# M1 exit report — keyboard feasibility

Status: **M1 exit requested.** This report closes the authorized M1 scope and asks for a separate
user decision on M2. Date: 2026-11-23.

## Evidence basis (stated once, plainly)

No physical-key manual pass was run. Gate 1 closed by **user authorization** (recorded in
FEASIBILITY_KEYBOARD "User authorization"): the user reviewed the synthetic pass results and the
live probe state, then instructed *"mark as passed. my default browser is essentially firefox."*
The accepted basis is the synthetic Chromium 158 pass (18/18 markers, 191 rows) plus two physical
chords (Ctrl+A, Ctrl+C) the user pressed in the visible probe window. **This is an acceptance
decision, not a measurement of Firefox.** Every claim below is scoped to that basis; a measured
cross-browser envelope reopens Gate 1.

## Per-criterion evidence (M1 scope, IMPLEMENTATION_PLAN)

| # | Criterion | Evidence |
| --- | --- | --- |
| 1 | 18-item checklist documentation | `feasibility/keyboard-probe.html` (self-test 9/9, zero external references); all 18 items executed via Playwright CDP input, log and labels recorded; results table in FEASIBILITY_KEYBOARD synthetic section; matrix filled (Chrome = synthetic, Firefox = user-accepted with risk-chord flags) |
| 2 | Capture-release policy | **Decided:** Esc cancels a pending prefix and exits capture context, with a visible pending indicator (mode-bar area). Presentation only — never presented as a Herdr binding (FEASIBILITY "Supported envelope", hold policy 2) |
| 3 | Pending-prefix cancellation / clipboard-failure behavior | **Decided:** blur between prefix and action key voids the attempt (re-triable, never failed) — hold policy 1. Clipboard failure is assessment-neutral: copy actions are assessed as page-level copy requested, never OS-clipboard success — hold policy 3; probe fallback path (textarea + selection) exercised and works |
| 4 | Outstanding fidelity-audit dimensions | Completed and verified in the M0 reconciliation (`10199ad`): close-pane chain, help-listed bindings, chrome rows, Yazi citations, web citations, copy-mode command-char rule (source-verified at pinned commit `e8d7d97`) |
| 5 | Published supported envelope | Published (FEASIBILITY "Supported envelope"): Linux x86_64, US layout; Chromium ≥158 evidenced; Firefox accepted-by-decision with Ctrl+W plain/in-field as presumed-intercepted risk chords; IME and AltGr character production outside taught scope (lessons ASCII-only per standing field-edge constraint) |
| 6 | Updated gate documents | FEASIBILITY_KEYBOARD (status, matrix, envelope, hold policies, claim status), LEVEL.md (standing BLOCKED-ON resolved; feasibility-gate bullet updated; "remaining for parent" updated), HERDR_FIDELITY.md (Unresolved #1/#2 resolved-on-accepted-basis with reopening condition), IMPLEMENTATION_PLAN.md (M1 progress, blocker summary, decision record) |

## Key technical findings (Chromium 158 evidence)

- Every taught chord (`Ctrl+B` alone, sequential prefix+letter including h/j/k/l, Esc, `Ctrl+[`,
  field keys A/E/K/Y, Tab, prefix+`?`/Shift+N/Shift+T/`-`/`[`, plain Enter) reached the page with
  correct `key`/`code`/modifier properties. Zero drops or misroutes at page level.
- **Prefix second-press semantics hold:** in every prefix chord the follow-up key arrived with
  modifiers cleared — the property the mode-bar state machine depends on.
- Shift modifiers survive the prefix (Shift+N/T: `shift=yes` on the letter keydown).
- Synthetic-only limitations recorded honestly: AltGr decomposes to Ctrl+Alt with no composed
  character (partial); IME untestable (untested); Ctrl+W "delivered" proves nothing about real
  browser chrome (CDP bypasses it) — hence its risk-chord treatment.

## Residual risks (accepted with the authorization)

1. **Firefox is unmeasured.** Real Firefox is expected to intercept Ctrl+W (tab close) before the
   page; the game's capture layer must never place a required action behind it, and the probe's
   warning panel documents interception for players. Other Firefox-specific interception (if any)
   is unknown until a physical pass.
2. **IME and AltGr edges remain unresolved** (FIDELITY Unresolved #3) — mitigated by the standing
   field-edge constraint: all typing lessons ship ASCII-only; copy-mode search excludes IME/AltGr
   edges.
3. **A measured Firefox claim reopens Gate 1** — recorded as the reopening condition in
   FIDELITY and FEASIBILITY.

## What M1 does not claim

No fidelity of the *simulation* (that is M2's fixture work against the pinned upstream build), no
visual parity evidence, no accessibility or performance claims (M3/M4), and no measured
cross-browser input envelope.

## Requested decision

Approve **M2 (L1–L3 vertical slice)** as scoped in IMPLEMENTATION_PLAN — first dependency
installation at the exact TECH_STACK versions, boundary enforcement live, visual baselines from the
pinned upstream build, CI gates, React render purity — or name amendments first. M2 remains blocked
until that separate approval.
