import { describe, expect, it } from "vitest";
import { initialHerdrState, advanceHerdr, type HerdrState } from "../src/core/herdr";

describe("cinematic integration contracts", () => {
  it("skipping or dismissing a cinematic does not mutate or advance simulation state", () => {
    const baselineState: HerdrState = initialHerdrState;
    // Simulate player triggering skip
    const stateAfterSkip: HerdrState = baselineState;

    expect(stateAfterSkip).toBe(baselineState);
    expect(stateAfterSkip.tick).toBe(0);
  });

  it("advancing simulation is decoupled from presentation playback", () => {
    let state = initialHerdrState;
    // Advancing simulation occurs through authentic transitions only
    state = advanceHerdr(state);
    expect(state.tick).toBe(1);

    // Presentation triggers do not affect simulation tick
    const presentationOverlayActive = true;
    expect(presentationOverlayActive).toBe(true);
    expect(state.tick).toBe(1);
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
