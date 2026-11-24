// Browser adapter for the approved L1-L3 slice: owns the Herdr store, resets the
// scenario on an explicit level transition, and exposes one immutable combined
// view. Story and assessment only observe committed facts; neither owns Herdr
// state. No persistence, no save library, no wall clock.

import {
  createScenario,
  createStore,
  type ChromeEvent,
  type HerdrSnapshot,
  type HerdrState,
  type HerdrStore,
  type InputEvent,
  type JournalEntry,
} from "../core/herdr";
import {
  createAssessment,
  declareDestination as declareAssessmentDestination,
  objectivesMet,
  observe,
  requestHint as requestAssessmentHint,
  type AssessmentState,
  type ObjectiveRecord,
} from "../core/assessment";
import {
  applyStoryAction,
  initialStory,
  L1_ASSIGNMENT_LINES,
  L1_MEMO_LINES,
  presentationFor,
  storyConditionMet,
  type Level,
  type PresentationText,
  type StoryActionId,
  type StoryState,
} from "../core/narrative";

export type Phase =
  | "title"
  | "cold-open"
  | "episode"
  | "briefing"
  | "workspace"
  | "response"
  | "complete";

export interface AssessmentProgress {
  readonly objectives: readonly ObjectiveRecord[];
  readonly hintsUsed: number;
  readonly helpConsulted: boolean;
}

export interface InvestigationSnapshot {
  readonly phase: Phase;
  readonly level: Level;
  readonly herdr: HerdrSnapshot;
  readonly story: StoryState;
  readonly assessment: AssessmentProgress;
  readonly presentation: PresentationText;
  readonly declaredDestination: string | null;
  readonly canContinue: boolean;
  readonly canAdvance: boolean;
  readonly objectivesMet: boolean;
  readonly storyConditionMet: boolean;
  /** Standard is keyboard-only; Accessible allows alternative navigation. */
  readonly inputPolicy: InputPolicy;
}

export type ChromeAction =
  | { readonly action: "select-workspace"; readonly workspaceId: string }
  | { readonly action: "select-tab"; readonly tabId: string }
  | { readonly action: "new-tab" }
  | { readonly action: "focus-pane"; readonly paneId: string };

/**
 * Input policy for the simulated console. STANDARD is the game's teaching
 * mode: the in-world cooperative security notice runs the remote console
 * keyboard-only, so pointer events inside simulated Herdr chrome dispatch
 * nothing. ACCESSIBLE preserves alternative navigation for players who need
 * it: chrome clicks work and story progression is allowed, but the journal
 * keeps them non-player actions, so keyboard-transfer mastery credit is
 * never awarded. The policy is a fictional host restriction, not native
 * Herdr behavior, and it never changes the core's bindings.
 */
export type InputPolicy = "standard" | "accessible";

export interface InvestigationSession {
  subscribe(listener: () => void): () => void;
  getSnapshot(): InvestigationSnapshot;
  newInvestigation(): void;
  continueInvestigation(): boolean;
  advancePresentation(): void;
  skipPresentation(): void;
  returnToTitle(): void;
  /** Null outside the workspace: scene input never mutates the simulation. */
  dispatch(event: InputEvent): JournalEntry | null;
  /**
   * Native chrome controls (workspace/tab/new-tab/pane focus): dispatched as
   * genuine ChromeEvents through the store — refused in Standard mode (the
   * keyboard-only session dispatches nothing for clicks), dispatched in
   * Accessible mode as alternative modality. Returns false when refused.
   * Mouse and native-control activation is external chrome modality — story
   * access, never keybinding-transfer credit (journal playerAction is false
   * for chrome). Stale ids are guarded in the core (no-op).
   */
  dispatchChrome(action: ChromeAction): boolean;
  storyAction(action: StoryActionId): void;
  requestHint(): void;
  declareDestination(paneId: string): void;
  /** Standard: keyboard-only simulated chrome; Accessible: alternative modality. */
  setAccessibleMode(on: boolean): void;
  /**
   * Development aid only: versioned JSON of committed state for a dev reload,
   * or null when there is nothing to protect (fresh title). Never called in a
   * production build.
   */
  serializeRecovery(): string | null;
  /** Development aid only: restore a matching snapshot; false if ignored. */
  restoreRecovery(json: string): boolean;
}

