import { describe, expect, it } from "vitest";
import { createScenario, createStore, type InputEvent } from "../src/core/herdr";

// Boundary ownership (M5): callers must not be able to mutate the initial
// state, getState()'s nested state, or journal events to desync the cached
// snapshot. Every exposed path is frozen; the caller's own objects are not.

const press = (
  key: string,
  modifiers: readonly ("ctrl" | "alt" | "shift" | "meta")[] = [],
): InputEvent => ({
  kind: "key",
  origin: "player",
  key,
  modifiers,
  phase: "press",
});

describe("boundary: initial state is copied, not retained", () => {
  it("mutating the caller's initial object after createStore does not affect the store", () => {
    const initial = createScenario(1);
    const s = createStore(initial);
    const before = s.snapshot();
    // The caller still owns its object; mutate it freely.
    const ws = initial.workspaces[0];
    const originalName = ws?.name;
    expect(ws).toBeDefined();
    (initial as { mode: string }).mode = "copy";
    (ws as { name: string }).name = "hijacked";
    expect(s.getState().mode).toBe("terminal");
    expect(s.getState().workspaces[0]?.name).toBe(originalName);
    expect(s.snapshot()).toBe(before);
  });

  it("the store's copy of the initial state is frozen", () => {
    const s = createStore(createScenario(1));
    expect(Object.isFrozen(s.getState())).toBe(true);
    expect(Object.isFrozen(s.getState().workspaces)).toBe(true);
  });
});

describe("boundary: getState() cannot mutate internal state", () => {
  it("nested state objects are frozen at every level", () => {
    const s = createStore(createScenario(1));
    const state = s.getState();
    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(state.workspaces)).toBe(true);
    expect(Object.isFrozen(state.workspaces[0])).toBe(true);
    expect(Object.isFrozen(state.workspaces[0]?.tabs)).toBe(true);
    expect(Object.isFrozen(state.workspaces[0]?.tabs[0])).toBe(true);
    expect(Object.isFrozen(state.workspaces[0]?.tabs[0]?.panes)).toBe(true);
    expect(Object.isFrozen(state.workspaces[0]?.tabs[0]?.panes[0])).toBe(true);
    expect(Object.isFrozen(state.workspaces[0]?.tabs[0]?.panes[0]?.agent)).toBe(true);
    expect(Object.isFrozen(state.journal)).toBe(true);
  });

  it("mutation attempts throw and leave the snapshot unchanged", () => {
    const s = createStore(createScenario(1));
    const before = s.snapshot();
    const originalName = before.workspaces[0]?.name;
    const state = s.getState();
    expect(() => {
      (state as { mode: string }).mode = "copy";
    }).toThrow(TypeError);
    expect(() => {
      (state.workspaces[0] as { name: string }).name = "hijacked";
    }).toThrow(TypeError);
    expect(() => {
      (state.workspaces[0]?.tabs[0]?.panes[0] as { title: string }).title = "hijacked";
    }).toThrow(TypeError);
    expect(() => {
      (state.workspaces[0]?.tabs[0]?.panes[0]?.agent as { raw: string }).raw = "idle";
    }).toThrow(TypeError);
    expect(s.getState().mode).toBe("terminal");
    expect(s.getState().workspaces[0]?.name).toBe(originalName);
    expect(s.snapshot()).toBe(before);
  });
});

