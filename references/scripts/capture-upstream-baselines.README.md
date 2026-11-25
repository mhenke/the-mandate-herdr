# Capture harness: upstream Herdr visual baselines

Produces the visual-regression baselines from the **real pinned upstream Herdr**
(commit `e8d7d9705a7a2c89cef4dd42079379f05685af87`, version 0.9.5). These PNGs are the only
legitimate visual-regression baselines; `assets/reference/*` are illustrative-only.

## Run

```sh
bash scripts/capture-upstream-baselines.sh
```

Prerequisites: the built pinned binary (`HERDR_BIN` override supported), ghostty 1.3.1, tmux,
Xvfb, xdotool, ImageMagick (`import`/`identify`), python3, OMP, OpenCode.

The binary hash is pinned in the harness, not merely its `--version` string.
On 2026-11-24 the clean upstream checkout at the commit above was rebuilt with:

```sh
ZIG=/tmp/zig-0.16.0/zig cargo build --release --locked --offline
```

Exit 0. SHA-256:
`85df1850d2c3b34f9ec0aad2c46fd5c806f6b48a0481a6afc74acb4294e09ee1`.
An override must supply that verified binary; a different build requires a new
source verification and an explicit hash update.

## Safety: why this runs a named session

A naive second Herdr instance killed the user's live default-session server **four times**
(2026-11-23). Herdr's holder registry and the `herdr-core` state daemon use fixed
`/run/user/<uid>` paths; no environment variable isolates them. The script therefore runs
`herdr --session capture-<run-id>` with a private config dir — a named session owns its own sockets and
runtime state (official Herdr behavior, pinned persistence-remote docs) — and cleanup calls only
`session stop <that-name>`. **`server stop` must never be invoked by this script**: it resolves the
default session through the global registry and kills the user's server. Verified probe: the
user's default server PID and workspace count were unchanged across the full sandbox lifecycle.

## Determinism

| Setting | Value |
| --- | --- |
| Terminal | ghostty 1.3.1, X11 backend under a newly allocated private Xvfb |
| Font | DejaVu Sans Mono 13 |
| Grid | 120 cols × 40 rows, zero padding, no decorations |
| TERM | xterm-256color |
| Config | private `config.toml`: `onboarding = false`, update checks off |
| Pane process | `/bin/sh`, empty `ENV`, fixed `$ ` prompt (no user shell startup files) |

## States and provenance

Each PNG lands in `references/herdr-baselines/<state>.png`, alongside its
tmux screen-text transcript. `manifest.json` records provenance and input sequences.
States are **cumulative, in manifest order**; the script is the complete replay recipe,
not a collection of independent seeds.

The config changes only onboarding and update checks. Theme, chrome, bindings,
sidebar dimensions, tab placement, and confirmation policy remain upstream defaults.
Pane shell output is neutral demonstration material, not game canon.

## Capture coverage

| States | Purpose |
| --- | --- |
| `00-default` | Fresh, unsplit instance before any interaction |
| `01-initial-layout`–`06-help` | Original six: split layout, agent sidebar, resize, prefix, copy, Help |
| `07-help-filtered` | Help search |
| `08-focus-left`, `09-split-down` | Focus indicator and nested split geometry |
| `10-new-tab`–`12-named-tabs` | Default new-tab naming dialog, rename dialog, committed label and tab switching |
| `13-zoom`, `14-sidebar-compact` | Default per-tab `Z` zoom marker and compact sidebar |
| `15-new-workspace`, `15b-rename-workspace`, `16-workspace-navigation` | Immediate workspace creation, rename field, and navigation |
| `17-goto`–`19-goto-blocked` | Grouped goto picker, text search, blocked filter |
| `20-copy-search`, `21-copy-selection` | Copy-mode search and selection without clipboard writes |
| `22-agent-idle` | Visible idle state after a reported working state |
| `23-close-confirmation` | Last-pane confirmation, canceled; no accept-path claim |
| `24-omp`–`26-opencode-zoom` | Real OMP and OpenCode programs, split and zoomed |
| `27-click-new-tab`, `28-click-new-tab-committed` | Mouse click on tab bar `+` opens default new-tab naming dialog; label entry and Enter commits new tab |
| `29-click-new-workspace`, `30-click-new-workspace-committed` | Mouse click on sidebar ` new` creates and focuses workspace immediately; renamed via `prefix W` |

