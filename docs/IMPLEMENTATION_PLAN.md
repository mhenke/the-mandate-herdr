# Implementation plan

M0 and M1 are approved. M2 authorizes L1–L3 only. `LEVEL.md` defines the current slice and future design contracts. `HERDR_FIDELITY.md` and `HERDR_RESEARCH.md` bound all teaching claims.

## Milestone 0 — review gate — **APPROVED** (user decision)

The user approved M0 with recorded decisions (see "Review-gate decisions recorded" below). The reconciliation audit's seven blockers were fixed and verified (`10199ad`); the report is `docs/REVIEW_GATE.md`. No narrative reopening without a concrete new finding.

## Milestone 1 — feasibility — **accepted**

Scope (user-approved): 18-item checklist documentation (physical-key observations come from the user only; synthetic results non-certifying), capture-release and pending-prefix cancellation policies, clipboard-failure behavior and its assessment impact, completion or explicit resolution of the outstanding fidelity-audit dimensions, published supported envelope with limitations and blocked lessons, updated gate documents with per-criterion evidence. **Explicitly excluded: application scaffolding, gameplay implementation, the L1–L3 vertical slice.**

Gate 1 closed on 2026-11-23 by user authorization. The Chromium record includes a synthetic pass and two physical chords. Firefox remains unmeasured. `FEASIBILITY_KEYBOARD.md` records the keyboard envelope, blur and capture policies, and clipboard fallback. M2 supersedes the original Escape release policy.

Exit report: `docs/M1_EXIT_REPORT.md` (per-criterion evidence; requests separate M2 approval).

## Milestone 2 — vertical slice — **ACCEPTED** (user decision, 2026-11-24)

Scope: L1–L3 completed and accepted. Exit report preserved at `docs/M2_EXIT_REPORT.md`. Zero simulation contamination, authentic Herdr-owned Escape, external capture release, unbroken L1–L3 session continuity, and provenance-gated assessment verified.

## Milestone 3 — full content — **AUTHORIZED, in progress** (user decision, 2026-11-24)

Scope: Implementation of Levels 4–15 executed in sequential, playable batches:
- **Batch 1 (Authorized & In Progress)**: Episode I completion — L4 ("Filed 19:05", introducing workspace navigation `prefix+w`, Help `prefix+?`, VN-12 drafting/filing, Choice 1 source protection) and L5 ("Fit to File", Retention Checkpoint 1 on fresh intake set without new Herdr shortcuts, culminating in Episode I Finale "The Third Count").
- **Batch 2 (Pending Batch 1 review)**: Episode II (L6–L10) navigating and supervising multiple simulated Claude sessions, culminating in L10 Retention Checkpoint 2.
- **Batch 3 (Pending Batch 2 review)**: Episode III (L11–L15) advancing toward the final boss, concurrent agents, session continuity, and the Nov 24 hearing deadline.

Standing constraint: Browser chord support claims require physical-key or CDP-verified evidence. The known Firefox measurement limitation remains open and must not be represented as resolved. Validated save/recovery persistence across episodes. Visual regression across chrome states and axe-core checks per batch.

Recorded corrections (user, M2 approval):

1. **Escape conflict resolved before input capture.** Escape is also an authentic Herdr control (canceling prefix mode, closing certain overlays), so a global Escape-to-release handler would violate fidelity. Inside the simulated TUI, Escape is **Herdr-owned** and follows pinned behavior; capture release is a **separate accessible release mechanism** (external control, see FEASIBILITY hold policy 2 as amended) that does not steal Herdr input. **Both paths are tested** at M2.
2. **Evidence-based browser claims.** Chromium results are predominantly synthetic CDP input plus two physical keyboard observations; they are never described as measured Firefox compatibility or full physical certification. Firefox risk is accepted for M2 development but stays visible in testing and release documentation. The prefix+`?` result stays **partial**, not fully verified.

### Theatrical presentation — required (user, 2026-11-23)

M2 must deliver a small, connected L1–L3 political-thriller experience, not a tutorial with incidental story:

- Start L1 at the open terminal. No player workspace, agent, or assignment document is ready in advance. The title and skippable cold open remain available without gating play.
- L1 earns June's acknowledgment through a player-run retrieval. L2 and L3 keep the same session and evidence. The objective HUD gives short, contextual steps and fades instruction as the player repeats Herdr operations.
- Herdr is the only assessed curriculum. Keep Claude Code and the preconfigured MCP documents deterministic, offline, and inside the fictional application boundary.
- STORY_BIBLE, STORY_ARC, NARRATIVE_DESIGN, and LEVEL remain the narrative and objective authorities. No early final-twist reveal, contradictory events, or Episodes II/III implementation.
- Cinematics are keyboard-accessible, skippable, and reduced-motion compatible. They never steal authentic Herdr input; the separate capture-release control remains available.
- Assignments arrive through the fiction. The external HUD shows a short objective, a reason, and three to five steps. Mark completion on committed state. Audio is optional and carries no exclusive facts.
- Existing concept artwork may support the fiction, never stand in for upstream Herdr visual baselines.
- Show the experience running in the browser, inspect screenshots, and provide genuine Playwright coverage of the presentation flow and earned progression. Cinematic skips and presentation controls cannot grant objective credit; simulation correctness and player-action provenance remain mandatory.
- **Cinematic production (user, 2026-11-23):** HyperFrames is an optional, offline cinematic-production tool kept out of the React application runtime. Proof of concept: one skippable 15–20 s Episode I cold open rendered locally to MP4 from approved concept artwork and November 12 canon, with captions/text equivalent, a reduced-motion still, immediate Skip, muted start (audio only on user initiation), and a direct transition into the playable L1 assignment. Editable HyperFrames source is preserved; Episodes II/III cinematics and any delay to L1 gameplay remain out of scope.

