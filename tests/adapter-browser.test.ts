// Adapter contract: host key translation stays keyboard-source honest.
// Runs in Node (no React/DOM); the bridge between browser reports and core.

import { describe, expect, it } from "vitest";
import { toInputEvent } from "../src/adapters/herdr-browser";
import { createInvestigationSession } from "../src/adapters/investigation-session";
import type { InputEvent } from "../src/core/herdr";

describe("toInputEvent", () => {
  it("translates Ctrl+B to the prefix combo", () => {
    const result = toInputEvent(
      {
        key: "b",
        code: "KeyB",
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        repeat: false,
      },
      { attached: true, mode: "terminal", overlay: null },
    );
    expect(result).toMatchObject({ key: "b", modifiers: ["ctrl"], phase: "press" });
  });

  it("marks repeats without dropping them (core classifies repeats)", () => {
    const result = toInputEvent(
      {
        key: "a",
        code: "KeyA",
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        repeat: true,
      },
      null,
    );
    expect(result).toMatchObject({ phase: "repeat" });
  });

  it("leaves modifier-only reports with the browser", () => {
    const result = toInputEvent(
      {
        key: "Shift",
        code: "ShiftLeft",
        ctrlKey: false,
        altKey: false,
        shiftKey: true,
        metaKey: false,
        repeat: false,
      },
      null,
    );
    expect(result).toBeNull();
  });

  it.each(["r", "R", "w", "t", "l", "h", "v"])("leaves Control+%s with the browser", (key) => {
    const result = toInputEvent(
      {
        key,
        code: `Key${key.toUpperCase()}`,
        ctrlKey: true,
        altKey: false,
        shiftKey: key === "R",
        metaKey: false,
        repeat: false,
      },
      { attached: true, mode: "terminal", overlay: null },
    );
    expect(result).toBeNull();
  });
});

function submit(session: ReturnType<typeof createInvestigationSession>, text: string) {
  for (const key of [...text, "enter"]) {
    session.dispatch({ kind: "key", origin: "player", key, modifiers: [], phase: "press" });
  }
}

function startHerdr(session: ReturnType<typeof createInvestigationSession>) {
  submit(session, "herdr");
}

describe("workspace host blur through the runtime", () => {
  it("voids a pending prefix and records the void", () => {
    const session = createInvestigationSession();
    startHerdr(session);
    session.dispatch({
      kind: "key",
      origin: "player",
      key: "b",
      modifiers: ["ctrl"],
      phase: "press",
    });
    const entry = session.dispatch({ kind: "host", origin: "host", host: "blur" })?.entry;
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

  it("restores a suspended investigation from the title", () => {
    const first = createInvestigationSession();
    startHerdr(first);
    first.returnToTitle();
    const json = first.serializeRecovery();
    expect(json).not.toBeNull();
    const second = createInvestigationSession();
    expect(second.restoreRecovery(json as string)).toBe(true);
    expect(second.getSnapshot().phase).toBe("title");
    expect(second.getSnapshot().canContinue).toBe(true);
  });

  it("restores player-retrieved documents and agent history without new credit", () => {
    const first = createInvestigationSession();
    startHerdr(first);
    submit(first, "claude");
    submit(first, "Find the source-handling memo.");
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
    expect(after.application).toEqual(before.application);
    expect(after.application.readReceipts).toContainEqual({
      documentId: "CPA-01A",
      paneId: before.herdr.workspaces[0]?.tabs[0]?.panes[0]?.id,
    });
    expect(after.herdr.workspaces[0]?.tabs[0]?.panes[0]?.output).toContain(
      "SOURCE-HANDLING MEMORANDUM // CPA-01A",
    );
    // The restored session keeps accepting input deterministically.
    const entry = second.dispatch(key("x"))?.entry;
    expect(entry?.playerAction).toBe(true);
  });

  it("ignores corrupt JSON and version mismatch", () => {
    const session = createInvestigationSession();
    expect(session.restoreRecovery("{not json")).toBe(false);
    expect(session.restoreRecovery(JSON.stringify({ version: 999, phase: "workspace" }))).toBe(
      false,
    );
    expect(
      session.restoreRecovery(
        JSON.stringify({ version: 2, phase: "workspace", suspendedPhase: "title" }),
      ),
    ).toBe(false);
    expect(session.getSnapshot().phase).toBe("workspace");
  });
});
