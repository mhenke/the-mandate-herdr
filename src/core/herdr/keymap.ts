// Default keymap of the pinned edition (src/config/model.rs:1120-1182) and the
// host-key normalization contract for the adapter (src/config/keybinds.rs:1421-1560).
// Only defaults are modelled; configuration examples are not bindings.

import type { Modifier } from "./types";

export type PrefixAction =
  | "newTab"
  | "renameTab"
  | "previousTab"
  | "nextTab"
  | "switchTab"
  | "closeTab"
  | "splitRight"
  | "splitDown"
  | "focusLeft"
  | "focusDown"
  | "focusUp"
  | "focusRight"
  | "swapLeft"
  | "swapDown"
  | "swapUp"
  | "swapRight"
  | "closePane"
  | "zoom"
  | "resizeMode"
  | "toggleSidebar"
  | "help"
  | "workspacePicker"
  | "goto"
  | "detach"
  | "newWorkspace"
  | "renameWorkspace"
  | "closeWorkspace"
  | "copyMode"
  // Real defaults that are out of the L1-L3 teaching scope. They resolve (so
  // they are never an "invalid follow-up") but their effect is not modelled.
  | "settings"
  | "editScrollback"
  | "openNotificationTarget"
  | "renamePane"
  | "reloadConfig"
  | "newWorktree"
  | "cyclePaneNext"
  | "cyclePanePrevious";

export interface KeyCombo {
  readonly key: string;
  readonly modifiers: readonly Modifier[];
}

export const PREFIX: KeyCombo = { key: "b", modifiers: ["ctrl"] };

interface PrefixBinding {
  readonly combo: KeyCombo;
  readonly action: PrefixAction;
  /** Zero-based tab index for prefix+1..9 (src/config/model.rs:1163). */
  readonly index?: number;
  /** Upstream binding label, e.g. "prefix+minus" (keybind_help.rs:44-46). */
  readonly label?: string;
}

const bind = (
  key: string,
  action: PrefixAction,
  modifiers: readonly Modifier[] = [],
  label?: string,
): PrefixBinding => ({
  combo: { key, modifiers },
  action,
  label,
});

/** src/config/model.rs:1120-1182 */
export const PREFIX_BINDINGS: readonly PrefixBinding[] = [
  bind("c", "newTab"),
  bind("t", "renameTab", ["shift"]),
  bind("p", "previousTab"),
  bind("n", "nextTab"),
  ...Array.from({ length: 9 }, (_, i) => ({
    combo: { key: String(i + 1), modifiers: [] as readonly Modifier[] },
    action: "switchTab" as const,
    index: i,
  })),
  bind("x", "closeTab", ["shift"]),
  bind("v", "splitRight"),
  bind("-", "splitDown", [], "prefix+minus"),
  bind("h", "focusLeft"),
  bind("j", "focusDown"),
  bind("k", "focusUp"),
  bind("l", "focusRight"),
  bind("h", "swapLeft", ["shift"]),
  bind("j", "swapDown", ["shift"]),
  bind("k", "swapUp", ["shift"]),
  bind("l", "swapRight", ["shift"]),
  bind("x", "closePane"),
  bind("z", "zoom"),
  bind("r", "resizeMode"),
  bind("b", "toggleSidebar"),
  bind("?", "help"),
  bind("w", "workspacePicker"),
  bind("g", "goto"),
  bind("q", "detach"),
  bind("n", "newWorkspace", ["shift"]),
  bind("w", "renameWorkspace", ["shift"]),
  bind("d", "closeWorkspace", ["shift"]),
  bind("[", "copyMode"),
  // Defaults present upstream but outside the L1-L3 slice (model.rs:1120-1182).
  // They resolve (never an invalid follow-up); their transition is unmodelled.
  bind("s", "settings"),
  bind("e", "editScrollback"),
  bind("o", "openNotificationTarget"),
  bind("p", "renamePane", ["shift"]),
  bind("r", "reloadConfig", ["shift"]),
  bind("g", "newWorktree", ["shift"]),
  bind("tab", "cyclePaneNext"),
  bind("backtab", "cyclePanePrevious", [], "prefix+shift+tab"),
];

/** Upstream binding label (keybind_help.rs:44-46). */
export function bindingLabel(binding: PrefixBinding): string {
  if (binding.label) return binding.label;
  const shift = binding.combo.modifiers.includes("shift") ? "shift+" : "";
  return `prefix+${shift}${binding.combo.key}`;
}

