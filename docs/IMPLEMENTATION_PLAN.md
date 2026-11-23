# Implementation plan

Status: proposal for review. No implementation is authorized; this plan defines what authorization would cover, in what order, and what each milestone must prove. Milestones map to the gates in `docs/ARCHITECTURE.md` §Gates; level content comes from `docs/LEVEL.md`; teaching claims are bounded by `docs/HERDR_FIDELITY.md` and `docs/HERDR_RESEARCH.md`.

## Milestone 0 — review gate — **APPROVED** (user decision)

The user approved M0 with recorded decisions (see "Review-gate decisions recorded" below). The reconciliation audit's seven blockers were fixed and verified (`10199ad`); the report is `docs/REVIEW_GATE.md`. No narrative reopening without a concrete new finding.

## Milestone 1 — feasibility — **authorized, in progress**

Scope (user-approved): 18-item checklist documentation (physical-key observations come from the user only; synthetic results non-certifying), capture-release and pending-prefix cancellation policies, clipboard-failure behavior and its assessment impact, completion or explicit resolution of the outstanding fidelity-audit dimensions, published supported envelope with limitations and blocked lessons, updated gate documents with per-criterion evidence. **Explicitly excluded: application scaffolding, gameplay implementation, the L1–L3 vertical slice.**

Progress: probe extended to 18 chords (self-test 9/9); synthetic pass recorded (non-certifying); fidelity-audit dimensions completed (close-pane chain, help-listed bindings, chrome rows, Yazi citations, web citations verified; copy-mode command-char rule verified); hold-policy and clipboard-failure sections drafted pending the physical pass.

Remaining: the user's manual pass on Linux + Firefox + US layout; hold-policy decisions recorded from its results; the published envelope (or its narrowed form).

## Milestone 2 — vertical slice (requires separate approval)

Scope: L1–L3 only (per LEVEL.md contracts), in-memory attempt, no settings surface — and the first dependency installation with the exact TECH_STACK versions (React 19.3.1, TS 5.9.3 strict, Vite 8.3.8, Vitest 5.1.1, fast-check, Playwright, ESLint stack, pnpm 12.23.0 pinned, Node 22.12+, lockfile committed).

Exit criteria additions from the technology decisions:

1. Boundary enforcement live: ESLint import rules + bare-Node core import test prove `src/core/*` has zero React/DOM/adapter imports.
2. Visual baselines captured from the pinned upstream Herdr build for the taught interface states; visual regression running with the acceptance rule (screenshot evidence for CSS changes; justified baseline updates only).
3. CI workflow green: typecheck, lint (incl. Stylelint), tests incl. fast-check properties, Playwright smoke + visual + axe-core floor, Knip + fallow baselines; Actions pinned to SHAs; branch protection with required checks configured.
4. React render purity demonstrated: strict-mode development runs with zero side-effecting renders (no story advance, keybinding record, or level evaluation from a re-render).

## Milestone 3 — full content (on M2 acceptance)

As before (episode batches, persistence, settings, checkpoints, L15), plus: visual regression across all chrome states; axe-core checks per batch; StrykerJS remains scheduled/manual report-only until thresholds are earned; AGENT_WORKFLOW contract enforced in every batch's review.

## Milestone 4 — release validation

As before (manual accessibility audits, performance budgets, learner study, release record), plus: mutation-score evidence for `src/core/*` at whatever threshold the report-only history earned; dependency-security posture documented (Dependabot history, pinned SHAs audit).

## Standing constraints across all milestones

- Gameplay code, scaffolding, and dependencies require explicit user approval at each milestone boundary (M0 gate language).
- The feasibility probe stays a diagnostic page; nothing migrates into an application without post-gate approval.
- Any upstream Herdr baseline move re-triggers the ADR-0002 upgrade protocol before affected lessons ship.
- Narrative and assessment never share an authority path; story completion never manufactures keyboard-transfer credit.
- The manual pass remains the only certifying keyboard evidence; synthetic runs are labeled non-certifying wherever they appear.

## Current blocker summary

1. Skeptic full-package reconciliation (running) — gate input.
2. Manual keyboard pass — user action, gates M1 exit; initial proposed target Linux + Firefox + US-layout keyboard.
3. Gate-1 hold policies — parent decisions recorded at M1.
4. No runtime performance, accessibility, or learner-retention evidence exists yet — all are M3/M4 gates, not current claims.

## Review-gate decisions recorded (user)

1. **IQ-1 approved as optional evidence**: stage its Nov 17 release, reconcile across BIBLE/ARC/NARRATIVE_DESIGN/LEVEL, preserve L10 checkpoint purity — available before L10, examinable during L10, never required for retention scoring, existing common-root proof requirements unchanged, optional discovery recorded in the knowledge ledger without becoming an E3 prerequisite.
2. **Keyboard certification pending**: M0 proceeds unresolved; no manual-pass labels inferred from synthetic tests; Linux + Firefox + US-layout keyboard is the initial proposed test target; M2 blocked until M1 is accepted.
3. **Milestone structure accepted for review** — not an authorization for gameplay implementation. M1 is the next authorized work after M0 approval, subject to the same boundary; M2 requires separate approval.
4. **L15 detach/reattach must be validated as an authentic Herdr workflow** — a simulated page reload is never credited as a Herdr detach/reattach action (consistent with ARCHITECTURE §Fidelity and FIDELITY presentation-safety rules).
