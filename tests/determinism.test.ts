import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { createScenario, createStore, replay, type InputEvent } from "../src/core/herdr";

const key = (
  k: string,
  modifiers: readonly ("ctrl" | "alt" | "shift" | "meta")[] = [],
): InputEvent => ({
  kind: "key",
  origin: "player",
  key: k,
  modifiers,
  phase: "press",
});

describe("herdr determinism", () => {
  it("replaying the same events twice yields the same state", () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom("b", "h", "l", "c", "n", "p", "escape", "x", "v")),
        (keys) => {
          const events = keys.map((k) => key(k));
          const initial = createScenario(1);
          expect(replay(initial, events)).toEqual(replay(initial, events));
        },
      ),
    );
  });

  it("replay equals incremental dispatch for arbitrary sequences", () => {
    // Cross-check: the pure replay path and the store's incremental path must
    // agree, including the journal and the composed-surface acknowledgments.
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(
            fc.constantFrom(
              "b",
              "h",
              "j",
              "k",
              "l",
              "c",
              "n",
              "p",
              "v",
              "-",
              "x",
              "z",
              "q",
              "w",
              "[",
              "escape",
              "enter",
              "up",
              "down",
              "/",
              "?",
              "a",
            ),
            fc.constant("blur"),
          ),
          { maxLength: 30 },
        ),
        (steps) => {
          const events: InputEvent[] = steps.map((step) =>
            step === "blur" ? { kind: "host", origin: "host", host: "blur" } : key(step),
          );
          const store = createStore(createScenario(1));
          for (const event of events) store.dispatch(event);
          expect(replay(createScenario(1), events)).toEqual(store.getState());
        },
      ),
    );
  });
});
