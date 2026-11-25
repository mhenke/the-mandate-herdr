# The Mandate: Herdr

## Current gate

**M0 and M1 approved; M2 (L1–L3 vertical slice) approved 2026-11-23 and in progress** — dependency installation and scaffolding are authorized for M2 scope only. **L4–L15 remain unauthorized** pending separate approval after M2 acceptance. Recorded M2 corrections: (1) Escape is Herdr-owned inside the simulated TUI; capture release is a separate accessible external control, both paths tested; (2) browser support claims stay evidence-based — synthetic Chromium CDP input + two physical observations, Firefox unmeasured, prefix+`?` partial.

## Agent workflow

`docs/AGENT_WORKFLOW.md` is the binding contract for agent contributions: understand → scope → implement → verify → inspect (screenshots for presentation changes) → review (independent for fidelity/assessment-sensitive changes) → report with commands and exit statuses. Its prohibitions (contract tampering, silent snapshot updates, weakened assertions, generated-artifact commits, authority leakage into React) are review failures.

- **Worktree isolation**: Parallel agents develop in dedicated worktrees under `.worktrees/<lane-name>` (`lane/<lane-name>`). On creation, bootstrap the shared graph: `ln -s ../../graphify-out .worktrees/<lane-name>/graphify-out`. Keep worktrees git-ignored and prune after lane completion.
- **Code exploration (Graphify)**: Query before searching. Run `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` before grepping or reading files. Baseline index lives at root `graphify-out/` and is symlinked into worktrees. Run `pnpm graphify:update` after structural changes; avoid concurrent rebuilds across worktrees. Exploration aid only (never an architectural authority or runtime dependency); keep `graphify-out` uncommitted.

**Engineering skill system:** [pstack](https://github.com/cursor/plugins/tree/main/pstack) (official Cursor plugin, MIT) is the preferred skill system for substantial coding tasks — `poteto-mode` selects playbooks; `architect`, `tdd`, `interrogate`, `blast-radius`, `typescript-best-practices`, and the verification skills are prioritized; the visual-parity playbook is mandatory for Herdr UI layout changes; a project-specific verification skill is created once M2 produces a runnable application. pstack is referenced, never vendored. Harness status: the project is developed with **OpenCode, OMP, and Antigravity (agy)** — none of which has a documented pstack adapter, so **compatibility is unverified and must be tested per harness before any agent relies on its automation**; until then agents read the `SKILL.md` files as instructions. Cursor and Claude Code remain the officially documented pstack harnesses. obra/superpowers is excluded entirely (no dependency, submodule, skill collection, or recommended workflow). pstack never overrides the Herdr fidelity contracts, milestone approvals, or this file's prohibitions.

## Stack boundaries (enforced, not convention)

`src/core/herdr` (pure simulation) must not import React, DOM APIs, adapters, or own narrative/assessment state; `src/core/narrative` and `src/core/assessment` observe committed facts and never own Herdr state; `src/ui` renders committed view models and never mutates simulation state. ESLint import rules plus a bare-Node core import test enforce this. React Strict Mode and `eslint-plugin-react-hooks` recommended rules are required configuration.

## Behavioral authority

Before specifying interface behavior, read `docs/HERDR_RESEARCH.md` and `docs/HERDR_FIDELITY.md`. Verify claims against the pinned upstream commit. If these documents are not available, research the official documentation and source first.

- Preserve Herdr's bindings, prefix semantics, focus, layout, hierarchy, agent status, lifecycle, configuration, and input forwarding.
- Record source paths and commit permalinks for verified behavior. Label assumptions and unresolved discrepancies.
- Fictional actions belong inside simulated terminal applications, never on repurposed Herdr bindings.
- Treat browser and operating-system interception as a fidelity constraint; a replacement binding is not authentic behavior.
- Research source without controlling the user's live Herdr session.

## Design ownership

Use `docs/STORY_BIBLE.md` for canon, `docs/LEVEL.md` for level contracts, and `docs/LEARNING_DESIGN.md` for skill coverage. When changing a shared fact, reconcile its dependents.

The required structure is fifteen connected levels across three episodes: retention assessments at 5 and 10; cumulative mastery at 15. Keep fictional institutions internally credible. Audit chronology, character knowledge, evidence provenance, clue placement, and the revelation before declaring the story ready.

Consult `docs/YAZI_QUEST_ANALYSIS.md` before transferring a reference-project pattern. Preserve the instructional purpose, not incidental story or component structure.

## Implementation proposal

Keep simulated Herdr behavior, narrative triggers, assessment, and presentation/accessibility separate. Prefer deterministic state transitions and replayable action evidence. Completion requires player actions and resulting state, not a completion button.

## Validation and reporting

Each document owner checks source accuracy and internal references. After reconciliation, independently audit the full design for contradictions, fidelity violations, missing assessments, and browser/accessibility risks. Report exact checks performed and remaining blockers. Stop at the review gate and request approval.
