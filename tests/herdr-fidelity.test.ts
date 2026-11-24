import { describe, expect, it } from "vitest";
import {
  createScenario,
  createStore,
  bindingLabel,
  helpBindingRows,
  PREFIX_BINDINGS,
  type HerdrState,
  type InputEvent,
  type Modifier,
} from "../src/core/herdr";

const press = (
  key: string,
  modifiers: readonly Modifier[] = [],
  origin: "player" | "script" | "fixture" | "host" = "player",
): InputEvent => ({ kind: "key", origin, key, modifiers, phase: "press" });

const blur: InputEvent = { kind: "host", origin: "host", host: "blur" };

function store(level: 1 | 2 | 3 = 1) {
  return createStore(createScenario(level));
}

function focusedPaneId(state: HerdrState): string {
  const ws = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
  const tab = ws?.tabs.find((t) => t.id === ws.activeTabId);
  if (!tab) throw new Error("no active tab");
  return tab.focusedPaneId;
}

function paneInput(state: HerdrState, paneId: string): readonly string[] {
  for (const ws of state.workspaces) {
    for (const tab of ws.tabs) {
      const pane = tab.panes.find((p) => p.id === paneId);
      if (pane) return pane.input;
    }
  }
  throw new Error(`pane ${paneId} missing`);
}

describe("FIDELITY row: prefix enter (input.rs:667-680)", () => {
  it("ctrl+b arms prefix mode and forwards nothing", () => {
    const s = store();
    const before = focusedPaneId(s.getState());
    const entry = s.dispatch(press("b", ["ctrl"]));
    expect(entry.effect).toBe("prefix-armed");
    expect(s.getState().mode).toBe("prefix");
    expect(paneInput(s.getState(), before)).toEqual([]);
  });
});

describe("FIDELITY row: prefix valid action (input.rs:699-705)", () => {
  it("prefix+h resolves, returns to Terminal, and moves focus left", () => {
    const s = store(1);
    const memo = focusedPaneId(s.getState());
    s.dispatch(press("b", ["ctrl"]));
    const entry = s.dispatch(press("h"));
    expect(entry.effect).toBe("prefix-resolved");
    expect(s.getState().mode).toBe("terminal");
    expect(focusedPaneId(s.getState())).not.toBe(memo);
    // Consumed input does not reach the focused pane.
    expect(paneInput(s.getState(), memo)).toEqual([]);
  });
});

describe("FIDELITY row: prefix invalid follow-up (input.rs:707-709)", () => {
  it("an unbound follow-up is consumed, exits prefix mode, and forwards nothing", () => {
    const s = store();
    const pane = focusedPaneId(s.getState());
    s.dispatch(press("b", ["ctrl"]));
    const entry = s.dispatch(press("Q"));
    expect(entry.effect).toBe("prefix-consumed");
    expect(s.getState().mode).toBe("terminal");
    expect(paneInput(s.getState(), pane)).toEqual([]);
  });
});

describe("FIDELITY row: prefix Escape (input.rs:694-697)", () => {
  it("Escape exits prefix mode with no action and no forwarding", () => {
    const s = store();
    const pane = focusedPaneId(s.getState());
    s.dispatch(press("b", ["ctrl"]));
    const entry = s.dispatch(press("escape"));
    expect(entry.effect).toBe("prefix-cancelled");
    expect(s.getState().mode).toBe("terminal");
    expect(paneInput(s.getState(), pane)).toEqual([]);
  });
});

describe("FIDELITY row: prefix second press (input.rs:689-693)", () => {
  it("a second prefix exits prefix mode and forwards the prefix key to the pane", () => {
    const s = store();
    const pane = focusedPaneId(s.getState());
    s.dispatch(press("b", ["ctrl"]));
    const entry = s.dispatch(press("b", ["ctrl"]));
    expect(entry.effect).toBe("prefix-forwarded");
    expect(s.getState().mode).toBe("terminal");
    // input.rs:391-405 pushes key.clone() unchanged, modifiers included.
    expect(paneInput(s.getState(), pane)).toEqual(["ctrl+b"]);
  });
});

