---
name: The Mandate: Herdr
description: A cinematic investigative thriller paired with a faithful, keyboard-first Herdr workspace.
colors:
  narrative-ink: "#07090c"
  action-gold: "#e8b53a"
  action-text: "#171204"
  warm-muted: "#f0d48a"
  scene-text: "#f4f1e8"
  terminal-surface: "#282c34"
  terminal-chrome: "#21252b"
  terminal-text: "#abb2bf"
  focus-blue: "#89b4fa"
  status-green: "#3fb950"
  status-red: "#e06c75"
typography:
  display:
    fontFamily: "system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 6vw, 4rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.015em"
  body:
    fontFamily: "system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
  interface:
    fontFamily: "ui-monospace, \"SF Mono\", Menlo, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
  navigation:
    fontFamily: "ui-monospace, \"SF Mono\", Menlo, Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
rounded:
  none: "0px"
  xs: "2px"
  sm: "3px"
  md: "4px"
  lg: "6px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
components:
  narrative-primary:
    backgroundColor: "{colors.action-gold}"
    textColor: "{colors.action-text}"
    typography: "{typography.interface}"
    rounded: "{rounded.md}"
    padding: "12px 28px"
  terminal-active-tab:
    backgroundColor: "{colors.focus-blue}"
    textColor: "#181825"
    typography: "{typography.interface}"
    rounded: "{rounded.none}"
    padding: "5.6px 14.4px"
---

# Design System: The Mandate: Herdr

## Overview

**Creative North Star: "The Night Desk"**

The visual system follows a stringer through a late investigative shift: rain-dark Capitol scenes establish the thriller, then the surrounding spectacle falls away as the player enters a working terminal. Its voice is tense, cinematic, and investigative; the experience remains a tool, not a decorative control room.

Two registers carry that idea. Narrative scenes use documentary-style Washington imagery, restrained warm action color, and clear system typography. The simulated Herdr workspace uses compact monospace chrome, flat dark surfaces, and blue selection and focus cues. Cooperative mission guidance sits above the terminal as a separate game layer.

**Key Characteristics:**
- Atmospheric, image-led narrative scenes; quiet and legible controls.
- Dense, edge-to-edge Herdr workspace with sharp geometry and blue focus.
- A distinct mission HUD that does not impersonate terminal chrome.

## Colors

The palette moves from cool charcoal and muted gold in the story layer to steel-blue focus against the terminal’s neutral charcoal; status colors remain semantic.

### Primary
- **Muted action gold** ({colors.action-gold}): narrative actions and the game HUD’s active objective cues.

### Secondary
- **Restrained steel blue** ({colors.focus-blue}): active Herdr tab, pane focus, and interface focus states.

### Neutral
- **Night ink** ({colors.narrative-ink}): the quiet surround behind scenes and workspace.
- **Scene ivory** ({colors.scene-text}): narrative headings over dark imagery.
- **Terminal charcoal** ({colors.terminal-surface}): simulated Herdr’s main work surface.
- **Terminal chrome** ({colors.terminal-chrome}): sidebar, tab strip, and status-bar surfaces.
- **Terminal text** ({colors.terminal-text}): default simulated interface copy.
- **Warm muted gold** ({colors.warm-muted}): supporting narrative copy and secondary actions.
- **Action ink** ({colors.action-text}): legible text on gold actions.
- **Status green** ({colors.status-green}) and **status red** ({colors.status-red}): semantic agent state cues.

**The Two Registers Rule.** Keep the cinematic story treatment and the Herdr workspace visually distinct; the game HUD is its own layer.

**The Gold Is Story Rule.** Use warm gold for narrative actions and game-mission emphasis, not as a dashboard-like treatment inside the simulated Herdr chrome.

**The Blue Is Focus Rule.** Reserve steel blue for active selection and focus in the simulated interface.

## Typography

**Display Font:** system-ui, sans-serif  
**Body Font:** system-ui, sans-serif  
**Label/Mono Font:** ui-monospace, "SF Mono", Menlo, Consolas, monospace

**Character:** System sans carries readable narrative headlines and prose. Monospace marks operational text, timestamps, labels, keyboard hints, and the simulated terminal.

