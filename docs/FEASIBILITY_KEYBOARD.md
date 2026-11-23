# Feasibility: Keyboard Delivery (Gate 1)

Status: **probe built; synthetic pass recorded (non-certifying); supported envelope published on a
recorded user decision (2026-11-23).** No physical-key manual pass was run. The matrix below is
filled from the synthetic pass (Chromium column) and from the user's acceptance decision (Firefox
column) — see "User authorization" before relying on either.

Gate decision (user, review-gate phase): the review gate proceeds with keyboard feasibility
unresolved; **M2 gameplay implementation stays blocked until M1 establishes a supported input
envelope.** Initial proposed test target for the first manual pass: **Linux + Firefox + a physical
US-layout keyboard.** This is a proposed test target, not a claim of compatibility; the matrix
expands from measured results only.

## Purpose and scope

The Mandate: Herdr depends on the player's browser delivering the keys Herdr teaches (prefix,
window, layout, and text-editing bindings). This gate answers one narrow question: which of those
keyboard events actually reach a page, in which browsers, and which are consumed first by the
browser or operating system.

In scope:

- Page-level `keydown` / `keyup` / `beforeinput` delivery for the Herdr-taught chord set.
- The effect of page-level `preventDefault()` on non-composing keydowns.
- Browser-chrome interception evidence, recorded as *absence* (e.g. Ctrl+W closes the tab).

Out of scope:

- Reproducing Herdr, gameplay, or any simulation.
- Fixing or working around intercepted combinations.
- Claiming a support envelope from synthetic events, automation, or a single browser.
- Assistive-technology replacement behavior beyond noting that it was active.

Deliverable under test: `feasibility/keyboard-probe.html` — one static file, no dependencies, no
build step, no network. It is a diagnostic page, not a product start.

## Method

A **physical-key manual pass is the only certifying evidence**: a human presses real chords on real
hardware while the probe records what the page receives. Chrome, Firefox, Safari, and Edge each
need their own pass on the target OS and keyboard layout.

Synthetic events, DevTools-dispatched events, headless runs, and automation are **non-certifying**.
They prove only that the probe page's logging, cancellation, and summary paths work. They cannot
show interception, because untrusted events never travel through browser chrome. Their results
belong in the synthetic section, labeled as such.

Observed results are labeled per checklist item:

| Label | Meaning |
| --- | --- |
| `delivered` | the page received usable keydown/keyup for the chord |
| `intercepted` | no page event arrived; browser or OS consumed the chord |
| `partial` | some keys of the chord arrived, some did not |
| `untested` | no observation recorded |

## Per-browser result matrix

Filled from the synthetic pass and the user authorization of 2026-11-23 (see "User authorization").
The original rule stands for any *future* measured claim: `untested` is the honest default; do not
infer a cell from another browser or from the synthetic pass.

