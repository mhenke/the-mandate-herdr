#!/usr/bin/env bash
# Capture visual-regression baselines from the real pinned upstream Herdr TUI.
#
# ISOLATION (read before modifying): a naive second Herdr instance here killed
# the user's live default-session server FOUR times on 2026-11-23. Herdr's
# holder registry and the herdr-core state daemon resolve fixed /run/user/<uid>
# paths; env-var isolation does NOT work. This script therefore runs the pinned
# binary with a unique NAMED session plus a private config dir:
# the named session owns its own sockets and runtime state (official Herdr
# behavior), and cleanup stops ONLY the session created by this run — never
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
# Verified from a clean pinned checkout with Cargo --release --locked --offline and Zig 0.16.0.
HERDR_BINARY_SHA256="85df1850d2c3b34f9ec0aad2c46fd5c806f6b48a0481a6afc74acb4294e09ee1"
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
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PUBLISH_DIR="$REPO_ROOT/references/herdr-baselines"
OUT_DIR=""
MANIFEST=""

CAPTURE_SESSION="capture-$(date +%s%N)"
TMUX_SOCKET="$CAPTURE_SESSION"
TMUX_SESSION="herdr-baseline"
XVFB_DISPLAY=""
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
  if [[ $status == 0 && -n "$WORK_DIR" ]]; then
    rm -rf -- "$WORK_DIR"
  fi
  return $status
}
trap cleanup EXIT

# Named sessions provide isolation; the private XDG paths alone do not.
scrubbed_env() {
  env -u HERDR_ENV -u HERDR_PANE_ID -u HERDR_TAB_ID -u HERDR_WORKSPACE_ID \
    -u HERDR_SOCKET_PATH -u HERDR_BIN_PATH -u TERM_PROGRAM \
    XDG_CONFIG_HOME="$WORK_DIR/config" \
    XDG_STATE_HOME="$WORK_DIR/state" \
    XDG_RUNTIME_DIR="$WORK_DIR/runtime" \
    HERDR_CONFIG_PATH="$WORK_DIR/config/herdr/config.toml" \
    SHELL=/bin/sh ENV= PS1='$ ' \
    TERM="$TERM_VALUE" \
    "$@"
}

herdr_cli() { scrubbed_env "$HERDR_BIN" --session "$CAPTURE_SESSION" "$@"; }

# --- precheck ----------------------------------------------------------------

[[ -x "$HERDR_BIN" ]] || die "upstream herdr binary not found at $HERDR_BIN
  Build it first (cargo build --release in the pinned clone at $UPSTREAM_COMMIT);
  this script never builds or runs cargo. Override with HERDR_BIN=<path>."

for tool in ghostty tmux import identify xdotool Xvfb xdpyinfo python3 sha256sum omp opencode; do
  command -v "$tool" >/dev/null 2>&1 || die "required tool missing: $tool"
done

ghostty_version="$(ghostty --version 2>/dev/null | head -1)"
[[ "$ghostty_version" == *"1.3.1"* ]] || die "expected ghostty 1.3.1, found: ${ghostty_version:-unknown}"

herdr_version="$("$HERDR_BIN" --version 2>/dev/null | head -1)"
[[ "$herdr_version" == "herdr $HERDR_VERSION" ]] || die "expected herdr $HERDR_VERSION, found: ${herdr_version:-unknown}"
[[ "$(sha256sum "$HERDR_BIN" | cut -d ' ' -f 1)" == "$HERDR_BINARY_SHA256" ]] \
  || die "binary hash does not match the source-verified pinned build"

WORK_DIR="$(mktemp -d "${TMPDIR:-/tmp}/herdr-baseline.XXXXXX")"
OUT_DIR="$WORK_DIR/screenshots"
MANIFEST="$OUT_DIR/manifest.json"
mkdir -p "$OUT_DIR"

# Fail closed: never capture an unrelated window on the user's display.
log "starting a private Xvfb"
Xvfb -displayfd 3 -screen 0 1920x1080x24 -nolisten tcp \
  3>"$WORK_DIR/display" >"$WORK_DIR/xvfb.log" 2>&1 &