Exit criteria additions from the technology decisions:

1. Boundary enforcement live: ESLint import rules + bare-Node core import test prove `src/core/*` has zero React/DOM/adapter imports.
2. Visual baselines captured from the pinned upstream Herdr build for the taught interface states; visual regression running with the acceptance rule (screenshot evidence for CSS changes; justified baseline updates only).
3. Run typecheck, lint, core and property tests, and Playwright gameplay and accessibility checks. Follow the direct-to-main workflow in `AGENT_WORKFLOW.md`. No PR or branch protection step is required.
4. React render purity demonstrated: strict-mode development runs with zero side-effecting renders (no story advance, keybinding record, or level evaluation from a re-render).
5. Both Escape paths tested: authentic Herdr Escape inside the simulated TUI, and the separate external release control reachable/activatable by keyboard without entering the Herdr input path.
6. **Real e2e suite, not an empty one (user, 2026-11-23).** Green CI does not establish gameplay quality: the current `--pass-with-no-tests` path is acceptable only during scaffolding. At slice integration the flag is removed and the e2e job must run genuine L1–L3 browser tests (keyboard delivery, visual comparison, accessibility floor, objective provenance). An empty or trivially-passing e2e suite fails the M2 exit review.
7. **Visual baseline provenance (user, 2026-11-23).** Every upstream baseline must be captured from the real pinned Herdr binary (`e8d7d9705a7a2c89cef4dd42079379f05685af87`, 0.9.5) — never a reconstructed illustration — and its manifest must record: upstream commit, terminal dimensions (rows/cols and pixel size), font family+size, theme/colors, the terminal configuration used, and the exact interface state (which keys produced it). These baselines are the visual authority for the React implementation; the illustrative images in `assets/reference/` remain non-authority.

## Milestone 3 — full content (on M2 acceptance)

As before (episode batches, persistence, settings, checkpoints, L15), plus: visual regression across all chrome states; axe-core checks per batch; StrykerJS remains scheduled/manual report-only until thresholds are earned; AGENT_WORKFLOW contract enforced in every batch's review.

## Milestone 4 — release validation

As before (manual accessibility audits, performance budgets, learner study, release record), plus: mutation-score evidence for `src/core/*` at whatever threshold the report-only history earned; dependency-security posture documented (Dependabot history, pinned SHAs audit).

## Standing constraints across all milestones

- Gameplay code, scaffolding, and dependencies require explicit user approval at each milestone boundary (M0 gate language).
- The feasibility probe stays a diagnostic page; nothing migrates into an application without post-gate approval.
- Any upstream Herdr baseline move re-triggers the ADR-0002 upgrade protocol before affected lessons ship.
- Narrative and assessment never share an authority path; story completion never manufactures keyboard-transfer credit.
- **Stack minimality (user, 2026-11-23):** the M2 stack stays minimal — React (presentation only) + CSS Modules + the deterministic TypeScript core as authoritative state owner, subscribed via `useSyncExternalStore` with immutable snapshots and no render-time mutation. No router, query cache, global-state, styling, form, or validation libraries without a concrete requirement; save-validation library choice (Zod vs explicit functions) is decided at the M3 persistence work, not in M2.
- Physical passes remain the only *measured* keyboard evidence; synthetic runs are labeled non-certifying wherever they appear. The Gate-1 envelope rests on the recorded user authorization of 2026-11-23 (acceptance, not measurement); a measured cross-browser claim reopens it.

## Current blocker summary

1. ~~Skeptic full-package reconciliation~~ — complete; blocker fixes verified (`10199ad`).
2. ~~Manual keyboard pass~~ — **closed 2026-11-23 by user authorization** (acceptance, not measurement; FEASIBILITY_KEYBOARD "User authorization").
3. ~~Gate-1 hold policies~~ — decided (void-on-blur, Herdr-owned Escape, external release, clipboard-failure fallback).
4. No runtime performance, accessibility, or learner-retention evidence exists yet — all are M3/M4 gates, not current claims.
5. **M2 approval & completion** — **ACCEPTED 2026-11-24** (exit report: `docs/M2_EXIT_REPORT.md`). M3 authorized for sequential batch delivery beginning with L4–L5.

## Review-gate decisions recorded (user)

1. **IQ-1 approved as optional evidence**: stage its Nov 17 release, reconcile across BIBLE/ARC/NARRATIVE_DESIGN/LEVEL, preserve L10 checkpoint purity — available before L10, examinable during L10, never required for retention scoring, existing common-root proof requirements unchanged, optional discovery recorded in the knowledge ledger without becoming an E3 prerequisite.
2. **Keyboard certification pending**: M0 proceeds unresolved; no manual-pass labels inferred from synthetic tests; Linux + Firefox + US-layout keyboard is the initial proposed test target; M2 blocked until M1 is accepted. — **Superseded 2026-11-23 by user authorization**: Gate 1 closed on the Chromium-evidenced basis (synthetic 18/18 + two physical chords) with the user's explicit acceptance ("mark as passed; default browser essentially Firefox"); Firefox Ctrl+W plain/in-field flagged as risk chords; IME/AltGr excluded from taught scope. Recorded in FEASIBILITY_KEYBOARD "User authorization".
3. **Milestone structure accepted for review** — not an authorization for gameplay implementation. M1 is the next authorized work after M0 approval, subject to the same boundary; M2 requires separate approval.
4. **L15 detach/reattach must be validated as an authentic Herdr workflow** — a simulated page reload is never credited as a Herdr detach/reattach action (consistent with ARCHITECTURE §Fidelity and FIDELITY presentation-safety rules).
