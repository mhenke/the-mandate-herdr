import { describe, expect, it } from "vitest";
import {
  createApplicationState,
  readDocument,
  searchDocuments,
  stepApplication,
  type ApplicationState,
} from "../src/core/applications";

const playerKey = (state: ApplicationState, key: string, paneId?: string) =>
  stepApplication(state, { kind: "key", origin: "player", key, paneId });

function typeLine(state: ApplicationState, line: string, paneId?: string) {
  for (const key of line) state = playerKey(state, key, paneId).state;
  return playerKey(state, "enter", paneId);
}

describe("fictional document tools and Claude Code", () => {
  it("starts with a terminal and launches Herdr only after the player submits herdr", () => {
    const initial = createApplicationState();
    expect(initial.herdrLaunched).toBe(false);
    expect(initial.terminal.input).toBe("");
    const typed = typeLine(initial, "herdr");
    expect(typed.state.herdrLaunched).toBe(true);
    expect(typed.effects.some((effect) => effect.kind === "herdr-started")).toBe(true);
  });

  it.each([
    "find the source-handling memo",
    "locate CPA-01A and show me the guidance",
    "retrieve June's cooperative memo about protecting the source",
  ])("retrieves CPA-01A from a reasonable request: %s", (request) => {
    let state = createApplicationState();
    state = typeLine(state, "herdr").state;
    state = typeLine(state, "claude", "p1").state;
    const result = typeLine(state, request, "p1");
    expect(
      result.effects.map((effect) => (effect.kind === "pane-output" ? effect.line : "")).join("\n"),
    ).toContain("MCP CALL documents.search");
    expect(
      result.effects.map((effect) => (effect.kind === "pane-output" ? effect.line : "")).join("\n"),
    ).toContain("MCP CALL documents.read");
    expect(
      result.effects.map((effect) => (effect.kind === "pane-output" ? effect.line : "")).join("\n"),
    ).toContain("02 // PRESERVE ATTRIBUTION");
    expect(result.state.readReceipts).toContainEqual({ documentId: "CPA-01A", paneId: "p1" });
  });

  it("shares canonical records across agent sessions and denies restricted records", () => {
    let state = typeLine(createApplicationState(), "herdr").state;
    state = typeLine(state, "claude", "p1").state;
    state = typeLine(state, "find CPA-01A", "p1").state;
    state = typeLine(state, "claude", "p2").state;
    const denied = typeLine(state, "read RESTRICTED-EIAB-DRAFT", "p2");
    expect(denied.state.agents.p2?.status).toBe("blocked");
    expect(denied.state.readReceipts).toEqual([{ documentId: "CPA-01A", paneId: "p1" }]);
    expect(
      denied.effects.some(
        (effect) => effect.kind === "pane-output" && effect.line.includes("permission_denied"),
      ),
    ).toBe(true);
    const recovered = typeLine(denied.state, "find the source handling memo", "p2");
    expect(recovered.state.agents.p2?.status).toBe("ready");
    expect(recovered.state.readReceipts).toContainEqual({ documentId: "CPA-01A", paneId: "p2" });
  });

  it("reports invalid and missing tool inputs without mutating the shared records", () => {
    const state = createApplicationState();
    expect(searchDocuments(state.records, " ")).toEqual({ ok: false, error: "invalid_query" });
    expect(searchDocuments(state.records, "unknown-id")).toEqual({ ok: false, error: "not_found" });
    expect(readDocument(state.records, " ")).toEqual({ ok: false, error: "invalid_id" });
    expect(readDocument(state.records, "unknown-id")).toEqual({ ok: false, error: "not_found" });
    expect(readDocument(state.records, "RESTRICTED-EIAB-DRAFT")).toEqual({
      ok: false,
      error: "permission_denied",
    });
    expect(state.readReceipts).toEqual([]);
  });

  it("does not retrieve Park's interview before the interview level", () => {
    let state = typeLine(createApplicationState(), "herdr").state;
    state = typeLine(state, "claude", "p1").state;
    const result = typeLine(state, "Find Theo Park's interview", "p1");
    expect(result.effects).toContainEqual({
      kind: "pane-output",
      paneId: "p1",
      line: "MCP RESULT documents.search error: not_found",
    });
    expect(result.state.readReceipts).toEqual([]);
  });

  it("ignores scripted and fixture input and replays deterministically", () => {
    const initial = createApplicationState();
    const scripted = stepApplication(initial, { kind: "key", origin: "script", key: "h" });
    expect(scripted.state).toBe(initial);
    const replay = (origin: "player" | "fixture") => {
      let state = createApplicationState();
      for (const key of "herdr") state = stepApplication(state, { kind: "key", origin, key }).state;
      state = stepApplication(state, { kind: "key", origin, key: "enter" }).state;
      return state;
    };
    expect(replay("player")).toEqual(replay("player"));
    expect(replay("fixture").herdrLaunched).toBe(false);
  });

  it("handles flexible phrasing without rigid hyphens or regex matching", () => {
    let state = typeLine(createApplicationState(), "herdr").state;
    state = typeLine(state, "claude", "p1").state;
    const result = typeLine(state, "can you open cpa 01a for me", "p1");
    expect(result.state.readReceipts).toContainEqual({ documentId: "CPA-01A", paneId: "p1" });

    const accept = typeLine(result.state, "I agree to take on June's assignment", "p1");
    expect(accept.state.assignmentAcknowledged).toBe(true);
    expect(
      accept.effects.some(
        (effect) => effect.kind === "pane-output" && effect.line.includes("JUNE ADEBAYO"),
      ),
    ).toBe(true);
  });

  it("provides helpful available record hints when a query cannot be identified", () => {
    let state = typeLine(createApplicationState(), "herdr").state;
    state = typeLine(state, "claude", "p1").state;
    const result = typeLine(state, "what is the weather today", "p1");
    const output = result.effects
      .map((effect) => (effect.kind === "pane-output" ? effect.line : ""))
      .join("\n");
    expect(output).toContain("I could not identify a record");
    expect(output).toContain("Available records: CPA-01A");
  });

  it("supports paste input events directly into the terminal and pane inputs", () => {
    const initial = createApplicationState();
    const pastedTerminal = stepApplication(initial, {
      kind: "paste",
      origin: "player",
      text: "herdr",
    });
    expect(pastedTerminal.state.terminal.input).toBe("herdr");
    const launched = stepApplication(pastedTerminal.state, {
      kind: "key",
      origin: "player",
      key: "enter",
    });
    expect(launched.state.herdrLaunched).toBe(true);

    const pastedPane = stepApplication(launched.state, {
      kind: "paste",
      origin: "player",
      paneId: "p1",
      text: "claude",
    });
    expect(pastedPane.state.paneInputs.p1).toBe("claude");
  });
});