XVFB_PID=$!
for _ in $(seq 1 100); do
  [[ -s "$WORK_DIR/display" ]] && break
  kill -0 "$XVFB_PID" 2>/dev/null || die "Xvfb failed (see $WORK_DIR/xvfb.log)"
  sleep 0.1
done
[[ -s "$WORK_DIR/display" ]] || die "private Xvfb never became ready"
XVFB_DISPLAY=":$(cat "$WORK_DIR/display")"
export DISPLAY="$XVFB_DISPLAY"
xdpyinfo >/dev/null 2>&1 || die "private display $DISPLAY is unavailable"

# --- isolated herdr config ---------------------------------------------------

# Keep Herdr config private; do not replace the user's configuration.
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
tmux -L "$TMUX_SOCKET" -f /dev/null new-session -d -s "$TMUX_SESSION" \
  -x "$GRID_COLS" -y "$GRID_ROWS" \
  "$(printf '%q ' env -u HERDR_ENV -u HERDR_PANE_ID -u HERDR_TAB_ID \
    -u HERDR_WORKSPACE_ID -u HERDR_SOCKET_PATH -u HERDR_BIN_PATH -u TERM_PROGRAM \
    XDG_CONFIG_HOME="$WORK_DIR/config" XDG_STATE_HOME="$WORK_DIR/state" \
    XDG_RUNTIME_DIR="$WORK_DIR/runtime" \
    SHELL=/bin/sh ENV= PS1='$ ' \
    HERDR_CONFIG_PATH="$WORK_DIR/config/herdr/config.toml" TERM="$TERM_VALUE" \
    "$HERDR_BIN" --session "$CAPTURE_SESSION")"
# tmux must not eat ctrl+b (Herdr's prefix) and must not add its own chrome.
tmux -L "$TMUX_SOCKET" set-option -g prefix C-a
tmux -L "$TMUX_SOCKET" set-option -g status off
tmux -L "$TMUX_SOCKET" set-option -g window-size manual
tmux -L "$TMUX_SOCKET" set-option -g mouse on

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
  for candidate in $(xdotool search --onlyvisible --pid "$GHOSTTY_PID" 2>/dev/null || true); do
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
  for _ in $(seq 1 100); do
    screen="$(tmux -L "$TMUX_SOCKET" capture-pane -p -t "$TMUX_SESSION")"
    grep -qF -- "$needle" <<<"$screen" && return
    sleep 0.1
  done
  die "expected '$needle' on screen; got:
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
  tmux -L "$TMUX_SOCKET" capture-pane -p -t "$TMUX_SESSION" >"$OUT_DIR/$state.txt"
  log "captured $state ($dims)"
  CAPTURED_STATES+=("$state")
  CAPTURE_KEYS+=("$state=$2")
}

# click_cell <col> <row> [marker] — send mouse click at cell (col, row), 0-indexed.
# Attempts synthetic X11 mouse click on Ghostty first via xdotool;
# falls back to direct SGR mouse sequence (press M + release m) to tmux.
click_cell() {
  local col="$1" row="$2" marker="${3:-}"
  local px=$((col * 10 + 5))
  local py=$((row * 20 + 10))
  local sgr_col=$((col + 1))
  local sgr_row=$((row + 1))

  xdotool windowfocus --sync "$WINDOW_ID" 2>/dev/null || true
  xdotool mousemove --window "$WINDOW_ID" --sync "$px" "$py" click 1 2>/dev/null || true

  if [[ -n "$marker" ]]; then
    for _ in $(seq 1 10); do
      if tmux -L "$TMUX_SOCKET" capture-pane -p -t "$TMUX_SESSION" 2>/dev/null | grep -qF -- "$marker"; then
        return 0
      fi
      sleep 0.1
    done
  fi

  # Fallback: deliver full SGR mouse press ('M') and release ('m')
  tmux -L "$TMUX_SOCKET" send-keys -t "$TMUX_SESSION" -l $'\e[<0;'"$sgr_col"';'"$sgr_row"'M'
  tmux -L "$TMUX_SOCKET" send-keys -t "$TMUX_SESSION" -l $'\e[<0;'"$sgr_col"';'"$sgr_row"'m'
  if [[ -n "$marker" ]]; then
    expect_text "$marker"
  else
    sleep "$SETTLE_SECONDS"
  fi
}

