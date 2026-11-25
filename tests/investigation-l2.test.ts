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

function enterLevel2(): Session {
  const session = createInvestigationSession();
  submit(session, "herdr");
  createWorkspace(session, "investigation");
  createTab(session, "research");
  submit(session, "claude");
  submit(session, "Find the cooperative source-handling memo and show me the original.");
  submit(session, "Accept the assignment");
  expect(session.getSnapshot().phase).toBe("response");
  session.advancePresentation();
  session.skipPresentation();
  expect(session.getSnapshot().level).toBe(2);
  expect(session.getSnapshot().phase).toBe("workspace");
  return session;
}

function objectiveMet(session: Session, id: string): boolean {
  return session
    .getSnapshot()
    .assessment.objectives.some((objective) => objective.id === id && objective.met);
}

describe("L2 continues the same investigation session", () => {
  it("keeps the L1 workspace, source memo, and agent session while comparing the shared SOC copy", () => {
    const session = enterLevel2();
    const workspace = activeWorkspace(session);
    const sourceTabId = workspace?.activeTabId;
    submit(session, "Find UM-1109-88");
    expect(session.getSnapshot().storyConditionMet).toBe(false);
    const sourcePaneId = focusedPane(session)?.id;
    const l1Application = session.getSnapshot().application;
    expect(workspace?.name).toBe("investigation");
    expect(workspace?.tabs.find((tab) => tab.id === sourceTabId)?.name).toBe("research");
    expect(l1Application.readReceipts).toContainEqual({
      documentId: "CPA-01A",
      paneId: sourcePaneId,
    });

    createTab(session, "report");
    const reportTabId = activeWorkspace(session)?.activeTabId;
    const reportPaneId = focusedPane(session)?.id;
    expect(reportTabId).not.toBe(sourceTabId);
    expect(objectiveMet(session, "L2-O1")).toBe(true);

    submit(session, "claude");
    submit(session, "Please retrieve SOC Memo UM-1109-88 and show the cooperative shared copy.");
    const output = focusedPane(session)?.output.join("\n") ?? "";
    expect(output).toContain("MCP CALL documents.search");
    expect(output).toContain("MCP CALL documents.read");
    expect(output).toContain("ORIGIN-EVENT-ID: [BLANK ON SHARED COPY].");
    expect(session.getSnapshot().application.readReceipts).toContainEqual({
      documentId: "UM-1109-88",
      paneId: reportPaneId,
    });
    expect(session.getSnapshot().application.readReceipts).toContainEqual({
      documentId: "CPA-01A",
      paneId: sourcePaneId,
    });
    expect(session.getSnapshot().storyConditionMet).toBe(true);
    expect(session.getSnapshot().phase).toBe("workspace");

    session.dispatch(prefix());
    session.dispatch(key("p"));
    expect(activeWorkspace(session)?.activeTabId).toBe(sourceTabId);
    expect(objectiveMet(session, "L2-O2")).toBe(false);
    session.dispatch(prefix());
    session.dispatch(key("n"));
    expect(activeWorkspace(session)?.activeTabId).toBe(reportTabId);
    expect(objectiveMet(session, "L2-O2")).toBe(true);
    expect(session.getSnapshot().phase).toBe("response");

    const agents = session.getSnapshot().application.agents;
    expect(Object.keys(agents)).toHaveLength(2);
    expect(
      agents[sourcePaneId ?? ""]?.history.some((entry) => entry.content.includes("CPA-01A")),
    ).toBe(true);
    expect(
      agents[reportPaneId ?? ""]?.history.some((entry) => entry.content.includes("UM-1109-88")),
    ).toBe(true);
    expect(
      session.getSnapshot().application.records.find((record) => record.id === "CPA-01A"),
    ).toEqual(l1Application.records.find((record) => record.id === "CPA-01A"));
  });

  it("allows story progress in Accessible mode without Herdr mastery credit", () => {
    const session = enterLevel2();
    session.setAccessibleMode(true);
    expect(session.dispatchChrome({ action: "new-tab" })).toBe(true);
    type(session, "report");
    session.dispatch(key("enter"));
    submit(session, "claude");
    submit(session, "Find UM-1109-88 and show the shared record.");

    expect(session.getSnapshot().storyConditionMet).toBe(true);
    expect(session.getSnapshot().phase).toBe("response");
    expect(session.getSnapshot().objectivesMet).toBe(false);
    expect(session.getSnapshot().assessment.objectives.every((objective) => !objective.met)).toBe(
      true,
    );
  });
});
