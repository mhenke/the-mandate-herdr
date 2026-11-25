---
name: "The Mandate: Herdr"
description: A cinematic investigation built around authentic, keyboard-first Herdr workflows.
colors:
  primary: "#e8b53a"
  on-primary: "#171204"
  narrative-ink: "#07090c"
  scene-text: "#f4f1e8"
  warm-muted: "#f0d48a"
  terminal-surface: "#282c34"
  terminal-chrome: "#21252b"
  terminal-text: "#abb2bf"
  terminal-muted: "#9aa4b0"
  terminal-bright: "#e6edf3"
  terminal-border: "#3e4452"
  terminal-inverse: "#181825"
  focus-blue: "#89b4fa"
  status-green: "#3fb950"
  status-red: "#e06c75"
typography:
  display:
    fontFamily: "system-ui, sans-serif"
    fontSize: "4rem"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.015em"
  body:
    fontFamily: "system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  interface:
    fontFamily: "ui-monospace, \"SF Mono\", Menlo, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
  navigation:
    fontFamily: "ui-monospace, \"SF Mono\", Menlo, Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
  action:
    fontFamily: "ui-monospace, \"SF Mono\", Menlo, Consolas, monospace"
    fontSize: "0.9375rem"
    fontWeight: 500
rounded:
  story: "4px"
  pane: "3px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
components:
  narrative-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.action}"
    rounded: "{rounded.story}"
    padding: "12px 28px"
  terminal-active-tab:
    backgroundColor: "{colors.focus-blue}"
    textColor: "{colors.terminal-inverse}"
    typography: "{typography.navigation}"
    padding: "5.6px 14.4px"
  narrative-scene:
    backgroundColor: "{colors.narrative-ink}"
    textColor: "{colors.scene-text}"
  narrative-secondary:
    textColor: "{colors.warm-muted}"
  terminal-pane:
    backgroundColor: "{colors.terminal-surface}"
    textColor: "{colors.terminal-text}"
    rounded: "{rounded.pane}"
  terminal-tab:
    backgroundColor: "{colors.terminal-chrome}"
    textColor: "{colors.terminal-muted}"
    typography: "{typography.navigation}"
  terminal-output:
    backgroundColor: "{colors.terminal-surface}"
    textColor: "{colors.terminal-bright}"
    typography: "{typography.interface}"
  terminal-divider:
    backgroundColor: "{colors.terminal-border}"
  status-captured:
    textColor: "{colors.status-green}"
  status-blocked:
    textColor: "{colors.status-red}"
---

# Design System: The Mandate: Herdr

## Overview

**Creative North Star: "The Night Desk"**

A late-night political investigation moves from rain-dark Washington scenes into a faithful Herdr workspace. Keep the thriller cinematic and the operational interface precise; mission guidance remains a separate game layer.

## Colors

Muted gold belongs to story actions and mission emphasis. Steel blue marks active selection and focus. Status colors always accompany readable state text.

**The Two Registers Rule.** Never style the simulated Herdr chrome as a cinematic dashboard.

## Typography

System sans carries narrative; display headings scale responsively from 2.25rem to a 4rem maximum. Monospace carries operational labels, keyboard hints, and simulated terminal content. Use the body, interface, navigation, and action tokens for their named roles.

## Layout

Narrative scenes use full-bleed imagery with a lower-left text block; the cold-open centers one media stage. The workspace is edge-to-edge, with a compact sidebar, tabs, panes, and status bar. Keep the game HUD above—not inside—the simulated terminal.

## Elevation & Depth

Use restrained shadows for the cinema stage, HUD, and floating hints. Terminal surfaces stay flat; a subtle blue glow may mark the focused pane.

## Shapes

Story controls use gently softened corners. Herdr tabs and sidebar stay square; panes use a slight radius. Fine borders define the interface.

## Components

- **Narrative actions:** gold primary, transparent warm secondary; keep keyboard focus visible.
- **Game HUD:** compact mission guidance, optional hints, and a separate capture-release control.
- **Herdr navigation:** square tabs; blue active state; clear keyboard focus.
- **Panes and status:** flat terminal surface; pair status color with text.

## Do's and Don'ts

- **Do** preserve keyboard-first interaction and the external capture-release control.
- **Do** treat supplied concept artwork as illustrative, never as an authentic upstream baseline.
- **Don't** use gold panels or rounded dashboard cards inside the simulated Herdr workspace.
- **Don't** let imagery or effects obscure terminal content or focus.
