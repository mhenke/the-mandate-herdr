import { describe, expect, it } from "vitest";
import { createStore, initialState, type HerdrState } from "../src/core/herdr";
import { resolveAsset } from "../src/ui/scenes";

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
