// Pure skill assessment for the approved L1-L3 slice (docs/LEVEL.md:76-174).
// Consumes committed before/after Herdr state plus the journal entry; credit is
// never derived from an action label alone. No React/DOM/adapters.

import type { HerdrState, JournalEntry, PaneState, TabState } from "../herdr";
import type { Level } from "../narrative";

export type ObjectiveId = "L1-O1" | "L1-O2" | "L1-O3" | "L2-O1" | "L2-O2" | "L3-O1" | "L3-O2";

export type Assistance = "independent" | "assisted";

export interface ObjectiveRecord {
  readonly id: ObjectiveId;
  readonly met: boolean;
  readonly assistance: Assistance;
  readonly evidence: readonly string[];
}

interface Progress {
  readonly l1HerdrLaunched: boolean;
  readonly l1WorkspaceCreated: boolean;
  readonly l1WorkspaceId: string | null;
  readonly l1TabCreated: boolean;
  readonly l2SecondTab: boolean;
  readonly l2RenamedTabId: string | null;
  readonly l2SwitchedAway: boolean;
  readonly l2SwitchedBack: boolean;
  readonly l3Split: boolean;
  readonly l3NewPaneId: string | null;
  readonly l3FocusMoved: boolean;
  readonly l3TypedInNewPane: boolean;
  readonly l3RenamedTabId: string | null;
}

export interface AssessmentState {
  readonly level: Level;
  readonly progress: Progress;
  readonly objectives: readonly ObjectiveRecord[];
  readonly hintsUsed: number;
  readonly helpConsulted: boolean;
}

const EMPTY_PROGRESS: Progress = {
  l1HerdrLaunched: false,
  l1WorkspaceCreated: false,
  l1WorkspaceId: null,
  l1TabCreated: false,
  l2SecondTab: false,
  l2RenamedTabId: null,
  l2SwitchedAway: false,
  l2SwitchedBack: false,
  l3Split: false,
  l3NewPaneId: null,
  l3FocusMoved: false,
  l3TypedInNewPane: false,
  l3RenamedTabId: null,
};

const REQUIRED: Record<Level, readonly ObjectiveId[]> = {
  1: ["L1-O1", "L1-O2", "L1-O3"],
  2: ["L2-O1", "L2-O2"],
  3: ["L3-O1", "L3-O2"],
};

export function requiredObjectives(level: Level): readonly ObjectiveId[] {
  return REQUIRED[level];
}

// --- state reads ------------------------------------------------------------

function activeTab(state: HerdrState): TabState | undefined {
  const ws = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
  return ws?.tabs.find((t) => t.id === ws.activeTabId);
}

function focusedPane(state: HerdrState): PaneState | undefined {
  const tab = activeTab(state);
  return tab?.panes.find((p) => p.id === tab.focusedPaneId);
}

function paneCount(state: HerdrState): number {
  return activeTab(state)?.panes.length ?? 0;
}

function tabCount(state: HerdrState): number {
  const ws = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
  return ws?.tabs.length ?? 0;
}

function inputGrew(before: HerdrState, after: HerdrState, paneId: string): boolean {
  const beforePane = activeTab(before)?.panes.find((p) => p.id === paneId);
  const afterPane = activeTab(after)?.panes.find((p) => p.id === paneId);
  return (afterPane?.input.length ?? 0) > (beforePane?.input.length ?? 0);
}

function isFocusAction(action: string | null): boolean {
  return (
    action === "focus-left" ||
    action === "focus-right" ||
    action === "focus-up" ||
    action === "focus-down"
  );
}

function isTabSwitch(action: string | null): boolean {
  return action === "next-tab" || action === "previous-tab" || action === "switch-tab";
}

/**
 * A typed character: printable, with at most a Shift modifier. Ctrl/Alt/Meta
 * and control/navigation keys are never typed input.
 */
function isTypedChar(entry: JournalEntry): boolean {
  return (
    entry.event.kind === "key" &&
    entry.event.modifiers.every((m) => m === "shift") &&
    /^[\x20-\x7e]$/.test(entry.event.key)
  );
}

// --- construction -----------------------------------------------------------

export function createAssessment(level: Level): AssessmentState {
  return finalize({
    level,
    progress: EMPTY_PROGRESS,
    objectives: [],
    hintsUsed: 0,
    helpConsulted: false,
  });
}

export function requestHint(assessment: AssessmentState): AssessmentState {
  return { ...assessment, hintsUsed: assessment.hintsUsed + 1 };
}

export function observeHerdrLaunch(
  assessment: AssessmentState,
  origin: JournalEntry["event"]["origin"],
): AssessmentState {
  if (assessment.level !== 1 || origin !== "player" || assessment.progress.l1HerdrLaunched) {
    return assessment;
  }
  return finalize({
    ...assessment,
    progress: { ...assessment.progress, l1HerdrLaunched: true },
  });
}

// --- observation ------------------------------------------------------------

/**
 * Observe one committed transition. `before`/`after` are the Herdr states on
 * either side of the dispatch; `entry` is its journal record. Only player
 * actions can satisfy an objective.
 */
