# Learning design

Status: proposal for review. Level numbers are curriculum constraints, not approval of the current story draft. Reconcile them with `LEVEL.md` before the review gate.

## Transfer goal

A player should leave able to organize a real Herdr session, distinguish terminal input from multiplexer actions, find the right workspace/tab/pane, and interpret agent and session state without relying on the game's story cues.

Finishing the investigation and demonstrating keyboard transfer are separate outcomes. A persuasive fictional filing is not evidence of Herdr fluency. A memorized shortcut without a useful resulting state is not mastery.

## Instruction

- Situated learning: each operation solves an information-work problem the player already understands.
- Cognitive load: introduce one substantial interface concept at a time. New story evidence may be complex; the interface lesson should then reuse known operations.
- Scaffolding: demonstrate the operation, require a guided attempt, then describe only the desired result.
- Fading: remove unsolicited key sequences after two successful reinforcements. Keep voluntary authentic binding help available.
- Spacing: revisit skills in later levels and after episode boundaries, not only in consecutive repetitions.
- Interleaving: ask players to choose among tabs, splits, workspaces, and zoom based on the task.
- Assessment: record an action trace and its resulting state. Avoid timers and minimum-keystroke scores as proxies for understanding.

The story cannot explain a real Herdr action incorrectly to make a scene work. Revise the scene instead.

## Proposed core skill matrix

