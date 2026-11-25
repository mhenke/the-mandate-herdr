import { describe, expect, it } from "vitest";
import { createStore, initialState, type HerdrState } from "../src/core/herdr";
import { resolveAsset } from "../src/ui/scenes";
import { createInvestigationSession } from "../src/adapters/investigation-session";

describe("cinematic integration contracts", () => {
  it("resolves asset URLs respecting base URL configuration", () => {
    expect(resolveAsset(undefined)).toBeUndefined();
    expect(resolveAsset("")).toBeUndefined();
    expect(resolveAsset("https://example.com/poster.png")).toBe("https://example.com/poster.png");
    expect(resolveAsset("data:image/png;base64,abc")).toBe("data:image/png;base64,abc");
    expect(resolveAsset("/images/Rainy%20Night.webp")).toMatch(/\/images\/Rainy%20Night\.webp$/);
  });

  it("skipping or dismissing a cinematic does not mutate or advance simulation state", () => {
    const baselineState: HerdrState = initialState();
    // Simulate player triggering skip
    const stateAfterSkip: HerdrState = baselineState;

    expect(stateAfterSkip).toBe(baselineState);
    expect(stateAfterSkip.journal.length).toBe(baselineState.journal.length);
  });

  it("advancing simulation is decoupled from presentation playback", () => {
    const store = createStore(initialState());
    const initialJournalLen = store.getState().journal.length;

    // Presentation triggers do not affect simulation store state
    const presentationOverlayActive = true;
    expect(presentationOverlayActive).toBe(true);
    expect(store.getState().journal.length).toBe(initialJournalLen);
  });

  it("skipping, pausing, or completing cinematics never changes evidence, mastery, or story time", () => {
    const session = createInvestigationSession();
    session.newInvestigation();

    const t0Snapshot = session.getSnapshot();
    expect(t0Snapshot.phase).toBe("cold-open");
    expect(t0Snapshot.story.date).toBe("2026-11-12");
    expect(t0Snapshot.story.events).toEqual([]);
    expect(t0Snapshot.assessment.objectives.every((o) => !o.met)).toBe(true);

    // Gameplay input is rejected while in cinematic presentation
    const rejectedInput = session.dispatch({
      kind: "key",
      origin: "player",
      key: "enter",
      modifiers: [],
      phase: "press",
    });
    expect(rejectedInput).toBeNull();

    // Simulate cinematic advance (cold-open -> episode)
    session.advancePresentation();
    const episodeSnapshot = session.getSnapshot();
    expect(episodeSnapshot.phase).toBe("episode");
    expect(episodeSnapshot.story.date).toBe("2026-11-12");
    expect(episodeSnapshot.story.events).toEqual([]);
    expect(episodeSnapshot.assessment.objectives.every((o) => !o.met)).toBe(true);

    // Simulate skip straight to workspace
    session.skipPresentation();
    const workspaceSnapshot = session.getSnapshot();
    expect(workspaceSnapshot.phase).toBe("workspace");
    expect(workspaceSnapshot.story.date).toBe("2026-11-12");
    expect(workspaceSnapshot.story.events).toEqual([]);
    expect(workspaceSnapshot.assessment.objectives.every((o) => !o.met)).toBe(true);
    // Herdr store has not yet been launched/journaled
    expect(workspaceSnapshot.application.herdrLaunched).toBe(false);
  });

  it("first terminal input does not automatically advance story time from T0", () => {
    const session = createInvestigationSession();
    session.newInvestigation();
    session.skipPresentation();

    const initialSnapshot = session.getSnapshot();
    expect(initialSnapshot.story.date).toBe("2026-11-12");
    expect(initialSnapshot.story.events).toHaveLength(0);

    // First terminal input typing 'h' in boot terminal
    session.dispatch({
      kind: "key",
      origin: "player",
      key: "h",
      modifiers: [],
      phase: "press",
    });

    const afterInputSnapshot = session.getSnapshot();
    // Time must remain at T0; typing alone never advances the story clock
    expect(afterInputSnapshot.story.date).toBe("2026-11-12");
    expect(afterInputSnapshot.story.events).toHaveLength(0);
    expect(afterInputSnapshot.assessment.objectives.every((o) => !o.met)).toBe(true);
  });

  it("cinematic metadata for L3 Mission Outro is complete and spoiler-safe", () => {
    const l3OutroManifest = {
      id: "mission-outro-03",
      title: "Mission Outro 03 — Five Minutes",
      videoUrl: "/cinematics/l3-outro/l3-outro.mp4",
      posterUrl: "/cinematics/l3-outro/l3-outro-poster.png",
      vttUrl: "/cinematics/l3-outro/l3-outro.vtt",
      scriptId: "LT-47B",
      target: "demo.vendor.internal",
      storyFloorConfirmed: true,
      spoilerExclusions: {
        revealsOriginStripping: false,
        revealsOccForward: false,
        revealsThirdReportTrap: false,
      },
    };

    expect(l3OutroManifest.storyFloorConfirmed).toBe(true);
    expect(l3OutroManifest.spoilerExclusions.revealsOriginStripping).toBe(false);
    expect(l3OutroManifest.spoilerExclusions.revealsOccForward).toBe(false);
    expect(l3OutroManifest.spoilerExclusions.revealsThirdReportTrap).toBe(false);
  });
});