describe("boundary: journal events are deep-frozen", () => {
  it("the returned entry, its event, modifiers and process payload are frozen", () => {
    const s = createStore(createScenario(1));
    const entry = s.dispatch(press("b", ["ctrl"]));
    expect(Object.isFrozen(entry)).toBe(true);
    expect(Object.isFrozen(entry.event)).toBe(true);
    const event = entry.event;
    if (event.kind !== "key") throw new Error("expected a key event");
    expect(Object.isFrozen(event.modifiers)).toBe(true);
    expect(() => {
      (event as { key: string }).key = "z";
    }).toThrow(TypeError);
    expect(() => {
      (event.modifiers as string[]).push("shift");
    }).toThrow(TypeError);
  });

  it("a process event's payload is frozen through the journal", () => {
    const s = createStore(createScenario(1));
    const pane = s.getState().workspaces[0]?.tabs[0]?.focusedPaneId;
    expect(pane).toBeDefined();
    s.dispatch({
      kind: "process",
      origin: "process",
      process: { kind: "agentState", paneId: pane ?? "", state: "working" },
    });
    const entry = s.journal()[0];
    expect(entry).toBeDefined();
    const event = entry?.event;
    expect(event?.kind).toBe("process");
    if (event?.kind !== "process") throw new Error("expected a process event");
    expect(Object.isFrozen(event)).toBe(true);
    expect(Object.isFrozen(event.process)).toBe(true);
    expect(() => {
      (event.process as { state: string }).state = "idle";
    }).toThrow(TypeError);
  });

  it("the caller's own event object is never frozen", () => {
    const s = createStore(createScenario(1));
    const event: InputEvent = {
      kind: "key",
      origin: "player",
      key: "b",
      modifiers: ["ctrl"],
      phase: "press",
    };
    s.dispatch(event);
    expect(Object.isFrozen(event)).toBe(false);
    expect(Object.isFrozen(event.modifiers)).toBe(false);
    // And it can still be mutated by its owner without touching the journal.
    (event as { key: string }).key = "z";
    expect(s.journal()[0]?.event).not.toBe(event);
    expect((s.journal()[0]?.event as { key: string }).key).toBe("b");
  });

  it("journal() returns the same frozen array identity until the next dispatch", () => {
    const s = createStore(createScenario(1));
    s.dispatch(press("b", ["ctrl"]));
    const first = s.journal();
    expect(Object.isFrozen(first)).toBe(true);
    expect(s.journal()).toBe(first);
    s.dispatch(press("escape"));
    expect(s.journal()).not.toBe(first);
    expect(s.journal()[0]).toBe(first[0]);
  });
});

describe("boundary: empty normalized keys are not input (N6)", () => {
  it("an empty key is neither forwarded nor recorded as player evidence", () => {
    const s = createStore(createScenario(1));
    const pane = s.getState().workspaces[0]?.tabs[0]?.focusedPaneId;
    const entry = s.dispatch({
      kind: "key",
      origin: "player",
      key: "",
      modifiers: [],
      phase: "press",
    });
    expect(entry.effect).toBe("none");
    expect(entry.action).toBeNull();
    expect(entry.playerAction).toBe(false);
    const input = s.getState().workspaces[0]?.tabs[0]?.panes.find((p) => p.id === pane)?.input;
    expect(input).toEqual([]);
  });

  it("an empty key cannot arm prefix or resolve a binding", () => {
    const s = createStore(createScenario(1));
    s.dispatch({ kind: "key", origin: "player", key: "", modifiers: ["ctrl"], phase: "press" });
    expect(s.getState().mode).toBe("terminal");
    s.dispatch({ kind: "key", origin: "player", key: "b", modifiers: ["ctrl"], phase: "press" });
    s.dispatch({ kind: "key", origin: "player", key: "", modifiers: [], phase: "press" });
    // Nothing arrived, so the pending prefix stays armed and nothing is
    // forwarded; the next real key still resolves it.
    expect(s.getState().mode).toBe("prefix");
    s.dispatch({ kind: "key", origin: "player", key: "escape", modifiers: [], phase: "press" });
    expect(s.getState().mode).toBe("terminal");
  });
});

describe("boundary: reattach composes visible completions (N4, input.rs:320-326)", () => {
  it("reattach acknowledges a done badge on the visible surface", () => {
    const s = createStore(createScenario(1));
    const pane = s.getState().workspaces[0]?.tabs[0]?.focusedPaneId;
    if (!pane) throw new Error("no focused pane");
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
    s.dispatch({ kind: "key", origin: "player", key: "b", modifiers: ["ctrl"], phase: "press" });
    s.dispatch({ kind: "key", origin: "player", key: "q", modifiers: [], phase: "press" });
    expect(s.getState().attached).toBe(false);
    s.dispatch({ kind: "host", origin: "host", host: "reattach" });
    expect(s.getState().attached).toBe(true);
    expect(
      s.snapshot().workspaces[0]?.tabs[0]?.panes.find((p) => p.id === pane)?.agent.projected,
    ).toBe("idle");
  });
});