click_tab_new() {
  local marker="${1:-new tab}"
  local coords
  coords="$(python3 -c '
import sys
lines = sys.stdin.read().splitlines()
if not lines: sys.exit(1)
col = lines[0].rfind("+")
if col == -1: sys.exit(2)
print(col, 0)
' <<<"$(tmux -L "$TMUX_SOCKET" capture-pane -p -t "$TMUX_SESSION")")" || die "failed to locate '+' button in tab bar"
  read -r col row <<<"$coords"
  click_cell "$col" "$row" "$marker"
}

click_workspace_new() {
  local coords
  coords="$(python3 -c '
import sys
lines = sys.stdin.read().splitlines()
for r, line in enumerate(lines):
    if line.startswith(" new") or " new" in line[:10]:
        print(2, r)
        sys.exit(0)
sys.exit(2)
' <<<"$(tmux -L "$TMUX_SOCKET" capture-pane -p -t "$TMUX_SESSION")")" || die "failed to locate '\'' new'\'' button in sidebar"
  read -r col row <<<"$coords"

  local ws_count_before
  ws_count_before="$(python3 -c 'import json,sys; print(len(json.load(sys.stdin)["result"]["workspaces"]))' <<<"$(herdr_cli workspace list)")"

  local px=$((col * 10 + 5))
  local py=$((row * 20 + 10))
  local sgr_col=$((col + 1))
  local sgr_row=$((row + 1))

  xdotool windowfocus --sync "$WINDOW_ID" 2>/dev/null || true
  xdotool mousemove --window "$WINDOW_ID" --sync "$px" "$py" click 1 2>/dev/null || true

  local success=0
  for _ in $(seq 1 10); do
    local current_count
    current_count="$(python3 -c 'import json,sys; print(len(json.load(sys.stdin)["result"]["workspaces"]))' <<<"$(herdr_cli workspace list)" 2>/dev/null || echo 0)"
    if (( current_count > ws_count_before )); then
      success=1
      break
    fi
    sleep 0.1
  done

  if (( ! success )); then
    # Fallback: deliver full SGR mouse press ('M') and release ('m')
    tmux -L "$TMUX_SOCKET" send-keys -t "$TMUX_SESSION" -l $'\e[<0;'"$sgr_col"';'"$sgr_row"'M'
    tmux -L "$TMUX_SOCKET" send-keys -t "$TMUX_SESSION" -l $'\e[<0;'"$sgr_col"';'"$sgr_row"'m'
    for _ in $(seq 1 20); do
      local current_count
      current_count="$(python3 -c 'import json,sys; print(len(json.load(sys.stdin)["result"]["workspaces"]))' <<<"$(herdr_cli workspace list)" 2>/dev/null || echo 0)"
      if (( current_count > ws_count_before )); then
        success=1
        break
      fi
      sleep 0.1
    done
    (( success )) || die "failed to create new workspace via ' new' click"
  fi
  sleep "$SETTLE_SECONDS"
}

CAPTURED_STATES=()
CAPTURE_KEYS=()

# All following actions are cumulative within this fresh named session.
prefix() {
  local key="$1"
  for _ in $(seq 1 5); do
    send_keys C-b
    for _ in $(seq 1 10); do
      if tmux -L "$TMUX_SOCKET" capture-pane -p -t "$TMUX_SESSION" 2>/dev/null | grep -qF "PREFIX"; then
        send_keys "$key"
        sleep "$SETTLE_SECONDS"
        return 0
      fi
      sleep 0.1
    done
    send_keys Escape
    sleep 0.2
  done
  die "expected 'PREFIX' on screen after ctrl+b"
}

capture 00-default "fresh launch; no keys; default chrome and bindings"

# 01-initial-layout — fresh launch, then split right (prefix+v).
# docs/HERDR_FIDELITY.md:47; docs/HERDR_FIDELITY.md:18 (tab row, top default).
send_keys C-b; sleep 0.3; send_keys v
sleep "$SETTLE_SECONDS"
panes="$(herdr_cli pane list)"
[[ "$(python3 -c 'import json,sys; print(len(json.load(sys.stdin)["result"]["panes"]))' <<<"$panes")" == 2 ]] \
  || die "split right did not create two capture-session panes"