describe("FIDELITY row: held prefix / repeat (input.rs:391-405)", () => {
  it("a repeat phase never double-fires an action", () => {
    const s = store();
    s.dispatch(press("b", ["ctrl"]));
    const entry = s.dispatch({
      kind: "key",
      origin: "player",
      key: "h",
      modifiers: [],
      phase: "repeat",
    });
    expect(entry.effect).toBe("none");
    expect(s.getState().mode).toBe("prefix");
  });
});

describe("FIDELITY row: host blur voids pending prefix (Unresolved #2 RESOLVED)", () => {
  it("blur between prefix and action key voids the attempt and is re-triable", () => {
    const s = store();
    const pane = focusedPaneId(s.getState());
    s.dispatch(press("b", ["ctrl"]));
    const entry = s.dispatch(blur);
    expect(entry.effect).toBe("prefix-voided");
    expect(s.getState().mode).toBe("terminal");
    expect(paneInput(s.getState(), pane)).toEqual([]);
    // Re-triable: the same sequence works afterwards.
    s.dispatch(press("b", ["ctrl"]));
    expect(s.dispatch(press("h")).effect).toBe("prefix-resolved");
  });
});

describe("FIDELITY row: plain chords (Esc, Ctrl+[)", () => {
  it("plain Escape in Terminal mode is forwarded to the pane, not hijacked", () => {
    const s = store();
    const pane = focusedPaneId(s.getState());
    const entry = s.dispatch(press("escape"));
    expect(entry.effect).toBe("forwarded");
    expect(paneInput(s.getState(), pane)).toEqual(["escape"]);
  });

  it("plain Ctrl+[ in Terminal mode is forwarded, distinct from prefix+[", () => {
    const s = store();
    const pane = focusedPaneId(s.getState());
    s.dispatch(press("[", ["ctrl"]));
    expect(paneInput(s.getState(), pane)).toEqual(["ctrl+["]);
    expect(s.getState().mode).toBe("terminal");
  });

  it("plain Enter in Terminal mode is forwarded to the pane", () => {
    const s = store();
    const pane = focusedPaneId(s.getState());
    s.dispatch(press("enter"));
    expect(paneInput(s.getState(), pane)).toEqual(["enter"]);
  });
});

describe("FIDELITY row: copy mode entry (prefix+[)", () => {
  it("sequential prefix+[ enters copy mode", () => {
    const s = store();
    s.dispatch(press("b", ["ctrl"]));
    const entry = s.dispatch(press("["));
    expect(entry.effect).toBe("prefix-resolved");
    expect(s.getState().mode).toBe("copy");
    expect(s.getState().copy?.paneId).toBe(focusedPaneId(s.getState()));
  });

  it("copy mode exits with q and Esc clears search before exiting", () => {
    const s = store();
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("["));
    s.dispatch(press("/"));
    s.dispatch(press("a"));
    s.dispatch(press("enter"));
    expect(s.getState().copy?.searchQuery).toBe("a");
    s.dispatch(press("escape"));
    expect(s.getState().mode).toBe("copy");
    expect(s.getState().copy?.searchQuery).toBe("");
    s.dispatch(press("q"));
    expect(s.getState().mode).toBe("terminal");
    expect(s.getState().copy).toBeNull();
  });
});

describe("FIDELITY row: core five focus (layout.rs:369-424)", () => {
  it("focus moves only to an existing neighbor and never wraps", () => {
    const s = store(1);
    const memo = focusedPaneId(s.getState());
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("h"));
    const assignment = focusedPaneId(s.getState());
    expect(assignment).not.toBe(memo);
    // No pane to the left of the assignment pane: focus does not move.
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("h"));
    expect(focusedPaneId(s.getState())).toBe(assignment);
  });
});

