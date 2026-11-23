#!/usr/bin/env bash
# Capture visual-regression baselines from the real pinned upstream Herdr TUI.
#
# ISOLATION (read before modifying): a naive second Herdr instance here killed
# the user's live default-session server FOUR times on 2026-11-23. Herdr's
# holder registry and the herdr-core state daemon resolve fixed /run/user/<uid>
# paths; env-var isolation does NOT work. This script therefore runs the pinned
# binary with a NAMED session (--session capture) plus a private config dir:
# the named session owns its own sockets and runtime state (official Herdr
# behavior), and cleanup uses ONLY `session stop capture` — never
# `server stop`, which resolves the default session and can kill the user's
# live server. Verified probe 2026-11-23: user's default server PID and
# workspace count unchanged across the full lifecycle.
#
# Baselines produced here are the ONLY legitimate visual-regression baselines
# (docs/ARCHITECTURE.md:152, docs/TECH_STACK.md:33-34). The images in
# assets/reference/ are illustrative only and are never baselines.
#
# Deterministic capture settings (hard constants, do not tune per run):
#   terminal   ghostty 1.3.1 (X11 backend under Xvfb)
#   font       DejaVu Sans Mono, size 13
#   grid       120 cols x 40 rows, zero window padding, no decorations
#   TERM       xterm-256color
#   isolation  private XDG_CONFIG_HOME/XDG_STATE_HOME, single-instance disabled
#
# Taught states and their contracts:
#   01-initial-layout  docs/HERDR_FIDELITY.md:47  (split right/down = prefix+v / prefix+minus)
#                      docs/HERDR_FIDELITY.md:18  (tab row, default top placement)
#   02-sidebar         docs/HERDR_FIDELITY.md:17  (sidebar agent/space rows)
#   03-mode-bar        docs/HERDR_FIDELITY.md:19  (mode bar at bottom of pane surface)
#   04-prefix-pending  docs/HERDR_FIDELITY.md:32  (ctrl+b arms prefix mode)
#   05-copy-mode       docs/HERDR_FIDELITY.md:60  (prefix+[ enters copy mode)
#   06-help            docs/HERDR_FIDELITY.md:37  (prefix+? opens Help overlay)
#
# Usage: scripts/capture-upstream-baselines.sh
# See scripts/capture-upstream-baselines.README.md.

set -euo pipefail

# --- constants ---------------------------------------------------------------

UPSTREAM_COMMIT="e8d7d9705a7a2c89cef4dd42079379f05685af87"
HERDR_VERSION="0.9.5"
TERMINAL_LABEL="ghostty 1.3.1"
FONT_FAMILY="DejaVu Sans Mono"
FONT_SIZE=13
GRID_COLS=120
GRID_ROWS=40
TERM_VALUE="xterm-256color"
THEME_LABEL="herdr default dark theme; ghostty default colors"
GRID_LABEL="${GRID_COLS}x${GRID_ROWS}"
SETTLE_SECONDS="${SETTLE_SECONDS:-0.5}"

HERDR_BIN="${HERDR_BIN:-/tmp/opencode/the-mandate-research/herdr/target/release/herdr}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$REPO_ROOT/tests/e2e/__screenshots__/upstream"
MANIFEST="$OUT_DIR/manifest.json"

TMUX_SOCKET="herdr-baseline"
TMUX_SESSION="herdr-baseline"
CAPTURE_SESSION="capture"
XVFB_DISPLAY=":77"
XVFB_PID=""
GHOSTTY_PID=""
WORK_DIR=""

# --- helpers -----------------------------------------------------------------

die() { printf 'capture-upstream-baselines: %s\n' "$*" >&2; exit 1; }
log() { printf 'capture-upstream-baselines: %s\n' "$*" >&2; }

cleanup() {
  local status=$?
  [[ -n "$GHOSTTY_PID" ]] && kill "$GHOSTTY_PID" 2>/dev/null || true
  tmux -L "$TMUX_SOCKET" kill-server 2>/dev/null || true
  if [[ -n "$WORK_DIR" && -d "$WORK_DIR" ]]; then
    # Scoped to the named session ONLY. Never run `server stop` here: it
    # resolves the default session through the global holder registry and
    # kills the user's live server (see the incident note in the header).
    scrubbed_env "$HERDR_BIN" session stop "$CAPTURE_SESSION" >/dev/null 2>&1 || true
  fi
  [[ -n "$XVFB_PID" ]] && kill "$XVFB_PID" 2>/dev/null || true
  return $status
}
trap cleanup EXIT

