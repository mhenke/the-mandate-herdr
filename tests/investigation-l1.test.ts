import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { createInvestigationSession } from "../src/adapters/investigation-session";
import type { InputEvent, Modifier } from "../src/core/herdr";
import type { ObjectiveId } from "../src/core/assessment";

const key = (
  k: string,
  modifiers: readonly Modifier[] = [],
  origin: "player" | "script" | "fixture" = "player",
): InputEvent => ({ kind: "key", origin, key: k, modifiers, phase: "press" });

const prefix = key("b", ["ctrl"]);

function toWorkspace(session: ReturnType<typeof createInvestigationSession>): void {
  session.newInvestigation();
  session.skipPresentation();
}

function paneIds(session: ReturnType<typeof createInvestigationSession>): {
  assignment: string;
  memo: string;
} {
  const tab = session.getSnapshot().herdr.workspaces[0]?.tabs[0];
  const assignment = tab?.panes.find((p) => p.app === "assignment")?.id ?? "";
  const memo = tab?.panes.find((p) => p.app === "memo")?.id ?? "";
  return { assignment, memo };
}

/** O1: prefix focus memo->assignment, then a forwarded character. */
function doFocusAndType(session: ReturnType<typeof createInvestigationSession>): void {
  session.dispatch(prefix);
  session.dispatch(key("h"));
  session.dispatch(key("x"));
}

/** O2: help opened, filter typed, cleared with ctrl+u, closed. */
function doHelp(session: ReturnType<typeof createInvestigationSession>): void {
  session.dispatch(prefix);
  session.dispatch(key("?"));
  session.dispatch(key("/"));
  session.dispatch(key("a"));
  session.dispatch(key("u", ["ctrl"]));
  session.dispatch(key("enter"));
}

/** O3: invalid follow-up consumed, terminal restored, pane input unchanged. */
function doInvalid(session: ReturnType<typeof createInvestigationSession>): void {
  session.dispatch(prefix);
  session.dispatch(key("y"));
}

function objectiveMet(session: ReturnType<typeof createInvestigationSession>, id: string): boolean {
  return session.getSnapshot().assessment.objectives.some((o) => o.id === id && o.met);
}

