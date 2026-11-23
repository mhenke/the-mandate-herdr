import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { advanceHerdr } from "../src/core/herdr";

describe("herdr determinism", () => {
  it("advancing the same state twice yields the same output", () => {
    fc.assert(
      fc.property(fc.nat(), (tick) => {
        const state = { tick };
        expect(advanceHerdr(state)).toEqual(advanceHerdr(state));
        expect(advanceHerdr(state).tick).toBe(tick + 1);
      }),
    );
  });
});
