# The Mandate: Herdr

## Current gate: Milestone 3 (In Progress)

- **Authorized scope**: Milestone 3 implementation for Levels 4–15 authorized in sequential, playable batches, beginning with Batch 1 (L4 "Filed 19:05" and L5 "Fit to File"). Completed L1–L3 vertical slice accepted and preserved.
- **Learning scope**: Assess only accepted player-origin Herdr operations. Claude Code, fictional MCP tools, and investigative reasoning advance the story. They never grant keyboard credit.
- **TUI escape contract**: The Escape key is Herdr-owned inside the simulated console. Host capture release is exclusively operated via the external accessible control.
- **Evidence standard**: Browser chord support claims require physical-key or CDP-verified evidence (Firefox unmeasured; prefix+`?` partial). The known Firefox measurement limitation remains open and must not be represented as resolved.

## Agent workflow & governance

- **Solo developer workflow**: Single-developer project ("one person"). Direct commits and pushes to `main`; pull requests and branch protection ceremonies are omitted. Follow the core workflow in `docs/AGENT_WORKFLOW.md` (Understand → Scope → Implement → Verify → Inspect → Watch CI → Report). After any push to `main` (or a lane branch), watch remote CI to completion using `pnpm ci:watch` (or `bash scripts/watch-ci.sh`); diagnose and fix any failures iteratively until green before concluding.
- **Worktree isolation**: Parallel agents develop in dedicated worktrees under `.worktrees/<lane-name>` (`lane/<lane-name>`). On creation, bootstrap the shared graph: `ln -s ../../graphify-out .worktrees/<lane-name>/graphify-out`. Keep worktrees git-ignored and prune after lane completion.
- **Code exploration (Graphify)**: Query before searching. Run `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` before grepping or reading files. Baseline index lives at root `graphify-out/` and is symlinked into worktrees. Run `pnpm graphify:update` after structural changes; avoid concurrent rebuilds across worktrees. Exploration aid only (never an architectural authority or runtime dependency); keep `graphify-out` uncommitted.
- **Guardrails**: Preserve fidelity contracts, keep test assertions strict, keep generated artifacts (`graphify-out`) uncommitted, and maintain pure simulation free of React/DOM dependencies.
- **Specification index**: `docs/README.md` indexes all architecture, fidelity, narrative, and milestone specifications.
- **Engineering skills**: Use [pstack](https://github.com/cursor/plugins/tree/main/pstack) in fallback mode (execute `SKILL.md` instructions manually in OpenCode, OMP, and Antigravity); `poteto-mode` selects playbooks; prioritize `architect`, `tdd`, `interrogate`, `blast-radius`, and visual-parity for UI. Exclude `obra/superpowers`.

## Architectural boundaries (ESLint-enforced)

- **Pure simulation (`src/core/herdr`, `src/core/applications`)**: Zero dependencies on React, DOM APIs, or adapters. Pure state transitions over immutable models (multiplexer state and deterministic in-terminal CLI agent simulation per ADR 0007).
- **Fictional tool changes**: Read `docs/CLAUDE_MCP_SIMULATION.md`. Keep pane histories separate and records shared. Do not run real commands or services.
- **Observation cores (`src/core/narrative`, `src/core/assessment`)**: Observe committed facts; zero state ownership of Herdr multiplexer data.
- **Host adapters (`src/adapters`)**: Translate browser events and enforce session recovery. They never own simulation rules.
- **Presentation (`src/ui`)**: Read-only projections of committed session snapshots. Zero direct core mutations.

## Behavioral & visual authority

- **Interface behavior**: Follow `docs/HERDR_FIDELITY.md` and `docs/HERDR_RESEARCH.md` verified against pinned Herdr commit `e8d7d97` (v0.9.5).
- **Herdr visual baselines**: Authoritative visual and transcript contracts live in `references/herdr-baselines/` (32 measured interface states and transcripts).
- **Illustrative captures**: Third-party captures in `references/illustrative/` are non-authoritative mood references.
- **Feasibility probe**: M1 keyboard diagnostics live in `references/feasibility/keyboard-probe.html`.
- **Harness scripts**: Herdr baseline capture and isolation scripts live in `references/scripts/`.

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
5. **Watch CI post-push**: After pushing to `main` (or a lane branch), execute `pnpm ci:watch` (or `bash scripts/watch-ci.sh`) to monitor remote CI to green completion. The script resolves the full 40-character commit SHA, waits until registered, monitors via `gh run watch <run-id> --exit-status`, and extracts `gh run view <run-id> --log-failed` on any failure. Diagnose and fix failures iteratively until green. Never declare completion while CI is pending or failed.
6. Report exact commands executed, exit codes, CI run link/verdict, and verifiable evidence.
