# Herdr research

Baseline: upstream [`herdrdev/herdr`](https://github.com/herdrdev/herdr) at commit [`e8d7d9705a7a2c89cef4dd42079379f05685af87`](https://github.com/herdrdev/herdr/tree/e8d7d9705a7a2c89cef4dd42079379f05685af87) ("fix: retry interrupted handoff reads; reap pane shells in 500+ pane sessions (#6107)"), inspected in a local shallow clone. Current stable documentation edition is 0.9.5 at `docs/versions/0.9.5/website/src/content/docs/`.

Status: source-backed working baseline, subject to reconciliation. Scope: behavior the game needs. Features outside the taught curriculum are not investigated to upstream-test depth; they are listed as open gaps rather than asserted.

All behavior claims carry their evidence location. Where upstream documentation and source disagree, the discrepancy is recorded, not averaged.

## Documentation coverage

Full text read at the pinned edition (22 English `.mdx` files, 4824 lines; per-file SHA256 inventory at `/tmp/opencode/inventory.txt`):

| File | Lines | Relevance |
|---|---:|---|
| [keyboard](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/docs/versions/0.9.5/website/src/content/docs/keyboard.mdx) | 140 | Prefix model, bindings, field editing, copy mode, host-interception guidance |
| [concepts](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/docs/versions/0.9.5/website/src/content/docs/concepts.mdx) | 89 | Session/workspace/tab/pane/agent model |
| [quick-start](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/docs/versions/0.9.5/website/src/content/docs/quick-start.mdx) | 75 | First-run, detach, mouse-first onboarding |
| [configuration](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/docs/versions/0.9.5/website/src/content/docs/configuration.mdx) | 615 | `[keys]`, `[terminal]`, `[ui]`, `[theme]`, `[session]`, `[experimental]` |
| [config-reference.mdx](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/docs/versions/0.9.5/website/src/content/docs/config-reference.mdx) | 21 | Dynamic `<ConfigReference />` component; source of truth is `config-reference.json` (1540 lines), not this file |
| [session-state](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/docs/versions/0.9.5/website/src/content/docs/session-state.mdx) | 136 | Detach/restart/update survival, snapshots, agent restore |
| [persistence-remote](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/docs/versions/0.9.5/website/src/content/docs/persistence-remote.mdx) | 164 | Reattach, named sessions, remote attach |
| [how-to-work](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/docs/versions/0.9.5/website/src/content/docs/how-to-work.mdx) | 103 | Local/SSH/phone workflows, detach guidance |
| [agents](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/docs/versions/0.9.5/website/src/content/docs/agents.mdx) | 175 | Supported agents, detection manifests, state rollup |
| [integrations](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/docs/versions/0.9.5/website/src/content/docs/integrations.mdx) | 372 | Integration install/status/update |
| [add-herdr-support](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/docs/versions/0.9.5/website/src/content/docs/add-herdr-support.mdx) | 114 | Agent integration minimum versions, resume commands |
| [agent-automation](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/docs/versions/0.9.5/website/src/content/docs/agent-automation.mdx) | 127 | Agent-side automation via socket API |
| [agent-skill](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/docs/versions/0.9.5/website/src/content/docs/agent-skill.mdx) | 67 | Agent skill reporting commands |
| [socket-api](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/docs/versions/0.9.5/website/src/content/docs/socket-api.mdx) | 958 | Raw socket methods; code-derived shapes |
| [cli-reference](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/docs/versions/0.9.5/website/src/content/docs/cli-reference.mdx) | 574 | CLI commands and response shapes |
| [plugins](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/docs/versions/0.9.5/website/src/content/docs/plugins.mdx) | 390 | Plugin manifests, panes, keybindings |
| [marketplace](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/docs/versions/0.9.5/website/src/content/docs/marketplace.mdx) | 54 | Plugin discovery/publication |
| [connecting-machines](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/docs/versions/0.9.5/website/src/content/docs/connecting-machines.mdx) | 128 | Saved SSH machines |
| [install](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/docs/versions/0.9.5/website/src/content/docs/install.mdx) | 158 | Install/update channels |
| [troubleshooting](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/docs/versions/0.9.5/website/src/content/docs/troubleshooting.mdx) | 120 | Input/keybinding/session diagnostics |
| [windows-beta](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/docs/versions/0.9.5/website/src/content/docs/windows-beta.mdx) | 162 | ConPTY, keyboard, capability caveats |
| [index](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/docs/versions/0.9.5/website/src/content/docs/index.mdx) | 82 | Landing page with component imports, not content |

Not read as text: rendered `<ConfigReference />` and `<CardGrid />` components; `next/`/`preview/` editions beyond inventory; translated archives. Not covered: deep behavior contracts for plugins, marketplace publication, remote-machine management, and the full socket surface. The game needs only its pinned subset, and `HERDR_FIDELITY.md` must say so.

## Verified contracts with source evidence

### Hierarchy and modes

- Model: session → workspace → tab → pane → detected agent; panes host terminal processes [concepts.mdx; agents.mdx].
- Modes: terminal input, prefix, navigate; mouse-first UI with keyboard optional [keyboard.mdx:1–15; concepts.mdx].

### Keyboard

Default prefix `ctrl+b`: press, release, then the action key [keyboard.mdx:16–20]. Defaults per [keyboard.mdx] + `config-reference.json`:

| Action | Default | Notes |
|---|---|---|
| New tab | `prefix+c` | |
| Split right / down | `prefix+v` / `prefix+minus` | |
| Focus pane left/down/up/right | `prefix+h/j/k/l` | The only default pane-focus bindings |
| Workspace navigation | `prefix+w` | |
| Detach | `prefix+q` | |
| Zoom | `prefix+z` | |
| Close pane | `prefix+x` | |
| Swap panes | `prefix+shift+h/j/k/l` | |
| Resize mode | `prefix+r` | Direct resize chords exist only as config examples, not defaults |
| Copy mode | `prefix+[` | |
| Next/previous tab | `prefix+n` / `prefix+p` | |
| Jump tab 1–9 | `prefix+1..9` | |
| Rename tab | `prefix+shift+t` | |
| Close tab | `prefix+shift+x` | |
| New/rename/close workspace | `prefix+shift+n/w/d` | |
| Goto picker | `prefix+g` | |
| Toggle sidebar | `prefix+b` | |
| Help | `prefix+?` | `/` filters; `Backspace` edits the filter; `ctrl+u` clears it |

Copy mode (focused pane): movement `h/j/k/l`, tmux `w/b/e`, big-word `W/B/E`, `{`/`}`, PageUp/Down, `ctrl+b/f/u/d`; search `/`/`?` repeated by `n`/`N`; selection `v`/`Space`/`V`; copy `y`/`Enter`; exit `q`/`Esc` (Esc clears an active selection/search first); search is case-insensitive unless the query contains an uppercase letter; output stays live; the configured prefix keeps its normal meaning, so with the default prefix `ctrl+b` enters prefix mode rather than paging up [keyboard.mdx].

Herdr-owned text fields: `Ctrl+B/F`, `Ctrl+A/E`, `Alt+B/F`, `Backspace`/`Ctrl+H`, `Delete`/`Ctrl+D`, `Ctrl+U/K`, `Ctrl+W`/`Alt+Backspace`/`Ctrl+Backspace` (word cut), `Alt+D`, `Ctrl+Y`; cut buffers stay within the current field [keyboard.mdx].

Navigation surfaces are distinct:

- `prefix+w` workspace navigator: selection movement and exits per [keyboard.mdx].
- `prefix+g` goto picker: rows grouped by workspace; `/` searches names, agent kinds, tabs, workspaces, branches, paths; `j/k`/Up/Down move rows when not typing; Left/Right jumps to the first agent/terminal in the previous/next workspace section without wrapping; while editing a search, Left/Right move the text cursor; `b/w/i/d` filter blocked/working/idle/done agents and `a` shows all terminals; Esc/`Ctrl+[` leaves [keyboard.mdx].
- `prefix+b` toggles the sidebar [keyboard.mdx].

Earlier drafts conflated these surfaces; this document is the corrected record.

Host-interception guidance: chords must survive OS, outer terminal, and inner programs; if a direct chord does nothing, the host consumed it; rebind either side [keyboard.mdx]. The `ctrl+alt` family is documented as widely free, with named exceptions (`ctrl+alt+arrows`, `+t`, `+l/a`, `+s/u`, `+f1..f12`) [keyboard.mdx]. Non-Latin layouts: ctrl-only shortcuts may use the physical base key reported by a Kitty-capable host; Latin characters, `Ctrl+Shift` chords, and AltGr keep their layout meaning [keyboard.mdx].

### Lifecycle (production source)

- Detach: client sends `ClientMessage::Detach` (`src/client/endpoint/registry.rs:369`; tag check `src/protocol/wire.rs:2008`; server handling `src/server/client_transport.rs:1511`). Server and processes continue; reattach restores state [keyboard.mdx; session-state.mdx "What survives"]. The detach action only flips the client's own Detach flag (`src/client/shell/actions.rs:10–12`); it never touches panes.
- Close pane: TUI dispatch `src/client/shell/actions.rs:115–123` → `request_pane_close` (`src/client/shell/overlay_input.rs:1030–1061`) → endpoint request chain (`src/client/shell/shell_runtime.rs:15–35`; headless `src/client/shell/endpoint_requests.rs:95–132`; view plumbing `src/client/shell/client_views.rs:910–959`) → `src/client/shell/app/api.rs:1117,1211` → API `src/app/api/panes.rs:1967–2032` → workspace `src/workspace.rs:1111–1140` → tab `src/workspace/tab.rs:426–440` → `detach_pane` (`src/workspace/tab.rs:501–516`, returns `None` when it would empty the tab) → terminal cleanup `src/app/actions.rs:628–645` (removes unattached terminal state, queues runtime shutdowns) and `src/app/runtime.rs:30–41` (`Runtime::shutdown` on removed runtimes). Pane runtime stop: `src/pane.rs:2233–2245` (`PaneRuntime::shutdown`: abort detection, PTY actor shutdown, then process termination; `Drop` at `src/pane.rs:1702–1717` does the same); process kill `src/pane.rs:1760–1807` signals session PIDs with bounded waits. PTY I/O cutoff: `src/pty/actor.rs:186–199` (bounded Enter grace) and `src/pty/actor/unix.rs:359–370` (accepting=false + Shutdown control). Both ordinary and last-workspace branches drain runtime shutdowns immediately in the same request (`panes.rs:1997–2015` workspace branch, `panes.rs:2016–2029` ordinary branch). **Closing a pane ends that terminal's runtime synchronously; it is not a safe detour around process loss.** Earlier drafts claiming "process preserved, cleaned up later" were wrong.
- Close-pane confirmation: with `confirm_close` enabled, closing the last pane of the last tab in a workspace raises a confirmation overlay instead of closing (`src/client/shell/overlay_input.rs:1030–1061`). The post-confirmation accept path was not traced; the game must not assert behavior beyond the gate itself.
- Platform process-kill differences: Linux enumerates session PIDs via `/proc` and escalates SIGHUP→SIGTERM→SIGKILL with ~250 ms waits (`src/platform/linux.rs:801–841`); macOS does the same with `getsid` (`src/platform/macos.rs:1126–1195`); Windows hard-terminates descendants and does not implement the HUP/TERM escalation (`src/platform/windows.rs:2771–2807`). The simulated lifecycle must match the pinned platform's contract when process termination is part of a lesson.
- Close tab (`prefix+shift+x`) and close workspace (`prefix+shift+d`) use the same cleanup family. Worktree-group confirmation paths exist (`src/app/actions.rs` helpers there are `#[cfg(test)]`; production entry is the API path above). Upstream documentation does not state checkout-deletion behavior for every branch; lessons on close-workspace must stay inside verified behavior or be marked unresolved.
- Server restart without handoff: pane processes lost; layout restored from snapshot; panes return as fresh shells [session-state.mdx]. `--handoff` is opt-in experimental, best-effort, and does not preserve in-flight coordination [session-state.mdx].
- Auto-repeat under a changed input context is tracked and reprocessed, never discarded (`src/input.rs` lease behavior; see prefix semantics).

### Prefix semantics (source, with unresolved edges)

`src/input.rs:667–719`: in Terminal mode, a direct binding resolves first; then the prefix check arms Prefix mode (`:667–680`). In Prefix mode (`:681–709`): a second prefix press exits prefix mode and forwards the prefix key to the focused pane (`:689–693`); Escape exits (`:694–697`); a valid prefix binding resolves and runs (`:699–705`); anything else is consumed and exits with no action and no forwarded key (`:707–709`). Repeat handling: `src/input.rs:391–405` computes a `RepeatPlan` against the context after the press is consumed; `src/input/lease.rs:94–157` reprocesses same-context repeats and suppresses repeats when the context changed; focus loss clears that source's leases (`src/client/shell/input.rs:443–463`). No time-based prefix timeout exists in the inspected code. Help is bound to `prefix+?` by default (`src/config/model.rs:340,1124`) and opens a Help overlay (`src/client/shell/actions.rs:51–59`); the keybinding reference data is `docs/config-reference.json` (`src/config/keybinds.rs:2341–2343`). Default `KeysConfig` includes only `prefix+h/j/k/l` among pane-focus actions (`src/config/model.rs:1120–1182`); direct `ctrl+alt` focus and resize chords are configuration examples, not defaults. Unresolved until the fidelity pass: whether a repeat arriving while still in Prefix mode is forwarded as the original prefix key or as a new press (`lease.rs:130` vs `:152`), prefix behavior across host focus loss and window blur, and nested-mode interaction (e.g. prefix pending while a copy-mode pane is focused — the return-mode selection at `input.rs:682–688` shows the intended shape, edge cases unverified).

### Agents (source)

- Raw states in `src/detect/mod.rs:9–20` are only `Idle|Working|Blocked|Unknown`; there is no raw `Done`. "Done" is a presentation rule: an `Idle` pane whose completion has not yet been acknowledged by this client (`src/app/agent_view.rs:325–333`; API mapping `src/app/api_helpers.rs:96–107`).
- "Seen" differs by side. Server: `mark_active_tab_seen` (`src/app/actions.rs:453–473`) marks every pane of the active tab; any non-idle transition marks seen; transitions to Idle from Working/Blocked are the completion events (`:22–29`). Client: per-pane `acknowledged`/`completed` sequence numbers with `seen()` = acknowledged ≥ completion (`src/client/endpoint/endpoint_agent_state.rs:43–175`), acknowledged when the pane surface is composed/focused. Done badges can differ between clients; `idle`/`done` do not certify that an unseen approval dialog is recognized, and background work may continue.
- Detection is based on the PTY session's process tree, with `/proc/<pid>/environ` hints (`src/pane.rs:568–570,681–712,868–914`; `src/platform/linux.rs:789–799`), matched against a recognized-agent allow-list (`src/detect/mod.rs:43–68,150–228`); a plain shell is `Unknown`. Herdr detects coding agents, not arbitrary "human operatives"; the game's fiction must map to processes Herdr plausibly detects.
- Native session restore requires minimum integration versions [session-state.mdx; add-herdr-support.mdx].
- Agent state is Herdr's observation, not ground truth about the fictional operative. Unresolved: exact client-side acknowledgment when a background agent finishes while another pane has focus.

### UI chrome (source-checked)

- Mode bars: the prefix/navigate/copy/resize bar renders at the bottom of the pane surface (`src/client/shell/render.rs:31–51`); it occupies the tab-bar rect only when `ui.tab_bar_position = "bottom"` (`src/client/shell/composition.rs:310–340`). Earlier drafts claiming unconditional tab-row replacement are corrected. The mode bar is suppressed while an overlay or the mobile navigate panel is active (`composition.rs:318–334`).
- Layout defaults: `tab_bar_position: Top`, `status_indicators: Dots`, `sidebar_width: 26` clamped [18, 36], `sidebar_start_collapsed: false`, collapsed mode Compact (width 4; Hidden = 0) (`src/config/model.rs:1198–1229`; `src/client/shell/config.rs:426–439`). Default sidebar rows: agents `[[state_icon, machine, workspace, tab], [agent]]`, spaces `[[state_icon, workspace], [branch, git_status]]`, `row_gap: 0` (`src/config/sidebar.rs:13,440–476`).
- Focus geometry: directional focus filters other panes by directional overlap, then edge distance → largest overlap → center distance → index (`src/layout.rs:369–424`; used via `src/app/api/panes.rs:2109–2120` and `handle_pane_focus_direction` `:663–718`; client dispatcher `src/client/shell/actions.rs:875–889`). It is geometry-based, not list-cycling, and does not wrap.
- Navigate mode: workspace up/down default to the `up`/`down` keys (`src/config/model.rs:1134–1135`); selection logic at `src/client/shell/workspace_navigation.rs:99–202`. Navigator overlay keys verified `j/k`, `up/down`, `Home/End/G` at `src/client/shell/overlay_input.rs:637–786`. Unresolved: which physical keys move selection in the sidebar list itself when the sidebar is a focus target, and whether they differ from the Navigator's set.
- Sidebar rows/tokens, `status_indicators = "symbols"`, zoom pill, window-title tokens per [configuration.mdx], with rules/hide interactions and symbols rendering unresolved pending the fidelity pass. `prefix+b` toggles client-local chrome only (`src/client/shell/actions.rs:13–21`; `src/client/shell/state.rs:1003–1014`); it is a client preference, not server state.
- The default keybind set is exactly the table above; anything else is a configuration example until verified in `config-reference.json` or source.

## Discrepancies and corrections recorded

1. Upstream docs say closing the terminal window keeps the server and agents running; source shows closing a pane shuts down that pane's runtime. Both are true for their own objects; the game must never present pane-close as detach.
2. Docs list `done` among agent states; source implements it as a per-client projection, not a raw enum value. Valid for UI fidelity; invalid as a global fact.
3. "Herdr intercepts before the OS" appeared in earlier drafts and is meaningless: input reaches Herdr only after OS/host delivery. The game teaches delivered behavior and must not promise interception.
4. Upstream `ctrl+alt` examples were mistaken for defaults in earlier drafts; they are configuration examples.

## Unresolved items (fidelity pass)

1. Browser-level `ctrl+b`/`ctrl+w` delivery per OS/browser/assistive-technology/layout: a tested envelope, not an assumption.
2. Prefix-mode behavior on host focus loss, window blur, and suspended tabs; repeat reclassification while still in Prefix mode.
3. Copy-mode and field-editing edges under IME/composition and AltGr.
4. Focus reflow after a close (which pane becomes focused); behavior when the snapshot's focused pane is already closed between snapshot and request.
5. Close-pane confirmation accept path beyond the gate; whether `Runtime::shutdown` covers plugin/other runtimes or only the closed terminal; close-workspace confirmation branches beyond the traced path; any checkout-deletion claims.
6. Sidebar rules/hide rendering details; symbols-mode glyph set; sidebar-list navigation keys as a focus target.
7. Client-side agent acknowledgment when a background agent finishes under a different focused pane.
8. Agent detection thresholds for borderline fictional processes.
9. Socket/CLI depth needed only if the architecture ever adopts the live-Herdr alternative (out of scope by default).

Each unresolved item blocks its related lesson rather than licensing invented behavior.

## Method notes

### Live-site consultation (2026-11-23)

The official live documentation at herdr.dev was fetched for six pages (`/tui/docs/how-to-work/`,
`/agents/`, `/agent-automation/`, `/session-state/`, `/persistence-remote/`,
`/connecting-machines/`). All six have pinned-edition counterparts already inventoried above
(`how-to-work.mdx`, `agents.mdx`, `agent-automation.mdx`, `session-state.mdx`,
`persistence-remote.mdx`, `connecting-machines.mdx`). The live pages are the **current** edition;
the pinned 0.9.5 source remains behavioral authority for taught content. Facts verified consistent
across both (detach binding `ctrl+b q`; per-client Done/seen state; agent detection manifests with
integration reports winning over screen reads; named sessions owning sockets and runtime state;
server-restart restore semantics; direct-attach prefix semantics) are recorded as cross-checked.
Any live-page fact used in a contract must cite the pinned source line, not the website.

### Capture-harness incident record (2026-11-23)

Four attempts to run a second Herdr instance for visual-baseline captures killed the user's live
default-session server. Root cause: Herdr's server holder registry and the `herdr-core`
workspace/agent-state daemon resolve through fixed `/run/user/<uid>/herdr-core` paths that **no
environment variable redirects** (`XDG_CONFIG_HOME`, `XDG_STATE_HOME`, `XDG_RUNTIME_DIR` were all
isolated and the leak persisted; sandboxed TUIs even rendered the user's live workspace list).
Env-var isolation for a second Herdr instance is not real. Resolution: the pinned binary's own
**named sessions** (`herdr --session <name>`, documented in the pinned persistence-remote edition
as owning "its own panes, tabs, workspaces, sockets, and runtime state", sharing only the global
config file). Verified probe (2026-11-23): a `--session capture` instance with a private config
started fresh (empty spaces), and the user's default server survived the full sandbox lifecycle —
PID and workspace count unchanged before/after, including `session stop capture`. A fresh named
session names its initial workspace after the process cwd (`the-mandate`) — not user data.
`scripts/capture-upstream-baselines.sh` uses this mechanism; `server stop` must never appear in
its cleanup (only `session stop capture`).

Source citations use `path:line` at the pinned commit. Documentation claims cite edition paths. No runtime behavior was executed and no live Herdr session was driven for this research; no game prototype exists. Acceptance criteria for each taught contract belong in `HERDR_FIDELITY.md`.