INITIAL_WORKSPACE_ID="$(python3 -c 'import json,sys; print(json.load(sys.stdin)["result"]["panes"][0]["workspace_id"])' <<<"$panes")"
mapfile -t PANE_IDS < <(python3 -c 'import json,sys; print("\n".join(p["pane_id"] for p in json.load(sys.stdin)["result"]["panes"]))' <<<"$panes")
capture 01-initial-layout "ctrl+b, v (split right)"

# 02-sidebar — sidebar with space rows and agent rows.
# docs/HERDR_FIDELITY.md:17. Agent rows come from the documented report-agent
# integration path (docs/versions/0.9.5/.../cli-reference.mdx:271-282), not from
# a fabricated process name.
herdr_cli pane report-agent "${PANE_IDS[0]}" --source baseline --agent claude --state working >/dev/null
herdr_cli pane report-agent "${PANE_IDS[1]}" --source baseline --agent codex --state blocked >/dev/null
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
send_keys /; send_keys -l "split"
expect_text "split"
capture 07-help-filtered "in Help: / then type split"
send_keys C-u
send_keys Escape; sleep 0.3; send_keys Escape; sleep 0.3

# L1–L3: focused input, split geometry, tab creation and rename field.
herdr_cli pane run "${PANE_IDS[0]}" "printf '\\033[2J\\033[HAssignment terminal\\nReference material stays in this pane.\\n'" >/dev/null
herdr_cli pane run "${PANE_IDS[1]}" "printf '\\033[2J\\033[HInterview terminal\\nSource: baseline demonstration\\nEvidence: inspect process output, not the status dot.\\n'" >/dev/null
expect_text "Interview terminal"
prefix h
capture 08-focus-left "ctrl+b, h; shell printf commands populate both panes with neutral demonstration text"
prefix l
prefix -
capture 09-split-down "ctrl+b, l; ctrl+b, minus (new bottom-right pane focused)"
prefix c
expect_text "new tab"
capture 10-new-tab "ctrl+b, c (default new-tab naming dialog)"
send_keys Enter; sleep "$SETTLE_SECONDS"
prefix T
expect_text "rename tab"
send_keys C-u; send_keys -l "Interview"
capture 11-rename-tab "ctrl+b, shift+t; ctrl+u; type Interview (not yet submitted)"
send_keys Enter; expect_text "Interview"
prefix p
capture 12-named-tabs "Enter commits rename; ctrl+b, p (return to first tab)"
prefix z
expect_text "1 Z"
capture 13-zoom "ctrl+b, z (focused pane zoomed)"
prefix z
prefix b
capture 14-sidebar-compact "ctrl+b, z (restore layout); ctrl+b, b (default compact sidebar)"
prefix b

# Later-curriculum references only; no L4+ game implementation is authorized.
prefix N
capture 15-new-workspace "ctrl+b, shift+n (default creates workspace immediately)"
prefix W
expect_text "rename workspace"
send_keys C-u; send_keys -l "Reference"
capture 15b-rename-workspace "ctrl+b, shift+w; ctrl+u; type Reference"
send_keys Enter; sleep "$SETTLE_SECONDS"
prefix w
expect_text "NAV"
capture 16-workspace-navigation "Enter commits workspace rename; ctrl+b, w"
send_keys Up; send_keys Enter; sleep "$SETTLE_SECONDS"
send_keys Escape; sleep "$SETTLE_SECONDS"
prefix g
capture 17-goto "navigate Up, Enter to original workspace; ctrl+b, g (goto picker, two workspace groups)"
send_keys /; send_keys -l "codex"
expect_text "codex"
capture 18-goto-search "in goto picker: / then type codex"
send_keys Escape; sleep 0.3; send_keys Escape; sleep 0.3
prefix g
send_keys b
capture 19-goto-blocked "ctrl+b, g; b (blocked-agent filter)"
send_keys Escape; sleep 0.3

