# Agent workflow

The contract for any coding agent modifying this repository. It exists because The Mandate has two properties ordinary projects lack: the interface must behave exactly like a pinned upstream application (Herdr), and the codebase is maintained primarily by AI agents. Violations of this document are review failures, not style notes.

## Engineering skill system: pstack (selected, user decision)

**[pstack](https://github.com/cursor/plugins/tree/main/pstack)** (Lauren Tan / @poteto, MIT) is the preferred engineering skill system for substantial coding tasks. It is **referenced, never vendored**: this repository does not copy the pstack repository; agents use the official plugin through a supported harness.

### Supported installation methods (documented, official)

| Harness | Method | Status |
|---|---|---|
| Cursor | `/add-plugin pstack` | Official, documented |
| Claude Code | `/plugin marketplace add cursor/plugins` then `/plugin install pstack@cursor-plugins` (auto-update off for third-party marketplaces) | Official, documented adapter |
| **OpenCode / OMP / Antigravity (this project's harnesses)** | **Unverified.** No official adapter is documented for any of the three. Skill files (`SKILL.md`, Agent-Skills convention) can be read as instructions by skills-reading harnesses, but slash-command routing, `poteto-agent`/`comment-sicko` subagent types, custom modes, automations, and model-role mapping are Cursor/Claude-Code features and must not be assumed to work | Verify before relying on automation |

**Project harnesses:** The Mandate is developed with **OpenCode, OMP, and Antigravity (agy)**. All three are unverified for pstack automation. Harness instruction files: OpenCode and OMP read `AGENTS.md`; Antigravity reads project rules under `.agents/rules/` — when M2 begins, a one-line pointer rule must exist there so Antigravity agents receive this workflow. Keep per-harness differences (model mapping, subagent types, automations) out of repo contracts; the workflow contract here is harness-neutral.

**Compatibility rule:** before any agent relies on pstack automation or orchestration in any of the project's harnesses, run a small verification task in that harness and record the result (which skills fired, which features were skipped, whether playbook routing worked). Until then, agents use the **fallback mode**: read the relevant pstack `SKILL.md`/playbook files as instructions and execute them manually — the workflow contract in this document still applies in full.

### How pstack is used here

- **`poteto-mode`** is the default entry point for substantial coding tasks: it selects the playbook (investigation, bug fix, feature, refactoring, testing, review, shipping, visual parity, …) and routes to the other skills as steps fire.
- **Prioritized skills:** `architect` (module boundaries before implementation — this repo's state-ownership table is exactly its territory), `tdd` (failing test first where a cheap local test path exists), `interrogate` (independent multi-model review of diffs — satisfies this document's independent-review requirement), `blast-radius` (what else a change could break, proven by running code), `typescript-best-practices` (type-system discipline for the domain contracts), `correct` (converts recurring agent mistakes into enforceable checks), and the verification-skill family: `create-verification-skill` / `maintain-verification-skill` (generate the project's runnable verification procedure once M2 produces a runnable application) and `create-formal-verification-skill` / `maintain-formal-verification-skill` (verify critical state-machine properties — the prefix state machine and event replay are natural first candidates).
- **Visual-parity playbook** is mandatory when implementing or changing Herdr UI layouts: it complements this document's screenshot-inspection step and the TECH_STACK visual-regression acceptance rule; baselines remain the pinned upstream captures, never the illustrative reference images.
- **Graphify stays** for codebase exploration and dependency analysis; it complements pstack (which has no code-graph tool) and is never replaced by it.

### Boundaries between pstack and this repository's rules

pstack never overrides the repo's own authorities. In any conflict, this order wins:

1. Herdr fidelity contracts (`HERDR_FIDELITY.md`, `HERDR_RESEARCH.md`) — pstack skills may not repurpose bindings or invent behavior to satisfy a playbook step.
2. Milestone approvals (`IMPLEMENTATION_PLAN.md`) — no playbook authorizes gameplay implementation or dependency installation before its gate.
3. The workflow prohibitions in this document (contract tampering, silent snapshot updates, weakened assertions, authority leakage into React, generated-artifact commits).
4. Narrative and assessment ownership rules (`ARCHITECTURE.md` state table, `STORY_BIBLE.md` canon).

pstack's model-role configuration (`/setup-pstack`) may be used to map its roles to available models; it does not change which agent harness may run which repo gates.

### Explicitly excluded

**obra/superpowers** is not adopted: not as a dependency, not as a submodule, not as a skill collection, not as a recommended workflow for this repository. Agents working on The Mandate must not introduce it. (Other harness-level skills present in a contributor's local environment remain their own affair; this repository's contract is pstack plus the workflow above.)

## The workflow (every change)

1. **Understand.** Read `AGENTS.md`, the affected contracts (`docs/HERDR_FIDELITY.md`, `docs/LEVEL.md`, `docs/LEARNING_DESIGN.md`, `docs/ARCHITECTURE.md`), and the relevant code graph (Graphify query if available). Read the actual source before changing behavior; never act on a function or test name.
2. **Scope.** State which modules and behaviors will change before changing them. Out-of-scope drift is a defect even when the extra change is an improvement.
3. **Implement.** The smallest change that satisfies the requirement. No speculative features, no abstraction without a second user, no reformatting of unrelated code.
4. **Verify.** Run `pnpm typecheck`, `pnpm lint`, the narrow relevant tests (`pnpm test`), and the behavioral check covering the change. Property-based tests (fast-check) are required for any new transition or invariant in `src/core/*`.
5. **Inspect.** Presentation changes attach before/after screenshots of the affected Herdr interface states (fixed viewport, seeded state). A failing visual test is resolved by fixing the CSS or by a justified, reviewer-approved baseline update — never by silently updating the snapshot.
6. **Review.** Fidelity-sensitive changes (anything citing `HERDR_FIDELITY.md`), assessment-sensitive changes (`src/core/assessment`), and lifecycle semantics require an independent reviewer who did not write the change.
7. **Report.** List changed files, exact commands run with exit statuses, evidence (logs, screenshots, test output), residual risks, and anything not tested. A claim without a command is unverified.

## Hard prohibitions

- Never modify a Herdr behavioral contract (`HERDR_FIDELITY.md`, `HERDR_RESEARCH.md`) to make an implementation test pass. Contracts change only through the upgrade protocol (ADR-0002) with user approval.
- Never update a visual snapshot without reviewing the diff and recording justification.
- Never replace a failing test with an easier assertion; fix the code or argue the test is wrong in the report.
- Never introduce a dependency outside `docs/TECH_STACK.md`'s verified set without a recorded compatibility check and user approval.
- Never commit generated artifacts (graphs, coverage output, screenshots from test runs, Graphify output) unless the file is explicitly designated as a fixture or baseline.
- Never move assessment or narrative authority into React components, browser APIs, or adapters (enforced by boundary lint; violations are also review failures).
- Never mark simulated behavior as authentic without its contract citation; never present a page affordance as a Herdr action.

## Parallel agents

Parallel agents must own separate modules or separate worktrees with one named integrator responsible for reconciliation. Two agents must never edit the same file concurrently; when lanes would touch a shared file (contracts, glossary, story canon), the integrator serializes the edits and reconciles dependents. Agents do not approve their own work; the integrator (or the user at milestone gates) owns acceptance.

## Exploration tools

Graphify (local, `graphify-out/` or the repo wrapper) accelerates exploration and boundary review. Its output is an exploration aid, never an architectural authority — source code and the project contracts decide disputes. Generated graph data stays out of commits.

## Screenshots and visual regression

- Baselines: captured from the pinned upstream Herdr build (interface states) and the game's seeded states; pinned alongside their upstream commit.
- Any CSS change touching chrome (sidebar, tab bar, mode bars, panes, focus indicators) requires the before/after screenshot step (5).
- Hosted visual services are not used; screenshots live in the repo or CI artifacts.

## Escalation

If a contract, the architecture, and the implementation disagree, stop and report the discrepancy with evidence — do not pick a side silently. If a task cannot be completed within the current milestone authorization (see `docs/IMPLEMENTATION_PLAN.md`), stop at the boundary and say so.
