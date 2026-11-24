import { describe, expect, it } from "vitest";
import { createInvestigationSession } from "../src/adapters/investigation-session";
import type { InputEvent, Modifier } from "../src/core/herdr";

const key = (
  k: string,
  modifiers: readonly Modifier[] = [],
  origin: "player" | "script" | "fixture" = "player",
): InputEvent => ({ kind: "key", origin, key: k, modifiers, phase: "press" });

const prefix = key("b", ["ctrl"]);

function toL2Workspace(session: ReturnType<typeof createInvestigationSession>): void {
  session.newInvestigation();
  session.skipPresentation();
  // Satisfy Level 1 to advance
  session.storyAction("read-memo");
  session.dispatch(prefix);
  session.dispatch(key("h"));
  session.dispatch(key("x"));
  session.storyAction("acknowledge-assignment");
  session.dispatch(prefix);
  session.dispatch(key("?"));
  session.dispatch(key("/"));
  session.dispatch(key("a"));
  session.dispatch(key("u", ["ctrl"]));
  session.dispatch(key("enter"));
  session.dispatch(prefix);
  session.dispatch(key("y"));
  expect(session.getSnapshot().phase).toBe("response");
  session.advancePresentation(); // to L2 briefing
  expect(session.getSnapshot().phase).toBe("briefing");
  expect(session.getSnapshot().level).toBe(2);
  session.advancePresentation(); // to L2 workspace
  expect(session.getSnapshot().phase).toBe("workspace");
}

function objectiveMet(session: ReturnType<typeof createInvestigationSession>, id: string): boolean {
  return session.getSnapshot().assessment.objectives.some((o) => o.id === id && o.met);
}

