# Yazi Quest analysis

Baseline: [`7220cfd0180a004f5a00db52c9cca6193395374f`](https://github.com/mhenke/yazi-quest/tree/7220cfd0180a004f5a00db52c9cca6193395374f). Static source/document inspection only; no reference-game tests or playthrough were run for this analysis.

## Required reading

All eight documents were read in full. They contain design intent and historical claims; they are not interchangeable with the current implementation.

| Document | Lines | Relevant contribution |
|---|---:|---|
| [STORY_ARC](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/docs/STORY_ARC.md) | 152 | Three episodes, linked missions, identity revelation, earlier clues reinterpreted by the ending |
| [NARRATIVE_DESIGN](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/docs/NARRATIVE_DESIGN.md) | 146 | Conflicting institutional interests, attributed communications, differentiated failures, breadcrumb locations |
| [LEARNING_DESIGN](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/docs/LEARNING_DESIGN.md) | 175 | Situated learning, cognitive load, scaffolding/fading, spacing/interleaving, performance assessment |
| [LEVEL](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/docs/LEVEL.md) | 138 | Introduction, two reinforcements, then dropped key hints; objectives tied to concrete artifacts |
| [HAUNTED_MACHINE_SUMMARY](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/docs/HAUNTED_MACHINE_SUMMARY.md) | 343 | Historical implementation claims, terminal-as-storytelling surface, settings and effects |
| [Haunted Machine design](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/docs/plans/2026-02-20-haunted-machine-design.md) | 599 | Action/discovery/threshold/transition triggers, voice hierarchy, explicit interference risks |
| [DESIGN](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/DESIGN.md) | 176 | Stable working environment, state distinctions, episode signals, documented accessibility limits |
| [AGENTS](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/AGENTS.md) | 107 | Reducer immutability, input ownership, separation of player actions from level setup, verification limits |

## What makes the narrative work as a design reference

The survival premise supplies a reason to navigate, move, conceal, and inspect. The later identity revelation reinterprets the artifacts and the player's earlier actions. The useful principle is an evidence trail with changing meaning, not the reference's AI identity, time loop, haunting, or escape ending.

Institutional voices express different objectives rather than delivering interchangeable hints. Failure is attributed to a particular process or person. Small environmental artifacts establish a world beyond the objective list. See [narrative pillars and communications](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/docs/NARRATIVE_DESIGN.md#L7-L106) and [breadcrumb table](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/docs/NARRATIVE_DESIGN.md#L110-L135).

For The Mandate, transfer the method: establish who created an artifact, what the player initially believes it means, and which later discovery changes that interpretation. An election-security conspiracy needs its own motives and causal mechanism. Renaming ghosts as analysts would not achieve this.

These are design observations, not evidence that every player experienced the intended emotional response.

## Actual implementation path

### Keyboard ownership

[`GlobalInputContext.tsx:44–88`](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/src/GlobalInputContext.tsx#L44-L88) installs a window keydown listener. It skips already-prevented and composing events, preserves ordinary button activation, orders enabled handlers by priority, and limits text-field interception to opted-in handlers. A handler returning true consumes further dispatch.

[`App.tsx:1440–1564`](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/src/App.tsx#L1440-L1564) registers the gameplay handler. It checks cinematic/game-over states, input modes, DOM target ownership, and completion state before dispatching by mode.

[`handleNormalMode.ts:20–81`](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/src/hooks/keyboard/handleNormalMode.ts#L20-L81) handles warning ownership and a level-specific narrative case, then delegates navigation, clipboard, and system-parameter operations. This is a useful example of ordered dispatch, but also shows fiction-specific behavior entering the input path.

### State and objective validation

[`gameReducer.ts:168–193`](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/src/hooks/gameReducer.ts#L168-L193) maps action labels to skill-use flags. These flags are more informative than final filesystem shape alone, but are not a causal event journal.

The actual normal task evaluator is a React effect in [`App.tsx:587–629`](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/src/App.tsx#L587-L629), not the reducer alone. It calls each task's `check`, adds newly satisfied task IDs, dispatches `COMPLETE_TASK`, then dispatches matching post-task actions.

[`levels.ts:1269–1336`](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/src/constants/levels.ts#L1269-L1336) illustrates concrete checks: current path contains the vault, expected keys exist in a target directory, an obsolete config is absent, an active config/payload exists, and prerequisite task IDs are complete.

Level advancement has application-level orchestration. [`App.tsx:930–960`](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/src/App.tsx#L930-L960) applies prerequisite setup, computes target state, hides success presentation, and dispatches `SET_LEVEL`. The presence of `buildsOn`/`leadsTo` metadata alone does not establish that metadata executes progression.

### Narrative triggers and presentation

[`useNarrativeSystem.ts:37–175`](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/src/hooks/useNarrativeSystem.ts#L37-L175) uses level IDs and task history for notifications, entry thoughts, and alerts. Ref-based duplicate guards reset on level changes. These are component-lifetime guards, not durable event-level idempotency across arbitrary saves and reloads.

[`useNarrativeSystem.ts:177–299`](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/src/hooks/useNarrativeSystem.ts#L177-L299) observes newly completed tasks and specific filesystem/clipboard conditions. It dispatches thoughts and attributed warnings. The mechanism connects story delivery to activity, but several cases are hard-coded to particular levels and artifacts.

[`App.tsx:1566–1594`](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/src/App.tsx#L1566-L1594) selects boot/outro presentation and enables gameplay glitch presentation only for the full-effects setting when motion reduction is inactive.

## Documentation and implementation discrepancies

| Area | Evidence | Consequence for The Mandate |
|---|---|---|
| Checkpoints still introduce skills | Learning doc calls L5/L10 retention checkpoints, while [LEVEL:47–52,95–100](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/docs/LEVEL.md#L47-L100) introduces hidden/selection behavior at L5 and sorting at L10 | Use genuinely previously taught skills at checkpoints; audit actual starting states and objectives |
| Capstone phase descriptions disagree | [Story arc:118](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/docs/STORY_ARC.md#L118) says four phases; [learning design:85](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/docs/LEARNING_DESIGN.md#L81-L87) says five tasks; level data has five tasks, while [reducer:207–235](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/src/hooks/gameReducer.ts#L207-L235) and [App:645–676](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/src/App.tsx#L645-L676) use an eight-phase threshold | Define one authoritative capstone contract and test reachability; this static discrepancy is not a reproduced runtime failure |
| Capstone hints contain keys | [LEVEL:135–138](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/docs/LEVEL.md#L135-L138) prohibits key mentions; [level data:1261](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/src/constants/levels.ts#L1261) includes them | Specify voluntary hints and assisted versus independent attempts explicitly |
| Deliberate reference-tool deviation | [Learning design:146–158](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/docs/LEARNING_DESIGN.md#L146-L158) describes exiting filter mode on navigation as a simplification | The Mandate's iron rule disallows such behavior changes for convenience |
| Historical feature summary overstates present certainty | [Summary:126–147](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/docs/HAUNTED_MACHINE_SUMMARY.md#L126-L147) names ghost registry/hook files not present at those paths in the inspected checkout; the summary itself claims merge to main | Record missing named files without inventing branch history or concluding all related storytelling is absent |
| Accessibility settings are present | Current `types.ts`, `HelpModal.tsx`, `useReduceMotion.ts`, and App's effects condition expose the setting; DESIGN also documents the presets | Do not call this a branch-only feature. Presence still does not establish accessibility conformance |
| Threat equations need precise reading | [Reducer:251–285](https://github.com/mhenke/yazi-quest/blob/7220cfd0180a004f5a00db52c9cca6193395374f/src/hooks/gameReducer.ts#L251-L285) floors threat to time/key-ratio targets after decay; it does not add the full ratio each tick | Do not copy equations or assert their educational effectiveness |

The historical summary's test totals and bundle-size numbers are its claims, not fresh measurements of this baseline. No passing-test, performance, or learner-retention claim is established here.

## Architecture assessment

Useful boundaries:

- Content and task predicates are inspectable data rather than buried entirely in rendering.
- Reducer-owned state and explicit action labels make operations traceable.
- Central input priority and text-field ownership avoid independent listeners all handling one key.
- Setup versus player-action guardrails acknowledge a real assessment risk.

Boundaries to improve rather than copy:

- Task evaluation, post-task dispatch, progression, and level-specific alerts share App effects.
- Narrative conditions mix level identity, transient component refs, task lists, and filesystem details.
- Level-specific input paths couple fiction to navigation.
- Wall-clock timers, visual threats, efficiency flags, and task state require additional isolation for deterministic replay.

For The Mandate, evaluate objectives and story triggers from committed domain events outside rendering; retain input ownership as a principle. React is an optional presentation choice, not the architecture.

The reference's fixed three-column file manager, episode palette, exact component folders, viewport floor, and key meanings are project-specific. They are not Herdr conventions. In particular, mapping a Yazi operation such as invert-selection to a random Herdr rename or swap operation would teach neither tool.

## Instructional choices

Adopt: situated information-work problems; small early state spaces; introduction and two meaningful reinforcements; later interleaved retrieval; outcome-based checkpoints; concrete feedback; performance evidence.

Adapt critically:

- Fading removes unsolicited instruction, not access to authentic help.
- Story completion, conceptual understanding, and keyboard transfer need separate evidence.
- Herdr is mouse-capable. Allow accessible story interaction while honestly labeling input modality.
- Stress and low keystroke counts are not established measures of retention. Use untimed mastery and delayed fresh-task testing before claiming transfer.
- The reference deliberately uses UI corruption, cursor interference, and simulated input lag in its design. The Mandate must protect authentic input and chrome, placing tension in fictional application content.
- Do not gate essential plot comprehension behind an opaque efficiency or consciousness score.

## Verification limits

Inspected all eight required documents and the source paths cited above. Confirmed the pinned SHA with `git rev-parse HEAD` and document lengths with `wc -l` (both exit 0). Searched the current source tree for the named ghost/narrative files and inspected actual settings/input/progression code.

Not performed: installation, application execution, test suite, historical branch reconstruction, coverage measurement, accessibility testing, or playtesting. Static findings justify design precautions; they do not establish the reference game's runtime behavior in every path.