describe("FIDELITY row: core five split (focus lands in new pane)", () => {
  it("prefix+v splits right and focuses the new pane", () => {
    const s = store(3);
    const before = focusedPaneId(s.getState());
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("v"));
    const after = focusedPaneId(s.getState());
    expect(after).not.toBe(before);
    const tab = s.snapshot().workspaces[0]?.tabs[0];
    expect(tab?.panes).toHaveLength(2);
    // New pane is to the right of the original.
    const original = tab?.panes.find((p) => p.id === before);
    const created = tab?.panes.find((p) => p.id === after);
    expect(created?.rect.x).toBeGreaterThan(original?.rect.x ?? 0);
  });

  it("prefix+minus splits down", () => {
    const s = store(3);
    const before = focusedPaneId(s.getState());
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("-"));
    const tab = s.snapshot().workspaces[0]?.tabs[0];
    const original = tab?.panes.find((p) => p.id === before);
    const created = tab?.panes.find((p) => p.id === focusedPaneId(s.getState()));
    expect(created?.rect.y).toBeGreaterThan(original?.rect.y ?? 0);
  });
});

describe("FIDELITY row: tabs (prefix+c / n / p / shift+t)", () => {
  it("prefix+c opens the new-tab prompt; Enter creates an active tab with its own pane", () => {
    const s = store(2);
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("c"));
    expect(s.snapshot().overlay).toMatchObject({ kind: "rename", target: "new-tab" });
    s.dispatch(press("enter"));
    const ws = s.snapshot().workspaces[0];
    expect(ws?.tabs).toHaveLength(2);
    expect(ws?.activeTabId).toBe(ws?.tabs[1]?.id);
    expect(ws?.tabs[1]?.panes).toHaveLength(1);
  });

  it("prefix+n / prefix+p switch tabs", () => {
    const s = store(2);
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("c"));
    s.dispatch(press("enter"));
    const second = s.snapshot().workspaces[0]?.activeTabId;
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("p"));
    const first = s.snapshot().workspaces[0]?.activeTabId;
    expect(first).not.toBe(second);
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("n"));
    expect(s.snapshot().workspaces[0]?.activeTabId).toBe(second);
  });

  it("prefix+shift+t renames the tab through the Herdr field", () => {
    const s = store(2);
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("t", ["shift"]));
    expect(s.snapshot().overlay?.kind).toBe("rename");
    s.dispatch(press("u", ["ctrl"]));
    for (const ch of "artifact") s.dispatch(press(ch));
    s.dispatch(press("backspace"));
    s.dispatch(press("enter"));
    expect(s.snapshot().workspaces[0]?.tabs[0]?.name).toBe("artifac");
    expect(s.snapshot().overlay).toBeNull();
  });

  it("an empty-after-trim rename closes the overlay and keeps the old name", () => {
    // overlay_input.rs:939-996: the field is trimmed, the overlay always
    // closes, and an empty result emits no rename.
    const s = store(2);
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("t", ["shift"]));
    for (let i = 0; i < "reading".length; i += 1) s.dispatch(press("backspace"));
    s.dispatch(press("enter"));
    expect(s.snapshot().overlay).toBeNull();
    expect(s.snapshot().workspaces[0]?.tabs[0]?.name).toBe("reading");
  });

  it("a whitespace-only rename keeps the old name and closes the overlay", () => {
    const s = store(2);
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("t", ["shift"]));
    s.dispatch(press("u", ["ctrl"]));
    for (const ch of "   ") s.dispatch(press(ch));
    s.dispatch(press("enter"));
    expect(s.snapshot().overlay).toBeNull();
    expect(s.snapshot().workspaces[0]?.tabs[0]?.name).toBe("reading");
  });

  it("a padded valid rename commits the trimmed text", () => {
    const s = store(2);
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("t", ["shift"]));
    s.dispatch(press("u", ["ctrl"]));
    for (const ch of "  artifact  ") s.dispatch(press(ch));
    s.dispatch(press("enter"));
    expect(s.snapshot().overlay).toBeNull();
    expect(s.snapshot().workspaces[0]?.tabs[0]?.name).toBe("artifact");
  });

  it("closing the last tab is a no-op with no overlay (ASSUMPTION, Unresolved #4)", () => {
    // workspace.rs:575-578 refuses a last-tab close. ASSUMPTION (FIDELITY
    // Unresolved #4): the client-side reflow/confirmation for a last tab is not
    // traced, so this pins the server rule: no close, no overlay.
    const s = store(2);
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("x", ["shift"]));
    expect(s.snapshot().overlay).toBeNull();
    expect(s.snapshot().workspaces[0]?.tabs).toHaveLength(1);
  });

  it("closing a non-last tab moves the active tab per workspace.rs:575-589", () => {
    const s = store(2);
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("c"));
    s.dispatch(press("enter"));
    const second = s.snapshot().workspaces[0]?.activeTabId;
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("x", ["shift"]));
    const ws = s.snapshot().workspaces[0];
    expect(ws?.tabs).toHaveLength(1);
    expect(ws?.activeTabId).not.toBe(second);
  });
});