describe("L1 investigation runtime", () => {
  it("credits a genuine cleared filter when Escape leaves the field then closes help", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    for (const event of [
      prefix,
      key("?"),
      key("/"),
      key("a"),
      key("u", ["ctrl"]),
      key("escape"),
      key("escape"),
    ])
      session.dispatch(event);
    expect(session.getSnapshot().herdr.overlay).toBeNull();
    expect(objectiveMet(session, "L1-O2")).toBe(true);
  });

  it("starts at the title with no attempt and no Continue", () => {
    const session = createInvestigationSession();
    expect(session.getSnapshot().phase).toBe("title");
    expect(session.getSnapshot().canContinue).toBe(false);
    expect(session.continueInvestigation()).toBe(false);
  });

  it("title -> cold open -> workspace, and Continue resumes the same attempt", () => {
    const session = createInvestigationSession();
    session.newInvestigation();
    expect(session.getSnapshot().phase).toBe("cold-open");
    session.advancePresentation();
    expect(session.getSnapshot().phase).toBe("episode");
    session.advancePresentation();
    expect(session.getSnapshot().phase).toBe("briefing");
    session.advancePresentation();
    expect(session.getSnapshot().phase).toBe("workspace");

    doFocusAndType(session);
    const before = session.getSnapshot();
    session.returnToTitle();
    expect(session.getSnapshot().phase).toBe("title");
    expect(session.getSnapshot().canContinue).toBe(true);
    expect(session.continueInvestigation()).toBe(true);
    expect(session.getSnapshot().phase).toBe("workspace");
    expect(session.getSnapshot().assessment.objectives).toEqual(before.assessment.objectives);
  });

  it("repeated title/Continue/new is idempotent and never resumes a stale phase", () => {
    const session = createInvestigationSession();
    session.newInvestigation();
    session.skipPresentation();
    session.returnToTitle();
    session.returnToTitle();
    expect(session.getSnapshot().phase).toBe("title");
    expect(session.continueInvestigation()).toBe(true);
    expect(session.getSnapshot().phase).toBe("workspace");
    // Continue outside title is refused and cannot reset the phase.
    expect(session.continueInvestigation()).toBe(false);
    expect(session.getSnapshot().phase).toBe("workspace");
    session.newInvestigation();
    expect(session.getSnapshot().phase).toBe("cold-open");
    expect(session.getSnapshot().assessment.objectives.some((o) => o.met)).toBe(false);
  });

  it("scene and title input never mutate the simulation", () => {
    const session = createInvestigationSession();
    expect(session.dispatch(key("x"))).toBeNull();
    session.newInvestigation();
    const before = session.getSnapshot().herdr;
    expect(session.dispatch(prefix)).toBeNull();
    expect(session.getSnapshot().herdr).toBe(before);
    session.skipPresentation();
    expect(session.dispatch(prefix)).not.toBeNull();
  });

  it("skipping scenes yields no objectives", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    expect(session.getSnapshot().assessment.objectives.every((o) => !o.met)).toBe(true);
    expect(session.getSnapshot().objectivesMet).toBe(false);
  });

  it("script, fixture and process input never earn credit", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    session.dispatch(key("b", ["ctrl"], "script"));
    session.dispatch(key("h", [], "script"));
    session.dispatch(key("x", [], "fixture"));
    session.dispatch({
      kind: "process",
      origin: "process",
      process: { kind: "output", paneId: "p1", line: "x" },
    });
    expect(session.getSnapshot().assessment.objectives.some((o) => o.met)).toBe(false);
  });

  it("an invalid intent without state change is not credited", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    // A valid binding that changes nothing (focus left from the leftmost pane).
    session.dispatch(prefix);
    session.dispatch(key("h"));
    session.dispatch(prefix);
    session.dispatch(key("h"));
    expect(objectiveMet(session, "L1-O1")).toBe(false);
    expect(objectiveMet(session, "L1-O3")).toBe(false);
  });

  it("L1 O1: focus memo->assignment then a forwarded character", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    const { assignment } = paneIds(session);
    doFocusAndType(session);
    expect(objectiveMet(session, "L1-O1")).toBe(true);
    const pane = session
      .getSnapshot()
      .herdr.workspaces[0]?.tabs[0]?.panes.find((p) => p.id === assignment);
    expect(pane?.input).toEqual(["x"]);
  });

  it("L1 O2: help opened, filtered, cleared, closed", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    doHelp(session);
    expect(objectiveMet(session, "L1-O2")).toBe(true);
    expect(session.getSnapshot().assessment.helpConsulted).toBe(true);
  });

  it("L1 O3: invalid follow-up consumed with pane input unchanged", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    const { memo } = paneIds(session);
    doInvalid(session);
    expect(objectiveMet(session, "L1-O3")).toBe(true);
    const pane = session
      .getSnapshot()
      .herdr.workspaces[0]?.tabs[0]?.panes.find((p) => p.id === memo);
    expect(pane?.input).toEqual([]);
  });

  it("story actions are grounded in the focused pane", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    // Memo is focused at level start: acknowledging the assignment is refused.
    session.storyAction("acknowledge-assignment");
    expect(session.getSnapshot().story.flags).toEqual([]);
    session.storyAction("read-memo");
    expect(session.getSnapshot().story.events).toEqual(["SE-L1-assignment"]);
    // Reading the memo twice is idempotent.
    session.storyAction("read-memo");
    expect(session.getSnapshot().story.events).toEqual(["SE-L1-assignment"]);
    // Focusing the assignment pane alone is not enough: the process must have
    // accepted input before the assignment can be acknowledged.
    session.dispatch(prefix);
    session.dispatch(key("h"));
    session.storyAction("acknowledge-assignment");
    expect(session.getSnapshot().story.flags).toEqual([]);
    session.dispatch(key("x"));
    session.storyAction("acknowledge-assignment");
    expect(session.getSnapshot().story.flags).toEqual(["assignment-accepted"]);
    // The acceptance is visible in the environment, not only in story state.
    const assignment = session
      .getSnapshot()
      .herdr.workspaces[0]?.tabs[0]?.panes.find((p) => p.app === "assignment");
    expect(assignment?.output).toContain("Assignment accepted — verify origin.");
  });

  it("story actions outside the workspace are refused", () => {
    const session = createInvestigationSession();
    session.newInvestigation();
    session.storyAction("read-memo");
    expect(session.getSnapshot().story.events).toEqual([]);
  });

  it("no advance to response without both story condition and skill predicates", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    session.storyAction("read-memo");
    session.dispatch(prefix);
    session.dispatch(key("h"));
    session.dispatch(key("x"));
    session.storyAction("acknowledge-assignment");
    expect(session.getSnapshot().storyConditionMet).toBe(true);
    expect(session.getSnapshot().phase).toBe("workspace");
    doFocusAndType(session);
    doHelp(session);
    doInvalid(session);
    expect(session.getSnapshot().objectivesMet).toBe(true);
    expect(session.getSnapshot().phase).toBe("response");
  });

  it("skill evidence alone never reaches the response", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    doFocusAndType(session);
    doHelp(session);
    doInvalid(session);
    expect(session.getSnapshot().objectivesMet).toBe(true);
    expect(session.getSnapshot().storyConditionMet).toBe(false);
    expect(session.getSnapshot().phase).toBe("workspace");
  });

  it("hint assistance is recorded on objectives", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    session.requestHint();
    expect(session.getSnapshot().assessment.hintsUsed).toBe(1);
    expect(session.getSnapshot().presentation.hints).toHaveLength(1);
    doFocusAndType(session);
    const o1 = session.getSnapshot().assessment.objectives.find((o) => o.id === "L1-O1");
    expect(o1?.assistance).toBe("assisted");
  });

  it("replay is deterministic and idempotent", () => {
    const run = (): unknown => {
      const session = createInvestigationSession();
      toWorkspace(session);
      session.storyAction("read-memo");
      doFocusAndType(session);
      doHelp(session);
      doInvalid(session);
      return session.getSnapshot();
    };
    expect(run()).toEqual(run());
  });

  it("property: arbitrary player input never credits without the required evidence", () => {
    const keys = ["h", "j", "k", "l", "x", "y", "?", "/", "a", "u", "enter", "escape"];
    fc.assert(
      fc.property(fc.array(fc.constantFrom(...keys), { maxLength: 12 }), (sequence) => {
        const session = createInvestigationSession();
        toWorkspace(session);
        for (const k of sequence) session.dispatch(key(k));
        const snapshot = session.getSnapshot();
        // No story action was taken, so the response is unreachable.
        expect(snapshot.phase).toBe("workspace");
        expect(snapshot.storyConditionMet).toBe(false);
      }),
    );
  });

  it("property: objectives only ever move from unmet to met", () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom("h", "x", "y", "?", "/", "a", "u", "enter"), { maxLength: 10 }),
        (sequence) => {
          const session = createInvestigationSession();
          toWorkspace(session);
          let previous = new Set<ObjectiveId>();
          for (const k of sequence) {
            session.dispatch(key(k));
            const met = new Set(
              session
                .getSnapshot()
                .assessment.objectives.filter((o) => o.met)
                .map((o) => o.id),
            );
            for (const id of previous) expect(met.has(id)).toBe(true);
            previous = met;
          }
        },
      ),
    );
  });
});

