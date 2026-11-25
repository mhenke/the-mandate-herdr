// Pure skill assessment for the approved L1-L3 slice (docs/LEVEL.md:76-174).
// Consumes committed before/after Herdr state plus the journal entry; credit is
// never derived from an action label alone. No React/DOM/adapters.

import type { HerdrState, JournalEntry, PaneState, TabState } from "../herdr";
import type { Level } from "../narrative";

export type ObjectiveId =
  | "L1-O1"
  | "L1-O2"
  | "L1-O3"
  | "L2-O1"
  | "L2-O2"
  | "L3-O1"
  | "L3-O2"
  | "L4-O1"
  | "L4-O2"
  | "L5-O1"
  | "L5-O2"
  | "L5-O3"
  | "L5-O4"
  | "L5-O5";

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
  readonly l4FilingWorkspaceCreated: boolean;
  readonly l4FilingWorkspaceId: string | null;
  readonly l4Split: boolean;
  readonly l4DraftPaneId: string | null;
  readonly l4TypedInDraft: boolean;
  readonly l4NavigatedBack: boolean;
  readonly l5TriageWorkspaceCreated: boolean;
  readonly l5TriageWorkspaceId: string | null;
  readonly l5TabCount: number;
  readonly l5RenamedTabs: readonly string[];
  readonly l5Split: boolean;
  readonly l5SplitPaneId: string | null;
  readonly l5FocusMoved: boolean;
  readonly l5TypedInTargetPane: boolean;
  readonly l5FindingSubmitted: boolean;
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
  l4FilingWorkspaceCreated: false,
  l4FilingWorkspaceId: null,
  l4Split: false,
  l4DraftPaneId: null,
  l4TypedInDraft: false,
  l4NavigatedBack: false,
  l5TriageWorkspaceCreated: false,
  l5TriageWorkspaceId: null,
  l5TabCount: 0,
  l5RenamedTabs: [],
  l5Split: false,
  l5SplitPaneId: null,
  l5FocusMoved: false,
  l5TypedInTargetPane: false,
  l5FindingSubmitted: false,
};

