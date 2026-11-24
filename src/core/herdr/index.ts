// Public surface of the pure Herdr simulation core (docs/ARCHITECTURE.md).
// No React, DOM, adapter, narrative or assessment imports.

export { createScenario, createStore, initialState, replay, type HerdrStore } from "./store";
export { collectPanes, findInDirection, paneCount, paneIds, splitRect } from "./layout";
export {
  PREFIX,
  PREFIX_BINDINGS,
  bindingLabel,
  helpBindingRows,
  helpRowCount,
  isPrefixKey,
  normalizeDomKey,
  resolvePrefixBinding,
} from "./keymap";
export type {
  ChromeEvent,
  HerdrSnapshot,
  HerdrState,
  InputEvent,
  JournalEntry,
  KeyEvent,
  Modifier,
  Overlay,
  PaneState,
  TabState,
  TabView,
  WorkspaceState,
} from "./types";