describe("FIDELITY row: close pane stops the runtime (shell/actions.rs:115-123)", () => {
  it("prefix+x removes the pane and clears its agent status", () => {
    const s = store(1);
    const memo = focusedPaneId(s.getState());
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("x"));
    const panes = s.snapshot().workspaces[0]?.tabs[0]?.panes ?? [];
    expect(panes.map((p) => p.id)).not.toContain(memo);
    expect(panes).toHaveLength(1);
  });

  it("a last-pane close raises the confirmation gate and does not close", () => {
    const s = store(3);
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("x"));
    expect(s.snapshot().overlay?.kind).toBe("confirmClose");
    expect(s.snapshot().workspaces[0]?.tabs[0]?.panes).toHaveLength(1);
    s.dispatch(press("escape"));
    expect(s.snapshot().overlay).toBeNull();
  });

  it("the gate needs no other pane in the tab AND no other tab in the workspace", () => {
    // overlay_input.rs:1030-1061: confirm_close && !other pane in tab &&
    // !other tab in workspace. Two tabs of one pane each: closing the only
    // pane closes the tab immediately, no overlay.
    const s = store(2);
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("c"));
    s.dispatch(press("enter"));
    expect(s.snapshot().workspaces[0]?.tabs).toHaveLength(2);
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("x"));
    expect(s.snapshot().overlay).toBeNull();
    expect(s.snapshot().workspaces[0]?.tabs).toHaveLength(1);
  });

  it("closing the pane copy mode is attached to clears mode and copy state", () => {
    // state.rs:1478-1490: a vanished copy pane resets copy mode to Terminal.
    const s = store(1);
    const memo = focusedPaneId(s.getState());
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("["));
    expect(s.getState().mode).toBe("copy");
    expect(s.getState().copy?.paneId).toBe(memo);
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("x"));
    expect(s.getState().mode).toBe("terminal");
    expect(s.getState().copy).toBeNull();
    // Subsequent keys route normally to the new focused pane.
    const next = focusedPaneId(s.getState());
    s.dispatch(press("z"));
    expect(paneInput(s.getState(), next)).toEqual(["z"]);
  });
});

