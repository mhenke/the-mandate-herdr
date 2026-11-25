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

function createTab(session: Session, name: string): void {
  session.dispatch(prefix());
  session.dispatch(key("c"));
  type(session, name);
  session.dispatch(key("enter"));
}

function enterLevel3(): Session {
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
  expect(session.getSnapshot().phase).toBe("response");
  session.advancePresentation();
  session.skipPresentation();
  expect(session.getSnapshot().level).toBe(3);
  return session;
}

function objectiveMet(session: Session, id: string): boolean {
  return session
    .getSnapshot()
    .assessment.objectives.some((objective) => objective.id === id && objective.met);
}

describe("L3 continues the newspaper investigation", () => {
  it("keeps earlier records and uses panes to retrieve Park's interview", () => {
    const session = enterLevel3();
    const workspace = activeWorkspace(session);
    const reportTabId = workspace?.activeTabId;
    const reportPaneId = focusedPane(session)?.id;
    expect(
      session.getSnapshot().application.readReceipts.map((receipt) => receipt.documentId),
    ).toEqual(["CPA-01A", "UM-1109-88"]);
    expect(session.getSnapshot().assessment.objectives.map((objective) => objective.id)).toEqual([
      "L3-O1",
      "L3-O2",
    ]);

    session.dispatch(prefix());
    session.dispatch(key("t", ["shift"]));
    session.dispatch(key("u", ["ctrl"]));
    type(session, "park-interview");
    session.dispatch(key("enter"));
    expect(objectiveMet(session, "L3-O2")).toBe(true);
    expect(activeTab(session)?.name).toBe("park-interview");

    session.dispatch(prefix());
    session.dispatch(key("v"));
    const splitTab = activeTab(session);
    expect(splitTab?.panes).toHaveLength(2);
    const newPaneId = splitTab?.focusedPaneId;
    expect(newPaneId).not.toBe(reportPaneId);

    session.dispatch(prefix());
    session.dispatch(key("h"));
    expect(activeTab(session)?.focusedPaneId).toBe(reportPaneId);
    session.dispatch(prefix());
    session.dispatch(key("l"));
    expect(activeTab(session)?.focusedPaneId).toBe(newPaneId);

    type(session, "claude");
    expect(objectiveMet(session, "L3-O1")).toBe(true);
    session.dispatch(key("enter"));
    expect(focusedPane(session)?.output.join("\n")).toContain("Claude Code");
    submit(session, "Please find Theo Park's consent interview transcript for LT-47B.");

    const snapshot = session.getSnapshot();
    expect(snapshot.application.readReceipts.map((receipt) => receipt.documentId)).toEqual([
      "CPA-01A",
      "UM-1109-88",
      "PARK-INTERVIEW-11-13",
    ]);
    expect(focusedPane(session)?.output.join("\n")).toContain(
      "PARK: 'Load-test script LT-47B misfired",
    );
    expect(Object.keys(snapshot.application.agents)).toHaveLength(3);
    expect(snapshot.storyConditionMet).toBe(true);
    expect(snapshot.objectivesMet).toBe(true);
    expect(snapshot.phase).toBe("response");

    session.advancePresentation();
    expect(session.getSnapshot().phase).toBe("briefing");
    expect(session.getSnapshot().level).toBe(4);
    session.skipPresentation();
    expect(session.getSnapshot().phase).toBe("workspace");
    expect(activeWorkspace(session)?.activeTabId).toBe(reportTabId);
  });
});
