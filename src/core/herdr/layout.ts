// BSP tiling layout, ported from the pinned upstream (src/layout.rs).
// Geometry: split_rect (:700-720), collect_panes (:502-526), directional
// focus (:369-424), remove_pane (:650-670), split_node (:619-627).

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export type SplitDirection = "horizontal" | "vertical";
export type NavDirection = "left" | "right" | "up" | "down";

export type SplitNode =
  | { readonly kind: "pane"; readonly id: string }
  | {
      readonly kind: "split";
      readonly direction: SplitDirection;
      readonly ratio: number;
      readonly first: SplitNode;
      readonly second: SplitNode;
    };

export interface PaneInfo {
  readonly id: string;
  readonly rect: Rect;
}

export function paneNode(id: string): SplitNode {
  return { kind: "pane", id };
}

/** src/layout.rs:619-627 */
export function splitNode(
  target: string,
  direction: SplitDirection,
  newId: string,
  ratio: number,
): SplitNode {
  return {
    kind: "split",
    direction,
    ratio: validSplitRatio(ratio),
    first: paneNode(target),
    second: paneNode(newId),
  };
}

/** src/layout.rs:629-635 */
export function validSplitRatio(ratio: number): number {
  if (Number.isFinite(ratio)) return Math.min(0.9, Math.max(0.1, ratio));
  return 0.5;
}

/** src/layout.rs:700-720 */
export function splitRect(area: Rect, direction: SplitDirection, ratio: number): [Rect, Rect] {
  if (direction === "horizontal") {
    const firstW = Math.round(area.width * ratio);
    const secondW = Math.max(0, area.width - firstW);
    return [
      { x: area.x, y: area.y, width: firstW, height: area.height },
      { x: area.x + firstW, y: area.y, width: secondW, height: area.height },
    ];
  }
  const firstH = Math.round(area.height * ratio);
  const secondH = Math.max(0, area.height - firstH);
  return [
    { x: area.x, y: area.y, width: area.width, height: firstH },
    { x: area.x, y: area.y + firstH, width: area.width, height: secondH },
  ];
}

/** src/layout.rs:502-526 — preorder collection. */
export function collectPanes(node: SplitNode, area: Rect, out: PaneInfo[] = []): PaneInfo[] {
  if (node.kind === "pane") {
    out.push({ id: node.id, rect: area });
    return out;
  }
  const [a, b] = splitRect(area, node.direction, node.ratio);
  collectPanes(node.first, a, out);
  collectPanes(node.second, b, out);
  return out;
}

export function paneIds(node: SplitNode, out: string[] = []): string[] {
  if (node.kind === "pane") {
    out.push(node.id);
    return out;
  }
  paneIds(node.first, out);
  paneIds(node.second, out);
  return out;
}

export function paneCount(node: SplitNode): number {
  return node.kind === "pane" ? 1 : paneCount(node.first) + paneCount(node.second);
}

/** src/layout.rs:650-670 — collapse the parent split when a child disappears. */
export function removePane(node: SplitNode, target: string): SplitNode | null {
  if (node.kind === "pane") return node.id === target ? null : node;
  const first = removePane(node.first, target);
  const second = removePane(node.second, target);
  if (first === null && second === null) return null;
  if (first === null) return second;
  if (second === null) return first;
  return { ...node, first, second };
}

/** src/layout.rs:619-627 replacement in place. */
export function replacePaneNode(
  node: SplitNode,
  target: string,
  replacement: SplitNode,
): SplitNode {
  if (node.kind === "pane") return node.id === target ? replacement : node;
  return {
    ...node,
    first: replacePaneNode(node.first, target, replacement),
    second: replacePaneNode(node.second, target, replacement),
  };
}

/** src/layout.rs:369-424 — directional overlap, then edge distance, overlap, center, index. */
export function findInDirection(
  focused: PaneInfo,
  direction: NavDirection,
  panes: readonly PaneInfo[],
): string | null {
  const fr = focused.rect;
  const candidates: { index: number; info: PaneInfo }[] = [];
  panes.forEach((p, index) => {
    if (p.id === focused.id) return;
    const r = p.rect;
    const ok =
      direction === "left"
        ? r.x + r.width <= fr.x && rangesOverlap(r.y, r.height, fr.y, fr.height)
        : direction === "right"
          ? r.x >= fr.x + fr.width && rangesOverlap(r.y, r.height, fr.y, fr.height)
          : direction === "up"
            ? r.y + r.height <= fr.y && rangesOverlap(r.x, r.width, fr.x, fr.width)
            : r.y >= fr.y + fr.height && rangesOverlap(r.x, r.width, fr.x, fr.width);
    if (ok) candidates.push({ index, info: p });
  });
  if (candidates.length === 0) return null;
  const keyed = candidates.map(({ index, info }) => {
    const r = info.rect;
    const edgeDistance =
      direction === "left"
        ? Math.max(0, fr.x - (r.x + r.width))
        : direction === "right"
          ? Math.max(0, r.x - (fr.x + fr.width))
          : direction === "up"
            ? Math.max(0, fr.y - (r.y + r.height))
            : Math.max(0, r.y - (fr.y + fr.height));
    const overlap =
      direction === "left" || direction === "right"
        ? rangeOverlapAmount(r.y, r.height, fr.y, fr.height)
        : rangeOverlapAmount(r.x, r.width, fr.x, fr.width);
    const centerDistance =
      direction === "left" || direction === "right"
        ? rangeCenterDistance(r.y, r.height, fr.y, fr.height)
        : rangeCenterDistance(r.x, r.width, fr.x, fr.width);
    return { index, info, edgeDistance, overlap, centerDistance };
  });
  keyed.sort(
    (a, b) =>
      a.edgeDistance - b.edgeDistance ||
      b.overlap - a.overlap ||
      a.centerDistance - b.centerDistance ||
      a.index - b.index,
  );
  return keyed[0]?.info.id ?? null;
}

function rangesOverlap(aStart: number, aLen: number, bStart: number, bLen: number): boolean {
  return aStart < bStart + bLen && aStart + aLen > bStart;
}

function rangeOverlapAmount(aStart: number, aLen: number, bStart: number, bLen: number): number {
  return Math.max(0, Math.min(aStart + aLen, bStart + bLen) - Math.max(aStart, bStart));
}

function rangeCenterDistance(aStart: number, aLen: number, bStart: number, bLen: number): number {
  return Math.abs(aStart * 2 + aLen - (bStart * 2 + bLen));
}