describe("FIDELITY row: agent status projection (agent_view.rs:325-333)", () => {
  it("done is Idle not yet acknowledged by this client", () => {
    const s = store(1);
    const pane = focusedPaneId(s.getState());
    s.dispatch({
      kind: "process",
      origin: "process",
      process: { kind: "agentState", paneId: pane, state: "working" },
    });
    s.dispatch({
      kind: "process",
      origin: "process",
      process: { kind: "agentState", paneId: pane, state: "idle" },
    });
    const view = s.snapshot().workspaces[0]?.tabs[0]?.panes.find((p) => p.id === pane);
    expect(view?.agent.raw).toBe("idle");
    expect(view?.agent.projected).toBe("done");
  });

  it("focusing the pane surface acknowledges and clears done", () => {
    const s = store(1);
    const memo = focusedPaneId(s.getState());
    s.dispatch({
      kind: "process",
      origin: "process",
      process: { kind: "agentState", paneId: memo, state: "working" },
    });
    s.dispatch({
      kind: "process",
      origin: "process",
      process: { kind: "agentState", paneId: memo, state: "idle" },
    });
    // Move away and back: composition acknowledges.
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("h"));
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("l"));
    const view = s.snapshot().workspaces[0]?.tabs[0]?.panes.find((p) => p.id === memo);
    expect(view?.agent.projected).toBe("idle");
  });

  it("a visible pane's done badge clears on the next composed surface", () => {
    // endpoint_agent_state.rs:43-175: every composed pane surface acknowledges
    // its panes, not only a focus change.
    const s = store(1);
    const pane = focusedPaneId(s.getState());
    s.dispatch({
      kind: "process",
      origin: "process",
      process: { kind: "agentState", paneId: pane, state: "working" },
    });
    s.dispatch({
      kind: "process",
      origin: "process",
      process: { kind: "agentState", paneId: pane, state: "idle" },
    });
    expect(
      s.snapshot().workspaces[0]?.tabs[0]?.panes.find((p) => p.id === pane)?.agent.projected,
    ).toBe("done");
    // Any subsequent composition acknowledges, with no focus change at all.
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("escape"));
    expect(
      s.snapshot().workspaces[0]?.tabs[0]?.panes.find((p) => p.id === pane)?.agent.projected,
    ).toBe("idle");
  });
});

describe("FIDELITY row: mode bar placement (render.rs:31-51)", () => {
  it("the mode bar is hidden in Terminal mode and shown in non-terminal modes", () => {
    const s = store();
    expect(s.snapshot().modeBar.placement).toBe("pane-surface-bottom");
    // render_mode_bar returns None in Terminal mode (render.rs:31-44).
    expect(s.snapshot().modeBar.visible).toBe(false);
    s.dispatch(press("b", ["ctrl"]));
    expect(s.snapshot().modeBar.visible).toBe(true);
    s.dispatch(press("escape"));
    expect(s.snapshot().modeBar.visible).toBe(false);
  });

  it("the mode bar is suppressed while an overlay is active", () => {
    const s = store();
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("?"));
    expect(s.snapshot().overlay?.kind).toBe("help");
    expect(s.snapshot().modeBar.visible).toBe(false);
  });
});

describe("FIDELITY row: help (config/model.rs:340,1124)", () => {
  it("help lists exactly the pinned active bindings and filters with /", () => {
    const s = store();
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("?"));
    const overlay = s.snapshot().overlay;
    expect(overlay?.kind).toBe("help");
    s.dispatch(press("/"));
    s.dispatch(press("z"));
    expect(s.snapshot().overlay).toMatchObject({
      kind: "help",
      query: "z",
      searchFocused: true,
    });
    s.dispatch(press("u", ["ctrl"]));
    expect(s.snapshot().overlay).toMatchObject({ kind: "help", query: "" });
    s.dispatch(press("escape"));
    s.dispatch(press("escape"));
    expect(s.snapshot().overlay).toBeNull();
  });

  it("help rows match the upstream groups and labels (keybind_help.rs:84-232)", () => {
    // Independent expected fixture, not derived from the implementation.
    const expected: Record<string, [string, string][]> = {
      global: [
        ["ctrl+b", "prefix mode"],
        ["prefix+?", "keybinds"],
        ["prefix+s", "settings"],
        ["prefix+q", "detach"],
        ["prefix+shift+r", "reload config"],
        ["prefix+o", "open notification target"],
      ],
      navigation: [
        ["esc", "back"],
        ["up / down", "workspace list"],
        ["h / j / k / l / left / right", "move focus"],
        ["tab / shift+tab", "cycle pane"],
        ["enter", "open workspace"],
        ["1..9", "switch workspace"],
      ],
    };
    const groups = helpBindingRows();
    expect(groups.map((g) => g.group)).toEqual([
      "global",
      "navigation",
      "workspaces / tabs",
      "panes",
    ]);
    for (const [group, rows] of Object.entries(expected)) {
      const actual = groups.find((g) => g.group === group);
      expect(actual?.rows.map((r) => [r.binding, r.label])).toEqual(rows);
    }
    // Indexed bindings collapse to one row (indexed_label, keybind_help.rs:52-70).
    const tabs = groups.find((g) => g.group === "workspaces / tabs");
    expect(tabs?.rows.filter((r) => r.binding === "prefix+1..9")).toHaveLength(1);
    expect(tabs?.rows.some((r) => r.binding === "prefix+1")).toBe(false);
    // Every default binding upstream lists appears in the help rows. Swap
    // bindings are real defaults but upstream help omits them
    // (keybind_help.rs:84-232), so they are excluded here.
    const allBindings = groups.flatMap((g) => g.rows.map((r) => r.binding));
    const omitted = new Set(["switchTab", "swapLeft", "swapDown", "swapUp", "swapRight"]);
    for (const binding of PREFIX_BINDINGS) {
      if (omitted.has(binding.action)) continue;
      const label = bindingLabel(binding);
      expect(allBindings, label).toContain(label);
    }
  });
});

