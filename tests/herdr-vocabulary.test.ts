import { describe, expect, it } from "vitest";
import {
  createScenario,
  createStore,
  isPrefixKey,
  normalizeDomKey,
  resolvePrefixBinding,
} from "../src/core/herdr";

// Host-key normalization contract for the adapter. Mirrors
// src/config/keybinds.rs:1421-1560 (key_parts_match_combo,
// shifted_char_matches_expected, legacy_shifted_ascii_letter_matches).

describe("vocabulary: normalizeDomKey (keybinds.rs:1421-1560)", () => {
  it("named keys map to the core vocabulary", () => {
    expect(normalizeDomKey("Escape", "Escape", [])).toEqual({ key: "escape", modifiers: [] });
    expect(normalizeDomKey("Enter", "Enter", [])).toEqual({ key: "enter", modifiers: [] });
    expect(normalizeDomKey("Backspace", "Backspace", [])).toEqual({
      key: "backspace",
      modifiers: [],
    });
    expect(normalizeDomKey("ArrowUp", "ArrowUp", [])).toEqual({ key: "up", modifiers: [] });
    expect(normalizeDomKey("ArrowDown", "ArrowDown", [])).toEqual({ key: "down", modifiers: [] });
    // Upstream Char(' ') (keybinds.rs:1305), not a "space" token.
    expect(normalizeDomKey(" ", "Space", [])).toEqual({ key: " ", modifiers: [] });
  });

  it("Shift+Tab folds to backtab without Shift (normalize_key_combo, :1406-1414)", () => {
    expect(normalizeDomKey("Tab", "Tab", ["shift"])).toEqual({ key: "backtab", modifiers: [] });
    expect(normalizeDomKey("Tab", "Tab", [])).toEqual({ key: "tab", modifiers: [] });
  });

  it("'?' arrives possibly with shift and matches the unshifted binding", () => {
    // Shift+/ typing `?` (shifted_char_matches_expected, :1529-1541).
    expect(normalizeDomKey("?", "Slash", ["shift"])).toEqual({ key: "?", modifiers: [] });
    expect(normalizeDomKey("?", "Slash", [])).toEqual({ key: "?", modifiers: [] });
  });

  it("'-' maps from the physical Minus code", () => {
    expect(normalizeDomKey("-", "Minus", [])).toEqual({ key: "-", modifiers: [] });
    // Unidentified key falls back to the physical code (parse_key_combo, :1326).
    expect(normalizeDomKey("Unidentified", "Minus", [])).toEqual({ key: "-", modifiers: [] });
  });

  it("'T' from Shift+t normalizes to t+shift, and legacy 'T' without shift too", () => {
    expect(normalizeDomKey("T", "KeyT", ["shift"])).toEqual({ key: "t", modifiers: ["shift"] });
    // legacy_shifted_ascii_letter_matches, :1486-1502.
    expect(normalizeDomKey("T", "KeyT", [])).toEqual({ key: "t", modifiers: ["shift"] });
    expect(normalizeDomKey("t", "KeyT", [])).toEqual({ key: "t", modifiers: [] });
  });

  it("every taught chord resolves through the normalized vocabulary", () => {
    const chords: [string, string, ("ctrl" | "alt" | "shift" | "meta")[], string][] = [
      ["b", "KeyB", ["ctrl"], "prefix"],
      ["?", "Slash", ["shift"], "help"],
      ["[", "BracketLeft", [], "copyMode"],
      ["-", "Minus", [], "splitDown"],
      ["T", "KeyT", ["shift"], "renameTab"],
      ["h", "KeyH", [], "focusLeft"],
      ["j", "KeyJ", [], "focusDown"],
      ["k", "KeyK", [], "focusUp"],
      ["l", "KeyL", [], "focusRight"],
      ["v", "KeyV", [], "splitRight"],
      ["x", "KeyX", [], "closePane"],
      ["z", "KeyZ", [], "zoom"],
      ["q", "KeyQ", [], "detach"],
      ["w", "KeyW", [], "workspacePicker"],
      ["c", "KeyC", [], "newTab"],
      ["n", "KeyN", [], "nextTab"],
      ["p", "KeyP", [], "previousTab"],
      ["1", "Digit1", [], "switchTab"],
    ];
    for (const [key, code, modifiers, action] of chords) {
      const normalized = normalizeDomKey(key, code, modifiers);
      if (action === "prefix") {
        expect(isPrefixKey(normalized.key, normalized.modifiers)).toBe(true);
        continue;
      }
      expect(resolvePrefixBinding(normalized.key, normalized.modifiers)?.action, key).toBe(action);
    }
  });

  it("does not demand exact modifier-set equality for shifted punctuation", () => {
    // Shift+? with an extra modifier still resolves the punctuation itself.
    expect(normalizeDomKey("?", "Slash", ["shift", "alt"])).toEqual({
      key: "?",
      modifiers: ["alt"],
    });
  });
});