### Hierarchy
- **Display** (700, fluid 2.25rem–4rem, line-height 1.04): title and scene headings.
- **Headline** (700, fluid 2.25rem–4rem, line-height 1.04): narrative scene titles.
- **Body** (400, 1rem base; scene lede scales fluidly to 1.2rem, line-height 1.6): narrative and explanatory copy.
- **Label** (400–700, 0.6875–0.75rem, tracked uppercase where used): scene kickers, dates, objective badges, and compact chrome.
- **Terminal** (400, 0.875rem pane copy, line-height 1.55): simulated Herdr content and workspace controls.

**The Two-Voice Rule.** Keep narrative prose in system sans and operational labels and interface text in monospace; do not introduce a third type family.

## Layout

Narrative scenes occupy the viewport over full-bleed image backgrounds, with the text block anchored near the lower left and constrained to a readable measure. The cold-open cinema instead centers one dominant stage in a quiet surround. Widths and type scale fluidly with `clamp`; scene actions and HUD controls wrap when needed.

The workspace is a full-height, edge-to-edge terminal: a narrow fixed-width sidebar on the left, tabs above the main area, compact pane headers, and a bottom status bar. Its interface density is intentional and follows the pinned Herdr reference. The game HUD remains above the terminal; capture release and quiet disclosures remain outside the simulated surface.

## Elevation & Depth

Depth is layered but restrained. Narrative imagery and the cold-open stage carry most of the atmosphere; the stage, HUD, and open hint popovers use shadows sparingly. The terminal is flat at rest: tonal surfaces and fine borders separate chrome, panes, and status. A focused pane receives a subtle blue glow as a state cue, not as ambient decoration.

**The Flat Terminal Rule.** Keep resting terminal surfaces flat; use depth only to clarify a focused or floating state.

## Shapes

The narrative layer uses gently softened controls and media corners (4–6px), with compact key badges and HUD indicators (2–3px). The simulated Herdr chrome is square-edged: tabs and sidebar have no rounding, while pane boundaries use only a slight radius (3px). Fine borders, not pill shapes, define the interface.

## Components

### Narrative actions
- **Character:** warm, direct controls set against the dark scene without a surrounding card.
- **Primary:** gold fill with dark text; monospace label; 12px × 28px internal padding and a 4px corner.
- **Hover / Focus:** lighten on hover; show a high-contrast white focus outline with offset.
- **Secondary:** transparent fill, warm muted text, and a fine gold-tinted border.

### Game HUD
- **Character:** compact monospace mission and capture controls, visually separate from Herdr’s native-looking chrome.
- **Surface:** near-black layered strips with thin borders and restrained shadow; objective emphasis uses gold, stage labels use semantic colors.
- **Capture control:** small, dark control with a fine border; hover increases contrast. Keep its accessible release role explicit.

### Herdr navigation
- **Character:** compact, square, low-chrome tab strip.
- **Inactive:** dark chrome fill, muted text, thin dividing edge.
- **Active / Focus:** blue fill and dark text; keyboard focus is visibly outlined.
- **New-tab control:** quiet glyph on transparent ground; hover gains a darker tonal surface.

### Herdr pane
- **Character:** flat terminal surface framed by a fine neutral border.
- **Header:** compact dark chrome, separator rule, and small monospace title.
- **Focused:** blue border and restrained blue glow; other panes remain flat.

### Objective and status badges
- **Character:** small uppercase labels with tight tracking and square geometry.
- **Objective:** subtle gold-tinted fill and border; completed state uses green.
- **Stage:** blue, warm, and green distinguish introduction, guided, and independent stages; color is paired with text.

## Do's and Don'ts

### Do:
- **Do** preserve the visual handoff from cinematic narrative scenes to the operational terminal.
- **Do** keep the game mission layer visually identifiable as separate from simulated Herdr.
- **Do** keep keyboard focus visible and use color together with text for state.
- **Do** use the supplied Capitol and workspace images only as illustrative scene-setting.

### Don't:
- **Don't** put rounded dashboard cards or gold panels into the Herdr terminal.
- **Don't** let cinematic effects obscure terminal content or keyboard focus.
- **Don't** present concept artwork as an authentic upstream Herdr visual baseline.
- **Don't** add visual conventions that imply unsupported Herdr behavior.