describe("FIDELITY row: workspace navigation (prefix+w)", () => {
  it("prefix+w opens navigate mode; Esc exits", () => {
    const s = store();
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("w"));
    expect(s.getState().mode).toBe("navigate");
    s.dispatch(press("escape"));
    expect(s.getState().mode).toBe("terminal");
  });
});

describe("FIDELITY row: detach (shell/actions.rs:10-12)", () => {
  it("prefix+q detaches the client and preserves session state", () => {
    const s = store(1);
    const before = s.snapshot().workspaces[0]?.tabs[0]?.panes.length;
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("q"));
    expect(s.snapshot().attached).toBe(false);
    expect(s.snapshot().workspaces[0]?.tabs[0]?.panes.length).toBe(before);
    s.dispatch({ kind: "host", origin: "host", host: "reattach" });
    expect(s.snapshot().attached).toBe(true);
  });
});

describe("FIDELITY row: sidebar toggle (shell/actions.rs:13-21)", () => {
  it("prefix+b toggles client-local chrome only", () => {
    const s = store();
    const mode = s.getState().mode;
    const focus = focusedPaneId(s.getState());
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("b"));
    expect(s.snapshot().chrome.sidebarVisible).toBe(false);
    expect(s.getState().mode).toBe(mode);
    expect(focusedPaneId(s.getState())).toBe(focus);
  });
});

describe("FIDELITY row: zoom (prefix+z)", () => {
  it("toggles the focused pane zoom and the pill state matches", () => {
    const s = store(1);
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("z"));
    expect(s.snapshot().workspaces[0]?.tabs[0]?.zoomPill).toBe(true);
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("z"));
    expect(s.snapshot().workspaces[0]?.tabs[0]?.zoomPill).toBe(false);
  });
});

describe("L1-L3 input-destination evidence (LEVEL.md O1)", () => {
  it("L1: prefix+h then a typed character lands in the assignment process", () => {
    const s = store(1);
    const memo = focusedPaneId(s.getState());
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("h"));
    const assignment = focusedPaneId(s.getState());
    expect(assignment).not.toBe(memo);
    s.dispatch(press("x"));
    expect(paneInput(s.getState(), assignment)).toEqual(["x"]);
    expect(paneInput(s.getState(), memo)).toEqual([]);
  });

  it("L3: split then focus back and type into the declared pane", () => {
    const s = store(3);
    const original = focusedPaneId(s.getState());
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("v"));
    const created = focusedPaneId(s.getState());
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("h"));
    expect(focusedPaneId(s.getState())).toBe(original);
    s.dispatch(press("t"));
    expect(paneInput(s.getState(), original)).toEqual(["t"]);
    expect(paneInput(s.getState(), created)).toEqual([]);
  });
});
