// Pure skill assessment for the approved L1-L3 slice (docs/LEVEL.md:76-174).
// Consumes committed before/after Herdr state plus the journal entry; credit is
// never derived from an action label alone. No React/DOM/adapters.

import type { HerdrState, JournalEntry, Overlay, PaneState, TabState } from "../herdr";
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
  readonly l1FocusMoved: boolean;
  /** Assignment input length at the qualifying focus; typing before it never counts. */
  readonly l1FocusInputBaseline: number | null;
  readonly l1CharForwarded: boolean;
  readonly l1HelpOpen: boolean;
  readonly l1HelpFilterTyped: boolean;
  /** Attempt-local player-typed filter length; never carries across help visits. */
  readonly l1HelpTypedLength: number;
  /** Attempt-local: a genuine player clear of exactly what the player typed. */
  readonly l1HelpAttemptCleared: boolean;
  readonly l1HelpCleared: boolean;
  readonly l1HelpClosed: boolean;
  readonly l1InvalidConsumed: boolean;
  readonly l2SecondTab: boolean;
  readonly l2RenamedTabId: string | null;
  readonly l2SwitchedAway: boolean;
  readonly l2SwitchedBack: boolean;
  readonly l2InvalidConsumed: boolean;
  readonly l3Split: boolean;
  readonly l3FocusMoved: boolean;
  readonly l3CharToDeclared: boolean;
  readonly l3RenamedTabId: string | null;
}

export interface AssessmentState {
  readonly level: Level;
  readonly progress: Progress;
  readonly objectives: readonly ObjectiveRecord[];
  readonly hintsUsed: number;
  readonly helpConsulted: boolean;
  readonly declaredDestination: string | null;
}

