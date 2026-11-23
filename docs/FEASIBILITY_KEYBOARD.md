# Feasibility: Keyboard Delivery (Gate 1)

Status: **probe built, no results.** Nothing in this document certifies browser keyboard behavior.
Every matrix cell is `untested` until a physical-key manual pass fills it.

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

Fill only from a physical-key manual pass. `untested` is the honest default; do not infer a cell
from another browser or from the synthetic pass.

| # | Test | Chrome | Firefox | Safari | Edge |
| --- | --- | --- | --- | --- | --- |
| 1 | Ctrl+B alone | untested | untested | untested | untested |
| 2 | Ctrl+B then w (sequential) | untested | untested | untested | untested |
| 3 | Ctrl+W plain | untested | untested | untested | untested |
| 4 | Ctrl+W with focus in page text field | untested | untested | untested | untested |
| 5 | Ctrl+B then c/v/x/z/g/b/1/n/p/q | untested | untested | untested | untested |
| 6 | Esc | untested | untested | untested | untested |
| 7 | Ctrl+[ | untested | untested | untested | untested |
| 8 | Ctrl+A / Ctrl+E / Ctrl+K / Ctrl+Y in text field | untested | untested | untested | untested |
| 9 | Tab | untested | untested | untested | untested |
| 10 | AltGr sequence (record what arrives) | untested | untested | untested | untested |
| 11 | IME / composition attempt | untested | untested | untested | untested |

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

To be filled by the parent. Headless or scripted results may be recorded here only with an explicit
statement that they are non-certifying and cannot establish interception. They test the probe, not
the browser.

| Run | Command / harness | Probe self-check | Notes |
| --- | --- | --- | --- |
| _pending_ | | | |

Known limitation: synthetic `KeyboardEvent`s are untrusted, never pass through browser chrome, and
carry whatever fields the dispatcher sets. They cannot show that Ctrl+W is consumed before the page.

## Claim status

**No support envelope is claimed.** Until a physical-key manual pass exists for a given browser,
nothing is known about that browser's delivery behavior beyond the page loading correctly. Do not
design fallback bindings, safe-key guidance, or an input-forwarding strategy on the assumption that
any chord above is delivered.