describe("vocabulary: real defaults outside L1-L3 resolve, never invalid", () => {
  it("settings/scrollback/notification/rename-pane/reload/worktree/cycle resolve", () => {
    // These are real defaults (model.rs:1120-1182). They must resolve as a
    // binding so they are never treated as an invalid follow-up; their
    // transition is unmodelled in the L1-L3 slice.
    const cases: [string, ("ctrl" | "alt" | "shift" | "meta")[], string][] = [
      ["s", [], "settings"],
      ["e", [], "editScrollback"],
      ["o", [], "openNotificationTarget"],
      ["p", ["shift"], "renamePane"],
      ["r", ["shift"], "reloadConfig"],
      ["g", ["shift"], "newWorktree"],
      ["tab", [], "cyclePaneNext"],
      ["backtab", [], "cyclePanePrevious"],
    ];
    for (const [key, modifiers, action] of cases) {
      expect(resolvePrefixBinding(key, modifiers)?.action, key).toBe(action);
    }
  });
});

describe("vocabulary: normalizer to dispatch integration (N3)", () => {
  const dispatchNormalized = (
    s: ReturnType<typeof createStore>,
    key: string,
    code: string,
    modifiers: ("ctrl" | "alt" | "shift" | "meta")[],
  ) => {
    const normalized = normalizeDomKey(key, code, modifiers);
    return s.dispatch({
      kind: "key",
      origin: "player",
      key: normalized.key,
      modifiers: normalized.modifiers,
      phase: "press",
    });
  };

  it("a DOM space forwards the literal ' ' to the focused pane", () => {
    const s = createStore(createScenario(1));
    const pane = s.getState().workspaces[0]?.tabs[0]?.focusedPaneId;
    dispatchNormalized(s, " ", "Space", []);
    const input = s.getState().workspaces[0]?.tabs[0]?.panes.find((p) => p.id === pane)?.input;
    expect(input).toEqual([" "]);
  });

  it("a DOM space selects in copy mode (copy_mode.rs:200-215, ' ' | 'v')", () => {
    const s = createStore(createScenario(1));
    s.dispatch({ kind: "key", origin: "player", key: "b", modifiers: ["ctrl"], phase: "press" });
    s.dispatch({ kind: "key", origin: "player", key: "[", modifiers: [], phase: "press" });
    expect(s.getState().mode).toBe("copy");
    dispatchNormalized(s, " ", "Space", []);
    expect(s.getState().copy?.selection).toBe(true);
  });

  it("Shift+/ typing '?' opens help through the normalizer", () => {
    const s = createStore(createScenario(1));
    dispatchNormalized(s, "b", "KeyB", ["ctrl"]);
    dispatchNormalized(s, "?", "Slash", ["shift"]);
    expect(s.getState().overlay?.kind).toBe("help");
  });

  it("Shift+t renames the tab through the normalizer", () => {
    const s = createStore(createScenario(2));
    dispatchNormalized(s, "b", "KeyB", ["ctrl"]);
    dispatchNormalized(s, "T", "KeyT", ["shift"]);
    expect(s.getState().overlay?.kind).toBe("rename");
  });

  it("physical Minus splits down through the normalizer", () => {
    const s = createStore(createScenario(3));
    dispatchNormalized(s, "b", "KeyB", ["ctrl"]);
    dispatchNormalized(s, "-", "Minus", []);
    expect(s.snapshot().workspaces[0]?.tabs[0]?.panes).toHaveLength(2);
  });
});