describe("L1 false-credit regressions", () => {
  it("O1: control keys after the focus never count as typed input", () => {
    for (const control of ["escape", "enter", "arrowleft", "backspace"]) {
      const session = createInvestigationSession();
      toWorkspace(session);
      session.dispatch(prefix);
      session.dispatch(key("h"));
      session.dispatch(key(control));
      expect(objectiveMet(session, "L1-O1")).toBe(false);
    }
  });

  it("O1: a scripted focus then player typing does not retro-credit", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    // Scripted prefix + focus moves memo -> assignment without player action.
    session.dispatch(key("b", ["ctrl"], "script"));
    session.dispatch(key("h", [], "script"));
    session.dispatch(key("x"));
    // A later player focus cannot move (assignment is leftmost, no wrap).
    session.dispatch(prefix);
    session.dispatch(key("h"));
    expect(objectiveMet(session, "L1-O1")).toBe(false);
  });

  it("O1: typing before the qualifying focus does not count", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    // Memo is focused: this character goes to the memo process.
    session.dispatch(key("x"));
    session.dispatch(prefix);
    session.dispatch(key("h"));
    expect(objectiveMet(session, "L1-O1")).toBe(false);
    // Only input accepted after the focus qualifies.
    session.dispatch(key("y"));
    expect(objectiveMet(session, "L1-O1")).toBe(true);
  });

  it("O1: vertical focus keys never credit the horizontal lesson", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    session.dispatch(prefix);
    session.dispatch(key("k"));
    session.dispatch(prefix);
    session.dispatch(key("j"));
    session.dispatch(key("x"));
    expect(objectiveMet(session, "L1-O1")).toBe(false);
  });

  it("O2: scripted query text plus player control keys is not player filtering", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    session.dispatch(prefix);
    session.dispatch(key("?"));
    session.dispatch(key("/"));
    session.dispatch(key("a", [], "script"));
    session.dispatch(key("b", [], "script"));
    session.dispatch(key("backspace"));
    session.dispatch(key("u", ["ctrl"]));
    session.dispatch(key("enter"));
    expect(objectiveMet(session, "L1-O2")).toBe(false);
  });

  it("O2: a scripted clear followed by a no-op player clear is not a clear", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    session.dispatch(prefix);
    session.dispatch(key("?"));
    session.dispatch(key("/"));
    session.dispatch(key("a"));
    session.dispatch(key("u", ["ctrl"], "script"));
    session.dispatch(key("u", ["ctrl"]));
    session.dispatch(key("enter"));
    expect(objectiveMet(session, "L1-O2")).toBe(false);
  });

  it("O2: player-typed filter, player clear, player close still credits", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    doHelp(session);
    expect(objectiveMet(session, "L1-O2")).toBe(true);
  });
});

