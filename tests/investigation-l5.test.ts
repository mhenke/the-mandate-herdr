import { describe, expect, it } from "vitest";
import { createInvestigationSession } from "../src/adapters/investigation-session";
import type { InputEvent, Modifier } from "../src/core/herdr";

const key = (value: string, modifiers: readonly Modifier[] = []): InputEvent => ({
  kind: "key",
  origin: "player",
  key: value,
  modifiers,
  phase: "press",
});
const prefix = () => key("b", ["ctrl"]);
type Session = ReturnType<typeof createInvestigationSession>;

function type(session: Session, value: string): void {
  for (const character of value) session.dispatch(key(character));
}

function submit(session: Session, value: string): void {
  type(session, value);
  session.dispatch(key("enter"));
}

function activeWorkspace(session: Session) {
  const { herdr } = session.getSnapshot();
  return herdr.workspaces.find((workspace) => workspace.id === herdr.activeWorkspaceId);
}

function activeTab(session: Session) {
  const workspace = activeWorkspace(session);
  return workspace?.tabs.find((tab) => tab.id === workspace.activeTabId);
}

function focusedPane(session: Session) {
  const tab = activeTab(session);
  return tab?.panes.find((pane) => pane.id === tab.focusedPaneId);
}

function createWorkspace(session: Session, name: string): void {
  session.dispatch(prefix());
  session.dispatch(key("n", ["shift"]));
  type(session, name);
  session.dispatch(key("enter"));
}

function createTab(session: Session, name: string): void {
  session.dispatch(prefix());
  session.dispatch(key("c"));
  type(session, name);
  session.dispatch(key("enter"));
}

function enterLevel5(): Session {
  const session = createInvestigationSession();
  submit(session, "herdr");
  submit(session, "claude");
  submit(session, "Find our procedures for handling confidential sources");
  submit(session, "Accept the assignment");
  session.advancePresentation();
  session.skipPresentation();

  createTab(session, "report");
  submit(session, "claude");
  submit(session, "Retrieve SOC Memo UM-1109-88 and show the shared copy.");
  session.dispatch(prefix());
  session.dispatch(key("p"));
  session.dispatch(prefix());
  session.dispatch(key("n"));
  session.advancePresentation();
  session.skipPresentation();

  session.dispatch(prefix());
  session.dispatch(key("t", ["shift"]));
  session.dispatch(key("u", ["ctrl"]));
  type(session, "park-interview");
  session.dispatch(key("enter"));

  session.dispatch(prefix());
  session.dispatch(key("v"));
  session.dispatch(prefix());
  session.dispatch(key("h"));
  session.dispatch(prefix());
  session.dispatch(key("l"));
  type(session, "claude");
  session.dispatch(key("enter"));
  submit(session, "Please find Theo Park's consent interview transcript for LT-47B.");
  session.advancePresentation();
  session.skipPresentation();

  // Level 4
  const investigationWsId = activeWorkspace(session)?.id;
  createWorkspace(session, "filing");
  session.dispatch(prefix());
  session.dispatch(key("v"));
  session.dispatch(prefix());
  session.dispatch(key("h"));
  session.dispatch(prefix());
  session.dispatch(key("l"));
  type(session, "claude");
  session.dispatch(key("enter"));
  submit(session, "file vn-12 paraphrase");

  session.dispatch(prefix());
  session.dispatch(key("w"));
  session.dispatch(key("up"));
  session.dispatch(key("enter"));
  expect(activeWorkspace(session)?.id).toBe(investigationWsId);

  session.advancePresentation();
  session.skipPresentation();

  expect(session.getSnapshot().level).toBe(5);
  return session;
}

function objectiveMet(session: Session, id: string): boolean {
  return session
    .getSnapshot()
    .assessment.objectives.some((objective) => objective.id === id && objective.met);
}

describe("L5: Fit to File (Retention Checkpoint 1 & Episode I Finale)", () => {
  it("verifies previously taught skills independently on the fresh intake set", () => {
    const session = enterLevel5();

    expect(session.getSnapshot().assessment.objectives.map((o) => o.id)).toEqual([
      "L5-O1",
      "L5-O2",
      "L5-O3",
      "L5-O4",
      "L5-O5",
    ]);

    // O5: Create the triage workspace without closing previous workspaces
    createWorkspace(session, "triage");
    expect(objectiveMet(session, "L5-O5")).toBe(true);
    expect(session.getSnapshot().herdr.workspaces.length).toBeGreaterThanOrEqual(2);

    // O1: Tab arrangement for the fresh set (create and name tabs)
    createTab(session, "intake");
    session.dispatch(prefix());
    session.dispatch(key("t", ["shift"]));
    session.dispatch(key("u", ["ctrl"]));
    type(session, "manifest");
    session.dispatch(key("enter"));
    expect(objectiveMet(session, "L5-O1")).toBe(true);

    // O2: Player-created comparison split
    session.dispatch(prefix());
    session.dispatch(key("v"));
    expect(objectiveMet(session, "L5-O2")).toBe(true);

    // O3: Correct focus and input destination
    session.dispatch(prefix());
    session.dispatch(key("h"));
    session.dispatch(prefix());
    session.dispatch(key("l"));
    type(session, "claude");
    expect(objectiveMet(session, "L5-O3")).toBe(true);
    session.dispatch(key("enter"));

    // Claude retrieves intake paperwork and compiles finding
    submit(session, "Retrieve INT-RECEIPT-12 and INTAKE-BATCH-1114");
    expect(focusedPane(session)?.output.join("\n")).toContain("INTAKE RECEIPT // INT-RECEIPT-12");

    // O4: Provenance-backed finding on the fresh set
    submit(session, "compile finding on intake batch");
    expect(objectiveMet(session, "L5-O4")).toBe(true);

    const snapshot = session.getSnapshot();
    expect(snapshot.story.events).toContain("SE-L5-retention1");
    expect(snapshot.story.flags).toContain("retention1-submitted");
    expect(snapshot.objectivesMet).toBe(true);
    expect(snapshot.storyConditionMet).toBe(true);
    expect(snapshot.phase).toBe("response");
    expect(snapshot.presentation.response).toContain("EPISODE I FINALE — THE THIRD COUNT");

    // Advance from Level 5 response -> triggers Episode I Finale completion!
    session.advancePresentation();
    expect(session.getSnapshot().phase).toBe("complete");
  });
});
