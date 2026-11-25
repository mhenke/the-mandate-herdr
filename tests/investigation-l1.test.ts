import { describe, expect, it } from "vitest";
import { createInvestigationSession } from "../src/adapters/investigation-session";
import type { InputEvent, Modifier } from "../src/core/herdr";

type Origin = "player" | "script" | "fixture";

const key = (
  value: string,
  modifiers: readonly Modifier[] = [],
  origin: Origin = "player",
): InputEvent => ({
  kind: "key",
  origin,
  key: value,
  modifiers,
  phase: "press",
});

const prefix = (origin: Origin = "player") => key("b", ["ctrl"], origin);
type Session = ReturnType<typeof createInvestigationSession>;

function type(session: Session, value: string, origin: Origin = "player"): void {
  for (const character of value) session.dispatch(key(character, [], origin));
}

function submit(session: Session, value: string, paneId?: string): void {
  type(session, value);
  if (paneId) {
    const { herdr } = session.getSnapshot();
    const workspace = herdr.workspaces.find((item) => item.id === herdr.activeWorkspaceId);
    const tab = workspace?.tabs.find((item) => item.id === workspace.activeTabId);
    if (tab?.focusedPaneId !== paneId)
      throw new Error("Expected the requested pane to be focused.");
  }
  session.dispatch(key("enter"));
}

function launchHerdr(session: Session): void {
  submit(session, "herdr");
}

function createWorkspace(session: Session, name: string, origin: Origin = "player"): void {
  session.dispatch(prefix(origin));
  session.dispatch(key("n", ["shift"], origin));
  type(session, name, origin);
  session.dispatch(key("enter", [], origin));
}

function createTab(session: Session, name: string): void {
  session.dispatch(prefix());
  session.dispatch(key("c"));
  type(session, name);
  session.dispatch(key("enter"));
}

function focusedPane(session: Session) {
  const { herdr } = session.getSnapshot();
  const workspace = herdr.workspaces.find((item) => item.id === herdr.activeWorkspaceId);
  const tab = workspace?.tabs.find((item) => item.id === workspace.activeTabId);
  return tab?.panes.find((item) => item.id === tab.focusedPaneId);
}

function objectiveMet(session: Session, id: string): boolean {
  return session
    .getSnapshot()
    .assessment.objectives.some((objective) => objective.id === id && objective.met);
}

function reachL1Response(): ReturnType<Session["getSnapshot"]> {
  const session = createInvestigationSession();
  launchHerdr(session);
  createWorkspace(session, "investigation");
  createTab(session, "research");
  const paneId = focusedPane(session)?.id;
  if (!paneId) throw new Error("The research tab must have a focused pane.");
  submit(session, "claude", paneId);
  submit(session, "Find the cooperative source-handling memo and show me the original.", paneId);
  submit(session, "Accept the assignment", paneId);
  return session.getSnapshot();
}

