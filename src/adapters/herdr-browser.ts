// Browser-session plumbing behind the investigation runtime
// (docs/ARCHITECTURE.md). Pure translation between host key reports and
// core input events. No React, no DOM access, no narrative/assessment.

import { normalizeDomKey } from "../core/herdr/index";
import type { InputEvent, KeyEvent, Modifier } from "../core/herdr/index";

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

/** Modifier reports carry no binding upstream (input.rs:637-639); drop them. */
const MODIFIER_ONLY = new Set(["Shift", "Control", "Alt", "Meta"]);

/**
 * Host-owned chords the page must never claim. Ctrl+W closes the browser tab
 * on Windows/Linux; the preview never sits behind it (LEVEL.md standing rule).
 */
function isBrowserOwned(input: DomKeyInput): boolean {
  return input.ctrlKey && (input.key === "w" || input.key === "W");
}

export function toInputEvent(input: DomKeyInput): {
  readonly event: InputEvent | null;
  readonly handled: boolean;
} {
  if (MODIFIER_ONLY.has(input.key)) return { event: null, handled: true };
  if (isBrowserOwned(input)) return { event: null, handled: false };
  const modifiers: Modifier[] = [];
  if (input.ctrlKey) modifiers.push("ctrl");
  if (input.altKey) modifiers.push("alt");
  if (input.shiftKey) modifiers.push("shift");
  if (input.metaKey) modifiers.push("meta");
  const normalized = normalizeDomKey(input.key, input.code, modifiers);
  // Ctrl+letter chords (e.g. Ctrl+B) are the prefix even when the browser
  // reports an uppercase key (legacy folded by the core contract).
  const event: KeyEvent = {
    kind: "key",
    origin: "player",
    key: normalized.key,
    modifiers: normalized.modifiers,
    phase: input.repeat ? "repeat" : "press",
  };
  return { event, handled: true };
}