prefix k
prefix '['
expect_text "COPY"
send_keys /; send_keys -l "Evidence"
capture 20-copy-search "ctrl+b, k; ctrl+b, [; / then type Evidence (copy search field)"
send_keys Enter; sleep 0.3
send_keys V
capture 21-copy-selection "Enter commits copy search; V selects a line (no clipboard write)"
send_keys Escape; send_keys Escape; sleep 0.3
herdr_cli pane report-agent "${PANE_IDS[0]}" --source baseline --agent claude --state idle >/dev/null
expect_text "claude"
capture 22-agent-idle "report-agent CLI changes claude from working to idle; visible panes acknowledge completion"

# Default last-pane close confirmation, canceled without closing anything.
herdr_cli workspace create --cwd "$WORK_DIR" --label Confirmation --focus >/dev/null
sleep "$SETTLE_SECONDS"
prefix x
expect_text "Close"
capture 23-close-confirmation "CLI creates single-pane workspace; ctrl+b, x (default close confirmation, never accepted)"
send_keys Escape; sleep 0.3

# Real agent programs, not simulated agent screens or model-generated output.
mkdir -p "$WORK_DIR/agents" "$WORK_DIR/home" "$WORK_DIR/data" "$WORK_DIR/cache"
agent_env=(env -i PATH="$PATH" HOME="$WORK_DIR/home" SHELL=/bin/sh TERM="$TERM_VALUE"
  XDG_CONFIG_HOME="$WORK_DIR/config" XDG_STATE_HOME="$WORK_DIR/state"
  XDG_DATA_HOME="$WORK_DIR/data" XDG_CACHE_HOME="$WORK_DIR/cache")
agent_tab="$(herdr_cli tab create --cwd "$WORK_DIR/agents" --label Agents --focus)"
agent_pane="$(python3 -c 'import json,sys; print(json.load(sys.stdin)["result"]["root_pane"]["pane_id"])' <<<"$agent_tab")"
herdr_cli pane run "$agent_pane" "$(printf '%q ' "${agent_env[@]}" omp --no-session --no-tools --no-extensions --no-skills --no-rules --no-context-files --no-title --motion none)" >/dev/null
herdr_cli pane wait-output "$agent_pane" --match "press" --timeout 30000 >/dev/null
herdr_cli pane send-keys "$agent_pane" enter >/dev/null
herdr_cli pane wait-output "$agent_pane" --match "Sign in to your providers" --timeout 30000 >/dev/null
capture 24-omp "CLI creates Agents tab; launches real omp with tools/extensions/context disabled; Enter skips first-run splash; provider setup left unauthenticated; no prompt sent"
split="$(herdr_cli pane split "$agent_pane" --direction right --focus)"
opencode_pane="$(python3 -c 'import json,sys; print(json.load(sys.stdin)["result"]["pane"]["pane_id"])' <<<"$split")"
herdr_cli pane run "$opencode_pane" "$(printf '%q ' "${agent_env[@]}" opencode --standalone)" >/dev/null
herdr_cli pane wait-output "$opencode_pane" --match "Ask anything" --timeout 30000 >/dev/null
capture 25-coding-agents "CLI splits right; launches real opencode --standalone in new pane; OMP remains in left pane; no prompt sent"
herdr_cli pane zoom "$opencode_pane" --on >/dev/null
capture 26-opencode-zoom "CLI zooms the real OpenCode pane"

# Return to the neutral initial workspace and unzoom for mouse-driven baseline states.
herdr_cli pane zoom "$opencode_pane" --off >/dev/null
herdr_cli workspace focus "$INITIAL_WORKSPACE_ID" >/dev/null
sleep "$SETTLE_SECONDS"

# Mouse-driven creation flows (tab bar '+' and sidebar ' new').
# Pinned upstream: tabs.rs (NEW_TAB_WIDTH=3, hits.new_tab), sidebar.rs (hits.new_workspace),
# mouse.rs:2049-2075 (Down(Left) -> KeybindAction::NewTab / KeybindAction::NewWorkspace).
click_tab_new "new tab"
capture 27-click-new-tab "left-click '+' in tab bar opens default new-tab naming dialog"