describe("L2 investigation runtime and Herdr simulator fidelity", () => {
  it("starts L2 with the reading queue tab and L2 objectives", () => {
    const session = createInvestigationSession();
    toL2Workspace(session);
    const snap = session.getSnapshot();
    expect(snap.level).toBe(2);
    expect(snap.herdr.workspaces[0]?.tabs).toHaveLength(1);
    expect(snap.herdr.workspaces[0]?.tabs[0]?.name).toBe("reading");
    expect(snap.herdr.workspaces[0]?.tabs[0]?.panes[0]?.output).toEqual([
      "COOPERATIVE INTAKE — READING QUEUE",
      "ITEM: SOC Memo UM-1109-88 (Shared Copy)",
      "SOURCE: Campus SOC via Quill transfer",
      "NOTE ON FACE: Headers stripped per external sharing policy.",
      "Open a dedicated artifact tab to inspect the supplied banner screenshot.",
    ]);
    expect(snap.assessment.objectives.map((o) => o.id)).toEqual(["L2-O1", "L2-O2"]);
    expect(snap.assessment.objectives.every((o) => !o.met)).toBe(true);
  });

  it("prefix+c opens the new tab prompt; Escape cancels without creating a tab", () => {
    const session = createInvestigationSession();
    toL2Workspace(session);
    session.dispatch(prefix);
    session.dispatch(key("c"));
    expect(session.getSnapshot().herdr.overlay).toMatchObject({
      kind: "rename",
      target: "new-tab",
      text: "2",
    });
    session.dispatch(key("escape"));
    expect(session.getSnapshot().herdr.overlay).toBeNull();
    expect(session.getSnapshot().herdr.workspaces[0]?.tabs).toHaveLength(1);
  });

  it("creates a second tab, renames it through the Herdr field, and switches tabs (L2-O1)", () => {
    const session = createInvestigationSession();
    toL2Workspace(session);

    // Create second tab: prefix+c then Enter commits default
    session.dispatch(prefix);
    session.dispatch(key("c"));
    session.dispatch(key("enter"));
    expect(session.getSnapshot().herdr.workspaces[0]?.tabs).toHaveLength(2);
    const artifactTabId = session.getSnapshot().herdr.workspaces[0]?.activeTabId;

    // Rename tab via prefix+shift+t (S04)
    session.dispatch(prefix);
    session.dispatch(key("t", ["shift"]));
    expect(session.getSnapshot().herdr.overlay).toMatchObject({
      kind: "rename",
      target: "tab",
    });
    session.dispatch(key("u", ["ctrl"])); // clear default
    session.dispatch(key("a"));
    session.dispatch(key("r"));
    session.dispatch(key("t"));
    session.dispatch(key("i"));
    session.dispatch(key("f"));
    session.dispatch(key("a"));
    session.dispatch(key("c"));
    session.dispatch(key("t"));
    session.dispatch(key("enter"));

    const tab = session.getSnapshot().herdr.workspaces[0]?.tabs.find((t) => t.id === artifactTabId);
    expect(tab?.name).toBe("artifact");
    expect(tab?.panes[0]?.output).toEqual([
      "ATTACHMENT: UM-1109-88 / BANNER CAPTURE",
      "ORIGIN-EVENT-ID: [BLANK - FORM DEFAULT / STRIPPED]",
      "TARGET: Vendor Demonstration Portal (VP-1109)",
      "WINDOW: 2026-11-09 21:47 - 21:52 EST",
      "BANNER: 'MAINTENANCE ADVISORY: DIAGNOSTIC SCRIPT EXECUTION IN PROGRESS'",
      "ATTRIBUTION: Remote banner verification of supplied artifact only.",
    ]);

    // Switch tabs: prefix+p switches to reading tab, prefix+n switches back to artifact tab
    session.dispatch(prefix);
    session.dispatch(key("p"));
    expect(session.getSnapshot().herdr.workspaces[0]?.activeTabId).not.toBe(artifactTabId);

    session.dispatch(prefix);
    session.dispatch(key("n"));
    expect(session.getSnapshot().herdr.workspaces[0]?.activeTabId).toBe(artifactTabId);

    expect(objectiveMet(session, "L2-O1")).toBe(true);
  });

  it("consumes an invalid prefix follow-up inside the artifact tab (L2-O2)", () => {
    const session = createInvestigationSession();
    toL2Workspace(session);

    // Create second tab and focus it
    session.dispatch(prefix);
    session.dispatch(key("c"));
    session.dispatch(key("enter"));

    // Press prefix, then unbound key 'y' inside the artifact tab
    session.dispatch(prefix);
    session.dispatch(key("y"));

    expect(objectiveMet(session, "L2-O2")).toBe(true);
  });

  it("earns response and advances to Level 3 when story action and objectives are met", () => {
    const session = createInvestigationSession();
    toL2Workspace(session);

    // Fulfill L2-O1
    session.dispatch(prefix);
    session.dispatch(key("c"));
    session.dispatch(key("enter"));
    session.dispatch(prefix);
    session.dispatch(key("t", ["shift"]));
    session.dispatch(key("u", ["ctrl"]));
    session.dispatch(key("a"));
    session.dispatch(key("enter"));
    session.dispatch(prefix);
    session.dispatch(key("p"));
    session.dispatch(prefix);
    session.dispatch(key("n"));
    expect(objectiveMet(session, "L2-O1")).toBe(true);

    // Fulfill L2-O2
    session.dispatch(prefix);
    session.dispatch(key("y"));
    expect(objectiveMet(session, "L2-O2")).toBe(true);

    // Story action: examine artifact
    session.storyAction("examine-artifact");

    // Settle into response phase
    const snap = session.getSnapshot();
    expect(snap.phase).toBe("response");
    expect(snap.story.events).toContain("SE-L2-artifact");
    expect(snap.presentation.response).toContain("Artifact examined");

    // Advancing from L2 response opens L3 briefing
    session.advancePresentation();
    expect(session.getSnapshot().phase).toBe("briefing");
    expect(session.getSnapshot().level).toBe(3);
  });

  it("Accessible mode allows completing Level 2 without keyboard mastery credit", () => {
    const session = createInvestigationSession();
    toL2Workspace(session);
    session.setAccessibleMode(true);

    // Pointer chrome creates tab and focuses it
    session.dispatchChrome({ action: "new-tab" });
    session.dispatch(key("enter"));

    // Story action
    session.storyAction("examine-artifact");

    const snap = session.getSnapshot();
    expect(snap.phase).toBe("response");
    expect(snap.storyConditionMet).toBe(true);
    expect(snap.objectivesMet).toBe(false);
    expect(snap.assessment.objectives.every((o) => !o.met)).toBe(true);
  });
});
