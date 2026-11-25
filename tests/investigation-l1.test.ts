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
  const paneId = focusedPane(session)?.id;
  if (!paneId) throw new Error("The initial tab must have a focused pane.");
  submit(session, "claude", paneId);
  submit(session, "Find our procedures for handling confidential sources", paneId);
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
    expect(session.getSnapshot().application.terminal.output.join("\n")).toContain("$ herdr");
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

  it("supports simulated filesystem shell commands before and inside Herdr", () => {
    const session = createInvestigationSession();
    // In startup terminal:
    submit(session, "pwd");
    expect(session.getSnapshot().application.terminal.output.join("\n")).toContain(
      "~/Projects/the-mandate",
    );
    submit(session, "ls");
    expect(session.getSnapshot().application.terminal.output.join("\n")).toContain("README.md");
    submit(session, "cat README.md");
    expect(session.getSnapshot().application.terminal.output.join("\n")).toContain("The Mandate");

    // Launch Herdr:
    launchHerdr(session);
    const paneId = focusedPane(session)?.id;
    if (!paneId) throw new Error("Focused pane required");

    // In Herdr shell before Claude:
    submit(session, "pwd", paneId);
    expect(focusedPane(session)?.output.join("\n")).toContain("~/Projects/the-mandate");
    submit(session, "ls notes", paneId);
    expect(focusedPane(session)?.output.join("\n")).toContain("assignment.txt");
    submit(session, "cat notes/assignment.txt", paneId);
    expect(focusedPane(session)?.output.join("\n")).toContain("Desk Assignment");
    submit(session, "unknowncmd", paneId);
    expect(focusedPane(session)?.output.join("\n")).toContain("command not found");
  });

  it("launches Claude Code and retrieves assignment through natural schedule/email queries", () => {
    const session = createInvestigationSession();
    launchHerdr(session);
    const paneId = focusedPane(session)?.id;
    if (!paneId) throw new Error("Focused pane required");

    submit(session, "claude", paneId);
    expect(focusedPane(session)?.output.join("\n")).toContain("Claude Code");

    // Schedule check:
    submit(session, "What's on my schedule today?", paneId);
    let output = focusedPane(session)?.output.join("\n") ?? "";
    expect(output).toContain("newsroom_schedule.get_today");
    expect(output).toContain("June Adebayo");

    // Email check:
    submit(session, "Do I have any new email?", paneId);
    output = focusedPane(session)?.output.join("\n") ?? "";
    expect(output).toContain("newsroom_mail.list_inbox");
    expect(output).toContain("Vendor security incident & protected source");

    // Compound schedule and email inquiry:
    submit(session, "what do i have going on today? also do i have any outstanding email?", paneId);
    output = focusedPane(session)?.output.join("\n") ?? "";
    expect(output).toContain("newsroom_schedule.get_today");
    expect(output).toContain("newsroom_mail.list_inbox");
    expect(output).toContain("Priority lead triage with June Adebayo");

    // Assignment inquiry:
    submit(session, "What did June assign me?", paneId);
    output = focusedPane(session)?.output.join("\n") ?? "";
    expect(output).toContain("newsroom_mail.get_message");
    expect(output).toContain("CPA-01A");

    // Attempting acceptance before reading rules is politely blocked:
    submit(session, "Accept the assignment", paneId);
    output = focusedPane(session)?.output.join("\n") ?? "";
    expect(output).toContain("require reviewing the source-handling procedures");
    expect(session.getSnapshot().application.assignmentAcknowledged).toBe(false);
  });

  it("retrieves source handling procedures naturally and allows continued typing after completion", () => {
    const session = createInvestigationSession();
    launchHerdr(session);
    const paneId = focusedPane(session)?.id;
    if (!paneId) throw new Error("The default tab must have a focused pane.");

    submit(session, "claude", paneId);

    // Natural source procedure query:
    submit(session, "Find our procedures for handling confidential sources", paneId);
    let output = focusedPane(session)?.output.join("\n") ?? "";
    expect(output).toContain("documents.read");
    expect(output).toContain("SOURCE-HANDLING MEMORANDUM // CPA-01A");
    expect(output).toContain("01 // VERIFY ORIGIN.");
    expect(output).toContain("02 // PRESERVE ATTRIBUTION.");
    expect(session.getSnapshot().application.readReceipts).toContainEqual({
      documentId: "CPA-01A",
      paneId,
    });

    // Accept assignment:
    submit(session, "I accept the assignment.", paneId);
    output = focusedPane(session)?.output.join("\n") ?? "";
    expect(output).toContain("JUNE ADEBAYO");
    expect(session.getSnapshot().application.assignmentAcknowledged).toBe(true);
    expect(session.getSnapshot().storyConditionMet).toBe(true);
    expect(session.getSnapshot().objectivesMet).toBe(true);
    expect(session.getSnapshot().phase).toBe("response");

    // Interactivity test: terminal input continues working seamlessly even after completing the objective!
    submit(session, "What do we know about the incident?", paneId);
    output = focusedPane(session)?.output.join("\n") ?? "";
    expect(output).toContain("telemetry misfire");

    // Exiting Claude returns to shell:
    submit(session, "exit", paneId);
    output = focusedPane(session)?.output.join("\n") ?? "";
    expect(output).toContain("Exiting Claude Code. Returning to shell.");

    // Can continue typing shell commands:
    submit(session, "pwd", paneId);
    output = focusedPane(session)?.output.join("\n") ?? "";
    expect(output).toContain("~/Projects/the-mandate");
  });

  it("reveals one additional hint per request", () => {
    const session = createInvestigationSession();
    expect(session.getSnapshot().presentation.hints).toEqual([]);
    session.requestHint();
    expect(session.getSnapshot().presentation.hints).toEqual([
      "Type herdr and press Enter to open your newsroom workspace.",
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