# Herdr refuses to run nested inside another Herdr, and its server registry
# (herdr-core holder under XDG_RUNTIME_DIR) is global: an isolated server must
# NOT register into the user's default-holder slot or `server stop` can resolve
# through the registry and kill the USER's server. So every child herdr gets a
# fully private runtime: scrubbed env vars + private XDG_RUNTIME_DIR.
# XDG_RUNTIME_DIR is the load-bearing isolation: without it, this script killed
# the user's live server three times on 2026-11-23 (see M2 exit report).
scrubbed_env() {
  env -u HERDR_ENV -u HERDR_PANE_ID -u HERDR_TAB_ID -u HERDR_WORKSPACE_ID \
    -u HERDR_SOCKET_PATH -u HERDR_BIN_PATH -u TERM_PROGRAM \
    XDG_CONFIG_HOME="$WORK_DIR/config" \
    XDG_STATE_HOME="$WORK_DIR/state" \
    XDG_RUNTIME_DIR="$WORK_DIR/runtime" \
    HERDR_CONFIG_PATH="$WORK_DIR/config/herdr/config.toml" \
    TERM="$TERM_VALUE" \
    "$@"
}

herdr_cli() { scrubbed_env "$HERDR_BIN" "$@"; }

# --- precheck ----------------------------------------------------------------

[[ -x "$HERDR_BIN" ]] || die "upstream herdr binary not found at $HERDR_BIN
  Build it first (cargo build --release in the pinned clone at $UPSTREAM_COMMIT);
  this script never builds or runs cargo. Override with HERDR_BIN=<path>."

for tool in ghostty tmux import xdotool Xvfb; do
  command -v "$tool" >/dev/null 2>&1 || die "required tool missing: $tool"
done

ghostty_version="$(ghostty --version 2>/dev/null | head -1)"
[[ "$ghostty_version" == *"1.3.1"* ]] || die "expected ghostty 1.3.1, found: ${ghostty_version:-unknown}"

herdr_version="$("$HERDR_BIN" --version 2>/dev/null | head -1)"
[[ "$herdr_version" == *"$HERDR_VERSION"* ]] || die "expected herdr $HERDR_VERSION, found: ${herdr_version:-unknown}"

mkdir -p "$OUT_DIR"

# --- display -----------------------------------------------------------------

# Prefer a private Xvfb so window geometry and DPI never depend on the host
# session; fall back to an existing DISPLAY only if Xvfb cannot start.
if DISPLAY="$XVFB_DISPLAY" xdpyinfo >/dev/null 2>&1; then
  log "reusing Xvfb on $XVFB_DISPLAY"
  export DISPLAY="$XVFB_DISPLAY"
else
  log "starting Xvfb on $XVFB_DISPLAY"
  setsid nohup Xvfb "$XVFB_DISPLAY" -screen 0 1920x1080x24 -nolisten tcp \
    >/dev/null 2>&1 </dev/null &
  XVFB_PID=$!
  export DISPLAY="$XVFB_DISPLAY"
  for _ in $(seq 1 50); do
    xdpyinfo >/dev/null 2>&1 && break
    sleep 0.1
  done
  if ! xdpyinfo >/dev/null 2>&1; then
    XVFB_PID=""
    if [[ -n "${DISPLAY_OVERRIDE:-}" ]] && DISPLAY="$DISPLAY_OVERRIDE" xdpyinfo >/dev/null 2>&1; then
      export DISPLAY="$DISPLAY_OVERRIDE"
      log "Xvfb unavailable; falling back to DISPLAY=$DISPLAY"
    else
      die "no usable X display (Xvfb $XVFB_DISPLAY failed)"
    fi
  fi
fi

# --- isolated herdr config ---------------------------------------------------

WORK_DIR="$(mktemp -d "${TMPDIR:-/tmp}/herdr-baseline.XXXXXX")"
mkdir -p "$WORK_DIR/config/herdr" "$WORK_DIR/state" "$WORK_DIR/runtime"
cat >"$WORK_DIR/config/herdr/config.toml" <<'EOF'
# Deterministic capture config: no onboarding overlay, no update chatter.
onboarding = false

[update]
version_check = false
manifest_check = false
EOF

# --- launch: tmux session running herdr, attached inside ghostty --------------

