// Browser adapter for the approved L1-L3 slice. Herdr owns pane and session
// behavior. The fictional application state records commands and evidence.
// Story and assessment observe committed transitions. No wall clock.

import {
  createApplicationState,
  stepApplication,
  type ApplicationState,
} from "../core/applications";
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
  objectivesMet,
  observe,
  observeHerdrLaunch,
  requestHint as requestAssessmentHint,
  type AssessmentState,
  type ObjectiveRecord,
} from "../core/assessment";
import {
  applyStoryAction,
  initialStory,
  presentationFor,
  storyConditionMet,
  type Level,
  type PresentationText,
  type StoryState,
} from "../core/narrative";

export type Phase =
  | "title"
  | "cold-open"
  | "episode"
  | "briefing"
  | "workspace"
  | "response"
  | "complete"
  | "not-found";

export type PresentationEvent =
  | { readonly kind: "presentation"; readonly action: "cold-open-started" }
  | { readonly kind: "presentation"; readonly action: "pause" }
  | { readonly kind: "presentation"; readonly action: "resume" }
  | { readonly kind: "presentation"; readonly action: "skip" }
  | { readonly kind: "presentation"; readonly action: "ended" };

export interface AssessmentProgress {
  readonly objectives: readonly ObjectiveRecord[];
  readonly hintsUsed: number;
  readonly helpConsulted: boolean;
}

export interface InvestigationSnapshot {
  readonly phase: Phase;
  readonly level: Level;
  readonly herdr: HerdrSnapshot;
  readonly application: ApplicationState;
  readonly story: StoryState;
  readonly assessment: AssessmentProgress;
  readonly presentation: PresentationText;
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
  goToPhase(targetPhase: Phase): boolean;
  /** The startup prompt can consume input without producing a Herdr entry. */
  dispatch(
    event: InputEvent,
  ): { readonly entry: JournalEntry | null; readonly consumed: boolean } | null;
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
  requestHint(): void;
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
  readonly application: ApplicationState;
  readonly story: StoryState;
  readonly assessment: AssessmentState;
}
// Development-only reload recovery: Vite full reloads during active development
// wipe the in-memory session. A versioned snapshot of committed state is kept
// in sessionStorage and restored on the next boot when schema and version match.
// This is a development aid, NOT a save system: permanent persistence is
// deferred to M3, the mechanism only replays committed facts (journal events
// plus the already-earned story/assessment state), and it never manufactures
// learning credit. Production builds do not save or restore.
// v5 stores the player-origin Herdr launch skill with the Herdr event journal
// and fictional application sessions.
const RECOVERY_VERSION = 5;
export const RECOVERY_STORAGE_KEY = `mandate-dev-recovery:v${RECOVERY_VERSION}`;

interface RecoveryPayload {
  readonly version: number;
  readonly phase: Phase;
  readonly suspendedPhase: Phase;
  readonly policy: InputPolicy;
  readonly attempt: {
    readonly level: Level;
    readonly application: ApplicationState;
    readonly story: StoryState;
    readonly assessment: AssessmentState;
    readonly events: readonly InputEvent[];
  } | null;
}

const RECOVERY_PHASE_SET = new Set<Phase>([
  "title",
  "cold-open",
  "episode",
  "briefing",
  "workspace",
  "response",
  "complete",
  "not-found",
]);
const RECOVERY_POLICY_SET = new Set<string>(["standard", "accessible"]);

