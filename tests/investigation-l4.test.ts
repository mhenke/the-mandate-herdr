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

function enterLevel4(): Session {
  const session = createInvestigationSession();
  submit(session, "herdr");
  createWorkspace(session, "investigation");
  createTab(session, "research");
  submit(session, "claude");
  submit(session, "Find the cooperative source-handling memo and show me the original.");
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

  expect(session.getSnapshot().level).toBe(4);
  return session;
}

function objectiveMet(session: Session, id: string): boolean {
  return session
    .getSnapshot()
    .assessment.objectives.some((objective) => objective.id === id && objective.met);
}

describe("L4: Filed 19:05 (Verifier Note VN-12 and Choice 1)", () => {
  it("preserves earlier records and requires separate workspace and split pane for VN-12", () => {
    const session = enterLevel4();
    const initialWs = activeWorkspace(session);
    const initialWsId = initialWs?.id;

    // Earlier evidence is intact
    expect(
      session.getSnapshot().application.readReceipts.map((r) => r.documentId),
    ).toEqual(["CPA-01A", "UM-1109-88", "PARK-INTERVIEW-11-13"]);

    expect(session.getSnapshot().assessment.objectives.map((o) => o.id)).toEqual([
      "L4-O1",
      "L4-O2",
    ]);
    expect(objectiveMet(session, "L4-O1")).toBe(false);
    expect(objectiveMet(session, "L4-O2")).toBe(false);

    // Step 1: Create a filing workspace (Ctrl+B Shift+N)
    createWorkspace(session, "filing");
    const filingWs = activeWorkspace(session);
    expect(filingWs?.name).toBe("filing");
    expect(filingWs?.id).not.toBe(initialWsId);

    // Step 2: Split the tab in the filing workspace (Ctrl+B V)
    session.dispatch(prefix());
    session.dispatch(key("v"));
    const splitTab = activeTab(session);
    expect(splitTab?.panes.length).toBe(2);

    // Step 3: Move focus to the draft pane and direct input
    session.dispatch(prefix());
    session.dispatch(key("l"));
    type(session, "claude");
    expect(objectiveMet(session, "L4-O2")).toBe(true);
    session.dispatch(key("enter"));

    // Step 4: Ask Claude to file VN-12 with paraphrase (Choice 1)
    submit(session, "file vn-12 paraphrase");

    const snapshot = session.getSnapshot();
    expect(snapshot.story.flags).toContain("source-protection-paraphrase");
    expect(snapshot.story.flags).toContain("vn12-filed");
    expect(snapshot.story.events).toContain("SE-L4-filing");
    expect(focusedPane(session)?.output.join("\n")).toContain("SUBMISSION ACKNOWLEDGEMENT // SUB-ACK-12");

    // L4-O1 requires returning to the reading workspace
    expect(objectiveMet(session, "L4-O1")).toBe(false);

    // Step 5: Navigate back to the reading workspace using workspace navigator (Ctrl+B W)
    session.dispatch(prefix());
    session.dispatch(key("w"));
    // Navigator mode open, select initial workspace and press enter
    session.dispatch(key("up"));
    session.dispatch(key("enter"));

    expect(session.getSnapshot().herdr.activeWorkspaceId).toBe(initialWsId);
    expect(objectiveMet(session, "L4-O1")).toBe(true);
    expect(session.getSnapshot().objectivesMet).toBe(true);
    expect(session.getSnapshot().storyConditionMet).toBe(true);
    expect(session.getSnapshot().phase).toBe("response");

    // Advance to Level 5 briefing
    session.advancePresentation();
    expect(session.getSnapshot().level).toBe(5);
    expect(session.getSnapshot().phase).toBe("briefing");
  });

  it("records detail choice when player chooses identifying detail option", () => {
    const session = enterLevel4();
    createWorkspace(session, "filing");
    session.dispatch(prefix());
    session.dispatch(key("v"));
    session.dispatch(prefix());
    session.dispatch(key("l"));
    submit(session, "claude");

    // File with detail
    submit(session, "file vn-12 detail");
    const snapshot = session.getSnapshot();
    expect(snapshot.story.flags).toContain("source-protection-detail");
    expect(snapshot.story.flags).toContain("vn12-filed");
  });
});
