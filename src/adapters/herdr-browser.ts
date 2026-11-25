// Browser-session plumbing behind the investigation runtime
// (docs/ARCHITECTURE.md). Pure translation between host key reports and
// core input events. No React, no DOM access, no narrative/assessment.

import { isPrefixKey, type HerdrSnapshot, type KeyEvent, type Modifier } from "../core/herdr/index";

export interface NormalizedKey {
  readonly key: string;
  readonly modifiers: readonly Modifier[];
}

const NAMED_KEYS: Record<string, string> = {
  Escape: "escape",
  Enter: "enter",
  Tab: "tab",
  Backspace: "backspace",
  Delete: "delete",
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  Home: "home",
  End: "end",
  PageUp: "pageup",
  PageDown: "pagedown",
  " ": " ",
};

const CODE_KEYS: Record<string, string> = {
  Minus: "-",
  Equal: "equal",
  BracketLeft: "[",
  BracketRight: "]",
  Backslash: "\\",
  Semicolon: ";",
  Quote: "'",
  Comma: ",",
  Period: ".",
  Slash: "/",
  Backquote: "`",
};

/** Shifted punctuation that matches its unshifted binding (keybinds.rs:1529-1560). */
const SHIFTED_PUNCTUATION = new Set([
  "!",
  "@",
  "#",
  "$",
  "%",
  "^",
  "&",
  "*",
  "(",
  ")",
  "_",
  "+",
  "{",
  "}",
  "|",
  ":",
  '"',
  "<",
  ">",
  "?",
  "~",
]);

function normalizeSingleChar(ch: string, mods: Set<Modifier>): NormalizedKey {
  if (/[a-z]/i.test(ch)) {
    const lower = ch.toLowerCase();
    // Legacy uppercase report without SHIFT still means the shifted letter.
    if (ch !== lower && !mods.has("shift")) mods.add("shift");
    return { key: lower, modifiers: [...mods] };
  }
  if (ch === "-") return { key: "-", modifiers: [...mods] };
  if (SHIFTED_PUNCTUATION.has(ch) && mods.has("shift")) {
    // The character already carries the shift; the binding does not.
    mods.delete("shift");
    return { key: ch, modifiers: [...mods] };
  }
  return { key: ch, modifiers: [...mods] };
}

/**
 * Normalize a host key report into the core's key vocabulary.
 *
 * Mirrors `key_parts_match_combo` (src/config/keybinds.rs:1421-1442):
 * - `normalize_key_combo` folds Shift+Tab into BackTab (:1406-1414);
 * - a shifted punctuation character matches its unshifted binding
 *   (`shifted_char_matches_expected`, :1529-1541), so Shift+/ typing `?`
 *   normalizes to `?` without Shift;
 * - a legacy uppercase letter without SHIFT matches the lowercase binding
 *   (`legacy_shifted_ascii_letter_matches`, :1486-1502), so `T` normalizes to
 *   `t` + Shift;
 * - exact modifier-set equality is not required for those two cases.
 *
 * `code` is the physical position and is only a fallback when `key` is
 * unidentified (src/config/keybinds.rs:1281-1360 maps `minus` to `-`).
 */
export function normalizeDomKey(
  key: string,
  code: string,
  modifiers: readonly Modifier[],
): NormalizedKey {
  const mods = new Set(modifiers);

  const named = NAMED_KEYS[key];
  if (named) {
    // Shift+Tab is BackTab upstream; the Shift bit is dropped (:1406-1414).
    if (named === "tab" && mods.has("shift")) {
      return { key: "backtab", modifiers: [...mods].filter((m) => m !== "shift") };
    }
    return { key: named, modifiers: [...mods] };
  }

  const raw = key.length === 1 ? key : (CODE_KEYS[code] ?? key);
  if (raw.length === 1) {
    return normalizeSingleChar(raw, mods);
  }

  return { key: raw, modifiers: [...mods] };
}

/** Minimal host key report; the caller copies these fields off the DOM event. */
export interface DomKeyInput {
  readonly key: string;
  readonly code: string;
  readonly ctrlKey: boolean;
  readonly altKey: boolean;
  readonly shiftKey: boolean;
  readonly metaKey: boolean;
  readonly repeat: boolean;
}

/** Modifier reports carry no binding upstream (input.rs:637-639). */
const MODIFIER_ONLY = new Set(["Shift", "Control", "Alt", "Meta"]);

type KeyContext = Pick<HerdrSnapshot, "attached" | "mode" | "overlay"> | null;

const HERDR_MODE_KEYS = ["up", "down", "left", "right", "home", "end", "pageup", "pagedown"];

function routesKey({ key, modifiers }: NormalizedKey, herdr: KeyContext): boolean {
  if (herdr?.attached === false) return false;
  const prompt = !herdr || (herdr.mode === "terminal" && !herdr.overlay);
  if (modifiers.length === 1 && modifiers[0] === "ctrl") {
    if (prompt && (key === "u" || key === "c")) return true;
    if (!herdr) return false;
    const overlay = herdr.overlay;
    if (overlay) {
      return (
        key === "u" &&
        (overlay.kind === "rename" || (overlay.kind === "help" && overlay.searchFocused))
      );
    }
    return (
      (herdr.mode !== "resize" && isPrefixKey(key, modifiers)) ||
      (herdr.mode === "navigate" && key === "[")
    );
  }
  return (
    modifiers.every((modifier) => modifier === "shift") &&
    (key === "enter" ||
      key === "backspace" ||
      (herdr !== null && key === "escape") ||
      (!prompt && HERDR_MODE_KEYS.includes(key)) ||
      (key.length === 1 && /^[\x20-\x7e]$/.test(key)))
  );
}

export function toInputEvent(input: DomKeyInput, herdr: KeyContext): KeyEvent | null {
  if (MODIFIER_ONLY.has(input.key)) return null;
  const modifiers: Modifier[] = [];
  if (input.ctrlKey) modifiers.push("ctrl");
  if (input.altKey) modifiers.push("alt");
  if (input.shiftKey) modifiers.push("shift");
  if (input.metaKey) modifiers.push("meta");
  const normalized = normalizeDomKey(input.key, input.code, modifiers);
  if (!routesKey(normalized, herdr)) return null;
  // Ctrl+letter chords (e.g. Ctrl+B) are the prefix even when the browser
  // reports an uppercase key (legacy folded by the core contract).
  return {
    kind: "key",
    origin: "player",
    key: normalized.key,
    modifiers: normalized.modifiers,
    phase: input.repeat ? "repeat" : "press",
  };
}
