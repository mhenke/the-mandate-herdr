import { describe, expect, it } from "vitest";
import { createScenario, createStore, type HerdrState, type InputEvent } from "../src/core/herdr";

// Copy-mode reconciliation (src/client/shell/state.rs:1478-1503): copy state is
// cleared when its pane disappears or is no longer focused, and Copy mode is
// re-entered only while that pane is focused. One rule at the frame boundary
// covers pane close, tab close, tab switch, and workspace switch.

const press = (
  key: string,
  modifiers: readonly ("ctrl" | "alt" | "shift" | "meta")[] = [],
): InputEvent => ({ kind: "key", origin: "player", key, modifiers, phase: "press" });

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

/** L2 scenario plus a second tab, so a sole-pane close closes the tab. */
function twoTabs(): HerdrState {
  const s = createStore(createScenario(2));
  s.dispatch(press("b", ["ctrl"]));
  s.dispatch(press("c"));
  s.dispatch(press("enter"));
  s.dispatch(press("b", ["ctrl"]));
  s.dispatch(press("p"));
  return s.getState();
}

function enterCopy(s: ReturnType<typeof createStore>): string {
  const pane = focusedPaneId(s.getState());
  s.dispatch(press("b", ["ctrl"]));
  s.dispatch(press("["));
  expect(s.getState().mode).toBe("copy");
  expect(s.getState().copy?.paneId).toBe(pane);
  return pane;
}

function expectTerminalAndForwarded(s: ReturnType<typeof createStore>): void {
  expect(s.getState().mode).toBe("terminal");
  expect(s.getState().copy).toBeNull();
  const focused = focusedPaneId(s.getState());
  s.dispatch(press("z"));
  expect(paneInput(s.getState(), focused)).toEqual(["z"]);
}

describe("copy reconciliation: pane close (state.rs:1478-1490)", () => {
  it("closing the copy pane in a multi-pane tab clears copy and restores Terminal", () => {
    const s = createStore(createScenario(1));
    enterCopy(s);
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("x"));
    expectTerminalAndForwarded(s);
  });

  it("closing the sole pane of a tab with sibling tabs clears copy", () => {
    const s = createStore(twoTabs());
    enterCopy(s);
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("x"));
    expect(s.snapshot().workspaces[0]?.tabs).toHaveLength(1);
    expectTerminalAndForwarded(s);
  });
});

describe("copy reconciliation: tab close (state.rs:1478-1490)", () => {
  it("closing the copy tab clears copy and restores Terminal", () => {
    const s = createStore(twoTabs());
    enterCopy(s);
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("x", ["shift"]));
    expect(s.snapshot().workspaces[0]?.tabs).toHaveLength(1);
    expectTerminalAndForwarded(s);
  });
});

describe("copy reconciliation: tab switch (state.rs:1496-1503)", () => {
  it("prefix+n to another tab clears copy and restores Terminal", () => {
    const s = createStore(twoTabs());
    enterCopy(s);
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("n"));
    expectTerminalAndForwarded(s);
  });

  it("prefix+p to another tab clears copy and restores Terminal", () => {
    const s = createStore(twoTabs());
    enterCopy(s);
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("p"));
    expectTerminalAndForwarded(s);
  });

  it("a digit tab jump clears copy and restores Terminal", () => {
    const s = createStore(twoTabs());
    enterCopy(s);
    // Jump to the other tab (index 1); index 0 is the current tab.
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("2"));
    expectTerminalAndForwarded(s);
  });
});

describe("copy reconciliation: workspace switch (state.rs:1496-1503)", () => {
  it("selecting another workspace clears copy and restores Terminal", () => {
    const base = createScenario(2);
    const first = base.workspaces[0];
    if (!first) throw new Error("scenario needs a workspace");
    // Distinct ids: a duplicated workspace would keep the same focused pane id
    // and legitimately re-enter copy.
    const second = {
      ...first,
      id: "w2",
      name: "second",
      tabs: first.tabs.map((tab) => ({
        ...tab,
        id: `${tab.id}-w2`,
        panes: tab.panes.map((pane) => ({ ...pane, id: `${pane.id}-w2` })),
        focusedPaneId: `${tab.focusedPaneId}-w2`,
      })),
      activeTabId: `${first.activeTabId}-w2`,
    };
    const s = createStore({ ...base, workspaces: [first, second] });
    enterCopy(s);
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("w"));
    expect(s.getState().mode).toBe("navigate");
    s.dispatch(press("down"));
    s.dispatch(press("enter"));
    expect(s.getState().activeWorkspaceId).toBe("w2");
    expectTerminalAndForwarded(s);
  });
});

describe("copy reconciliation: focus change (state.rs:1496-1503)", () => {
  it("moving focus off the copy pane clears copy and restores Terminal", () => {
    const s = createStore(createScenario(1));
    enterCopy(s);
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("h"));
    expectTerminalAndForwarded(s);
  });
});

describe("copy reconciliation: legitimate return-to-copy", () => {
  it("prefix inside copy mode returns to copy while the pane stays focused", () => {
    // input.rs:682-688: the return mode is Copy when the focused pane is the
    // copy pane, so a cancelled prefix must not tear copy down.
    const s = createStore(createScenario(1));
    const pane = enterCopy(s);
    s.dispatch(press("b", ["ctrl"]));
    expect(s.getState().mode).toBe("prefix");
    s.dispatch(press("escape"));
    expect(s.getState().mode).toBe("copy");
    expect(s.getState().copy?.paneId).toBe(pane);
  });

  it("an invalid prefix follow-up returns to copy, not Terminal", () => {
    const s = createStore(createScenario(1));
    enterCopy(s);
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("Q"));
    expect(s.getState().mode).toBe("copy");
    expect(s.getState().copy).not.toBeNull();
  });

  it("a resolved prefix action that keeps focus returns to copy", () => {
    const s = createStore(createScenario(1));
    enterCopy(s);
    s.dispatch(press("b", ["ctrl"]));
    s.dispatch(press("z"));
    expect(s.getState().mode).toBe("copy");
    expect(s.getState().copy).not.toBeNull();
  });
});
