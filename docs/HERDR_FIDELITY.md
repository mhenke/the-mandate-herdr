# Herdr fidelity

Baseline: upstream commit [`e8d7d9705a7a2c89cef4dd42079379f05685af87`](https://github.com/herdrdev/herdr/tree/e8d7d9705a7a2c89cef4dd42079379f05685af87), documentation edition 0.9.5. Companion to `HERDR_RESEARCH.md`; this file defines the contracts the game must satisfy and the acceptance tests that prove it. Teaching claims may exceed neither document.

Rules:

1. A lesson may teach only behavior recorded in `HERDR_RESEARCH.md` with evidence. Unresolved items block their lessons.
2. Fictional actions live inside simulated pane applications. Never repurpose an authentic binding, never invent a Herdr command, never present a page affordance as a Herdr action.
3. Presentation projects Herdr; it does not redefine it. Effects may not drop, delay-authoritative, or misattribute input.
4. Browser interception is a constraint on delivery, not a feature to fake.
5. The full default keymap and config surface live in `config-reference.json`; config examples are not defaults.

## Chrome projection

| Element | Contract | Acceptance |
|---|---|---|
| Sidebar | Default desktop rows: agents `[[state_icon, machine, workspace, tab], [agent]]`, spaces `[[state_icon, workspace], [branch, git_status]]`; `row_gap: 0`; collapsed Compact width 4 (`config/sidebar.rs:440–476,13`; `shell/config.rs:426–439`) | Tokens render in configured order; missing values and their separators disappear; a row with no values disappears; missing-token behavior verified in fixtures before any rule/hide lesson |
| Tab row | Position `top` (default) or `bottom` via `ui.tab_bar_position` (`config/model.rs:1198–1229`) | Default top placement never shows the mode bar in the tab row |
| Mode bar | Renders at the bottom of the pane surface (`shell/render.rs:31–51`); occupies the tab-bar rect only when the tab bar is at the bottom (`shell/composition.rs:310–340`); suppressed while an overlay or mobile navigate panel is active | Entering/exiting each mode swaps presentation without moving focus or dropping keys; default top placement verified |
| Zoom pill | `ZOOM` appears in `tab_bar_right` while the active tab is zoomed; per-tab `Z` markers independent | Toggling zoom updates the pill only |
| Status area | Right-edge entries `{type="zoom"|"hostname"|"datetime"|"command"}` with `tab_bar_right_separator` | Separator removal concatenates directly |
| Window title | `window_title` tokens `{hostname} {workspace} {tab} {pane} {terminal_title}`; `{{`/`}}` literals | Empty-token segments render empty; no invented tokens |
| Agent indicators | Dots by default (`status_indicators: Dots`); `symbols` mode distinguishes states by shape+color; static glyphs | Mode switch changes glyphs only; color is never the sole status channel in game UI |
| Layout defaults | Sidebar width 26 clamped [18, 36]; start expanded (`config/model.rs:1198–1229`) | Geometry matches defaults unless a lesson explicitly changes configuration |

## Key contracts and acceptance criteria

### Prefix

| Behavior | Contract (source) | Acceptance |
|---|---|---|
| Enter prefix mode | `ctrl+b` press in Terminal mode arms one action key (`shell/input.rs:667–680`) | Next single key resolves to a binding or is consumed; consumed input does not reach the focused pane |
| Valid action | Resolves and exits prefix mode, returning to the prior mode (`input.rs:699–705`; return-mode selection `:682–688`) | Action executes; mode returns to Terminal or Copy as applicable |
| Invalid follow-up | Consumed; exits prefix mode; no action; nothing forwarded (`input.rs:707–709`) | Invalid key reaches neither binding nor pane |
| Escape | Exits prefix mode, no action (`input.rs:694–697`) | No pending action survives Esc |
| Second prefix | Exits prefix mode and forwards the prefix key to the focused pane (`input.rs:689–693`) | Pane receives the prefix character; not re-armed |
| Help | `prefix+?` opens Help overlay (`config/model.rs:340,1124`; `shell/actions.rs:51–59`); `/` filters; `Backspace` edits; `ctrl+u` clears | Help lists exactly the pinned active bindings |
| Held prefix | Same-context repeats are reprocessed; context changes suppress repeats (`input.rs:391–405`; `input/lease.rs:94–157`); focus loss clears leases (`shell/input.rs:443–463`) | No double action from a held key; repeat behavior matches the lease contract |

Unresolved (blocks lessons until resolved): pending prefix across host focus loss/blur; repeat classification while still in Prefix mode (`lease.rs:130` vs `:152`); prefix timing at composition boundaries.

### Core five (taught first)

| Action | Default | Acceptance |
|---|---|---|
| New tab | `prefix+c` | New tab becomes active with its own pane; rename applies (`prefix+shift+t`) |
| Split right / down | `prefix+v` / `prefix+minus` | Split tree updates; focus lands in the new pane; geometry respects existing splits |
| Focus panes | `prefix+h/j/k/l` | Focus moves only to an existing neighbor in the direction (`layout.rs:369–424` directional-overlap rule); no wrap; no focus loss |
| Workspace navigation | `prefix+w` | Navigate mode opens; up/down move workspace selection (`config/model.rs:1134–1135`; `workspace_navigation.rs:99–202`); Enter selects; Esc/`Ctrl+[` exits |
| Detach | `prefix+q` | Simulated client detaches (`shell/actions.rs:10–12` flag contract); session state preserved; reattach restores layout and running state per verified contract |

### Pane/tab/workspace actions

| Action | Default | Acceptance |
|---|---|---|
| Zoom | `prefix+z` | Toggles focused pane zoom; pill state matches |
| Close pane | `prefix+x` | Removes the pane and **stops that terminal's runtime synchronously** (`shell/actions.rs:115–123` → `overlay_input.rs:1030–1061` → `api/panes.rs:1967–2032` → `actions.rs:628–645` → `runtime.rs:30–41`; process kill `pane.rs:1760–1807`); platform kill contract follows the pinned platform (Unix HUP→TERM→KILL `platform/linux.rs:801–841`, `platform/macos.rs:1126–1195`; Windows hard-terminate `platform/windows.rs:2771–2807`); with `confirm_close`, last-pane-in-workspace raises the confirmation overlay (`overlay_input.rs:1030–1061`), whose post-confirm path is unresolved and untaught; distinct from detach in every explanation |
| Swap panes | `prefix+shift+h/j/k/l` | Positions swap; focus follows the focused pane |
| Resize mode | `prefix+r` | Mode bar hints; resize applies; exit returns cleanly (direct resize chords are config examples, not defaults) |
| Copy mode | `prefix+[` | Movement/search/selection/copy/exit per research; output stays live; search case rule matches; default prefix keeps its meaning (enters prefix mode, not page-up) |
| Tabs | `prefix+n/p`, `prefix+1..9`, `prefix+shift+t/x` | Switch/jump/rename/close behave; close-tab last-tab behavior follows the verified workspace branch |
| Workspaces | `prefix+shift+n/w/d` | Create/rename/close per verified contracts; close may require confirmation in worktree-group branches (`api/panes.rs:1981–1987`); checkout-deletion claims are out of scope until resolved |
| Goto picker | `prefix+g` | Rows grouped by workspace; `/` searches names/kinds/tabs/workspaces/branches/paths; `j/k`/Up/Down move rows; Home/End/G supported (`overlay_input.rs:637–786`); Left/Right jump workspace sections without wrap; `b/w/i/d` filter states and `a` clears filters; Esc/`Ctrl+[` exits |
| Sidebar | `prefix+b` | Toggles client-local chrome only (`shell/actions.rs:13–21`); does not alter focus or modes; sidebar-list navigation keys unresolved and untaught |

### Field editing (Herdr-owned fields)

`Ctrl+B/F`, `Ctrl+A/E`, `Alt+B/F`, `Backspace`/`Ctrl+H`, `Delete`/`Ctrl+D`, `Ctrl+U/K`, `Ctrl+W`/`Alt+Backspace`/`Ctrl+Backspace`, `Alt+D`, `Ctrl+Y`; grapheme-aware; cut buffers stay in-field. Acceptance: no field operation leaks into the system clipboard; `Ctrl+W` inside a Herdr field cuts a word and is visibly distinct from any browser/host behavior.

### Agent status projection

| Contract | Acceptance |
|---|---|
| Raw states are `Idle|Working|Blocked|Unknown` (`detect/mod.rs:9–20`); "done" is presentation: an Idle pane not yet acknowledged by this client (`agent_view.rs:325–333`; `api_helpers.rs:96–107`) | A done badge means this client's projection, never proof of story truth; game may not assert unseen approvals are recognized |
| Seen is per-client: acknowledged ≥ completion sequence, acknowledged on pane-surface composition (`endpoint_agent_state.rs:43–175`); server-side marking is a different rule (`actions.rs:453–473`) | Simulated done/seen semantics choose and document one consistent rule; cross-client divergence, when taught, is labeled as upstream behavior |
| Detection is process-based: PTY session process tree + `/proc` hints + allow-list; plain shell = Unknown (`pane.rs:568–570,681–712,868–914`; `platform/linux.rs:789–799`; `detect/mod.rs:43–68,150–228`) | Fictional operatives map to plausibly detected processes; no claim of detecting humans |
| State changes do not move focus or drop input | No rerender-induced focus loss |

## Presentation safety

- Effects (reveals, glitches, transitions) run after committed state; they cannot gate or delay objective authority.
- Never present pane-close as "keeps running like detach." Never present a Reconnect button as reattach. Never write to the user's real `~/.config/herdr`.
- Story-only controls are visually and semantically external to chrome.
- Color-only status is prohibited; provide text/shape and programmatic labels.
- The mode bar placement contract (bottom pane area, not the tab row) is verified; a lesson that shows it otherwise fails fidelity review.

## Unresolved contracts (block lessons, no invention)

1. Browser delivery of `ctrl+b` and sequential prefix across the supported OS/browser/AT/layout matrix; plus `ctrl+w` only in taught field contexts. — **RESOLVED 2026-11-23 (feasibility, user-accepted basis):** Chromium 158 synthetic pass delivered all taught chords; Firefox accepted by user decision with Ctrl+W risk-chord handling; no required action may sit behind Ctrl+W. A *measured* cross-browser claim reopens this item.
2. Host-blur/suspend pending-prefix policy; capture release affordance. — **RESOLVED 2026-11-23 (policy):** blur voids the pending prefix (attempt voided, never failed); release is Esc plus a visible pending indicator (presentation only, never presented as a Herdr binding).
3. IME/composition and AltGr interaction with prefix, copy mode, and field editing.
4. Focus reflow after a close; already-closed focused pane between snapshot and request.
5. Close-pane confirmation accept path; `Runtime::shutdown` scope (plugins vs terminal only); close-workspace confirmation branches beyond the traced path; any checkout-deletion claims.
6. Sidebar rules/hide edge cases; symbols-mode glyph specifics; sidebar-list navigation keys.
7. Client-side agent acknowledgment for background completions under a different focused pane.
8. Agent detection edge thresholds for borderline fictional processes.
9. Any behavior depending on unverified upstream branches (e.g., handoff timing details).

Each unresolved item lists its blocking lesson and acceptance plan in `LEVEL.md` once level contracts exist. Until then, affected lessons are out of scope.

## Verification protocol

1. Static: fixtures assert simulated transition outputs against pinned contracts (commands, modes, bindings, lifecycle).
2. Input-matrix: physical-key tests per the architecture feasibility gate; synthetic DOM events cannot certify host survival.
3. Manual: screen reader, keyboard-only, reduced motion, zoom, and capture-escape walks on the published envelope.
4. Upgrade: re-run affected fixtures/tests on any upstream baseline change; update this file's pinned commit first.
