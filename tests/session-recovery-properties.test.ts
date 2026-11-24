import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { createInvestigationSession, type Phase } from "../src/adapters/investigation-session";
import type { InputEvent } from "../src/core/herdr";

const ALL_PHASES: Phase[] = [
  "title",
  "cold-open",
  "episode",
  "briefing",
  "workspace",
  "response",
  "complete",
  "not-found",
];

const arbitraryPhase: fc.Arbitrary<Phase> = fc.constantFrom(...ALL_PHASES);

const arbitraryKey: fc.Arbitrary<InputEvent> = fc
  .record({
    key: fc.constantFrom("b", "h", "j", "k", "l", "c", "x", "escape", "enter", "1", "2"),
    modifiers: fc.subarray(["ctrl", "alt", "shift"] as const),
  })
  .map(({ key, modifiers }) => ({
    kind: "key" as const,
    origin: "player" as const,
    key,
    modifiers: [...modifiers],
    phase: "press" as const,
  }));

describe("session recovery property tests", () => {
  it("property: serializeRecovery -> restoreRecovery perfectly restores phase, level, and policy", () => {
    fc.assert(
      fc.property(
        arbitraryPhase,
        fc.boolean(),
        fc.array(arbitraryKey, { maxLength: 8 }),
        (targetPhase, accessibleMode, keyEvents) => {
          const session = createInvestigationSession();
          session.setAccessibleMode(accessibleMode);

          // Transition to target phase
          session.goToPhase(targetPhase);

          // If in workspace, dispatch some events
          if (targetPhase === "workspace") {
            for (const event of keyEvents) {
              session.dispatch(event);
            }
          }

          const beforeSnapshot = session.getSnapshot();
          const serialized = session.serializeRecovery();

          // Title screen without attempt yields null by contract
          if (serialized === null) {
            expect(beforeSnapshot.phase).toBe("title");
            expect(beforeSnapshot.canContinue).toBe(false);
            return;
          }

          // Restore onto a fresh session
          const restoredSession = createInvestigationSession();
          const restoreSuccess = restoredSession.restoreRecovery(serialized);
          expect(restoreSuccess).toBe(true);

          const afterSnapshot = restoredSession.getSnapshot();
          expect(afterSnapshot.phase).toBe(beforeSnapshot.phase);
          expect(afterSnapshot.level).toBe(beforeSnapshot.level);
          expect(afterSnapshot.inputPolicy).toBe(beforeSnapshot.inputPolicy);
          expect(afterSnapshot.declaredDestination).toBe(beforeSnapshot.declaredDestination);
          expect(afterSnapshot.assessment.hintsUsed).toBe(beforeSnapshot.assessment.hintsUsed);
          expect(afterSnapshot.canContinue).toBe(beforeSnapshot.canContinue);
        },
      ),
    );
  });

  it("property: restoreRecovery safely rejects arbitrary corrupt JSON strings without throwing", () => {
    fc.assert(
      fc.property(fc.string(), (corruptString) => {
        const session = createInvestigationSession();
        const before = session.getSnapshot();
        const result = session.restoreRecovery(corruptString);
        expect(result).toBe(false);
        // Session state must remain untouched
        const after = session.getSnapshot();
        expect(after.phase).toBe(before.phase);
        expect(after.level).toBe(before.level);
      }),
    );
  });

  it("property: restoreRecovery safely rejects mutated JSON payloads with invalid schemas", () => {
    fc.assert(
      fc.property(
        fc.record({
          version: fc.integer(),
          phase: fc.string(),
          suspendedPhase: fc.string(),
          policy: fc.string(),
          attempt: fc.oneof(fc.constant(null), fc.record({ randomKey: fc.string() })),
        }),
        (mutatedPayload) => {
          const session = createInvestigationSession();
          const json = JSON.stringify(mutatedPayload);
          const result = session.restoreRecovery(json);
          // If version, phase, or policy are not valid, it must return false
          const isValidVersion = mutatedPayload.version === 2;
          const isValidPhase = ALL_PHASES.includes(mutatedPayload.phase as Phase);
          const isValidSuspended = ALL_PHASES.includes(mutatedPayload.suspendedPhase as Phase);
          const isValidPolicy = ["standard", "accessible"].includes(mutatedPayload.policy);
          const isValidAttempt = mutatedPayload.attempt === null;

          if (!(
            isValidVersion &&
            isValidPhase &&
            isValidSuspended &&
            isValidPolicy &&
            isValidAttempt
          )) {
            expect(result).toBe(false);
          }
        },
      ),
    );
  });

  it("property: suspended phase and continueability survive serialization roundtrip", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("cold-open", "episode", "briefing", "workspace") as fc.Arbitrary<Phase>,
        (activePhase) => {
          const session = createInvestigationSession();
          session.goToPhase(activePhase);
          session.returnToTitle();

          const snapshotBefore = session.getSnapshot();
          expect(snapshotBefore.phase).toBe("title");
          expect(snapshotBefore.canContinue).toBe(true);

          const serialized = session.serializeRecovery();
          expect(serialized).not.toBeNull();

          const fresh = createInvestigationSession();
          expect(fresh.restoreRecovery(serialized!)).toBe(true);
          const snapshotAfter = fresh.getSnapshot();
          expect(snapshotAfter.phase).toBe("title");
          expect(snapshotAfter.canContinue).toBe(true);

          // Continuing returns to the suspended phase
          expect(fresh.continueInvestigation()).toBe(true);
          expect(fresh.getSnapshot().phase).toBe(activePhase);
        },
      ),
    );
  });

  it("property: recovery never manufactures unearned objective credit", () => {
    fc.assert(
      fc.property(fc.array(arbitraryKey, { maxLength: 10 }), (events) => {
        const session = createInvestigationSession();
        session.goToPhase("workspace");
        for (const e of events) session.dispatch(e);

        const beforeObjectives = session.getSnapshot().assessment.objectives;
        const serialized = session.serializeRecovery();
        expect(serialized).not.toBeNull();

        const fresh = createInvestigationSession();
        fresh.restoreRecovery(serialized!);
        const afterObjectives = fresh.getSnapshot().assessment.objectives;

        for (const obj of afterObjectives) {
          const prior = beforeObjectives.find((o) => o.id === obj.id);
          expect(obj.met).toBe(prior?.met ?? false);
        }
      }),
    );
  });
});