The exact behavior behind each skill is governed by `HERDR_FIDELITY.md`. The current default key sequences are documented in the [official keyboard guide](https://herdr.dev/tui/docs/keyboard/); the research baseline must pin their source before implementation.

| ID | Skill | Introduction | Reinforcement 1 | Reinforcement 2 | Further retrieval | Independent assessment |
|---|---|---|---|---|---|---|
| S01 | Prefix sequence versus ordinary forwarded terminal input | 1 | 2 | 3 | 6, 9, 12 | 5, 10, 15 |
| S02 | Discover active bindings with authentic help | 1 | 2 | 4 | Voluntary throughout | 5 and 15: resolve an unfamiliar task using help |
| S03 | Session/workspace/tab/pane/process hierarchy | 1 | 2 | 4 | 6, 9, 13 | 5, 10, 15 |
| S04 | Create, name, and switch tabs for separate activities | 2 | 3 | 4 | 7, 11 | 5, 10, 15 |
| S05 | Split right/down and reason about a split tree | 3 | 4 | 6 | 8, 12 | 5, 10, 15 |
| S06 | Directional pane focus and correct input destination | 3 | 4 | 6 | 8, 12, 14 | 5, 10, 15 |
| S07 | Create and navigate separate workspaces | 4 | 6 | 9 | 11, 13 | 10, 15 |
| S08 | Goto picker: find a particular process in a larger session | 6 | 8 | 9 | 12, 14 | 10, 15 |
| S09 | Zoom and restore a pane without changing its topology | 6 | 7 | 9 | 11, 14 | 10, 15 |
| S10 | Distinguish detected agent identity/status from process output and task completion | 7 | 8 | 9 | 11, 13 | 10, 15 |
| S11 | Copy-mode search, selection, copy, and exit | 8 | 9 | 11 | 12, 14 | 12, 15 |
| S12 | Detach/reattach versus close and server restart | 9 | 11 | 13 | 14 | 15 |

A reinforcement counts only when the player selects and performs the operation in a changed context. Replaying a tutorial animation or reopening the same completed task does not count.

### Scope limits

This is a core workflow course, not certification for every Herdr feature. Resize, pane swapping, configurable bindings, remote machines, worktrees, plugins, native agent resume, and experimental live handoff remain outside mandatory assessment unless the final design supplies verified contracts, useful story problems, and adequate practice. They may be explained accurately without pretending the player demonstrated them.

Configuration literacy includes recognizing that defaults can change and help shows active bindings. The proposed first release uses an explicit pinned-default profile. It does not claim to import the user's real Herdr configuration. A future custom profile requires its own parser, behavior tests, and assessment policy.

## Assessment contract

Every objective records:

1. A starting state with a practical problem.
2. The admissible actions, including authentic alternatives.
3. Required resulting state.
4. Required provenance of that state: player action, fixture, or simulated process event.
5. Assistance used and input modality.
6. Failure feedback and a recovery path.

Example: comparing two reports requires two relevant terminal views in the same tab, distinct source identities, and a recorded comparison. If assessing split creation, fixtures cannot pre-create the required second pane and grant credit. If assessing focus, observe a player focus transition followed by input accepted by the intended fictional process; do not credit a narrative script that moved focus.

Name-based checks accept different legitimate workspace/tab names. A particular layout is mandatory only when the task needs its geometry; do not reject an equivalent arrangement for cosmetic reasons. Exact shortcut evidence is required only when assessing keyboard transfer for that action.

### Three kinds of evidence

- Fictional process evidence: a report was read, a source comparison was recorded, or a finding was filed.
- Herdr action evidence: a pane was split, focus changed, or a client detached.
- Learning evidence: the player deliberately used the required operation, with its assistance/modality recorded.

Narrative scripts can produce process evidence but cannot manufacture player-action evidence. Client-side records are useful assessment evidence, not tamper-proof credentials.

## Checkpoints

### Level 5: first independent investigation workspace

No new interface skills. Give a fresh evidence set and an outcome brief without key sequences. Require a useful tab arrangement, a player-created comparison split, correct pane focus/input, and a provenance-backed finding. Assess S01 and S03–S06. Offer authentic help throughout; record consultation rather than punish it.

Pass: required story evidence and required workflow state/action provenance exist. Missing provenance or a wrong input destination produces a specific deficiency. Retry the task with its evidence preserved; do not silently mark success.

### Level 10: coordination and corroboration

No new interface skills. Use multiple workspaces, an ambiguous agent-status situation, and conflicting reports. Require locating a target process, interpreting its status without mistaking `done` for evidentiary correctness, and checking its output before using the finding. Assess S07–S10 and retrieve S01/S04–S06.

Preserve room for alternative valid navigation paths. If specifically assessing the Goto picker, that sub-objective must require its use and explain why it is being assessed; do not pretend all authentic alternatives are wrong.

### Level 15: cumulative mastery

No new commands or story-critical facts introduced only to create a last-minute test. Use the final evidence corpus and a stable starting session. The player must organize activities, compare independent sources, find and verify agent output, search/copy a relevant passage, recover a detached client, and complete the fictional disclosure.

Assess all core skills through identifiable subtasks. Relevant source files, evidence IDs, and exact predicates belong in `LEVEL.md`. The final disclosure alone does not pass the level if the skill evidence is absent.

The fictional deadline advances through declared story events, not wall-clock time. Pausing, using assistive technology, rereading evidence, or leaving the browser does not consume it. A missed narrative deadline uses an explicit retry/checkpoint recovery; it never retroactively rewrites evidence.

## Hints and recovery

| Tier | Content | Assessment record |
|---|---|---|
| 0 | Outcome brief and fictional feedback | Independent attempt |
| 1 | Conceptual cue, such as separating unrelated activities | Concept assistance |
| 2 | Relevant active-binding help entry | Binding assistance |
| 3 | Worked example in a separate practice task | Guided practice; checkpoint retry remains available |

Checkpoints start at tier 0. They may be completed with assistance for story progression, but report that attempt as assisted. An optional fresh equivalent task can establish independent retrieval later. Never withhold essential help from a struggling player to preserve a score.

Wrong operations should have the upstream consequence. Safe fixtures and recovery provide protection; counterfeit Herdr behavior does not. Closing a disposable pane can be practiced after lifecycle behavior is verified. Never tell a player closing a pane is equivalent to detaching.

## Accessibility and honest outcome reporting

Mouse and accessible external controls may perform authentic actions. Record their modality separately; permit story completion without awarding unobserved keyboard-transfer credit.

External learning controls must be visibly separate from Herdr chrome and must not hijack Herdr bindings. Support a clear way to leave input capture, visible focus, reduced motion, non-color status descriptions, readable transcript views, and a bounded announcement policy. Manual screen-reader and keyboard-only evaluation remains required before making accessibility claims.

Report useful results per skill: demonstrated independently, demonstrated with assistance, practiced, or not observed. Do not combine these into an opaque “mastery” percentage.

## Validation before implementation approval

- Reconcile every matrix cell with a concrete level objective and action/result predicate.
- Confirm each assessed skill has two distinct reinforcements before final mastery.
- Walk the five-level episode boundaries to detect unexplained new commands.
- Trace each story discovery to its process evidence and each learning claim to its player-action evidence.
- Test the actual taught browser key/context matrix before selecting a supported browser envelope.
- Plan a small novice playtest and delayed fresh-task retrieval check. Documentation review cannot establish retention or narrative quality empirically.

Open: final level assignments depend on the revised story and audited Herdr contracts. No learner study, browser input test, or gameplay test has been run.
