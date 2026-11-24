import { describe, expect, it } from "vitest";
import { pathToPhase, phaseToPath, PHASE_PATHS, PHASE_TITLES } from "../src/adapters/navigation";
import { createInvestigationSession } from "../src/adapters/investigation-session";

describe("navigation adapter", () => {
  it("maps every phase to its corresponding path and document title", () => {
    expect(phaseToPath("title")).toBe("/");
    expect(phaseToPath("cold-open")).toBe("/cold-open");
    expect(phaseToPath("episode")).toBe("/episode");
    expect(phaseToPath("briefing")).toBe("/briefing");
    expect(phaseToPath("workspace")).toBe("/workspace");
    expect(phaseToPath("response")).toBe("/response");
    expect(phaseToPath("complete")).toBe("/complete");
    expect(Object.keys(PHASE_PATHS).length).toBe(7);

    expect(PHASE_TITLES.title).toBe("The Mandate: Herdr");
    expect(PHASE_TITLES["cold-open"]).toBe("Cold Open — The Mandate: Herdr");
    expect(PHASE_TITLES.workspace).toBe("Workspace — The Mandate: Herdr");
  });

  it("handles base URLs correctly when generating paths", () => {
    expect(phaseToPath("title", "/the-mandate/")).toBe("/the-mandate/");
    expect(phaseToPath("cold-open", "/the-mandate/")).toBe("/the-mandate/cold-open");
    expect(phaseToPath("workspace", "/the-mandate")).toBe("/the-mandate/workspace");
  });

  it("parses pathnames to phases accurately", () => {
    expect(pathToPhase("/")).toBe("title");
    expect(pathToPhase("")).toBe("title");
    expect(pathToPhase("/title")).toBe("title");
    expect(pathToPhase("/cold-open")).toBe("cold-open");
    expect(pathToPhase("/episode")).toBe("episode");
    expect(pathToPhase("/briefing")).toBe("briefing");
    expect(pathToPhase("/workspace")).toBe("workspace");
    expect(pathToPhase("/response")).toBe("response");
    expect(pathToPhase("/complete")).toBe("complete");
    expect(pathToPhase("/unknown-route")).toBe(null);
  });

  it("parses hash URLs with fallback support", () => {
    expect(pathToPhase("/", "#/cold-open")).toBe("cold-open");
    expect(pathToPhase("/", "#cold-open")).toBe("cold-open");
    expect(pathToPhase("/", "#/workspace")).toBe("workspace");
    expect(pathToPhase("/", "#/")).toBe("title");
    expect(pathToPhase("/", "#title")).toBe("title");
  });

  it("parses relative paths under custom base URLs", () => {
    expect(pathToPhase("/the-mandate/cold-open", "", "/the-mandate/")).toBe("cold-open");
    expect(pathToPhase("/the-mandate/workspace", "", "/the-mandate")).toBe("workspace");
    expect(pathToPhase("/the-mandate/", "", "/the-mandate/")).toBe("title");
  });

  it("InvestigationSession.goToPhase transitions between valid phases and maintains state", () => {
    const session = createInvestigationSession();
    expect(session.getSnapshot().phase).toBe("title");

    // Navigate to cold-open
    expect(session.goToPhase("cold-open")).toBe(true);
    expect(session.getSnapshot().phase).toBe("cold-open");

    // Navigate to briefing
    expect(session.goToPhase("briefing")).toBe(true);
    expect(session.getSnapshot().phase).toBe("briefing");

    // Navigate to workspace
    expect(session.goToPhase("workspace")).toBe(true);
    expect(session.getSnapshot().phase).toBe("workspace");

    // Going back to title preserves attempt and saves suspended phase
    expect(session.goToPhase("title")).toBe(true);
    expect(session.getSnapshot().phase).toBe("title");
    expect(session.getSnapshot().canContinue).toBe(true);

    // Returning to workspace preserves session
    expect(session.goToPhase("workspace")).toBe(true);
    expect(session.getSnapshot().phase).toBe("workspace");
  });
});
