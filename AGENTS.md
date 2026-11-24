# The Mandate: Herdr

## Current gate: Milestone 2 (In Progress)

- **Authorized scope**: M2 (L1–L3 vertical slice) only. **L4–L15 remain unauthorized** pending separate milestone approval.
- **TUI escape contract**: The Escape key is Herdr-owned inside the simulated console. Host capture release is exclusively operated via the external accessible control.
- **Evidence standard**: Browser chord support claims require physical-key or CDP-verified evidence (Firefox unmeasured; prefix+`?` partial).

## Agent workflow & governance

- **Workflow contract**: Follow `docs/AGENT_WORKFLOW.md` strictly (Understand → Scope → Implement → Verify → Inspect → Review → Report). Direct commits to `main` are blocked by branch protection; all work runs in isolated worktrees (`.worktrees/<lane>`) on dedicated lane branches submitted via pull requests.
- **Prohibitions**: Never tamper with fidelity contracts, silently update snapshots, weaken assertions, commit generated artifacts (`graphify-out/`), or leak simulation authority into React components.
- **Specification index**: Consult `docs/README.md` for the complete catalog and hierarchy of design, architecture, fidelity, narrative, and milestone documents.
- **Engineering skills**: Use [pstack](https://github.com/cursor/plugins/tree/main/pstack) via fallback mode (read `SKILL.md` as instructions in OpenCode, OMP, and Antigravity); `poteto-mode` selects playbooks; `architect`, `tdd`, `interrogate`, and `blast-radius` are prioritized; visual-parity playbook is mandatory for UI changes. obra/superpowers is excluded.

## Architectural boundaries (ESLint-enforced)

- **Pure simulation (`src/core/herdr`)**: Zero dependencies on React, DOM APIs, or adapters. Pure state transitions over immutable models.
- **Observation cores (`src/core/narrative`, `src/core/assessment`)**: Observe committed facts; zero state ownership of Herdr multiplexer data.
- **Host adapters (`src/adapters`)**: Translate browser events and enforce session recovery; never own simulation rules.
- **Presentation (`src/ui`)**: Read-only projections of committed session snapshots. Zero direct core mutations.
- **Local exploration**: Graphify (`graphify-out/`) accelerates code navigation; it is an exploration aid, never a runtime dependency or architectural authority.

## Behavioral & visual authority

- **Interface behavior**: Follow `docs/HERDR_FIDELITY.md` and `docs/HERDR_RESEARCH.md` verified against pinned Herdr commit `e8d7d97` (v0.9.5).
- **Herdr visual baselines**: Authoritative visual and transcript contracts live in `references/herdr-baselines/` (32 measured interface states and transcripts).
- **Illustrative captures**: Third-party captures in `references/illustrative/` are non-authoritative mood references.
- **Feasibility probe**: M1 keyboard diagnostics live in `references/feasibility/keyboard-probe.html`.
- **Harness scripts**: Upstream baseline capture and isolation scripts live in `references/scripts/`.

## Design & narrative canon

- **Story & worldbuilding**: `docs/STORY_BIBLE.md` is binding canon for characters (Adebayo, Beck, Vane) and Directive 47.
- **Progression & mechanics**: Use `docs/LEVEL.md` for level contracts, `docs/LEARNING_DESIGN.md` for pedagogical skills, and `docs/STORY_ARC.md` for multi-episode pacing.
- **Reference analysis**: Consult `docs/YAZI_QUEST_ANALYSIS.md` for instructional patterns; do not copy incidental narrative or components.

## Verification & reporting

Every change must prove compliance before reporting completion:
1. Run `pnpm typecheck` (tsc zero errors).
2. Run `pnpm lint` (ESLint, Stylelint, Prettier zero errors).
3. Run `pnpm test` (all Vitest unit, property, and purity tests passing).
4. For visual/presentation changes, inspect screenshots against `references/herdr-baselines/`.
5. Report exact commands executed, exit codes, and verifiable evidence.
