# Capture harness: upstream Herdr visual baselines

Produces the visual-regression baselines from the **real pinned upstream Herdr**
(commit `e8d7d9705a7a2c89cef4dd42079379f05685af87`, version 0.9.5). These PNGs are the only
legitimate visual-regression baselines; `assets/reference/*` are illustrative-only.

## Run

```sh
bash scripts/capture-upstream-baselines.sh
```

Prerequisites: the built pinned binary (`HERDR_BIN` override supported), ghostty 1.3.1, tmux,
Xvfb, xdotool, ImageMagick (`import`/`identify`), python3.

## Safety: why this runs a named session

A naive second Herdr instance killed the user's live default-session server **four times**
(2026-11-23). Herdr's holder registry and the `herdr-core` state daemon use fixed
`/run/user/<uid>` paths; no environment variable isolates them. The script therefore runs
`herdr --session capture` with a private config dir — a named session owns its own sockets and
runtime state (official Herdr behavior, pinned persistence-remote docs) — and cleanup calls only
`session stop capture`. **`server stop` must never appear in this script**: it resolves the
default session through the global registry and kills the user's server. Verified probe: the
user's default server PID and workspace count were unchanged across the full sandbox lifecycle.

## Determinism

| Setting | Value |
| --- | --- |
| Terminal | ghostty 1.3.1, X11 backend under a private Xvfb (`:77`) |
| Font | DejaVu Sans Mono 13 |
| Grid | 120 cols × 40 rows, zero padding, no decorations |
| TERM | xterm-256color |
| Config | private `config.toml`: `onboarding = false`, update checks off |

## States and provenance

Each PNG lands in `tests/e2e/__screenshots__/upstream/<state>.png` with a manifest entry recording:
upstream commit, Herdr version, terminal, font family/size, grid, theme, the terminal config text,
and the exact keys that produced the state. Re-run after an upstream baseline bump (ADR-0002
protocol) to regenerate both images and manifest together — never edit a PNG by hand, and never
let an illustration stand in for a capture.
