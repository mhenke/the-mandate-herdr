---
status: accepted
---

# Input policy and chrome event modality separation

The game teaches authentic Herdr keyboard workflows within a political thriller, but web browser players naturally click chrome controls (tabs, panes, new tab buttons) and players requiring assistive technologies need alternative navigation modalities. We decided that the simulation core accepts native chrome interactions via `ChromeEvent`s recorded with non-player provenance (`playerAction: false`), while the investigation adapter manages an `InputPolicy` ("standard" | "accessible"). In Standard mode, pointer chrome is refused with a transient reminder. In Accessible mode, pointer chrome navigates the simulation and allows story progression, but never awards keyboard-transfer mastery credit.

## Considered options

- **A. Adapter input policy with core ChromeEvent provenance (chosen).** Core handles `ChromeEvent` directly into genuine state transitions while marking journal entries `playerAction: false`. The adapter enforces `InputPolicy`: Standard rejects chrome clicks; Accessible routes them. Narrative progression (`storyConditionMet`) is separated from keyboard mastery (`objectivesMet`), preserving authentic learning evaluation while keeping the story universally accessible.
- **B. Synthetic keystroke injection on click (rejected).** Translating clicks into synthetic key events (e.g. clicking a tab injects `Ctrl+b 1`) corrupts player-action provenance, fabricates learning credit, and causes desynchronization if keybindings are customized or prefix state is dirty.
- **C. React-level state overrides (rejected).** Bypassing the simulation core to force UI state changes in React breaks core purity, violates architectural boundaries, destroys deterministic replayability, and prevents journal auditing.
- **D. Keyboard-only without accessibility alternative (rejected).** Violates accessibility requirements and blocks players unable to use continuous physical keyboard operations from experiencing the narrative.

## Consequences

- Core simulation remains completely pure: zero knowledge of UI toasts, accessibility toggles, or game assessment rules.
- Narrative access and learning evaluation are decoupled: any player can experience the full narrative, but mastery certificates or objective records truthfully reflect authentic keyboard usage.
- Dev reload recovery (v2) must carry `InputPolicy` so sessions do not silently downgrade across browser reloads.