log "starting tmux session '$TMUX_SESSION' running herdr (--session $CAPTURE_SESSION)"
tmux -L "$TMUX_SOCKET" new-session -d -s "$TMUX_SESSION" \
  -x "$GRID_COLS" -y "$GRID_ROWS" \
  "$(printf '%q ' env -u HERDR_ENV -u HERDR_PANE_ID -u HERDR_TAB_ID \
    -u HERDR_WORKSPACE_ID -u HERDR_SOCKET_PATH -u HERDR_BIN_PATH -u TERM_PROGRAM \
    XDG_CONFIG_HOME="$WORK_DIR/config" XDG_STATE_HOME="$WORK_DIR/state" \
    XDG_RUNTIME_DIR="$WORK_DIR/runtime" \
    HERDR_CONFIG_PATH="$WORK_DIR/config/herdr/config.toml" TERM="$TERM_VALUE" \
    "$HERDR_BIN" --session "$CAPTURE_SESSION")"
# tmux must not eat ctrl+b (Herdr's prefix) and must not add its own chrome.
tmux -L "$TMUX_SOCKET" set-option -g prefix C-a
tmux -L "$TMUX_SOCKET" set-option -g status off
tmux -L "$TMUX_SOCKET" set-option -g window-size manual

log "launching ghostty (${GRID_COLS}x${GRID_ROWS}, $FONT_FAMILY $FONT_SIZE)"
env -u WAYLAND_DISPLAY GDK_BACKEND=x11 DISPLAY="$DISPLAY" TERM="$TERM_VALUE" \
  setsid nohup ghostty \
  --config-default-files=false \
  --font-family="$FONT_FAMILY" \
  --font-size="$FONT_SIZE" \
  --window-padding-x=0 \
  --window-padding-y=0 \
  --window-width="$GRID_COLS" \
  --window-height="$GRID_ROWS" \
  --gtk-single-instance=false \
  --window-decoration=false \
  --window-save-state=never \
  --confirm-close-surface=false \
  --shell-integration=none \
  -e tmux -L "$TMUX_SOCKET" attach-session -t "$TMUX_SESSION" \
  >"$WORK_DIR/ghostty.log" 2>&1 </dev/null &
GHOSTTY_PID=$!

# Wait for the ghostty window to appear and settle.
WINDOW_ID=""
for _ in $(seq 1 100); do
  for candidate in $(xdotool search --onlyvisible --class ghostty 2>/dev/null || true); do
    geometry="$(xdotool getwindowgeometry "$candidate" 2>/dev/null || true)"
    if [[ "$geometry" =~ Geometry:\ ([0-9]+)x([0-9]+) ]]; then
      if (( BASH_REMATCH[1] > 100 && BASH_REMATCH[2] > 100 )); then
        WINDOW_ID="$candidate"
        break 2
      fi
    fi
  done
  sleep 0.1
done
[[ -n "$WINDOW_ID" ]] || die "ghostty window never appeared (see $WORK_DIR/ghostty.log)"
log "ghostty window id $WINDOW_ID"

# Herdr needs a moment to paint its first frame; wait for the sidebar header
# rather than a fixed sleep so slow machines do not race the first keystroke.
for _ in $(seq 1 100); do
  tmux -L "$TMUX_SOCKET" capture-pane -p -t "$TMUX_SESSION" 2>/dev/null \
    | grep -qF "spaces" && break
  sleep 0.1
done
tmux -L "$TMUX_SOCKET" capture-pane -p -t "$TMUX_SESSION" 2>/dev/null \
  | grep -qF "spaces" || die "herdr TUI never painted (see $WORK_DIR/ghostty.log)"
sleep 1

# --- state driving -----------------------------------------------------------

# send_keys <keys...> — forward keys to the Herdr TUI through tmux.
send_keys() { tmux -L "$TMUX_SOCKET" send-keys -t "$TMUX_SESSION" "$@"; }

# expect_text <needle> — assert the rendered TUI contains a marker.
expect_text() {
  local needle="$1" screen
  screen="$(tmux -L "$TMUX_SOCKET" capture-pane -p -t "$TMUX_SESSION")"
  grep -qF -- "$needle" <<<"$screen" || die "expected '$needle' on screen; got:
$screen"
}