describe("L1 player-driven investigation", () => {
  it("starts at an open terminal and launches Herdr only after the player submits herdr", () => {
    const session = createInvestigationSession();
    const initial = session.getSnapshot();
    expect(initial.phase).toBe("workspace");
    expect(initial.application.terminal.output).toContain("$ ");
    expect(initial.application.herdrLaunched).toBe(false);
    expect(initial.herdr.workspaces).toHaveLength(1);
    expect(initial.herdr.workspaces[0]?.name).toBe("the-mandate");

    type(session, "herdr");
    expect(session.getSnapshot().application.herdrLaunched).toBe(false);
    session.dispatch(key("enter"));
    expect(session.getSnapshot().application.herdrLaunched).toBe(true);
    expect(session.getSnapshot().application.terminal.output).toContain("$ herdr");
  });

  it("credits a player launch command but not a scripted Herdr launch", () => {
    const session = createInvestigationSession();
    for (const character of "herdr") session.dispatch(key(character, [], "script"));
    session.dispatch(key("enter", [], "script"));
    expect(session.getSnapshot().application.herdrLaunched).toBe(false);
    expect(objectiveMet(session, "L1-O1")).toBe(false);

    submit(session, "herdr");
    expect(session.getSnapshot().application.herdrLaunched).toBe(true);
    expect(objectiveMet(session, "L1-O1")).toBe(true);
  });

  it("credits a player-created investigation workspace and tab, not scripted Herdr actions", () => {
    const session = createInvestigationSession();
    launchHerdr(session);
    createWorkspace(session, "fixture-workspace", "script");
    expect(objectiveMet(session, "L1-O2")).toBe(false);
    createWorkspace(session, "investigation");
    expect(objectiveMet(session, "L1-O2")).toBe(true);
    createTab(session, "research");
    expect(objectiveMet(session, "L1-O3")).toBe(true);
    const state = session.getSnapshot().herdr;
    const workspace = state.workspaces.find((item) => item.id === state.activeWorkspaceId);
    expect(workspace?.name).toBe("investigation");
    expect(workspace?.tabs.find((item) => item.id === workspace.activeTabId)?.name).toBe(
      "research",
    );
    expect(session.getSnapshot().application.readReceipts).toEqual([]);
    expect(session.getSnapshot().story.events).toEqual([]);
  });

  it("retrieves and displays the original memo, then advances after June's acknowledgment", () => {
    const session = createInvestigationSession();
    launchHerdr(session);
    createWorkspace(session, "investigation");
    createTab(session, "research");
    const paneId = focusedPane(session)?.id;
    if (!paneId) throw new Error("The research tab must have a focused pane.");

    submit(session, "claude", paneId);
    expect(focusedPane(session)?.output.join("\n")).toContain("Claude Code v1.0.12 (simulated)");

    submit(
      session,
      "Please locate CPA-01A, the cooperative source-handling memo, and show its text.",
      paneId,
    );
    const output = focusedPane(session)?.output.join("\n") ?? "";
    expect(output).toContain("MCP CALL documents.search");
    expect(output).toContain("MCP CALL documents.read");
    expect(output).toContain("01 // VERIFY ORIGIN.");
    expect(output).toContain("02 // PRESERVE ATTRIBUTION.");
    expect(output).toContain("03 // ASSUME NOTHING CONFIRMED.");
    expect(session.getSnapshot().application.readReceipts).toContainEqual({
      documentId: "CPA-01A",
      paneId,
    });
    expect(session.getSnapshot().phase).toBe("workspace");

    submit(session, "I accept the assignment.", paneId);
    expect(focusedPane(session)?.output.join("\n")).toContain("JUNE ADEBAYO");
    expect(session.getSnapshot().application.assignmentAcknowledged).toBe(true);
    expect(session.getSnapshot().storyConditionMet).toBe(true);
    expect(session.getSnapshot().objectivesMet).toBe(true);
    expect(session.getSnapshot().phase).toBe("response");
  });

  it("reveals one additional hint per request", () => {
    const session = createInvestigationSession();
    expect(session.getSnapshot().presentation.hints).toEqual([]);
    session.requestHint();
    expect(session.getSnapshot().presentation.hints).toEqual([
      "The terminal is ready. Type herdr and press Enter.",
    ]);
  });

  it("replays the same L1 actions to the same committed result", () => {
    expect(reachL1Response()).toEqual(reachL1Response());
  });
});

describe("input policy and mastery provenance", () => {
  it("refuses chrome clicks in Standard mode without changing Herdr state", () => {
    const session = createInvestigationSession();
    const before = session.getSnapshot().herdr;
    expect(session.getSnapshot().inputPolicy).toBe("standard");
    expect(session.dispatchChrome({ action: "new-tab" })).toBe(false);
    expect(session.getSnapshot().herdr).toBe(before);
    expect(session.getSnapshot().objectivesMet).toBe(false);
  });

  it("allows accessible chrome navigation without keyboard mastery credit", () => {
    const session = createInvestigationSession();
    session.setAccessibleMode(true);
    expect(session.dispatchChrome({ action: "new-tab" })).toBe(true);
    expect(session.getSnapshot().assessment.objectives.every((objective) => !objective.met)).toBe(
      true,
    );
  });
});