const EMPTY_PROGRESS: Progress = {
  l1FocusMoved: false,
  l1FocusInputBaseline: null,
  l1CharForwarded: false,
  l1HelpOpen: false,
  l1HelpFilterTyped: false,
  l1HelpTypedLength: 0,
  l1HelpAttemptCleared: false,
  l1HelpCleared: false,
  l1HelpClosed: false,
  l1InvalidConsumed: false,
  l2SecondTab: false,
  l2RenamedTabId: null,
  l2SwitchedAway: false,
  l2SwitchedBack: false,
  l2InvalidConsumed: false,
  l3Split: false,
  l3FocusMoved: false,
  l3CharToDeclared: false,
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

function inputUnchanged(before: HerdrState, after: HerdrState): boolean {
  const beforePane = focusedPane(before);
  const afterPane = focusedPane(after);
  if (!beforePane || !afterPane || beforePane.id !== afterPane.id) return false;
  return beforePane.input.length === afterPane.input.length;
}

function isFocusAction(action: string | null): boolean {
  return (
    action === "focus-left" ||
    action === "focus-right" ||
    action === "focus-up" ||
    action === "focus-down"
  );
}

/** L1 O1 teaches the horizontal pair only; up/down never credit it. */
function isHorizontalFocus(action: string | null): boolean {
  return action === "focus-left" || action === "focus-right";
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

/**
 * The prefix sequence must be player-owned: the last arm in the journal must
 * be a player action. Unrelated process output between arm and resolve is fine.
 */
function playerPrefixArmed(before: HerdrState): boolean {
  if (before.mode !== "prefix") return false;
  for (let i = before.journal.length - 1; i >= 0; i -= 1) {
    const entry = before.journal[i];
    if (entry?.effect === "prefix-armed") return entry.playerAction;
  }
  return false;
}

function isTabSwitch(action: string | null): boolean {
  return action === "next-tab" || action === "previous-tab" || action === "switch-tab";
}

function helpOverlay(state: HerdrState): Extract<Overlay, { kind: "help" }> | null {
  const overlay = state.overlay;
  return overlay && overlay.kind === "help" ? overlay : null;
}

// --- construction -----------------------------------------------------------

export function createAssessment(level: Level): AssessmentState {
  return finalize({
    level,
    progress: EMPTY_PROGRESS,
    objectives: [],
    hintsUsed: 0,
    helpConsulted: false,
    declaredDestination: null,
  });
}

export function declareDestination(assessment: AssessmentState, paneId: string): AssessmentState {
  return { ...assessment, declaredDestination: paneId };
}

export function requestHint(assessment: AssessmentState): AssessmentState {
  return { ...assessment, hintsUsed: assessment.hintsUsed + 1 };
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
  const player = entry.playerAction;
  const action = entry.action;
  const p = assessment.progress;
  const beforeFocus = focusedPane(before);
  const afterFocus = focusedPane(after);
  const beforeHelp = helpOverlay(before);
  const afterHelp = helpOverlay(after);
  const assignmentInputAfter =
    activeTab(after)?.panes.find((pane) => pane.app === "assignment")?.input.length ?? 0;

  // Every prefix-resolved action needs the full player-owned prefix sequence.
  const prefixPlayer = player && playerPrefixArmed(before);

  // O1 focus credit needs the resolved prefix focus effect to actually move
  // memo -> assignment (horizontal pair only), and the baseline is taken then.
  const focusQualified =
    prefixPlayer &&
    entry.effect === "prefix-resolved" &&
    isHorizontalFocus(action) &&
    beforeFocus?.app === "memo" &&
    afterFocus?.app === "assignment";
  const focusBaseline = p.l1FocusInputBaseline ?? (focusQualified ? assignmentInputAfter : null);

  // O2 is tracked per help attempt: open resets, a successful clear resets the
  // typed count, and any later query change voids the pending clear.
  const beforeQuery = beforeHelp?.query.length ?? 0;
  const afterQuery = afterHelp?.query.length ?? 0;
  let typedLength = p.l1HelpTypedLength;
  let attemptCleared = p.l1HelpAttemptCleared;
  let helpOpen = p.l1HelpOpen;
  let helpTyped = p.l1HelpFilterTyped;
  let helpCleared = p.l1HelpCleared;
  let helpClosed = p.l1HelpClosed;

  if (prefixPlayer && action === "help") {
    helpOpen = true;
    typedLength = 0;
    attemptCleared = false;
  }
  if (player && action === "help-filter-open") {
    typedLength = 0;
    attemptCleared = false;
  }
  if (player && action === "help-filter-edit") {
    const delta = afterQuery - beforeQuery;
    if (delta > 0) {
      typedLength += delta;
      helpTyped = true;
    } else if (delta < 0) {
      typedLength = Math.max(0, typedLength + delta);
    }
    if (delta !== 0) attemptCleared = false;
  }
  if (player && action === "help-filter-clear") {
    // Clear must remove exactly the player-typed query, not scripted text.
    if (beforeQuery > 0 && afterQuery === 0 && beforeQuery === typedLength && typedLength > 0) {
      helpCleared = true;
      attemptCleared = true;
      typedLength = 0;
    }
  }
  if (player && action === "help-filter-cancel") {
    typedLength = 0;
    attemptCleared = attemptCleared && beforeQuery === 0 && afterQuery === 0;
  }
  if (player && action === "help-close") {
    // A close only completes the attempt when the last clear was genuine and
    // the query is empty at close time (a dirty filter is not a clean exit).
    if (beforeHelp && !afterHelp && attemptCleared && beforeQuery === 0) {
      helpClosed = true;
    }
    typedLength = 0;
    attemptCleared = false;
  }

  const next: Progress = {
    ...p,
    l1FocusMoved: p.l1FocusMoved || focusQualified,
    l1FocusInputBaseline: focusBaseline,
    l1CharForwarded:
      p.l1CharForwarded ||
      (player &&
        entry.effect === "forwarded" &&
        isTypedChar(entry) &&
        afterFocus?.app === "assignment" &&
        focusBaseline !== null &&
        assignmentInputAfter > focusBaseline),
    l1HelpOpen: helpOpen,
    l1HelpFilterTyped: helpTyped,
    l1HelpTypedLength: typedLength,
    l1HelpAttemptCleared: attemptCleared,
    l1HelpCleared: helpCleared,
    l1HelpClosed: helpClosed,
    l1InvalidConsumed:
      p.l1InvalidConsumed ||
      (prefixPlayer &&
        action === "invalid-consumed" &&
        before.mode === "prefix" &&
        after.mode === "terminal" &&
        inputUnchanged(before, after)),
    l2SecondTab:
      p.l2SecondTab ||
      (player &&
        (action === "new-tab" || action === "rename-commit") &&
        tabCount(after) > tabCount(before)),
    l2RenamedTabId: p.l2RenamedTabId ?? renamedTab(before, after, entry),
    l2SwitchedAway:
      p.l2SwitchedAway ||
      (player &&
        isTabSwitch(action) &&
        (p.l2RenamedTabId !== null
          ? activeTab(after)?.id !== p.l2RenamedTabId
          : activeTab(after)?.id !== activeTab(before)?.id)),
    l2SwitchedBack:
      p.l2SwitchedBack ||
      (p.l2SwitchedAway &&
        player &&
        isTabSwitch(action) &&
        (p.l2RenamedTabId !== null
          ? activeTab(after)?.id === p.l2RenamedTabId
          : activeTab(after)?.id !== before.workspaces[0]?.tabs[0]?.id)),
    l2InvalidConsumed:
      p.l2InvalidConsumed ||
      (player &&
        action === "invalid-consumed" &&
        before.mode === "prefix" &&
        after.mode === "terminal" &&
        (p.l2RenamedTabId !== null
          ? activeTab(after)?.id === p.l2RenamedTabId
          : activeTab(after)?.id !== before.workspaces[0]?.tabs[0]?.id) &&
        inputUnchanged(before, after)),
    l3Split:
      p.l3Split ||
      (player &&
        (action === "split-right" || action === "split-down") &&
        paneCount(before) === 1 &&
        paneCount(after) === 2),
    l3FocusMoved:
      p.l3FocusMoved ||
      (player &&
        isFocusAction(action) &&
        beforeFocus !== undefined &&
        afterFocus !== undefined &&
        beforeFocus.id !== afterFocus.id),
    l3CharToDeclared:
      p.l3CharToDeclared ||
      (player &&
        entry.effect === "forwarded" &&
        assessment.declaredDestination !== null &&
        afterFocus?.id === assessment.declaredDestination &&
        inputGrew(before, after, assessment.declaredDestination)),
    l3RenamedTabId: p.l3RenamedTabId ?? renamedTab(before, after, entry),
  };

  const helpConsulted =
    assessment.helpConsulted || (player && (action === "help" || action === "help-close"));

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

function metIds(level: Level, p: Progress): Set<ObjectiveId> {
  const met = new Set<ObjectiveId>();
  if (level === 1) {
    if (p.l1FocusMoved && p.l1CharForwarded) met.add("L1-O1");
    if (p.l1HelpOpen && p.l1HelpFilterTyped && p.l1HelpCleared && p.l1HelpClosed) met.add("L1-O2");
    if (p.l1InvalidConsumed) met.add("L1-O3");
  }
  if (level === 2) {
    if (p.l2SecondTab && p.l2RenamedTabId !== null && p.l2SwitchedAway && p.l2SwitchedBack) {
      met.add("L2-O1");
    }
    if (p.l2InvalidConsumed) met.add("L2-O2");
  }
  if (level === 3) {
    if (p.l3Split && p.l3FocusMoved && p.l3CharToDeclared) met.add("L3-O1");
    if (p.l3RenamedTabId !== null) met.add("L3-O2");
  }
  return met;
}

const EVIDENCE: Record<ObjectiveId, string> = {
  "L1-O1":
    "prefix focus memo->assignment, then a forwarded character accepted by the assignment pane",
  "L1-O2": "help opened, filter typed, cleared with ctrl+u, closed",
  "L1-O3": "invalid prefix follow-up consumed, terminal mode restored, pane input unchanged",
  "L2-O1": "second tab created, renamed through the field, switched away and back active",
  "L2-O2": "invalid prefix follow-up consumed inside the artifact tab",
  "L3-O1": "split created two live panes, focus moved, typed character landed in the declared pane",
  "L3-O2": "interview tab named through the player rename field",
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