describe("L1 review regressions (attempt lifecycle and provenance)", () => {
  it("O2: a dirty filter close after clear is not a clean exit", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    session.dispatch(prefix);
    session.dispatch(key("?"));
    session.dispatch(key("/"));
    session.dispatch(key("a"));
    session.dispatch(key("u", ["ctrl"]));
    session.dispatch(key("b"));
    session.dispatch(key("enter"));
    expect(objectiveMet(session, "L1-O2")).toBe(false);
  });

  it("O2: an interrupted visit does not poison a valid retry", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    // First visit: type but close without clearing.
    session.dispatch(prefix);
    session.dispatch(key("?"));
    session.dispatch(key("/"));
    session.dispatch(key("a"));
    session.dispatch(key("enter"));
    expect(objectiveMet(session, "L1-O2")).toBe(false);
    // Second visit starts clean and completes.
    session.dispatch(prefix);
    session.dispatch(key("?"));
    session.dispatch(key("/"));
    session.dispatch(key("b"));
    session.dispatch(key("u", ["ctrl"]));
    session.dispatch(key("enter"));
    expect(objectiveMet(session, "L1-O2")).toBe(true);
  });

  it("O1: a Shift-only printable character counts as typed input", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    session.dispatch(prefix);
    session.dispatch(key("h"));
    session.dispatch(key("x", ["shift"]));
    expect(objectiveMet(session, "L1-O1")).toBe(true);
  });

  it("O1: a scripted prefix arm followed by player focus and typing does not credit", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    session.dispatch(key("b", ["ctrl"], "script"));
    session.dispatch(key("h"));
    session.dispatch(key("x"));
    expect(objectiveMet(session, "L1-O1")).toBe(false);
  });

  it("O3: a scripted prefix arm followed by a player invalid key does not credit", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    session.dispatch(key("b", ["ctrl"], "script"));
    session.dispatch(key("y"));
    expect(objectiveMet(session, "L1-O3")).toBe(false);
  });

  it("O2: help opened by a scripted prefix arm does not credit a later player filter", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    session.dispatch(key("b", ["ctrl"], "script"));
    session.dispatch(key("?"));
    session.dispatch(key("/"));
    session.dispatch(key("a"));
    session.dispatch(key("u", ["ctrl"]));
    session.dispatch(key("enter"));
    expect(objectiveMet(session, "L1-O2")).toBe(false);
  });

  it("seeds readable canonical L1 documents without credit", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    const snapshot = session.getSnapshot();
    const assignment = snapshot.herdr.workspaces[0]?.tabs[0]?.panes.find(
      (p) => p.app === "assignment",
    );
    const memo = snapshot.herdr.workspaces[0]?.tabs[0]?.panes.find((p) => p.app === "memo");
    expect(assignment?.output.join("\n")).toContain("June Adebayo");
    expect(assignment?.output.join("\n")).toContain("Vendor security incident");
    expect(memo?.output.join("\n")).toContain("Verify origin.");
    expect(memo?.output.join("\n")).toContain("Preserve attribution.");
    expect(memo?.output.join("\n")).toContain("Do not assume independent confirmation.");
    expect(memo?.output.join("\n")).toContain("Protected source: do not burn identity.");
    expect(snapshot.story.events).toEqual([]);
    expect(snapshot.story.flags).toEqual([]);
    expect(snapshot.assessment.objectives.some((o) => o.met)).toBe(false);
  });
});

