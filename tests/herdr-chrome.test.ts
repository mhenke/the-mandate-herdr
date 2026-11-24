import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { createScenario, createStore, replay } from "../src/core/herdr";
import type {
  ChromeEvent,
  HerdrState,
  InputEvent,
  PaneState,
  TabState,
  WorkspaceState,
} from "../src/core/herdr";

function chrome(event: ChromeEvent): ChromeEvent {
  return event;
}

/** Add a second workspace in the test fixture only; core has no workspace button. */
function withSecondWorkspace(state: HerdrState): HerdrState {
  const first = state.workspaces[0]!;
  const source = first.tabs[0]!;
  const pane: PaneState = { ...source.panes[0]!, id: "p3", title: "Second pane" };
  const tab: TabState = {
    ...source,
    id: "t2",
    name: "second tab",
    root: { kind: "pane", id: "p3" },
    focusedPaneId: "p3",
    prevFocusId: null,
    zoomedPaneId: null,
    panes: [pane],
  };
  const second: WorkspaceState = {
    ...first,
    id: "w2",
    name: "second",
    tabs: [tab],
    activeTabId: "t2",
  };
  return {
    ...state,
    workspaces: [first, second],
    nextPaneId: 4,
    nextTabId: 3,
    nextWorkspaceId: 2,
  };
}

function start(): ReturnType<typeof createStore> {
  return createStore(withSecondWorkspace(createScenario(1)));
}

function activeTab(state: HerdrState): TabState {
  const ws = state.workspaces.find((w) => w.id === state.activeWorkspaceId)!;
  return ws.tabs.find((t) => t.id === ws.activeTabId)!;
}

function keyPress(key: string): InputEvent {
  return { kind: "key", origin: "player", key, modifiers: [], phase: "press" };
}