send_keys -l "Terminal"
send_keys Enter
sleep "$SETTLE_SECONDS"
expect_text "Terminal"
capture 28-click-new-tab-committed "type Terminal, Enter commits new named tab"

click_workspace_new
sleep "$SETTLE_SECONDS"
capture 29-click-new-workspace "left-click ' new' in sidebar creates and focuses new workspace immediately"

prefix W
expect_text "rename workspace"
send_keys C-u; send_keys -l "Scratch"
send_keys Enter
sleep "$SETTLE_SECONDS"
expect_text "Scratch"
capture 30-click-new-workspace-committed "ctrl+b, shift+w; ctrl+u; type Scratch; Enter commits renamed workspace"

# --- manifest ----------------------------------------------------------------

captured_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
config_text="$(cat "$WORK_DIR/config/herdr/config.toml")"
python3 - "$MANIFEST" "$captured_at" "$UPSTREAM_COMMIT" "$HERDR_VERSION" \
  "$TERMINAL_LABEL" "$FONT_FAMILY" "$FONT_SIZE" "$GRID_LABEL" \
  "$THEME_LABEL" "$config_text" "$HERDR_BIN" \
  "${CAPTURE_KEYS[@]}" <<'PY'
import hashlib, json, struct, sys
from pathlib import Path

manifest_path, captured_at, commit, version, terminal, font, size, grid, theme, config_text, binary, *keys = sys.argv[1:]
key_map = dict(kv.split("=", 1) for kv in keys)
states = list(key_map)
assert len(states) == 32, f"expected 32 captures, got {len(states)}"
root = Path(manifest_path).parent
binary_hash = hashlib.sha256(Path(binary).read_bytes()).hexdigest()
entries = [
    {
        "state": state,
        "file": f"{state}.png",
        "upstream_commit": commit,
        "upstream_source": f"https://github.com/herdrdev/herdr/tree/{commit}",
        "herdr_binary_sha256": binary_hash,
        "binary_verification": "SHA-256 pinned after a clean-source release build, Cargo --locked --offline, Zig 0.16.0",
        "herdr_version": version,
        "terminal": terminal,
        "font": font,
        "font_size": int(size),
        "grid": grid,
        "theme": theme,
        "pane_shell": "/bin/sh",
        "herdr_config": config_text,
        "screen_text": f"{state}.txt",
        "sha256": hashlib.sha256((root / f"{state}.png").read_bytes()).hexdigest(),
        "predecessor": states[index - 1] if index else None,
        "terminal_config": "font-family = DejaVu Sans Mono\nfont-size = 13\nwindow-padding-x = 0\nwindow-padding-y = 0\nwindow-width = 120\nwindow-height = 40\ngtk-single-instance = false\nwindow-decoration = false\nwindow-save-state = never\nconfirm-close-surface = false\nshell-integration = none\n",
        "keys": key_map[state],
        "captured_at": captured_at,
    }
    for index, state in enumerate(states)
]
for entry in entries:
    data = (root / entry["file"]).read_bytes()
    assert data[:8] == b"\x89PNG\r\n\x1a\n", entry["file"]
    width, height = struct.unpack(">II", data[16:24])
    assert (width, height) == (1200, 800), (entry["file"], width, height)
    assert len((root / entry["screen_text"]).read_text().splitlines()) == 40, entry["state"]
    entry["pixels"] = {"width": width, "height": height}
with open(manifest_path, "w", encoding="utf-8") as handle:
    json.dump(entries, handle, indent=2)
    handle.write("\n")
PY

# Publish only a fully captured and validated bundle.
mkdir -p "$(dirname "$PUBLISH_DIR")"
if [[ -d "$PUBLISH_DIR" ]]; then
  mv "$PUBLISH_DIR" "$WORK_DIR/previous"
fi
if ! mv "$OUT_DIR" "$PUBLISH_DIR"; then
  [[ ! -d "$WORK_DIR/previous" ]] || mv "$WORK_DIR/previous" "$PUBLISH_DIR"
  die "could not publish capture bundle"
fi
MANIFEST="$PUBLISH_DIR/manifest.json"

log "wrote $MANIFEST (${#CAPTURED_STATES[@]} states)"