# capture <state> <keys> — screenshot the ghostty window into the baseline directory.
capture() {
  local state="$1" file="$OUT_DIR/$1.png"
  sleep "$SETTLE_SECONDS"
  import -window "$WINDOW_ID" "$file" 2>/dev/null || die "import failed for $state"
  [[ -s "$file" ]] || die "empty screenshot for $state"
  local dims
  dims="$(identify -format '%wx%h' "$file" 2>/dev/null || true)"
  [[ -n "$dims" ]] || die "unreadable screenshot for $state"
  log "captured $state ($dims)"
  CAPTURED_STATES+=("$state")
}

CAPTURED_STATES=()

# 01-initial-layout — fresh launch, then split right (prefix+v).
# docs/HERDR_FIDELITY.md:47; docs/HERDR_FIDELITY.md:18 (tab row, top default).
send_keys C-b; sleep 0.3; send_keys v
expect_text "┌"
capture 01-initial-layout "ctrl+b, v (split right)"

# 02-sidebar — sidebar with space rows and agent rows.
# docs/HERDR_FIDELITY.md:17. Agent rows come from the documented report-agent
# integration path (docs/versions/0.9.5/.../cli-reference.mdx:271-282), not from
# a fabricated process name.
herdr_cli pane report-agent w1:p1 --source baseline --agent claude --state working >/dev/null
herdr_cli pane report-agent w1:p2 --source baseline --agent codex --state blocked >/dev/null
expect_text "claude"
expect_text "codex"
capture 02-sidebar "report-agent CLI (claude working, codex blocked); no keys"

# 03-mode-bar — resize mode bar at the bottom of the pane surface.
# docs/HERDR_FIDELITY.md:19; docs/HERDR_FIDELITY.md:59 (prefix+r).
send_keys C-b; sleep 0.3; send_keys r
expect_text "RESIZE"
capture 03-mode-bar "ctrl+b, r (resize mode)"
send_keys Escape; sleep 0.3

# 04-prefix-pending — ctrl+b pressed once, prefix pending indicator visible.
# docs/HERDR_FIDELITY.md:32.
send_keys C-b
expect_text "PREFIX"
capture 04-prefix-pending "ctrl+b (prefix armed, pending)"
send_keys Escape; sleep 0.3

# 05-copy-mode — prefix then '[' enters copy mode.
# docs/HERDR_FIDELITY.md:60.
send_keys C-b; sleep 0.3; send_keys '['
expect_text "COPY"
capture 05-copy-mode "ctrl+b, [ (copy mode entry)"
send_keys Escape; sleep 0.3

# 06-help — prefix then '?' opens the Help overlay.
# docs/HERDR_FIDELITY.md:37.
send_keys C-b; sleep 0.3; send_keys '?'
expect_text "keybinds"
capture 06-help "ctrl+b, ? (help overlay)"
send_keys Escape; sleep 0.3

# --- manifest ----------------------------------------------------------------

captured_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
config_text="$(sed 's/"/\\"/g' "$WORK_DIR/config/herdr/config.toml")"
python3 - "$MANIFEST" "$captured_at" "$UPSTREAM_COMMIT" "$HERDR_VERSION" \
  "$TERMINAL_LABEL" "$FONT_FAMILY" "$FONT_SIZE" "$GRID_LABEL" \
  "$THEME_LABEL" "$config_text" \
  "01-initial-layout=ctrl+b then v (split right)" \
  "02-sidebar=report-agent CLI: claude working, codex blocked (no keys)" \
  "03-mode-bar=ctrl+b then r (resize mode)" \
  "04-prefix-pending=ctrl+b (prefix armed, pending)" \
  "05-copy-mode=ctrl+b then [ (copy mode entry)" \
  "06-help=ctrl+b then ? (help overlay)" <<'PY'
import json, sys

manifest_path, captured_at, commit, version, terminal, font, size, grid, theme, config_text, *keys = sys.argv[1:]
key_map = dict(kv.split("=", 1) for kv in keys)
states = list(key_map)
entries = [
    {
        "state": state,
        "file": f"{state}.png",
        "upstream_commit": commit,
        "herdr_version": version,
        "terminal": terminal,
        "font": font,
        "font_size": int(size),
        "grid": grid,
        "theme": theme,
        "terminal_config": config_text,
        "keys": key_map[state],
        "captured_at": captured_at,
    }
    for state in states
]
with open(manifest_path, "w", encoding="utf-8") as handle:
    json.dump(entries, handle, indent=2)
    handle.write("\n")
PY

log "wrote $MANIFEST (${#CAPTURED_STATES[@]} states)"