export function sameCombo(a: KeyCombo, key: string, modifiers: readonly Modifier[]): boolean {
  return a.key === key && sameModifiers(a.modifiers, modifiers);
}

function sameModifiers(a: readonly Modifier[], b: readonly Modifier[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((m) => set.has(m));
}

export function isPrefixKey(key: string, modifiers: readonly Modifier[]): boolean {
  return sameCombo(PREFIX, key, modifiers);
}

export function resolvePrefixBinding(
  key: string,
  modifiers: readonly Modifier[],
): PrefixBinding | null {
  return PREFIX_BINDINGS.find((b) => sameCombo(b.combo, key, modifiers)) ?? null;
}

// --- help rows (src/input/keybind_help.rs:84-232) ---------------------------

export interface HelpRow {
  readonly binding: string;
  readonly label: string;
}

export interface HelpGroup {
  readonly group: string;
  readonly rows: readonly HelpRow[];
}

const row = (binding: string, label: string): HelpRow => ({ binding, label });

const HELP_BINDING_GROUPS: readonly HelpGroup[] = [
  {
    group: "global",
    rows: [
      row("ctrl+b", "prefix mode"),
      row("prefix+?", "keybinds"),
      row("prefix+s", "settings"),
      row("prefix+q", "detach"),
      row("prefix+shift+r", "reload config"),
      row("prefix+o", "open notification target"),
    ],
  },
  {
    group: "navigation",
    rows: [
      row("esc", "back"),
      row("up / down", "workspace list"),
      row("h / j / k / l / left / right", "move focus"),
      row("tab / shift+tab", "cycle pane"),
      row("enter", "open workspace"),
      row("1..9", "switch workspace"),
    ],
  },
  {
    group: "workspaces / tabs",
    rows: [
      row("prefix+w", "workspace navigation"),
      row("prefix+g", "session navigator"),
      row("prefix+shift+n", "new workspace"),
      row("prefix+shift+g", "new worktree"),
      row("unset", "open worktree"),
      row("unset", "delete worktree checkout"),
      row("prefix+shift+w", "rename workspace"),
      row("prefix+shift+d", "close workspace"),
      row("unset", "previous workspace"),
      row("unset", "next workspace"),
      row("unset", "switch workspace 1-9"),
      row("unset", "previous agent"),
      row("unset", "next agent"),
      row("unset", "focus agent 1-9"),
      row("prefix+c", "new tab"),
      row("prefix+shift+t", "rename tab"),
      row("prefix+p", "previous tab"),
      row("prefix+n", "next tab"),
      row("unset", "move tab left"),
      row("unset", "move tab right"),
      row("prefix+1..9", "switch tab 1-9"),
      row("prefix+shift+x", "close tab"),
    ],
  },
  {
    group: "panes",
    rows: [
      row("prefix+v", "split vertical"),
      row("prefix+minus", "split horizontal"),
      row("prefix+x", "close pane"),
      row("prefix+shift+p", "rename pane"),
      row("prefix+e", "edit scrollback"),
      row("unset", "clear pane"),
      row("prefix+[", "copy mode"),
      row("prefix+z", "zoom pane"),
      row("prefix+r", "resize mode"),
      row("unset", "resize pane left"),
      row("unset", "resize pane down"),
      row("unset", "resize pane up"),
      row("unset", "resize pane right"),
      row("prefix+b", "toggle sidebar"),
      row("prefix+h", "focus pane left"),
      row("prefix+j", "focus pane down"),
      row("prefix+k", "focus pane up"),
      row("prefix+l", "focus pane right"),
      row("prefix+tab", "cycle pane next"),
      row("prefix+shift+tab", "cycle pane previous"),
      row("unset", "last pane"),
    ],
  },
];

/**
 * Help lists exactly the pinned active bindings, grouped and labelled as
 * upstream renders them (src/input/keybind_help.rs:84-232). Indexed bindings
 * collapse to one `prefix+1..9` row (indexed_label, :52-70).
 */
export function helpBindingRows(): readonly HelpGroup[] {
  return HELP_BINDING_GROUPS;
}

export function helpRowCount(): number {
  return helpBindingRows().reduce((total, group) => total + group.rows.length, 0);
}