interface Attempt {
  readonly level: Level;
  readonly store: HerdrStore;
  readonly story: StoryState;
  readonly assessment: AssessmentState;
  readonly declaredDestination: string | null;
}

// Development-only reload recovery: Vite full reloads during active development
// wipe the in-memory session. A versioned snapshot of committed state is kept
// in sessionStorage and restored on the next boot when schema and version match.
// This is a development aid, NOT a save system: permanent persistence is
// deferred to M3, the mechanism only replays committed facts (journal events
// plus the already-earned story/assessment state), and it never manufactures
// learning credit. Production builds do not save or restore.
// v2 adds the input policy so an Accessible session is not silently
// downgraded to Standard (or vice versa) by a reload.
const RECOVERY_VERSION = 2;
export const RECOVERY_STORAGE_KEY = `mandate-dev-recovery:v${RECOVERY_VERSION}`;

interface RecoveryPayload {
  readonly version: number;
  readonly phase: Phase;
  readonly suspendedPhase: Phase;
  readonly policy: InputPolicy;
  readonly attempt: {
    readonly level: Level;
    readonly story: StoryState;
    readonly assessment: AssessmentState;
    readonly declaredDestination: string | null;
    readonly events: readonly InputEvent[];
  } | null;
}

const RECOVERY_PHASES: readonly Phase[] = [
  "title",
  "cold-open",
  "episode",
  "briefing",
  "workspace",
  "response",
  "complete",
];

function parseRecovery(json: string): RecoveryPayload | null {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return null;
  }
  if (!raw || typeof raw !== "object") return null;
  const payload = raw as Partial<RecoveryPayload>;
  if (payload.version !== RECOVERY_VERSION) return null;
  if (!payload.phase || !RECOVERY_PHASES.includes(payload.phase)) return null;
  if (!payload.suspendedPhase || !RECOVERY_PHASES.includes(payload.suspendedPhase)) return null;
  if (payload.policy !== "standard" && payload.policy !== "accessible") return null;
  if (payload.attempt === null) return { ...payload } as RecoveryPayload;
  const saved = payload.attempt;
  if (!saved || !Array.isArray(saved.events)) return null;
  return payload as RecoveryPayload;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}

const idleStores = new Map<Level, HerdrStore>();

/** Title screen still shows a committed Herdr view; one store per level, never dispatched. */
function idleSnapshot(level: Level): HerdrSnapshot {
  let store = idleStores.get(level);
  if (!store) {
    store = createStore(createScenario(level));
    idleStores.set(level, store);
  }
  return store.snapshot();
}

/** Seed canonical L1 documents as committed process output, by pane app. */
function seedDocuments(store: HerdrStore, level: Level): void {
  if (level !== 1) return;
  const tab = activeTabOf(store);
  const docs: readonly (readonly [string, readonly string[]])[] = [
    ["assignment", L1_ASSIGNMENT_LINES],
    ["memo", L1_MEMO_LINES],
  ];
  for (const [app, lines] of docs) {
    const pane = tab?.panes.find((p) => p.app === app);
    if (!pane) continue;
    for (const line of lines) {
      store.dispatch({
        kind: "process",
        origin: "process",
        process: { kind: "output", paneId: pane.id, line },
      });
    }
  }
}

function newAttempt(level: Level): Attempt {
  const store = createStore(createScenario(level));
  // Content only: process output grants no objective or story credit.
  seedDocuments(store, level);
  return {
    level,
    store,
    story: initialStory(level),
    assessment: createAssessment(level),
    declaredDestination: null,
  };
}

function activeTabOf(store: HerdrStore) {
  const state = store.getState();
  const ws = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
  return ws?.tabs.find((t) => t.id === ws.activeTabId);
}

/** The app of the pane the player is actually looking at, or null. */
function focusedApp(store: HerdrStore): string | null {
  const tab = activeTabOf(store);
  return tab?.panes.find((p) => p.id === tab.focusedPaneId)?.app ?? null;
}