describe("input policy (cooperative security notice)", () => {
  it("defaults to Standard keyboard-only mode", () => {
    const session = createInvestigationSession();
    expect(session.getSnapshot().inputPolicy).toBe("standard");
  });

  it("Standard mode refuses chrome clicks: no dispatch, no state change, no credit", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    const before = JSON.stringify(session.getSnapshot().herdr);
    expect(session.dispatchChrome({ action: "new-tab" })).toBe(false);
    expect(session.dispatchChrome({ action: "select-tab", tabId: "t99" })).toBe(false);
    expect(session.dispatchChrome({ action: "focus-pane", paneId: "p99" })).toBe(false);
    expect(JSON.stringify(session.getSnapshot().herdr)).toBe(before);
    expect(session.getSnapshot().inputPolicy).toBe("standard");
    expect(session.getSnapshot().objectivesMet).toBe(false);
  });

  it("Accessible mode dispatches chrome as alternative modality without keyboard credit", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    session.setAccessibleMode(true);
    expect(session.getSnapshot().inputPolicy).toBe("accessible");
    expect(session.dispatchChrome({ action: "new-tab" })).toBe(true);
    expect(session.getSnapshot().herdr.overlay).toMatchObject({ kind: "rename", target: "new-tab" });
    expect(session.getSnapshot().objectivesMet).toBe(false);
  });

  it("Accessible mode settles on the story condition alone; mastery stays uncredited", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    session.setAccessibleMode(true);
    session.storyAction("read-memo");
    session.dispatch(prefix);
    session.dispatch(key("h"));
    session.dispatch(key("x"));
    session.storyAction("acknowledge-assignment");
    expect(session.getSnapshot().storyConditionMet).toBe(true);
    expect(session.getSnapshot().objectivesMet).toBe(false);
    expect(session.getSnapshot().phase).toBe("response");
  });

  it("Standard mode still requires both story and skill for the response", () => {
    const session = createInvestigationSession();
    toWorkspace(session);
    session.storyAction("read-memo");
    session.dispatch(prefix);
    session.dispatch(key("h"));
    session.dispatch(key("x"));
    session.storyAction("acknowledge-assignment");
    expect(session.getSnapshot().storyConditionMet).toBe(true);
    expect(session.getSnapshot().phase).toBe("workspace");
  });
});