`02-sidebar` onward stages Claude-working / Codex-blocked via the official
`pane report-agent` integration API. Those rows are **reported fixtures**, not
running Claude or Codex processes. Later real-agent captures launch OMP with
tools/extensions/context discovery disabled and OpenCode with a private standalone
server. Both receive an empty inherited environment plus explicit PATH, TERM,
private HOME and private XDG directories; no user agent config or credentials are loaded.
No model prompt is submitted; no coding work or billed completion is needed.
OMP 19.1.1 is intentionally captured at its first-run provider setup; no sign-in
is attempted. OpenCode 2.4.0 is captured at its initial prompt.
No Done/seen semantics or unverified confirmation acceptance is inferred from a screenshot.

Two default behaviors matter when reproducing these states: `prefix+c` first
opens the **new tab** naming field (`prompt_new_tab_name = true`), whereas
`prefix+shift+n` creates a workspace immediately (`prompt_new_workspace_name = false`).
The mouse-driven creation flows test the identical routing: clicking `+` in the
tab strip (`hits.new_tab` in `tabs.rs`, width 3) opens the tab naming dialog,
and clicking ` new` in the sidebar (`hits.new_workspace` in `sidebar.rs`, width 5)
creates and focuses a new workspace immediately. Herdr enables crossterm SGR mouse
reporting (`mouse_capture = true` by default in `config/model.rs`). The harness
enables `set-option -g mouse on` in tmux, dispatching synthetic X11 clicks via
`xdotool` on the Ghostty window, reinforced by direct SGR mouse escape sequences
(`\e[<0;col;rowM`) into the pane pty. These exercise the exact click routing in
[`shell/mouse.rs:2049–2075`](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/src/client/shell/mouse.rs#L2049-L2075)
and [`shell/actions.rs:83–150`](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/src/client/shell/actions.rs#L83-L150).
Help and goto search require one Escape to leave search editing and a second
to close the overlay. These are source-backed observations, not new game contracts:
[`config/model.rs:1213–1215`](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/src/config/model.rs#L1213-L1215),
[`shell/overlay_input.rs:646–655`](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/src/client/shell/overlay_input.rs#L646-L655),
[`shell/overlay_input.rs:789–847`](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/src/client/shell/overlay_input.rs#L789-L847).
The default right-hand status area is empty: zoom displays the per-tab `Z`;
a `ZOOM` pill requires explicit configuration and is deliberately absent here
([pinned configuration:332](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/docs/versions/0.9.5/website/src/content/docs/configuration.mdx#L332)).

Authority: [pinned keyboard documentation](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/docs/versions/0.9.5/website/src/content/docs/keyboard.mdx),
[pinned CLI reference](https://github.com/herdrdev/herdr/blob/e8d7d9705a7a2c89cef4dd42079379f05685af87/docs/versions/0.9.5/website/src/content/docs/cli-reference.mdx),
and `docs/HERDR_FIDELITY.md`. Additional captures document upstream reference
states only; they do not authorize L4–L15 gameplay implementation.

Re-run after an upstream baseline bump (ADR-0002 protocol) to regenerate images,
transcripts, and manifest together. Never edit a PNG by hand or substitute an
illustration. OMP/OpenCode versions and their own UIs are host-dependent; only
the Herdr build and terminal settings are pinned.

The private tmux server ignores user configuration. Window capture is scoped to
the launched Ghostty PID on its private display, never the user's current window.
PNG hashes, binary hash, dimensions, and 40-row transcripts are checked before
publishing the complete bundle; a failed capture leaves the preceding bundle intact.
