// Adapter contract: host key translation stays keyboard-source honest.
// Runs in Node (no React/DOM); the bridge between browser reports and core.

import { describe, expect, it } from "vitest";
import { toInputEvent } from "../src/adapters/herdr-browser";
import { createInvestigationSession } from "../src/adapters/investigation-session";
import type { InputEvent } from "../src/core/herdr";

describe("toInputEvent", () => {
  it("translates Ctrl+B to the prefix combo", () => {
    const result = toInputEvent({
      key: "b",
      code: "KeyB",
      ctrlKey: true,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      repeat: false,
    });
    expect(result.handled).toBe(true);
    expect(result.event).toMatchObject({ key: "b", modifiers: ["ctrl"], phase: "press" });
  });

  it("marks repeats without dropping them (core classifies repeats)", () => {
    const result = toInputEvent({
      key: "a",
      code: "KeyA",
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      repeat: true,
    });
    expect(result.handled).toBe(true);
    expect(result.event).toMatchObject({ phase: "repeat" });
  });

  it("consumes modifier-only reports without a core event", () => {
    const result = toInputEvent({
      key: "Shift",
      code: "ShiftLeft",
      ctrlKey: false,
      altKey: false,
      shiftKey: true,
      metaKey: false,
      repeat: false,
    });
    expect(result).toEqual({ event: null, handled: true });
  });

  it("leaves reserved Ctrl+W with the browser (handled=false)", () => {
    const result = toInputEvent({
      key: "w",
      code: "KeyW",
      ctrlKey: true,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      repeat: false,
    });
    expect(result).toEqual({ event: null, handled: false });
  });
});

describe("workspace host blur through the runtime", () => {
  it("voids a pending prefix and records the void", () => {
    const session = createInvestigationSession();
    session.newInvestigation();
    session.skipPresentation();
    session.dispatch({
      kind: "key",
      origin: "player",
      key: "b",
      modifiers: ["ctrl"],
      phase: "press",
    });
    const entry = session.dispatch({ kind: "host", origin: "host", host: "blur" });
    expect(entry?.action).toBe("prefix-voided");
  });
});

describe("development reload recovery", () => {
  const key = (k: string): InputEvent => ({
    kind: "key",
    origin: "player",
    key: k,
    modifiers: [],
    phase: "press",
  });

  it("returns null on a fresh title and restores a suspended investigation", () => {
    const first = createInvestigationSession();
    expect(first.serializeRecovery()).toBeNull();
    first.newInvestigation();
    first.skipPresentation();
    first.returnToTitle();
    const json = first.serializeRecovery();
    expect(json).not.toBeNull();
    const second = createInvestigationSession();
    expect(second.restoreRecovery(json as string)).toBe(true);
    expect(second.getSnapshot().phase).toBe("title");
    expect(second.getSnapshot().canContinue).toBe(true);
  });

  it("replays the workspace exactly, seeded documents included, without new credit", () => {
    const first = createInvestigationSession();
    first.newInvestigation();
    first.skipPresentation();
    first.dispatch(key("b"));
    first.dispatch({
      kind: "key",
      origin: "player",
      key: "?",
      modifiers: ["ctrl"],
      phase: "press",
    });
    // Accessible modality: chrome clicks are allowed and journaled, so the
    // recovery replay reproduces the same state — but they never grant mastery.
    first.setAccessibleMode(true);
    first.dispatchChrome({ action: "new-tab" });
    first.dispatch(key("escape"));
    const before = first.getSnapshot();
    expect(before.objectivesMet).toBe(false);
    const json = first.serializeRecovery() as string;
    const second = createInvestigationSession();
    expect(second.restoreRecovery(json)).toBe(true);
    const after = second.getSnapshot();
    expect(after.phase).toBe("workspace");
    expect(after.herdr).toEqual(before.herdr);
    expect(after.assessment).toEqual(before.assessment);
    expect(after.objectivesMet).toBe(false);
    expect(after.inputPolicy).toBe("accessible");
    // Seeded documents live in the journaled process events: replay restores them.
    const memo = after.herdr.workspaces[0]?.tabs[0]?.panes.find((p) => p.app === "memo");
    expect(memo?.output.some((line) => line.includes("Verify origin"))).toBe(true);
    // The restored session keeps accepting input deterministically.
    const entry = second.dispatch(key("x"));
    expect(entry?.playerAction).toBe(true);
  });

  it("ignores corrupt JSON and version mismatch", () => {
    const session = createInvestigationSession();
    expect(session.restoreRecovery("{not json")).toBe(false);
    expect(session.restoreRecovery(JSON.stringify({ version: 999, phase: "workspace" }))).toBe(
      false,
    );
    expect(
      session.restoreRecovery(JSON.stringify({ version: 2, phase: "workspace", suspendedPhase: "title" })),
    ).toBe(false);
    expect(session.getSnapshot().phase).toBe("title");
  });
});