const REQUIRED: Record<Level, readonly ObjectiveId[]> = {
  1: ["L1-O1"],
  2: ["L2-O1", "L2-O2"],
  3: ["L3-O1", "L3-O2"],
  4: ["L4-O1", "L4-O2"],
  5: ["L5-O1", "L5-O2", "L5-O3", "L5-O4", "L5-O5"],
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
  const l1WorkspaceId =
    progress.l1WorkspaceId ?? (assessment.level === 1 ? (createdWorkspace?.id ?? null) : null);
  const l4FilingWorkspaceId =
    progress.l4FilingWorkspaceId ??
    (assessment.level === 4 ? (createdWorkspace?.id ?? null) : null);
  const l5TriageWorkspaceId =
    progress.l5TriageWorkspaceId ??
    (assessment.level === 5 ? (createdWorkspace?.id ?? null) : null);

  const split =
    player &&
    (action === "split-right" || action === "split-down") &&
    paneCount(after) > paneCount(before);
  const newPaneId = split
    ? (afterTab?.panes.find((pane) => pane.id !== beforeFocus?.id)?.id ?? null)
    : null;
  const l3NewPaneId = progress.l3NewPaneId ?? (assessment.level === 3 ? newPaneId : null);
  const l4DraftPaneId = progress.l4DraftPaneId ?? (assessment.level === 4 ? newPaneId : null);
  const l5SplitPaneId = progress.l5SplitPaneId ?? (assessment.level === 5 ? newPaneId : null);

  const renamed = renamedTab(before, after, entry);
  const newTabCreated = player && tabCount(after) > tabCount(before);
  const l2RenamedTabId =
    progress.l2RenamedTabId ?? (progress.l2SecondTab || newTabCreated ? renamed : null);
  const tabSwitch = player && isTabSwitch(action);
  const helpConsulted =
    assessment.helpConsulted || (player && (action === "help" || action === "help-close"));

  const focusChanged =
    player &&
    isFocusAction(action) &&
    beforeFocus &&
    afterFocus &&
    beforeFocus.id !== afterFocus.id;

  const typedInFocused =
    player &&
    entry.effect === "forwarded" &&
    isTypedChar(entry) &&
    afterFocus &&
    inputGrew(before, after, afterFocus.id);

  const next: Progress = {
    ...progress,
    l1WorkspaceCreated:
      progress.l1WorkspaceCreated || (assessment.level === 1 && createdWorkspace !== undefined),
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
    l2SecondTab:
      progress.l2SecondTab ||
      Boolean(assessment.level === 2 && player && tabCount(after) > tabCount(before)),
    l2RenamedTabId,
    l2SwitchedAway:
      progress.l2SwitchedAway ||
      Boolean(
        assessment.level === 2 && tabSwitch && l2RenamedTabId && afterTab?.id !== l2RenamedTabId,
      ),
    l2SwitchedBack:
      progress.l2SwitchedBack ||
      Boolean(
        assessment.level === 2 &&
        progress.l2SwitchedAway &&
        tabSwitch &&
        progress.l2RenamedTabId &&
        afterTab?.id === progress.l2RenamedTabId,
      ),
    l3Split: progress.l3Split || Boolean(assessment.level === 3 && split),
    l3NewPaneId,
    l3FocusMoved:
      progress.l3FocusMoved ||
      Boolean(assessment.level === 3 && (progress.l3Split || split) && focusChanged),
    l3TypedInNewPane:
      progress.l3TypedInNewPane ||
      Boolean(
        assessment.level === 3 &&
        progress.l3FocusMoved &&
        typedInFocused &&
        l3NewPaneId &&
        afterFocus?.id === l3NewPaneId,
      ),
    l3RenamedTabId: progress.l3RenamedTabId ?? (assessment.level === 3 ? renamed : null),

    // Level 4
    l4FilingWorkspaceCreated:
      progress.l4FilingWorkspaceCreated ||
      (assessment.level === 4 && createdWorkspace !== undefined),
    l4FilingWorkspaceId,
    l4Split: progress.l4Split || Boolean(assessment.level === 4 && split),
    l4DraftPaneId,
    l4TypedInDraft:
      progress.l4TypedInDraft ||
      Boolean(
        assessment.level === 4 &&
        typedInFocused &&
        (l4DraftPaneId ? afterFocus?.id === l4DraftPaneId : true),
      ),
    l4NavigatedBack:
      progress.l4NavigatedBack ||
      Boolean(
        assessment.level === 4 &&
        player &&
        (action === "workspace-open" ||
          action === "workspace-select" ||
          action === "navigate-select" ||
          action === "select-workspace") &&
        l4FilingWorkspaceId &&
        after.activeWorkspaceId !== l4FilingWorkspaceId,
      ),

    // Level 5
    l5TriageWorkspaceCreated:
      progress.l5TriageWorkspaceCreated ||
      (assessment.level === 5 && createdWorkspace !== undefined),
    l5TriageWorkspaceId,
    l5TabCount: Math.max(progress.l5TabCount, assessment.level === 5 ? tabCount(after) : 0),
    l5RenamedTabs:
      assessment.level === 5 && renamed && !progress.l5RenamedTabs.includes(renamed)
        ? [...progress.l5RenamedTabs, renamed]
        : progress.l5RenamedTabs,
    l5Split: progress.l5Split || Boolean(assessment.level === 5 && split),
    l5SplitPaneId,
    l5FocusMoved: progress.l5FocusMoved || Boolean(assessment.level === 5 && focusChanged),
    l5TypedInTargetPane:
      progress.l5TypedInTargetPane || Boolean(assessment.level === 5 && typedInFocused),
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

function metIdsL1(progress: Progress): Set<ObjectiveId> {
  const met = new Set<ObjectiveId>();
  if (progress.l1HerdrLaunched) met.add("L1-O1");
  if (progress.l1WorkspaceCreated) met.add("L1-O2");
  if (progress.l1TabCreated) met.add("L1-O3");
  return met;
}

function metIdsL2(progress: Progress): Set<ObjectiveId> {
  const met = new Set<ObjectiveId>();
  if (progress.l2SecondTab && progress.l2RenamedTabId !== null) met.add("L2-O1");
  if (progress.l2SwitchedAway && progress.l2SwitchedBack) met.add("L2-O2");
  return met;
}

function metIdsL3(progress: Progress): Set<ObjectiveId> {
  const met = new Set<ObjectiveId>();
  if (progress.l3Split && progress.l3FocusMoved && progress.l3TypedInNewPane) met.add("L3-O1");
  if (progress.l3RenamedTabId !== null) met.add("L3-O2");
  return met;
}

function metIdsL4(progress: Progress): Set<ObjectiveId> {
  const met = new Set<ObjectiveId>();
  if (
    progress.l4FilingWorkspaceCreated &&
    progress.l4Split &&
    progress.l4TypedInDraft &&
    progress.l4NavigatedBack
  ) {
    met.add("L4-O1");
  }
  if (progress.l4TypedInDraft) met.add("L4-O2");
  return met;
}

function metIdsL5(progress: Progress): Set<ObjectiveId> {
  const met = new Set<ObjectiveId>();
  if (progress.l5TabCount >= 2 && progress.l5RenamedTabs.length >= 1) met.add("L5-O1");
  if (progress.l5Split) met.add("L5-O2");
  if (progress.l5FocusMoved && progress.l5TypedInTargetPane) met.add("L5-O3");
  if (progress.l5FindingSubmitted) met.add("L5-O4");
  if (progress.l5TriageWorkspaceCreated) met.add("L5-O5");
  return met;
}

function metIds(level: Level, progress: Progress): Set<ObjectiveId> {
  switch (level) {
    case 1:
      return metIdsL1(progress);
    case 2:
      return metIdsL2(progress);
    case 3:
      return metIdsL3(progress);
    case 4:
      return metIdsL4(progress);
    case 5:
      return metIdsL5(progress);
  }
}

const EVIDENCE: Record<ObjectiveId, string> = {
  "L1-O1": "player launched Herdr from the open terminal",
  "L1-O2": "player created the investigation workspace through Herdr",
  "L1-O3": "player opened a tab in the investigation workspace through Herdr",
  "L2-O1": "player created and named a report tab through Herdr",
  "L2-O2": "player switched away from and back to the named tab",
  "L3-O1": "player split panes, moved focus, and typed in the new pane",
  "L3-O2": "player renamed a tab through Herdr",
  "L4-O1":
    "player created filing workspace, staged draft in split pane, and navigated between workspaces",
  "L4-O2": "player directed input to the draft pane before filing",
  "L5-O1": "player organized fresh intake records across multiple named tabs",
  "L5-O2": "player created comparison split for intake records",
  "L5-O3": "player moved focus and directed input to the target intake pane",
  "L5-O4": "provenance-backed finding citing fresh intake records committed",
  "L5-O5": "player created triage workspace while preserving running investigation",
};

export function observeFindingSubmission(assessment: AssessmentState): AssessmentState {
  if (assessment.level !== 5 || assessment.progress.l5FindingSubmitted) {
    return assessment;
  }
  return finalize({
    ...assessment,
    progress: { ...assessment.progress, l5FindingSubmitted: true },
  });
}

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
