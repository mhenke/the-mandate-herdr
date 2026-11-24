import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  PREFIX,
  PREFIX_BINDINGS,
  bindingLabel,
  isPrefixKey,
  normalizeDomKey,
  resolvePrefixBinding,
  sameCombo,
  type KeyCombo,
} from "../src/core/herdr/keymap";
import type { Modifier } from "../src/core/herdr/types";

const ALL_MODIFIERS: Modifier[] = ["ctrl", "alt", "shift", "meta"];

const arbitraryModifierSubarray: fc.Arbitrary<Modifier[]> = fc.subarray(ALL_MODIFIERS);

const arbitraryAsciiLetter: fc.Arbitrary<string> = fc.constantFrom(
  ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
);

const arbitraryNamedKey: fc.Arbitrary<string> = fc.constantFrom(
  "Escape",
  "Enter",
  "Tab",
  "Backspace",
  "Delete",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "PageUp",
  "PageDown",
  " ",
);

const arbitraryShiftedPunctuation: fc.Arbitrary<string> = fc.constantFrom(
  ...'!@#$%^&*()_+{}|:"<>?~'.split(""),
);

describe("keymap property tests", () => {
  it("property: normalizeDomKey reaches normal form idempotence in one step", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          arbitraryAsciiLetter,
          arbitraryNamedKey,
          arbitraryShiftedPunctuation,
          fc.string({ maxLength: 5 }),
        ),
        fc.string({ maxLength: 10 }),
        arbitraryModifierSubarray,
        (key, code, modifiers) => {
          const first = normalizeDomKey(key, code, modifiers);
          // Normalizing the result again with empty code must be identical
          const second = normalizeDomKey(first.key, "", first.modifiers);
          expect(second.key).toBe(first.key);
          expect(new Set(second.modifiers)).toEqual(new Set(first.modifiers));
        },
      ),
    );
  });

  it("property: Tab with Shift always normalizes to backtab without Shift modifier", () => {
    fc.assert(
      fc.property(arbitraryModifierSubarray, (mods) => {
        const withShift: Modifier[] = Array.from(new Set([...mods, "shift" as Modifier]));
        const result = normalizeDomKey("Tab", "Tab", withShift);
        expect(result.key).toBe("backtab");
        expect(result.modifiers).not.toContain("shift");
        // Other modifiers (like ctrl or alt) are preserved
        for (const m of withShift) {
          if (m !== "shift") {
            expect(result.modifiers).toContain(m);
          }
        }
      }),
    );
  });

  it("property: Shifted punctuation characters absorb the Shift modifier", () => {
    fc.assert(
      fc.property(arbitraryShiftedPunctuation, arbitraryModifierSubarray, (ch, mods) => {
        const withShift: Modifier[] = Array.from(new Set([...mods, "shift" as Modifier]));
        const result = normalizeDomKey(ch, "", withShift);
        expect(result.key).toBe(ch);
        expect(result.modifiers).not.toContain("shift");
      }),
    );
  });

  it("property: uppercase ASCII letters without Shift get normalized to lowercase + Shift", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")),
        arbitraryModifierSubarray,
        (upperChar, mods) => {
          const withoutShift = mods.filter((m) => m !== "shift");
          const result = normalizeDomKey(upperChar, "", withoutShift);
          expect(result.key).toBe(upperChar.toLowerCase());
          expect(result.modifiers).toContain("shift");
        },
      ),
    );
  });

  it("property: sameCombo is reflexive and modifier-order invariant", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 8 }),
        arbitraryModifierSubarray,
        (key, modifiers) => {
          const combo: KeyCombo = { key, modifiers };
          // Reflexive
          expect(sameCombo(combo, key, modifiers)).toBe(true);

          // Permutation of modifiers
          const reversedMods = [...modifiers].reverse();
          expect(sameCombo(combo, key, reversedMods)).toBe(true);
        },
      ),
    );
  });

  it("property: all configured prefix bindings resolve bijectively", () => {
    for (const binding of PREFIX_BINDINGS) {
      const resolved = resolvePrefixBinding(binding.combo.key, binding.combo.modifiers);
      expect(resolved).not.toBeNull();
      expect(resolved?.action).toBe(binding.action);

      // Label exists and is non-empty
      const label = bindingLabel(binding);
      expect(label.length).toBeGreaterThan(0);
      expect(label.startsWith("prefix+")).toBe(true);
    }
  });

  it("property: isPrefixKey is strictly true only for PREFIX combo", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 5 }), arbitraryModifierSubarray, (key, modifiers) => {
        const isPref = isPrefixKey(key, modifiers);
        const isExpected =
          key === PREFIX.key &&
          modifiers.length === PREFIX.modifiers.length &&
          modifiers.every((m) => PREFIX.modifiers.includes(m));
        expect(isPref).toBe(isExpected);
      }),
    );
  });
});