/** Input the assignment process actually accepted (input-destination evidence). */
function assignmentInput(store: HerdrStore): readonly string[] {
  return activeTabOf(store)?.panes.find((p) => p.app === "assignment")?.input ?? [];
}

function presentation(level: Level, hintsUsed: number): PresentationText {
  const text = presentationFor(level);
  return { ...text, hints: text.hints.slice(0, hintsUsed) };
}

/**
 * A story action needs the player to be looking at the content it claims to
 * read, and accepting the assignment needs input the assignment process
 * actually received. An external control cannot credit a memo the player never
 * opened or an assignment they never worked in.
 */
function groundedStoryAction(action: StoryActionId, store: HerdrStore): boolean {
  const app = focusedApp(store);
  switch (action) {
    case "read-memo":
      return app === "memo";
    case "acknowledge-assignment":
      return app === "assignment" && assignmentInput(store).length > 0;
    case "examine-artifact":
      return app === "artifact" || app === "reading";
    case "record-consent":
      return app === "assignment" || app === "transcript";
    case "complete-interview":
      return app === "transcript";
  }
}

export function createInvestigationSession(): InvestigationSession {
  let attempt: Attempt | null = null;
  let phase: Phase = "title";
  let suspendedPhase: Phase = "cold-open";
  let policy: InputPolicy = "standard";
  let cached: InvestigationSnapshot | null = null;
  const listeners = new Set<() => void>();

  function build(): InvestigationSnapshot {
    const current = attempt;
    const level: Level = current?.level ?? 1;
    const story = current?.story ?? initialStory(level);
    const assessment = current?.assessment;
    const objectives = assessment?.objectives ?? [];
    const hintsUsed = assessment?.hintsUsed ?? 0;
    const met = assessment ? objectivesMet(assessment) : false;
    const storyMet = storyConditionMet(story);
    return deepFreeze({
      phase,
      level,
      herdr: current?.store.snapshot() ?? idleSnapshot(level),
      story,
      assessment: {
        objectives,
        hintsUsed,
        helpConsulted: assessment?.helpConsulted ?? false,
      },
      presentation: presentation(level, hintsUsed),
      declaredDestination: current?.declaredDestination ?? null,
      canContinue: attempt !== null && phase === "title",
      canAdvance:
        phase === "cold-open" ||
        phase === "episode" ||
        phase === "briefing" ||
        phase === "response",
      objectivesMet: met,
      storyConditionMet: storyMet,
      inputPolicy: policy,
    });
  }

  function commit(): void {
    cached = build();
    for (const listener of listeners) listener();
  }

  function snapshot(): InvestigationSnapshot {
    cached ??= build();
    return cached;
  }

  /** Enter the earned response only when story condition AND skill predicates hold. */
  function settle(): void {
    if (phase !== "workspace" || !attempt) return;
    const storyOk = storyConditionMet(attempt.story);
    // Standard: mastery (keyboard-origin objectives) plus the story condition.
    // Accessible: story progression without keyboard-transfer mastery credit —
    // objectivesMet keeps reporting the unmet keyboard objectives.
    const ok = policy === "accessible" ? storyOk : storyOk && objectivesMet(attempt.assessment);
    if (ok) {
      phase = "response";
    }
  }

  function updateAttempt(next: Attempt): void {
    attempt = next;
    settle();
    commit();
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: snapshot,
    newInvestigation() {
      attempt = newAttempt(1);
      phase = "cold-open";
      commit();
    },
    continueInvestigation() {
      if (!attempt || phase !== "title") return false;
      phase = suspendedPhase;
      commit();
      return true;
    },
    advancePresentation() {
      if (phase === "cold-open") phase = "episode";
      else if (phase === "episode") phase = "briefing";
      else if (phase === "briefing") phase = "workspace";
      else if (phase === "response") {
        if (!attempt || attempt.level === 3) {
          phase = "complete";
        } else {
          attempt = newAttempt((attempt.level + 1) as Level);
          phase = "briefing";
        }
      } else return;
      commit();
    },
    skipPresentation() {
      if (phase !== "cold-open" && phase !== "episode" && phase !== "briefing") return;
      phase = "workspace";
      commit();
    },
    returnToTitle() {
      if (phase === "title") return;
      if (attempt) suspendedPhase = phase;
      phase = "title";
      commit();
    },
    dispatch(event) {
      // Scene and title input never reaches the simulation: no hidden state that
      // could later be credited.
      if (!attempt || phase !== "workspace") return null;
      const before: HerdrState = attempt.store.getState();
      const entry = attempt.store.dispatch(event);
      const after: HerdrState = attempt.store.getState();
      updateAttempt({ ...attempt, assessment: observe(attempt.assessment, before, after, entry) });
      return entry;
    },
    dispatchChrome(action) {
      // Standard mode is the keyboard-only session: clicks never dispatch
      // (cooperative security notice), so they cannot change state or objectives.
      if (policy === "standard") return false;
      if (!attempt || phase !== "workspace") return true;
      const before: HerdrState = attempt.store.getState();
      const entry = attempt.store.dispatch({
        ...action,
        kind: "chrome",
        origin: "player",
      } as ChromeEvent);
      const after: HerdrState = attempt.store.getState();
      updateAttempt({ ...attempt, assessment: observe(attempt.assessment, before, after, entry) });
      return true;
    },
    storyAction(action) {
      // Story actions are grounded in what the player is actually looking at.
      if (!attempt || phase !== "workspace") return;
      if (!groundedStoryAction(action, attempt.store)) return;
      const story = applyStoryAction(attempt.story, action);
      if (story === attempt.story) return;
      // The accepted assignment becomes visible in the environment itself.
      if (action === "acknowledge-assignment") {
        const pane = activeTabOf(attempt.store)?.panes.find((p) => p.app === "assignment");
        if (pane) {
          attempt.store.dispatch({
            kind: "process",
            origin: "process",
            process: {
              kind: "output",
              paneId: pane.id,
              line: "Assignment accepted — verify origin.",
            },
          });
        }
      }
      updateAttempt({ ...attempt, story });
    },
    requestHint() {
      if (!attempt || phase !== "workspace") return;
      updateAttempt({ ...attempt, assessment: requestAssessmentHint(attempt.assessment) });
    },
    declareDestination(paneId) {
      if (!attempt || phase !== "workspace") return;
      updateAttempt({
        ...attempt,
        declaredDestination: paneId,
        assessment: declareAssessmentDestination(attempt.assessment, paneId),
      });
    },
    setAccessibleMode(on) {
      const next: InputPolicy = on ? "accessible" : "standard";
      if (policy === next) return;
      policy = next;
      commit();
    },
    serializeRecovery() {
      // Fresh title has nothing to protect; a suspended title keeps Continue.
      if (phase === "title" && !attempt) return null;
      const payload: RecoveryPayload = {
        version: RECOVERY_VERSION,
        phase,
        suspendedPhase,
        policy,
        attempt: attempt
          ? {
              level: attempt.level,
              story: attempt.story,
              assessment: attempt.assessment,
              declaredDestination: attempt.declaredDestination,
              // Seeds are journaled process events, so replaying the journal
              // from the pristine scenario reproduces the exact store state.
              events: attempt.store.journal().map((entry) => entry.event),
            }
          : null,
      };
      return JSON.stringify(payload);
    },
    restoreRecovery(json) {
      const payload = parseRecovery(json);
      if (!payload) return false;
      attempt = payload.attempt
        ? (() => {
            const store = createStore(createScenario(payload.attempt.level));
            // Journal replay only: the pristine scenario, then every committed
            // event (seeds included) — deterministic by core contract.
            for (const event of payload.attempt.events) store.dispatch(event);
            return deepFreeze({
              level: payload.attempt.level,
              store,
              story: payload.attempt.story,
              assessment: payload.attempt.assessment,
              declaredDestination: payload.attempt.declaredDestination,
            });
          })()
        : null;
      phase = payload.phase;
      suspendedPhase = payload.suspendedPhase;
      policy = payload.policy;
      commit();
      return true;
    },
  };
}
