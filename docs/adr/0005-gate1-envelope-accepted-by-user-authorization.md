---
status: accepted
---

# Gate-1 keyboard envelope accepted by user authorization, not measurement

The keyboard feasibility gate (M1) was closed on 2026-11-23 by an explicit user decision rather
than a physical-key manual pass. The user reviewed the synthetic pass results and the live probe
state and instructed: *"mark as passed. my default browser is essentially firefox."* The accepted
basis: a synthetic 18/18 pass on Chromium 158 (Playwright CDP input — trusted events, but injected
below browser chrome) plus two physical chords (Ctrl+A, Ctrl+C) the user pressed in the visible
probe window. No Firefox measurement exists.

## Why the trade-off was taken

A full physical pass would have produced measured Firefox data, but at the cost of blocking the
entire milestone on a manual session the user declined to run. The synthetic pass already
establishes the properties the simulation depends on at the page level (delivery of every taught
chord, correct modifier mapping, prefix follow-ups arriving with modifiers cleared). The residual
risk — real browser-chrome interception — is bounded: Ctrl+W plain and Ctrl+W in field are the
known candidates and are handled by rule (risk chords: no required action behind them; hold
policies make blur/interception attempt-voiding, never failing).

## Consequences

- The published envelope is **accepted, not measured** (GLOSSARY distinguishes the two flavors).
  Certification-grade claims (interception behavior on real Firefox) remain unavailable.
- **Reopening condition:** any *measured* cross-browser claim (e.g., a wider-release envelope)
  reopens Gate 1 and requires the physical pass (FEASIBILITY_KEYBOARD "User authorization";
  HERDR_FIDELITY Unresolved #1).
- Hold policies (void-on-blur, Esc release, assessment-neutral clipboard fallback) are binding on
  every capture lesson regardless of the evidence basis.
- IME and AltGr character production stay unresolved (FIDELITY #3) and outside taught scope;
  lessons ship ASCII-only.

## Alternatives considered

- **Run the physical Firefox pass before closing M1** — the rigorous option; rejected for this
  milestone by the user's explicit decision, retained as the requirement for any measured claim.
- **Narrow the envelope to Chromium only** — more honest per-glyph, but the user designates
  Firefox as their default browser; a Firefox-excluded envelope would not describe the actual
  target environment. Accepted-with-risk-flags preserves that while naming what is unknown.