function parseRecovery(json: string): RecoveryPayload | null {
  try {
    const raw: unknown = JSON.parse(json);
    if (!raw || typeof raw !== "object") return null;
    const payload = raw as Partial<RecoveryPayload>;
    if (payload.version !== RECOVERY_VERSION) return null;
    if (!payload.phase || !RECOVERY_PHASE_SET.has(payload.phase)) return null;
    if (!payload.suspendedPhase || !RECOVERY_PHASE_SET.has(payload.suspendedPhase)) return null;
    if (!payload.policy || !RECOVERY_POLICY_SET.has(payload.policy)) return null;
    if (payload.attempt === null) return { ...payload } as RecoveryPayload;
    const saved = payload.attempt;
    if (
      !saved ||
      ![1, 2, 3].includes(saved.level) ||
      !saved.application ||
      !Array.isArray(saved.events)
    )
      return null;
    return payload as RecoveryPayload;
  } catch {
    return null;
  }
}

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) {
    deepFreeze(child);
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

function newAttempt(level: Level): Attempt {
  return {
    level,
    store: createStore(createScenario(1)),
    application: createApplicationState(),
    story: initialStory(level),
    assessment: createAssessment(level),
  };
}

const ADVANCEABLE_PHASES = new Set<Phase>(["cold-open", "episode", "briefing", "response"]);
const ATTEMPT_START_PHASES = new Set<Phase>(["cold-open", "episode", "briefing", "workspace"]);
const ATTEMPT_REQUISITE_PHASES = new Set<Phase>(["response", "complete"]);

export function createInvestigationSession(): InvestigationSession {
  let attempt: Attempt | null = newAttempt(1);
  let phase: Phase = "workspace";
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
    const text = presentationFor(level);
    const met = assessment ? objectivesMet(assessment) : false;
    const storyMet = storyConditionMet(story);
    return deepFreeze({
      phase,
      level,
      application: current?.application ?? createApplicationState(),
      herdr: current?.store.snapshot() ?? idleSnapshot(level),
      story,
      assessment: {
        objectives,
        hintsUsed,
        helpConsulted: assessment?.helpConsulted ?? false,
      },
      presentation: { ...text, hints: text.hints.slice(0, hintsUsed) },
      canContinue: attempt !== null && phase === "title",
      canAdvance: ADVANCEABLE_PHASES.has(phase),
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
          const level = (attempt.level + 1) as Level;
          attempt = {
            ...attempt,
            level,
            story: initialStory(level),
            assessment: createAssessment(level),
          };
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
      if (attempt && phase !== "not-found") suspendedPhase = phase;
      phase = "title";
      commit();
    },
    goToPhase(targetPhase) {
      if (targetPhase === phase) return true;
      if (targetPhase === "title") {
        if (attempt) suspendedPhase = phase;
        phase = "title";
        commit();
        return true;
      }
      if (targetPhase === "not-found") {
        phase = "not-found";
        commit();
        return true;
      }
      if (ATTEMPT_START_PHASES.has(targetPhase)) {
        attempt ??= newAttempt(1);
        phase = targetPhase;
        commit();
        return true;
      }
      if (ATTEMPT_REQUISITE_PHASES.has(targetPhase)) {
        if (!attempt || (phase !== "title" && phase !== "not-found")) return false;
        if (targetPhase !== suspendedPhase) return false;
        phase = targetPhase;
        commit();
        return true;
      }
      return false;
    },
    dispatch(event) {
      if (!attempt || phase !== "workspace") return null;
      if (!attempt.application.herdrLaunched) {
        if (
          event.kind !== "key" ||
          event.origin !== "player" ||
          (event.phase !== "press" && !(event.phase === "repeat" && event.key === "backspace"))
        ) {
          return null;
        }
        const transition = stepApplication(attempt.application, {
          kind: "key",
          origin: "player",
          key: event.key,
          modifiers: event.modifiers,
        });
        if (transition.ignored) return null;
        const assessment = transition.effects.some((effect) => effect.kind === "herdr-started")
          ? observeHerdrLaunch(attempt.assessment, event.origin)
          : attempt.assessment;
        updateAttempt({ ...attempt, application: transition.state, assessment });
        return { entry: null, consumed: true };
      }

      const before = attempt.store.getState();
      const entry = attempt.store.dispatch(event);
      const after = attempt.store.getState();
      const assessment =
        policy === "accessible"
          ? attempt.assessment
          : observe(attempt.assessment, before, after, entry);
      let application = attempt.application;
      let story = attempt.story;
      // Modal routes report consumption even when they do not change the layout.
      // In terminal mode the receiving application decides for forwarded input.
      let consumed = entry.effect !== "none" && entry.effect !== "forwarded";

      if (event.kind === "key" && event.origin === "player" && entry.effect === "forwarded") {
        const workspace = after.workspaces.find((item) => item.id === after.activeWorkspaceId);
        const tab = workspace?.tabs.find((item) => item.id === workspace.activeTabId);
        const paneId = tab?.focusedPaneId;
        if (workspace && tab && paneId) {
          const transition = stepApplication(
            application,
            {
              kind: "key",
              origin: "player",
              key: event.key,
              paneId,
              modifiers: event.modifiers,
            },
            attempt.level,
          );
          application = transition.state;
          // Escape remains reserved by the captured Herdr surface, not the host.
          consumed = !transition.ignored || event.key === "escape";

          if (event.key === "enter") {
            const launched = transition.effects.some((effect) => effect.kind === "claude-started");
            const researchTab =
              workspace.id !== idleSnapshot(1).activeWorkspaceId && workspace.tabs.indexOf(tab) > 0;
            const containsRecord = (pane: string, documentId: string) =>
              application.readReceipts.some(
                (receipt) => receipt.paneId === pane && receipt.documentId === documentId,
              );
            const agent = application.agents[paneId];
            if (agent && !launched) {
              attempt.store.dispatch({
                kind: "process",
                origin: "process",
                process: { kind: "agentState", paneId, state: "working" },
              });
            }
            for (const effect of transition.effects) {
              if (effect.kind === "pane-output") {
                attempt.store.dispatch({
                  kind: "process",
                  origin: "process",
                  process: { kind: "output", paneId, line: effect.line },
                });
              } else if (effect.kind === "assignment-acknowledged" && researchTab) {
                story = applyStoryAction(story, "acknowledge-assignment");
              } else if (effect.kind === "document-read") {
                let placementHint: string | undefined;
                if (attempt.level === 1 && effect.documentId === "CPA-01A") {
                  if (researchTab) story = applyStoryAction(story, "read-memo");
                  else
                    placementHint = "June: Keep the memo in a research tab in your own workspace.";
                } else if (attempt.level === 2 && effect.documentId === "UM-1109-88") {
                  const sourceInOtherTab = workspace.tabs.some(
                    (other) =>
                      other !== tab &&
                      other.panes.some((pane) => containsRecord(pane.id, "CPA-01A")),
                  );
                  if (sourceInOtherTab) story = applyStoryAction(story, "examine-artifact");
                  else placementHint = "June: Retrieve the report in a separate tab from the memo.";
                } else if (attempt.level === 3 && effect.documentId === "PARK-INTERVIEW-11-13") {
                  const reportInOtherPane = tab.panes.some(
                    (pane) => pane.id !== paneId && containsRecord(pane.id, "UM-1109-88"),
                  );
                  if (reportInOtherPane) {
                    story = applyStoryAction(story, "record-consent");
                    story = applyStoryAction(story, "complete-interview");
                  } else placementHint = "June: Open the transcript in a pane beside the report.";
                }
                if (placementHint) {
                  attempt.store.dispatch({
                    kind: "process",
                    origin: "process",
                    process: { kind: "output", paneId, line: placementHint },
                  });
                }
              }
            }
            if (launched || agent) {
              attempt.store.dispatch({
                kind: "process",
                origin: "process",
                process: {
                  kind: "agentState",
                  paneId,
                  state: agent?.status === "blocked" ? "blocked" : "idle",
                },
              });
            }
            attempt.store.dispatch({
              kind: "process",
              origin: "process",
              process: { kind: "consumeInput", paneId },
            });
          }
        }
      }

      updateAttempt({ ...attempt, application, story, assessment });
      return { entry, consumed };
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
    requestHint() {
      if (!attempt || phase !== "workspace") return;
      updateAttempt({ ...attempt, assessment: requestAssessmentHint(attempt.assessment) });
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
              application: attempt.application,
              story: attempt.story,
              assessment: attempt.assessment,
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
            const store = createStore(createScenario(1));
            // Replay every committed Herdr event from the initial shell.
            for (const event of payload.attempt.events) store.dispatch(event);
            return deepFreeze({
              level: payload.attempt.level,
              application: payload.attempt.application,
              store,
              story: payload.attempt.story,
              assessment: payload.attempt.assessment,
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