describe("chrome intents", () => {
  it("new-tab opens the default name prompt; Enter creates with newTabApp", () => {
    const store = createStore(createScenario(1));
    const before = store.getState();
    const previous = activeTab(before);
    const entry = store.dispatch(chrome({ kind: "chrome", origin: "player", action: "new-tab" }));
    const prompt = store.getState().overlay;
    // actions.rs:135-139 + overlay_input.rs:386-408: pre-filled next number.
    expect(prompt).toMatchObject({ kind: "rename", target: "new-tab", text: "2" });
    expect(entry.playerAction).toBe(false);
    store.dispatch(keyPress("enter"));
    const after = store.getState();
    expect(after.overlay).toBeNull();
    expect(activeTab(after).id).not.toBe(previous.id);
    expect(activeTab(after).name).toBe("tab 2");
    expect(activeTab(after).panes[0]?.app).toBe(after.workspaces[0]?.newTabApp);
  });

  it("new-tab keeps a custom typed name and Escape aborts without creating", () => {
    const store = createStore(createScenario(1));
    store.dispatch(chrome({ kind: "chrome", origin: "player", action: "new-tab" }));
    store.dispatch({
      kind: "key",
      origin: "player",
      key: "u",
      modifiers: ["ctrl"],
      phase: "press",
    });
    store.dispatch(keyPress("l"));
    store.dispatch(keyPress("e"));
    store.dispatch(keyPress("a"));
    store.dispatch(keyPress("k"));
    store.dispatch(keyPress("enter"));
    const named = store.getState();
    expect(named.overlay).toBeNull();
    expect(activeTab(named).name).toBe("leak");
    // Escape on a fresh prompt: no tab is created (save is the only commit).
    store.dispatch(chrome({ kind: "chrome", origin: "player", action: "new-tab" }));
    store.dispatch(keyPress("escape"));
    expect(store.getState().overlay).toBeNull();
    expect(store.getState().workspaces[0]?.tabs.length).toBe(named.workspaces[0]?.tabs.length);
  });

  it("select-tab activates the actual tab id", () => {
    const store = createStore(createScenario(1));
    const original = activeTab(store.getState()).id;
    store.dispatch(chrome({ kind: "chrome", origin: "player", action: "new-tab" }));
    store.dispatch(keyPress("enter"));
    const added = activeTab(store.getState()).id;
    expect(added).not.toBe(original);
    store.dispatch(
      chrome({ kind: "chrome", origin: "player", action: "select-tab", tabId: original }),
    );
    expect(activeTab(store.getState()).id).toBe(original);
  });

  it("select-workspace activates the actual workspace id", () => {
    const store = start();
    const before = store.getState();
    expect(before.activeWorkspaceId).toBe("w1");
    store.dispatch(
      chrome({ kind: "chrome", origin: "player", action: "select-workspace", workspaceId: "w2" }),
    );
    expect(store.getState().activeWorkspaceId).toBe("w2");
    store.dispatch(
      chrome({ kind: "chrome", origin: "player", action: "select-workspace", workspaceId: "w1" }),
    );
    expect(store.getState().activeWorkspaceId).toBe("w1");
  });

  it("focus-pane activates the actual pane id in the active tab", () => {
    const store = createStore(createScenario(1));
    const tab = activeTab(store.getState());
    const target = tab.panes.find((p) => p.id !== tab.focusedPaneId)!;
    const entry = store.dispatch(
      chrome({ kind: "chrome", origin: "player", action: "focus-pane", paneId: target.id }),
    );
    expect(activeTab(store.getState()).focusedPaneId).toBe(target.id);
    expect(entry.playerAction).toBe(false);
  });

  it("unknown or stale ids are inert and keep snapshot identity", () => {
    const store = start();
    const state = store.getState();
    const snapshot = store.snapshot();
    for (const event of [
      chrome({ kind: "chrome", origin: "player", action: "select-workspace", workspaceId: "w9" }),
      chrome({ kind: "chrome", origin: "player", action: "select-tab", tabId: "t9" }),
      chrome({ kind: "chrome", origin: "player", action: "focus-pane", paneId: "p9" }),
    ] satisfies ChromeEvent[]) {
      const entry = store.dispatch(event);
      expect(entry.effect).toBe("none");
      expect(entry.playerAction).toBe(false);
      expect(store.snapshot()).toBe(snapshot);
      expect(store.getState().activeWorkspaceId).toBe(state.activeWorkspaceId);
      expect(activeTab(store.getState())).toEqual(activeTab(state));
    }
  });

  it("mock/detached chrome is inert", () => {
    const detached = { ...withSecondWorkspace(createScenario(1)), attached: false };
    const store = createStore(detached);
    const snapshot = store.snapshot();
    const entry = store.dispatch(
      chrome({ kind: "chrome", origin: "player", action: "select-workspace", workspaceId: "w2" }),
    );
    expect(entry.effect).toBe("none");
    expect(store.snapshot()).toBe(snapshot);
    expect(store.getState().activeWorkspaceId).toBe("w1");
  });

  it("each modeled overlay dismisses on the first chrome click only", () => {
    const base = withSecondWorkspace(createScenario(1));
    const tab = base.workspaces[0]!.tabs[0]!;
    const overlays = [
      { kind: "help", query: "", searchFocused: false, scroll: 0 },
      { kind: "rename", target: "tab", id: tab.id, text: "x" },
      { kind: "confirmClose", tabId: tab.id, paneId: tab.focusedPaneId },
    ] as const;
    for (const overlay of overlays) {
      const store = createStore({ ...base, overlay });
      const first = store.dispatch(
        chrome({ kind: "chrome", origin: "player", action: "select-workspace", workspaceId: "w2" }),
      );
      expect(first.action).toBe("overlay-dismiss");
      expect(store.getState().overlay).toBeNull();
      expect(store.getState().activeWorkspaceId).toBe("w1");
      store.dispatch(
        chrome({ kind: "chrome", origin: "player", action: "select-workspace", workspaceId: "w2" }),
      );
      expect(store.getState().activeWorkspaceId).toBe("w2");
    }
  });

  it("copies the event at the boundary", () => {
    const store = createStore(createScenario(1));
    const tab = activeTab(store.getState()).id;
    const event: ChromeEvent = {
      kind: "chrome",
      origin: "player",
      action: "select-tab",
      tabId: tab,
    };
    store.dispatch(event);
    (event as { tabId: string }).tabId = "t99";
    const entry = store.journal().at(-1)!;
    expect(entry.event).not.toBe(event);
    expect(entry.event).toMatchObject({ kind: "chrome", action: "select-tab", tabId: tab });
  });

  it("rejects process and host chrome origins at the boundary", () => {
    const store = createStore(createScenario(1));
    for (const origin of ["process", "host"] as const) {
      expect(() =>
        store.dispatch({
          kind: "chrome",
          origin,
          action: "new-tab",
        } as unknown as ChromeEvent),
      ).toThrow(RangeError);
    }
  });

  it("chrome and key inputs replay deterministically", () => {
    const events: InputEvent[] = [
      { kind: "chrome", origin: "player", action: "new-tab" },
      { kind: "key", origin: "player", key: "x", modifiers: [], phase: "press" },
      { kind: "chrome", origin: "script", action: "select-tab", tabId: "t1" },
      { kind: "chrome", origin: "player", action: "focus-pane", paneId: "p2" },
    ];
    const initial = withSecondWorkspace(createScenario(1));
    expect(replay(initial, events)).toEqual(replay(initial, events));
  });

  it("property: chrome entries are never player keyboard actions; replay is stable", () => {
    const actions = ["new-tab", "select-tab", "focus-pane", "x"] as const;
    fc.assert(
      fc.property(fc.array(fc.constantFrom(...actions), { maxLength: 12 }), (sequence) => {
        const store = createStore(withSecondWorkspace(createScenario(1)));
        const events: InputEvent[] = [];
        for (const action of sequence) {
          if (action === "x") {
            const event: InputEvent = {
              kind: "key",
              origin: "player",
              key: "x",
              modifiers: [],
              phase: "press",
            };
            store.dispatch(event);
            events.push(event);
          } else if (action === "new-tab") {
            const event: InputEvent = { kind: "chrome", origin: "player", action };
            store.dispatch(event);
            events.push(event);
          } else if (action === "select-tab") {
            const event: InputEvent = {
              kind: "chrome",
              origin: "player",
              action,
              tabId: activeTab(store.getState()).id,
            };
            store.dispatch(event);
            events.push(event);
          } else {
            const event: InputEvent = {
              kind: "chrome",
              origin: "player",
              action,
              paneId: activeTab(store.getState()).focusedPaneId,
            };
            store.dispatch(event);
            events.push(event);
          }
        }
        expect(
          store
            .journal()
            .filter((e) => e.event.kind === "chrome")
            .every((e) => !e.playerAction),
        ).toBe(true);
        expect(replay(withSecondWorkspace(createScenario(1)), events)).toEqual(store.getState());
      }),
    );
  });
});
