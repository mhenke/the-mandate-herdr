import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  collectPanes,
  findInDirection,
  paneCount,
  paneIds,
  paneNode,
  removePane,
  splitRect,
  validSplitRatio,
  type NavDirection,
  type Rect,
  type SplitDirection,
  type SplitNode,
} from "../src/core/herdr/layout";

const arbitraryDirection: fc.Arbitrary<SplitDirection> = fc.constantFrom("horizontal", "vertical");
const arbitraryNavDirection: fc.Arbitrary<NavDirection> = fc.constantFrom(
  "left",
  "right",
  "up",
  "down",
);

const arbitraryRect: fc.Arbitrary<Rect> = fc.record({
  x: fc.integer({ min: 0, max: 200 }),
  y: fc.integer({ min: 0, max: 200 }),
  width: fc.integer({ min: 10, max: 240 }),
  height: fc.integer({ min: 10, max: 80 }),
});

// Generator for binary SplitNode trees
function arbitrarySplitNode(depth = 0): fc.Arbitrary<SplitNode> {
  if (depth >= 3) {
    return fc.integer({ min: 1, max: 9999 }).map((n) => paneNode(`pane-${n}`));
  }
  return fc.oneof(
    fc.integer({ min: 1, max: 9999 }).map((n) => paneNode(`pane-${n}`)),
    fc
      .record({
        direction: arbitraryDirection,
        ratio: fc.double({ min: 0.1, max: 0.9, noNaN: true }),
        first: arbitrarySplitNode(depth + 1),
        second: arbitrarySplitNode(depth + 1),
      })
      .map(({ direction, ratio, first, second }) => ({
        kind: "split" as const,
        direction,
        ratio,
        first,
        second,
      })),
  );
}

// Helper to check if two rectangles overlap in interior area
function rectsOverlap(r1: Rect, r2: Rect): boolean {
  return (
    r1.x < r2.x + r2.width &&
    r1.x + r1.width > r2.x &&
    r1.y < r2.y + r2.height &&
    r1.y + r1.height > r2.y
  );
}

describe("layout geometry property tests", () => {
  it("property: validSplitRatio is always bounded between 0.1 and 0.9", () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.float(), fc.constant(NaN), fc.constant(Infinity), fc.constant(-Infinity)),
        (r) => {
          const clamped = validSplitRatio(r);
          expect(clamped).toBeGreaterThanOrEqual(0.1);
          expect(clamped).toBeLessThanOrEqual(0.9);
          expect(Number.isFinite(clamped)).toBe(true);
        },
      ),
    );
  });

  it("property: splitRect strictly conserves width and height partitions", () => {
    fc.assert(
      fc.property(
        arbitraryRect,
        arbitraryDirection,
        fc.double({ min: 0.1, max: 0.9, noNaN: true }),
        (area, dir, ratio) => {
          const [a, b] = splitRect(area, dir, ratio);

          if (dir === "horizontal") {
            expect(a.width + b.width).toBe(area.width);
            expect(a.height).toBe(area.height);
            expect(b.height).toBe(area.height);
            expect(a.x).toBe(area.x);
            expect(b.x).toBe(area.x + a.width);
            expect(a.y).toBe(area.y);
            expect(b.y).toBe(area.y);
          } else {
            expect(a.height + b.height).toBe(area.height);
            expect(a.width).toBe(area.width);
            expect(b.width).toBe(area.width);
            expect(a.y).toBe(area.y);
            expect(b.y).toBe(area.y + a.height);
            expect(a.x).toBe(area.x);
            expect(b.x).toBe(area.x);
          }
        },
      ),
    );
  });

  it("property: collectPanes strictly conserves total area across arbitrary split trees", () => {
    fc.assert(
      fc.property(arbitrarySplitNode(), arbitraryRect, (tree, rootArea) => {
        const panes = collectPanes(tree, rootArea);
        expect(panes.length).toBe(paneCount(tree));

        // Area conservation: sum of leaf areas must equal root rectangle area
        const totalLeafArea = panes.reduce((sum, p) => sum + p.rect.width * p.rect.height, 0);
        const rootTotalArea = rootArea.width * rootArea.height;
        expect(totalLeafArea).toBe(rootTotalArea);
      }),
    );
  });

  it("property: no two leaf panes have overlapping interiors", () => {
    fc.assert(
      fc.property(arbitrarySplitNode(), arbitraryRect, (tree, rootArea) => {
        const panes = collectPanes(tree, rootArea);

        for (let i = 0; i < panes.length; i++) {
          for (let j = i + 1; j < panes.length; j++) {
            const r1 = panes[i]!.rect;
            const r2 = panes[j]!.rect;
            expect(rectsOverlap(r1, r2)).toBe(false);
          }
        }
      }),
    );
  });

  it("property: all leaf panes are completely contained within the root bounds", () => {
    fc.assert(
      fc.property(arbitrarySplitNode(), arbitraryRect, (tree, rootArea) => {
        const panes = collectPanes(tree, rootArea);

        for (const pane of panes) {
          expect(pane.rect.x).toBeGreaterThanOrEqual(rootArea.x);
          expect(pane.rect.y).toBeGreaterThanOrEqual(rootArea.y);
          expect(pane.rect.x + pane.rect.width).toBeLessThanOrEqual(rootArea.x + rootArea.width);
          expect(pane.rect.y + pane.rect.height).toBeLessThanOrEqual(rootArea.y + rootArea.height);
        }
      }),
    );
  });

  it("property: removePane strictly decrements count and preserves all other pane IDs", () => {
    fc.assert(
      fc.property(arbitrarySplitNode(), (tree) => {
        const ids = paneIds(tree);
        // Deduplicate IDs
        const uniqueIds = Array.from(new Set(ids));
        if (uniqueIds.length === 0) return;

        const targetId = uniqueIds[0]!;
        const remainingTree = removePane(tree, targetId);

        if (uniqueIds.length <= 1) {
          expect(remainingTree).toBeNull();
        } else {
          expect(remainingTree).not.toBeNull();
          const newIds = paneIds(remainingTree!);
          expect(newIds).not.toContain(targetId);
          for (const otherId of uniqueIds.slice(1)) {
            // Other unique IDs must still exist in the tree
            if (ids.filter((id) => id === otherId).length > 0) {
              expect(newIds).toContain(otherId);
            }
          }
        }
      }),
    );
  });

  it("property: findInDirection returns null or an existing neighbor pane ID", () => {
    fc.assert(
      fc.property(
        arbitrarySplitNode(),
        arbitraryRect,
        arbitraryNavDirection,
        (tree, rootArea, navDir) => {
          const ids = paneIds(tree);
          if (ids.length === 0) return;
          const focused = ids[0]!;

          const panes = collectPanes(tree, rootArea);
          const source = panes.find((p) => p.id === focused);
          if (!source) return;
          const result = findInDirection(source, navDir, panes);
          if (result !== null) {
            expect(ids).toContain(result);
            expect(result).not.toBe(focused);
          }
        },
      ),
    );
  });
});