export function observe(
  assessment: AssessmentState,
  before: HerdrState,
  after: HerdrState,
  entry: JournalEntry,
): AssessmentState {
  const { progress } = assessment;
  const player = entry.playerAction;
  const action = entry.action;
  const afterTab = activeTab(after);
  const beforeFocus = focusedPane(before);
  const afterFocus = focusedPane(after);
  const createdWorkspace =
    player && action === "workspace-create"
      ? after.workspaces.find(
          (workspace) => !before.workspaces.some((old) => old.id === workspace.id),
        )
      : undefined;
  const l1WorkspaceId = progress.l1WorkspaceId ?? createdWorkspace?.id ?? null;
  const split =
    player &&
    (action === "split-right" || action === "split-down") &&
    paneCount(before) === 1 &&
    paneCount(after) === 2;
  const newPaneId =
    progress.l3NewPaneId ??
    (split ? (afterTab?.panes.find((pane) => pane.id !== beforeFocus?.id)?.id ?? null) : null);
  const renamed = renamedTab(before, after, entry);
  const newTabCreated = player && tabCount(after) > tabCount(before);
  const l2RenamedTabId =
    progress.l2RenamedTabId ?? (progress.l2SecondTab || newTabCreated ? renamed : null);
  const tabSwitch = player && isTabSwitch(action);
  const helpConsulted =
    assessment.helpConsulted || (player && (action === "help" || action === "help-close"));

  const next: Progress = {
    ...progress,
    l1WorkspaceCreated: progress.l1WorkspaceCreated || createdWorkspace !== undefined,
    l1WorkspaceId,
    l1TabCreated:
      progress.l1TabCreated ||
      Boolean(
        player &&
        l1WorkspaceId &&
        before.activeWorkspaceId === l1WorkspaceId &&
        after.activeWorkspaceId === l1WorkspaceId &&
        tabCount(after) > tabCount(before),
      ),
    l2SecondTab: progress.l2SecondTab || Boolean(player && tabCount(after) > tabCount(before)),
    l2RenamedTabId,
    l2SwitchedAway:
      progress.l2SwitchedAway ||
      Boolean(tabSwitch && l2RenamedTabId && afterTab?.id !== l2RenamedTabId),
    l2SwitchedBack:
      progress.l2SwitchedBack ||
      Boolean(
        progress.l2SwitchedAway &&
        tabSwitch &&
        progress.l2RenamedTabId &&
        afterTab?.id === progress.l2RenamedTabId,
      ),
    l3Split: progress.l3Split || Boolean(split),
    l3NewPaneId: newPaneId,
    l3FocusMoved:
      progress.l3FocusMoved ||
      Boolean(
        (progress.l3Split || split) &&
        player &&
        isFocusAction(action) &&
        beforeFocus &&
        afterFocus &&
        beforeFocus.id !== afterFocus.id,
      ),
    l3TypedInNewPane:
      progress.l3TypedInNewPane ||
      Boolean(
        progress.l3FocusMoved &&
        player &&
        entry.effect === "forwarded" &&
        isTypedChar(entry) &&
        newPaneId &&
        afterFocus?.id === newPaneId &&
        inputGrew(before, after, newPaneId),
      ),
    l3RenamedTabId: progress.l3RenamedTabId ?? renamed,
  };

  return finalize({ ...assessment, progress: next, helpConsulted });
}

/** A genuine nonempty trimmed rename committed through the field on the active tab. */
function renamedTab(before: HerdrState, after: HerdrState, entry: JournalEntry): string | null {
  if (!entry.playerAction || entry.action !== "rename-commit") return null;
  const overlay = before.overlay;
  if (!overlay || overlay.kind !== "rename") return null;
  const trimmed = overlay.text.trim();
  if (trimmed.length === 0) return null;
  if (overlay.target === "tab") {
    const tab = activeTab(after);
    if (!tab || tab.name !== trimmed) return null;
    return tab.id;
  }
  if (overlay.target === "new-tab") {
    if (trimmed === overlay.defaultName) return null;
    const tab = activeTab(after);
    if (!tab || tab.name !== trimmed) return null;
    return tab.id;
  }
  return null;
}

function metIds(level: Level, progress: Progress): Set<ObjectiveId> {
  const met = new Set<ObjectiveId>();
  if (level === 1) {
    if (progress.l1HerdrLaunched) met.add("L1-O1");
    if (progress.l1WorkspaceCreated) met.add("L1-O2");
    if (progress.l1TabCreated) met.add("L1-O3");
  }
  if (level === 2) {
    if (progress.l2SecondTab && progress.l2RenamedTabId !== null) met.add("L2-O1");
    if (progress.l2SwitchedAway && progress.l2SwitchedBack) met.add("L2-O2");
  }
  if (level === 3) {
    if (progress.l3Split && progress.l3FocusMoved && progress.l3TypedInNewPane) met.add("L3-O1");
    if (progress.l3RenamedTabId !== null) met.add("L3-O2");
  }
  return met;
}

const EVIDENCE: Record<ObjectiveId, string> = {
  "L1-O1": "player launched Herdr from the open terminal",
  "L1-O2": "player created the investigation workspace through Herdr",
  "L1-O3": "player opened a tab in the investigation workspace through Herdr",
  "L2-O1": "player created and named a report tab through Herdr",
  "L2-O2": "player switched away from and back to the named tab",
  "L3-O1": "player split panes, moved focus, and typed in the new pane",
  "L3-O2": "player renamed a tab through Herdr",
};

function finalize(assessment: AssessmentState): AssessmentState {
  const met = metIds(assessment.level, assessment.progress);
  const previous = new Map(assessment.objectives.map((o) => [o.id, o]));
  const objectives: ObjectiveRecord[] = requiredObjectives(assessment.level).map((id) => {
    const prior = previous.get(id);
    if (prior?.met) return prior;
    if (!met.has(id)) {
      return { id, met: false, assistance: "independent", evidence: [] };
    }
    return {
      id,
      met: true,
      assistance: assessment.hintsUsed > 0 ? "assisted" : "independent",
      evidence: [EVIDENCE[id]],
    };
  });
  return { ...assessment, objectives };
}

export function objectivesMet(assessment: AssessmentState): boolean {
  const required = requiredObjectives(assessment.level);
  return required.every((id) => assessment.objectives.some((o) => o.id === id && o.met));
}