| # | Test | Chrome (synthetic pass) | Firefox (user-accepted, no measurement) |
| --- | --- | --- | --- |
| 1 | Ctrl+B alone | delivered | accepted† |
| 2 | Ctrl+B then w (sequential) | delivered | accepted† |
| 3 | Ctrl+W plain | delivered* | risk chord† |
| 4 | Ctrl+W with focus in page text field | delivered* | risk chord† |
| 5 | Ctrl+B then c/v/x/z/g/b/1/n/p/q + h/j/k/l | delivered | accepted† |
| 6 | Esc | delivered | accepted† |
| 7 | Ctrl+[ | delivered | accepted† |
| 8 | Ctrl+A / Ctrl+E / Ctrl+K / Ctrl+Y in text field | delivered | accepted† |
| 9 | Tab | delivered | accepted† |
| 10 | AltGr sequence (record what arrives) | partial | unmeasured |
| 11 | IME / composition attempt | untested | unmeasured |
| 12 | Ctrl+B then ? (help) | partial | accepted† |
| 13 | Ctrl+B then Shift+N | delivered | accepted† |
| 14 | Ctrl+B then Shift+T | delivered | accepted† |
| 15 | Ctrl+B then - | delivered | accepted† |
| 16 | Ctrl+B then h/j/k/l (pane focus) | delivered | accepted† |
| 17 | Ctrl+B then [ (copy-mode entry) | delivered | accepted† |
| 18 | Enter (plain) | delivered | accepted† |

\* CDP input bypasses browser chrome; the value proves nothing about interception. Chrome column
labels come from the synthetic pass (below), not a physical pass.
† `accepted` = user authorization of 2026-11-23 on the Chromium evidence basis, not a measured
Firefox result. `risk chord` = the two chords most likely intercepted by real browser chrome; the
game must never place a required action behind them (hold policy 3 in Supported envelope; probe
warning panel documents interception). Items 10/11 stay unmeasured and out of taught scope.

These rows exist because the checklist now covers every chord the level contracts assess
(`docs/LEVEL.md`), including copy-mode entry (`prefix+[`), the most-assessed skill. Item 17 is the
sequential prefix-then-bracket chord and is distinct from item 7, Ctrl+[ pressed alone.

Notes required per cell when filled: what the page logged, and what visibly happened instead
(tab closed, menu opened, character typed, nothing).

## Environment fields

Record one block per pass. An untested block stays blank.

| Field | Pass A | Pass B | Pass C | Pass D |
| --- | --- | --- | --- | --- |
| OS and version | | | | |
| Browser and exact version | | | | |
| Keyboard layout / locale | | | | |
| Physical keyboard model | | | | |
| Assistive tech active (screen reader, IME, remapper) | | | | |
| Probe `user agent` string (auto-filled on the page) | | | | |
| Date and tester | | | | |

## Manual pass instructions

For each browser, in a disposable window, with the target layout and any assistive tech active:

1. Open `feasibility/keyboard-probe.html` directly from disk (or over HTTPS). It needs no server.
2. Read the warning panel. Browser shortcuts may never reach the page; their absence is the signal.
3. Leave **Cancel observed events** off for the first pass, so delivery is observed passively.
   Repeat with it on only to confirm page-level cancellation behavior.
4. Press **Start capture**. Use **run now** on a checklist item *immediately* before pressing that
   chord; it inserts a marker row in the log and highlights the item. Then set the item's result to
   `delivered`, `intercepted`, or `partial`.
5. Run the checklist in order. Expect Ctrl+W to close the tab — that is a result, not a failure.
   If the tab closes, reopen the page and continue; optionally enable **Persist log in
   localStorage (survives Ctrl+W tab loss)** before starting, and remember that it writes to browser
   storage on this origin.
6. For field-based items, focus the page's text field before pressing the chord.
7. Press **Copy summary**. It copies a markdown table of every labeled result, with the user-agent
   string. If the clipboard is blocked (common on `file://`), the page selects the summary text in a
   textarea instead; copy it manually.
8. Paste the summary into the matrix above, then fill the environment block for that pass.

The page's own wording, quoted for the report:

> **Browser-level shortcuts may never reach this page.** Ctrl+W, Ctrl+T, Ctrl+N, Ctrl+Tab,
> Alt+Tab, Cmd+Q and similar are handled by the browser or OS before any page listener runs. Their
> absence from the log *is the signal*: record the chord as intercepted and note what actually
> happened.
>
> **Test in a disposable window.** Expect Ctrl+W to close this tab. Do not worry about losing state;
> that is one of the results. This page cannot test browser-chrome interception, only what a
> page-level `keydown` listener receives.

## Synthetic pass (non-certifying)

Headless or scripted results may be recorded here only with an explicit statement that they are
non-certifying and cannot establish interception. They test the probe, not the browser.

### Run 1 — Playwright CDP input, Chromium 158 (recorded 2026-11-23)

- Harness: Playwright `page.keyboard.press` (CDP `Input.dispatchKeyEvent` — trusted, isTrusted=true,
  but injected below browser chrome).
- Environment: Linux x86_64, Chromium 158.0.0.0, `en-US`, no IME. **Not Firefox** — the proposed
  certification target is untested by this run.
- Probe self-check: PASS (9/9, `#selftest` path unchanged).
- Result: 18/18 markers inserted, 191 rows captured (87 keydown, 86 keyup, 18 marks), zero
  misrouted/dropped events at the page level.

| # | Test | Synthetic label | Observed |
| --- | --- | --- | --- |
| 1 | Ctrl+B alone | delivered | `keydown b KeyB ctrl=yes`, correct release order |
| 2 | Ctrl+B then w (sequential) | delivered | follow-up `w` arrives plain (ctrl=no) — matches prefix second-press semantics |
| 3 | Ctrl+W plain | delivered* | *CDP bypasses chrome; proves nothing about Firefox, which is expected to intercept (tab close) |
| 4 | Ctrl+W with focus in page text field | delivered* | same caveat as #3 |
| 5 | Ctrl+B then c/v/x/z/g/b/1/n/p/q | delivered | every command char arrived plain after the prefix |
| 6 | Esc | delivered | `Escape/Escape` |
| 7 | Ctrl+[ | delivered | `keydown [ BracketLeft ctrl=yes` |
| 8 | Ctrl+A/E/K/Y in field | delivered | all four arrived with ctrl=yes |
| 9 | Tab | delivered | `Tab/Tab`, no text insertion |
| 10 | AltGr sequence | partial | CDP decomposes AltGr to Control+Alt; `e`/`q` arrive with ctrl+alt but no composed character (é/€) — character production untestable synthetically |
| 11 | IME / composition | untested | composition requires a real IME; cannot be synthesized |
| 12 | Ctrl+B then ? (help) | partial | `?` arrived (key=`?`, code=`Slash`) but with **shift=no** — a CDP dispatch artifact; the real question (does Shift survive the prefix) is unanswered |
| 13 | Ctrl+B then Shift+N | delivered | Shift keydown precedes; `n KeyN shift=yes` — modifier survives |
| 14 | Ctrl+B then Shift+T | delivered | same as #13 |
| 15 | Ctrl+B then - | delivered | `Minus` plain after prefix |
| 16 | Ctrl+B then h/j/k/l | delivered | all four arrive plain after prefix |
| 17 | Ctrl+B then [ (copy-mode) | delivered | prefix then plain `[ BracketLeft` — distinct from #7 as designed |
| 18 | Enter (plain) | delivered | `Enter/Enter` |

Additional policy-relevant observations:

- **Clipboard:** `navigator.clipboard.writeText` succeeded (CDP grants permission without a user
  gesture). Not representative of real-browser behavior; the fallback path (summary selected in
  textarea) exists in the probe and its handler was exercised.
- **Prefix semantics signal:** in every prefix chord, the follow-up key arrived with modifiers
  cleared — the property Herdr's second-press semantics depend on. Encouraging, but certification
  still requires the physical pass.

| Run | Command / harness | Probe self-check | Notes |
| --- | --- | --- | --- |
| 1 | Playwright CDP (`page.keyboard.press`), Chromium 158 headless-capable, Linux x86_64, 2026-11-23 | PASS 9/9 | Non-certifying; results table above. Does not test Firefox or any browser-chrome interception |

Known limitation: synthetic `KeyboardEvent`s are untrusted, never pass through browser chrome, and
carry whatever fields the dispatcher sets. They cannot show that Ctrl+W is consumed before the page.

## User authorization (2026-11-23)

The user closed the Gate-1 evidence question by decision, without a physical Firefox pass. Recorded
instruction: *"mark as passed. my default browser is essentially firefox"* — given after reviewing
the synthetic pass results and the live probe state. Accepted basis:

1. Synthetic 18-item pass (Chromium 158, CDP input, non-certifying): all chords delivered at page
   level with correct `key`/`code`/modifier properties; prefix follow-ups arrive with modifiers
   cleared.
2. Two physical chords (Ctrl+A, Ctrl+C) pressed by the user in the visible probe window — real
   hardware → OS → browser → page delivery, Chromium, delivered.
3. The user's designation of Firefox as their default browser.

**This is an acceptance decision, not a measurement.** No Firefox data exists. The decision is
recorded as ADR-0005. The consequences and residual risks are recorded in "Claim status" and
"Supported envelope" below. Any future claim of a *measured* Firefox envelope (e.g., for a wider
release) still requires the physical pass.

## Supported envelope (published 2026-11-23, basis: user authorization above)

- **Target environment:** Linux x86_64, keyboard required, en-US/US layout.
- **Verified-by-evidence browser:** Chromium ≥158 (synthetic 18/18 + 2 physical chords).
- **Accepted-by-decision browser:** Firefox (any recent) — delivery presumed equivalent to the
  Chromium evidence; **presumed-intercepted risk chords:** Ctrl+W plain and Ctrl+W in field
  (items #3/#4). The game's capture layer must treat Ctrl+W as a chord that may close the tab on
  real Firefox and must never place a required action behind it (hold policy below covers this;
  the probe warning panel documents the interception for players).
- **Excluded from taught scope (unchanged):** IME/composition (item #11) and AltGr character
  production (item #10, partial) — lessons ship ASCII-only under the standing field-edge
  constraint. The Shift-survival question for prefix+`?` (item #12) is answered by the Shift+N/T
  evidence (#13/#14 delivered with shift=yes); the synthetic `?` row's shift=no is a CDP dispatch
  artifact, recorded as such.
- **Hold policies (decided, binding on all capture lessons):**
  1. **Pending-prefix on host blur → void.** If the window loses focus between the prefix and the
     action key, the pending prefix is discarded; the attempt is voided (re-triable), never failed.
     Matches LEVEL.md's standing blur rule; deterministic and replay-safe.
  2. **Capture release affordance → separate external control (amended at M2 approval).**
     Escape inside the simulated TUI is **Herdr-owned**: it always follows authentic pinned
     behavior (cancel prefix, exit copy mode, close overlays) and is never hijacked for release.
     Release is provided by a visually and semantically external control in page chrome — a
     button, keyboard-reachable via browser focus order whenever the capture context is not
     capturing — plus a visible pending-prefix indicator. **Both paths tested at M2:** (a) Esc
     performs authentic Herdr behavior inside the TUI; (b) the release control is reachable and
     activatable by keyboard without entering the Herdr input path.
  3. **Clipboard failure → assessment-neutral fallback.** Copy actions are assessed as *page-level
     copy requested* (the action), never as OS-clipboard success. The probe's fallback pattern
     (summary selected in a textarea) is the UI precedent. The standing paste rule (LEVEL.md) already
     keeps story paste off assessed keybindings.



## Claim status

**Envelope claimed on the recorded user authorization (2026-11-23), not on measurement.** Chromium
158 delivery is evidenced (synthetic 18/18 + two physical chords); Firefox delivery is accepted by
user decision with Ctrl+W plain/in-field flagged as presumed-intercepted risk chords. IME and AltGr
character production remain unmeasured and outside taught scope. A *measured* Firefox claim still
requires the physical pass; Safari/Edge are untouched and unsupported until measured.
