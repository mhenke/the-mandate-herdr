import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  createAssessment,
  declareDestination,
  objectivesMet,
  observe,
  requestHint,
  requiredObjectives,
} from "../src/core/assessment";
import { createScenario, createStore, type HerdrState, type InputEvent } from "../src/core/herdr";
import type { Level } from "../src/core/narrative";

const LEVELS: Level[] = [1, 2, 3];
const arbitraryLevel: fc.Arbitrary<Level> = fc.constantFrom(...LEVELS);

const arbitraryNonPlayerEvent: fc.Arbitrary<InputEvent> = fc.oneof(
  fc
    .record({
      line: fc.string({ maxLength: 50 }),
      paneId: fc.constantFrom("pane-1", "pane-2", "pane-3", "assignment", "memo"),
    })
    .map(({ line, paneId }): InputEvent => ({
      kind: "process",
      origin: "process",
      process: { kind: "output", paneId, line },
    })),
  fc.constant<InputEvent>({ kind: "host", origin: "host", host: "blur" }),
  fc.constant<InputEvent>({ kind: "host", origin: "host", host: "focus" }),
  fc.constant<InputEvent>({ kind: "host", origin: "host", host: "reattach" }),
);

const arbitraryPlayerKeyEvent: fc.Arbitrary<InputEvent> = fc
  .record({
    key: fc.constantFrom(
      "b",
      "h",
      "j",
      "k",
      "l",
      "c",
      "v",
      "-",
      "x",
      "z",
      "escape",
      "enter",
      "1",
      "2",
    ),
    modifiers: fc.subarray(["ctrl", "alt", "shift"] as const),
  })
  .map(({ key, modifiers }): InputEvent => ({
    kind: "key",
    origin: "player",
    key,
    modifiers: [...modifiers],
    phase: "press",
  }));

describe("assessment property tests", () => {
  it("property: non-player events (process/host) never satisfy any player objective", () => {
    fc.assert(
      fc.property(
        arbitraryLevel,
        fc.array(arbitraryNonPlayerEvent, { maxLength: 25 }),
        (level, events) => {
          const store = createStore(createScenario(level));
          let assessment = createAssessment(level);

          for (const event of events) {
            const before: HerdrState = store.getState();
            const entry = store.dispatch(event);
            const after: HerdrState = store.getState();
            assessment = observe(assessment, before, after, entry);
          }

          // Provenance integrity: No player objectives may ever be credited
          expect(objectivesMet(assessment)).toBe(false);
          for (const obj of assessment.objectives) {
            expect(obj.met).toBe(false);
            expect(obj.evidence.length).toBe(0);
          }
        },
      ),
    );
  });

  it("property: objectives are strictly monotonic (once met, never revoked)", () => {
    fc.assert(
      fc.property(
        arbitraryLevel,
        fc.array(fc.oneof(arbitraryPlayerKeyEvent, arbitraryNonPlayerEvent), { maxLength: 25 }),
        (level, events) => {
          const store = createStore(createScenario(level));
          let assessment = createAssessment(level);
          const metObjectivesHistory = new Set<string>();

          for (const event of events) {
            const before: HerdrState = store.getState();
            const entry = store.dispatch(event);
            const after: HerdrState = store.getState();
            assessment = observe(assessment, before, after, entry);

            // Verify monotonicity
            for (const obj of assessment.objectives) {
              if (obj.met) {
                metObjectivesHistory.add(obj.id);
              } else {
                // If it was met previously, it must NOT regress to false
                expect(metObjectivesHistory.has(obj.id)).toBe(false);
              }
            }
          }
        },
      ),
    );
  });

  it("property: requestHint monotonically increments hintsUsed by exactly 1", () => {
    fc.assert(
      fc.property(arbitraryLevel, fc.integer({ min: 1, max: 10 }), (level, count) => {
        let assessment = createAssessment(level);
        let lastHints = assessment.hintsUsed;

        for (let i = 0; i < count; i++) {
          assessment = requestHint(assessment);
          expect(assessment.hintsUsed).toBe(lastHints + 1);
          lastHints = assessment.hintsUsed;
        }
      }),
    );
  });

  it("property: declareDestination updates destination without affecting objectives", () => {
    fc.assert(
      fc.property(
        arbitraryLevel,
        fc.string({ minLength: 1, maxLength: 20 }),
        (level, destPaneId) => {
          const initial = createAssessment(level);
          const updated = declareDestination(initial, destPaneId);

          expect(updated.declaredDestination).toBe(destPaneId);
          expect(updated.objectives).toEqual(initial.objectives);
          expect(updated.hintsUsed).toBe(initial.hintsUsed);
          expect(updated.helpConsulted).toBe(initial.helpConsulted);
        },
      ),
    );
  });

  it("property: requiredObjectives strictly matches the objectives of the initial state", () => {
    fc.assert(
      fc.property(arbitraryLevel, (level) => {
        const required = requiredObjectives(level);
        const assessment = createAssessment(level);
        const actualIds = assessment.objectives.map((o) => o.id);

        expect([...required]).toEqual(actualIds);
      }),
    );
  });
});
