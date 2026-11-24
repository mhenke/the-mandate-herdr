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

function isCandidateInDirection(focused: Rect, candidate: Rect, direction: NavDirection): boolean {
  switch (direction) {
    case "left":
      return (
        candidate.x + candidate.width <= focused.x &&
        rangesOverlap(candidate.y, candidate.height, focused.y, focused.height)
      );
    case "right":
      return (
        candidate.x >= focused.x + focused.width &&
        rangesOverlap(candidate.y, candidate.height, focused.y, focused.height)
      );
    case "up":
      return (
        candidate.y + candidate.height <= focused.y &&
        rangesOverlap(candidate.x, candidate.width, focused.x, focused.width)
      );
    case "down":
      return (
        candidate.y >= focused.y + focused.height &&
        rangesOverlap(candidate.x, candidate.width, focused.x, focused.width)
      );
  }
}

interface ScoredCandidate {
  readonly index: number;
  readonly info: PaneInfo;
  readonly edgeDistance: number;
  readonly overlap: number;
  readonly centerDistance: number;
}

function scoreCandidate(
  fr: Rect,
  candidate: PaneInfo,
  index: number,
  direction: NavDirection,
): ScoredCandidate {
  const r = candidate.rect;
  let edgeDistance: number;
  let overlap: number;
  let centerDistance: number;

  if (direction === "left") {
    edgeDistance = Math.max(0, fr.x - (r.x + r.width));
    overlap = rangeOverlapAmount(r.y, r.height, fr.y, fr.height);
    centerDistance = rangeCenterDistance(r.y, r.height, fr.y, fr.height);
  } else if (direction === "right") {
    edgeDistance = Math.max(0, r.x - (fr.x + fr.width));
    overlap = rangeOverlapAmount(r.y, r.height, fr.y, fr.height);
    centerDistance = rangeCenterDistance(r.y, r.height, fr.y, fr.height);
  } else if (direction === "up") {
    edgeDistance = Math.max(0, fr.y - (r.y + r.height));
    overlap = rangeOverlapAmount(r.x, r.width, fr.x, fr.width);
    centerDistance = rangeCenterDistance(r.x, r.width, fr.x, fr.width);
  } else {
    edgeDistance = Math.max(0, r.y - (fr.y + fr.height));
    overlap = rangeOverlapAmount(r.x, r.width, fr.x, fr.width);
    centerDistance = rangeCenterDistance(r.x, r.width, fr.x, fr.width);
  }

  return { index, info: candidate, edgeDistance, overlap, centerDistance };
}

function compareScoredCandidates(a: ScoredCandidate, b: ScoredCandidate): number {
  return (
    a.edgeDistance - b.edgeDistance ||
    b.overlap - a.overlap ||
    a.centerDistance - b.centerDistance ||
    a.index - b.index
  );
}

/** src/layout.rs:369-424 — directional overlap, then edge distance, overlap, center, index. */
export function findInDirection(
  focused: PaneInfo,
  direction: NavDirection,
  panes: readonly PaneInfo[],
): string | null {
  const fr = focused.rect;
  const candidates: ScoredCandidate[] = [];

  for (let index = 0; index < panes.length; index++) {
    const p = panes[index];
    if (p && p.id !== focused.id && isCandidateInDirection(fr, p.rect, direction)) {
      candidates.push(scoreCandidate(fr, p, index, direction));
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort(compareScoredCandidates);
  return candidates[0]?.info.id ?? null;
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
