#!/usr/bin/env bash
# Isolation probe: prove that a sandboxed Herdr instance inside a mount
# namespace cannot see or touch the user's live Herdr server.
#
# Why this exists: on 2026-11-23 the capture work killed the user's live
# herdr server FOUR times. Env-var isolation (XDG_*) is NOT sufficient —
# herdr-core (the workspace/agent-state daemon) and the server holder
# registry resolve through fixed /run/user/<uid> paths. The only working
# isolation is a mount namespace that masks /run and the herdr state dirs.
#
# This script MUST be run while the user's server is UP: the proof is that
# the user's server PID survives the full sandbox lifecycle (TUI start,
# server spawn, server stop) completely unchanged.
set -euo pipefail

HERDR_BIN="${HERDR_BIN:-/tmp/opencode/the-mandate-research/herdr/target/release/herdr}"
USER_SERVER_RE='^/home/mhenke/.local/bin/herdr server'

die() { printf 'probe: %s\n' "$*" >&2; exit 1; }

[[ -x "$HERDR_BIN" ]] || die "herdr binary missing at $HERDR_BIN"
command -v unshare >/dev/null 2>&1 || die "unshare missing"
command -v tmux >/dev/null 2>&1 || die "tmux missing"

USER_PID="$(pgrep -f "$USER_SERVER_RE" | head -1)"
[[ -n "$USER_PID" ]] || die "user's herdr server not running — relaunch it first; this probe is meaningless without it"
printf 'probe: user server pid %s (before)\n' "$USER_PID"
USER_WS_BEFORE="$(herdr workspace list 2>/dev/null | grep -o '"workspace_id"' | wc -l)"
printf 'probe: user workspaces before: %s\n' "$USER_WS_BEFORE"

# Empty mask sources (tmpfs contents over the herdr paths inside the ns).
MASKDIR="$(mktemp -d /tmp/herdr-mask.XXXXXX)"
mkdir -p "$MASKDIR/empty"

unshare -Ur -m -- bash -s "$HERDR_BIN" "$MASKDIR/empty" <<'NS' 2>&1
set -euo pipefail
HERDR_BIN="$1"; EMPTY="$2"

# --- namespace mounts -------------------------------------------------------
mount -t tmpfs -o size=64m tmpfs /run
mkdir -p /run/user/1000 /ns/private
mount --bind "$EMPTY" /home/mhenke/.config/herdr
mount --bind "$EMPTY" /home/mhenke/.local/state/herdr
mount --bind "$EMPTY" /home/mhenke/.local/state/herdr-core
[[ -d /home/mhenke/.local/state/herdr-tui-orca ]] && \
  mount --bind "$EMPTY" /home/mhenke/.local/state/herdr-tui-orca || true
mount -t tmpfs -o size=64m tmpfs /ns/private
mkdir -p /ns/private/config/herdr /ns/private/state /ns/private/runtime
printf 'onboarding = false\n[update]\nversion_check = false\n' \
  > /ns/private/config/herdr/config.toml

export XDG_CONFIG_HOME=/ns/private/config
export XDG_STATE_HOME=/ns/private/state
export XDG_RUNTIME_DIR=/ns/private/runtime
export HERDR_CONFIG_PATH=/ns/private/config/herdr/config.toml
export TERM=xterm-256color
unset HERDR_ENV HERDR_PANE_ID HERDR_TAB_ID HERDR_WORKSPACE_ID \
      HERDR_SOCKET_PATH HERDR_BIN_PATH TERM_PROGRAM || true

# --- sandbox TUI lifecycle --------------------------------------------------
tmux -L probe new-session -d -s t -x 120 -y 40 "$HERDR_BIN"
tmux -L probe set-option -g prefix C-a
tmux -L probe set-option -g status off
sleep 4

echo "probe: sandbox TUI screen (must show NO user workspace labels):"
tmux -L probe capture-pane -p -t t | grep -v '^$' | head -6 || true
LEAKS="$(tmux -L probe capture-pane -p -t t | grep -cE 'CSCI8325|oh-my-opencod|dotfiles|yazi-quest|the-mandate' || true)"
echo "probe: user-data leaks in sandbox TUI: ${LEAKS:-0}"
if [[ "${LEAKS:-0}" -gt 0 ]]; then echo "probe: FAIL — sandbox sees user data"; exit 3; fi

WS_COUNT="$(tmux -L probe send-keys -t t '' 2>/dev/null; true)"
"$HERDR_BIN" workspace list 2>/dev/null | grep -o '"workspace_id"' | wc -l \
  | { read -r n; echo "probe: sandbox workspace count: $n"; }
"$HERDR_BIN" server stop >/dev/null 2>&1 || true
tmux -L probe kill-server 2>/dev/null || true
echo "probe: sandbox lifecycle complete"
NS

sleep 1
USER_PID_AFTER="$(pgrep -f "$USER_SERVER_RE" | head -1)"
USER_WS_AFTER="$(herdr workspace list 2>/dev/null | grep -o '"workspace_id"' | wc -l)"
printf 'probe: user server pid %s (after), workspaces after: %s\n' \
  "${USER_PID_AFTER:-GONE}" "$USER_WS_AFTER"
if [[ "$USER_PID_AFTER" != "$USER_PID" ]]; then
  die "FAIL — user server pid changed: $USER_PID -> ${USER_PID_AFTER:-GONE}"
fi
if [[ "$USER_WS_BEFORE" != "$USER_WS_AFTER" ]]; then
  die "FAIL — user workspace count changed: $USER_WS_BEFORE -> $USER_WS_AFTER"
fi
printf 'probe: PASS — user server untouched through full sandbox lifecycle\n'
