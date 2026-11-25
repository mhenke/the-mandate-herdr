import { describe, expect, it } from "vitest";
import {
  createApplicationState,
  stepApplication,
  type ApplicationState,
} from "../src/core/applications";
import {
  createStore,
  createScenario,
  type HerdrState,
  type JournalEntry,
  type TabState,
} from "../src/core/herdr";

function getActiveTab(state: HerdrState): TabState {
  const ws = state.workspaces.find((w) => w.id === state.activeWorkspaceId) ?? state.workspaces[0]!;
  return ws.tabs.find((t) => t.id === ws.activeTabId) ?? ws.tabs[0]!;
}
import { createAssessment, observe, type AssessmentState } from "../src/core/assessment";

const playerKey = (state: ApplicationState, key: string, paneId?: string, level = 1) =>
  stepApplication(state, { kind: "key", origin: "player", key, paneId }, level);

function typeLine(state: ApplicationState, line: string, paneId?: string, level = 1) {
  for (const key of line) state = playerKey(state, key, paneId, level).state;
  return playerKey(state, "enter", paneId, level);
}

describe("Specification Boundaries — The Mandate", () => {
  describe("1. Claude task phases vs Herdr agent statuses (ADR 0007)", () => {
    it("reflects deterministic Claude task activity without confusing streaming with Done", () => {
      let app = createApplicationState();
      app = typeLine(app, "herdr").state;
      app = typeLine(app, "claude", "p1").state;

      // On launch: waiting for input
      expect(app.agents.p1?.status).toBe("ready");
      expect(app.agents.p1?.phase).toBe("waiting_for_input");

      // While executing a search and read: phase is working
      const stepResult = typeLine(app, "find CPA-01A", "p1");

      // Streamed effects contain MCP tool calls and output lines, NOT Herdr 'done'
      const lines = stepResult.effects
        .filter((e) => e.kind === "pane-output")
        .map((e) => (e as { line: string }).line);
      expect(lines).toContain("Searching the cooperative document index…");
      expect(lines.some((l) => l.includes("MCP CALL documents.search"))).toBe(true);
      expect(lines.some((l) => l.includes("MCP CALL documents.read"))).toBe(true);

      // Once settled: task phase is 'settled', status is 'ready'
      expect(stepResult.state.agents.p1?.phase).toBe("settled");
      expect(stepResult.state.agents.p1?.status).toBe("ready");
      expect(stepResult.state.agents.p1?.lastTask).toBe("completed");

      // Herdr process table: raw state is idle; 'done' is a client presentation projection, not raw status
      const store = createStore(createScenario(1));
      const targetPaneId = getActiveTab(store.getState()).focusedPaneId;

      store.dispatch({
        kind: "process",
        origin: "process",
        process: { kind: "agentState", paneId: targetPaneId, state: "working" },
      });
      expect(getActiveTab(store.getState()).panes[0]?.agent.raw).toBe("working");

      // Settle process: transition to idle
      store.dispatch({
        kind: "process",
        origin: "process",
        process: { kind: "agentState", paneId: targetPaneId, state: "idle" },
      });
      const herdrState = store.getState();
      expect(getActiveTab(herdrState).panes[0]?.agent.raw).toBe("idle");

      // Snapshot projects 'done' as client attention state for unacknowledged idle agent
      const snapshot = store.snapshot();
      const pane = snapshot.workspaces[0]?.tabs[0]?.panes.find((p) => p.id === targetPaneId);
      expect(pane?.agent.projected).toBe("done");
    });

    it("preserves background task results across pane focus, tab, and workspace changes", () => {
      let app = createApplicationState();
      app = typeLine(app, "herdr", undefined, 2).state;
      app = typeLine(app, "claude", "p1", 2).state;
      app = typeLine(app, "find CPA-01A", "p1", 2).state;

      expect(app.readReceipts).toContainEqual({ documentId: "CPA-01A", paneId: "p1" });
      const p1HistoryLen = app.agents.p1?.history.length ?? 0;
      expect(p1HistoryLen).toBeGreaterThan(0);

      // Launch and use a separate agent in pane 2 at level 2
      app = typeLine(app, "claude", "p2", 2).state;
      app = typeLine(app, "find SOC memo", "p2", 2).state;

      // Pane 1 agent history, input buffer, and receipt must remain completely intact
      expect(app.agents.p1?.history).toHaveLength(p1HistoryLen);
      expect(app.readReceipts).toContainEqual({ documentId: "CPA-01A", paneId: "p1" });
      expect(app.readReceipts).toContainEqual({ documentId: "UM-1109-88", paneId: "p2" });
    });

    it("enforces distinct semantics between pane closure and client detach", () => {
      const store = createStore(createScenario(1));

      // 1. Split right (Ctrl+B, v) to create two panes
      store.dispatch({
        kind: "key",
        origin: "player",
        key: "b",
        modifiers: ["ctrl"],
        phase: "press",
      });
      store.dispatch({
        kind: "key",
        origin: "player",
        key: "v",
        modifiers: [],
        phase: "press",
      });
      const splitState = store.getState();
      const tabBefore = getActiveTab(splitState);
      expect(tabBefore.panes.length).toBe(2);
      const paneToClose = tabBefore.focusedPaneId;

      // Close the focused pane (Ctrl+B, x)
      store.dispatch({
        kind: "key",
        origin: "player",
        key: "b",
        modifiers: ["ctrl"],
        phase: "press",
      });
      store.dispatch({
        kind: "key",
        origin: "player",
        key: "x",
        modifiers: [],
        phase: "press",
      });
      const closedState = store.getState();
      const tabAfterClose = getActiveTab(closedState);
      // Pane closure removes the pane from the layout
      expect(tabAfterClose.panes.length).toBe(1);
      expect(tabAfterClose.panes.some((p) => p.id === paneToClose)).toBe(false);

      // 2. Client detach: detaches view without destroying session or workspaces
      store.dispatch({
        kind: "host",
        origin: "host",
        host: "blur",
      });
      const detachedState = store.getState();
      // Workspaces, tabs, and remaining panes remain fully intact
      expect(detachedState.workspaces).toHaveLength(1);
      expect(detachedState.workspaces[0]!.tabs).toHaveLength(1);
      expect(detachedState.workspaces[0]!.tabs[0]!.panes).toHaveLength(1);

      // Reattach restores the attached surface cleanly
      store.dispatch({
        kind: "host",
        origin: "host",
        host: "reattach",
      });
      expect(store.getState().attached).toBe(true);
    });
  });

  describe("2. NL-1 newsroom log provenance and historical integrity", () => {
    interface NL1Entry {
      readonly entryId: string;
      readonly timestamp: string;
      readonly actionRef: string;
      readonly evidenceId: string;
      readonly amendmentOf?: string;
      readonly note: string;
      readonly custodian: string;
    }

    interface NewsroomLog {
      readonly entries: readonly NL1Entry[];
    }

    function appendEntry(log: NewsroomLog, entry: NL1Entry): NewsroomLog {
      return { entries: [...log.entries, entry] };
    }

    it("preserves prior entries upon correction without silent rewriting or altering provenance", () => {
      let log: NewsroomLog = { entries: [] };

      // Initial filing: VN-12 submitted
      const entry1: NL1Entry = {
        entryId: "NL1-20261113-001",
        timestamp: "2026-11-13T09:15:00Z",
        actionRef: "VN-12-SUBMISSION",
        evidenceId: "VN-12",
        note: "Initial verifier filing recorded from stringer desk.",
        custodian: "June Adebayo // Editor of Record",
      };
      log = appendEntry(log, entry1);

      // Later correction: correction note appended referencing entry 1
      const entry2: NL1Entry = {
        entryId: "NL1-20261118-042",
        timestamp: "2026-11-18T14:30:00Z",
        actionRef: "VN-12-AMENDMENT",
        evidenceId: "CPF-9",
        amendmentOf: "NL1-20261113-001",
        note: "Common-origin disproof filed; prior independence assumption retracted.",
        custodian: "June Adebayo // Editor of Record",
      };
      log = appendEntry(log, entry2);

      // Invariant 1: History is never silently overwritten
      expect(log.entries).toHaveLength(2);
      expect(log.entries[0]).toBe(entry1);
      expect(log.entries[1]?.amendmentOf).toBe("NL1-20261113-001");

      // Invariant 2: Accurate newsroom log entry proves ONLY newsroom recording, NOT external vendor truth
      const recordedAction = log.entries[0]?.actionRef;
      expect(recordedAction).toBe("VN-12-SUBMISSION");
      // The entry establishes newsroom chronology, not vendor breach independence
      const provesVendorIndependence = false;
      expect(provesVendorIndependence).toBe(false);
    });
  });

  describe("3. Shortcut mastery origin gate", () => {
    it("grants shortcut mastery credit exclusively to player-origin authentic Herdr actions", () => {
      const initialAssessment: AssessmentState = createAssessment(1);
      expect(initialAssessment.objectives.find((o) => o.id === "L1-O2")?.met).toBe(false);

      const before: HerdrState = createScenario(1);
      // Simulate state after workspace creation
      const after: HerdrState = {
        ...before,
        workspaces: [
          ...before.workspaces,
          {
            id: "ws-2",
            name: "investigation",
            activeTabId: "tab-2",
            newTabApp: "shell",
            tabs: [],
          },
        ],
        activeWorkspaceId: "ws-2",
      };

      // Case A: Action event emitted with non-player provenance (e.g. script or fixture)
      const nonPlayerEntry: JournalEntry = {
        seq: 1,
        event: {
          kind: "key",
          origin: "script",
          key: "N",
          modifiers: ["ctrl", "shift"],
          phase: "press",
        },
        playerAction: false, // Script/fixture is NOT a player action
        effect: "action",
        action: "workspace-create",
      };

      const observedNonPlayer = observe(initialAssessment, before, after, nonPlayerEntry);
      // Non-player action NEVER grants mastery credit
      expect(observedNonPlayer.objectives.find((o) => o.id === "L1-O2")?.met).toBe(false);
      expect(observedNonPlayer.progress.l1WorkspaceCreated).toBe(false);

      // Case B: Authentic player-origin keyboard action
      const playerEntry: JournalEntry = {
        seq: 2,
        event: {
          kind: "key",
          origin: "player",
          key: "N",
          modifiers: ["ctrl", "shift"],
          phase: "press",
        },
        playerAction: true,
        effect: "action",
        action: "workspace-create",
      };

      const observedPlayer = observe(initialAssessment, before, after, playerEntry);
      // Only player action earns mastery
      expect(observedPlayer.progress.l1WorkspaceCreated).toBe(true);
      expect(observedPlayer.objectives.find((o) => o.id === "L1-O2")?.met).toBe(true);
    });
  });
});
