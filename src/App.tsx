// The player starts in a terminal. Cinematics remain optional and skippable.
// React renders committed state; Herdr owns workspace and key behavior.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type { ApplicationState } from "./core/applications";
import { createInvestigationSession, RECOVERY_STORAGE_KEY } from "./adapters/investigation-session";
import { pathToPhase, phaseToPath, PHASE_TITLES } from "./adapters/navigation";
import { toInputEvent } from "./adapters/herdr-browser";
import { ActionsProvider, type MandateActions } from "./ui/ActionsContext";
import { MandatePreview, type KeyboardToast, type PreviewKeyInput } from "./ui/MandatePreview";
import { GameHud } from "./ui/GameHud";
import { useInvestigationSnapshot } from "./ui/useHerdrSnapshot";
import {
  BriefingScene,
  ColdOpenScene,
  CompleteScene,
  EpisodeScene,
  NotFoundScene,
  ResponseScene,
  TitleScene,
} from "./ui/scenes";
import "./styles/mandate-preview.css";

const COLD_OPEN_VIDEO = "/cinematics/episode-one/cold-open.mp4";
const COLD_OPEN_POSTER = "/cinematics/episode-one/cold-open-poster.png";
const COLD_OPEN_CAPTIONS = "/cinematics/episode-one/cold-open.vtt";

// Static text equivalent of the shipped cold-open transcript (local copy of
// public/cinematics/episode-one/cold-open.txt; the film carries no exclusive
// story information).
const COLD_OPEN_TRANSCRIPT =
  "WASHINGTON D.C. — CAPITOL AVENUE // 23:47 EST. THE MANDATE — EPISODE ONE // THE LEAK. " +
  "JUNE ADEBAYO (COOPERATIVE): A source has come forward on a vendor security incident. " +
  "Confirm what is known before contact. " +
  "SOURCE-HANDLING MEMORANDUM: verify origin · preserve attribution · no assumed confirmation. " +
  "Your desk is live.";

function StartupTerminal({
  application,
  workspaceName,
  captured,
  onPreviewKey,
}: {
  readonly application: ApplicationState;
  readonly workspaceName: string | undefined;
  readonly captured: boolean;
  readonly onPreviewKey: (input: PreviewKeyInput) => boolean;
}) {
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (captured && onPreviewKey(event)) event.preventDefault();
  };
  const history = application.terminal.output.slice(0, -1);
  const prompt = application.terminal.output.at(-1) ?? "$ ";
  return (
    <section
      className="terminal-boot"
      data-surface="true"
      tabIndex={0}
      role="region"
      aria-label="Terminal. Type herdr and press Enter to start."
      onKeyDown={handleKeyDown}
    >
      <pre className="terminal-boot-history">{history.join("\n")}</pre>
      <p className="terminal-boot-line">
        {workspaceName ? (
          <span className="terminal-boot-path">~/Projects/{workspaceName} </span>
        ) : null}
        {prompt}
        {application.terminal.input}
        <span className="term-cursor" aria-hidden="true">
          ▊
        </span>
      </p>
    </section>
  );
}

function usePhaseNavigation(
  session: ReturnType<typeof createInvestigationSession>,
  phase: string,
): void {
  const isPopStateRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPopState = (event: PopStateEvent) => {
      const targetPhase =
        event.state?.phase ??
        pathToPhase(window.location.pathname, window.location.hash, import.meta.env.BASE_URL);
      if (targetPhase) {
        isPopStateRef.current = true;
        session.goToPhase(targetPhase);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [session]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const targetPath = phaseToPath(
      phase as Parameters<typeof phaseToPath>[0],
      import.meta.env.BASE_URL,
    );
    document.title = PHASE_TITLES[phase as keyof typeof PHASE_TITLES] ?? "The Mandate: Herdr";

    if (isPopStateRef.current) {
      isPopStateRef.current = false;
      return;
    }

    const currentPath = window.location.pathname;
    if (
      phase === "not-found" ||
      (currentPath !== targetPath &&
        pathToPhase(currentPath, window.location.hash, import.meta.env.BASE_URL) === phase)
    ) {
      window.history.replaceState({ phase }, "", targetPath);
    } else if (currentPath !== targetPath) {
      window.history.pushState({ phase }, "", targetPath);
    } else if (!window.history.state || window.history.state.phase !== phase) {
      window.history.replaceState({ phase }, "", targetPath);
    }
  }, [phase]);
}

function readStorage(key: string): string | null {
  try {
    if (typeof localStorage !== "undefined") {
      const val = localStorage.getItem(key);
      if (val) return val;
    }
  } catch {
    // Ignore storage availability errors
  }
  try {
    if (typeof sessionStorage !== "undefined") {
      return sessionStorage.getItem(key);
    }
  } catch {
    // Ignore storage availability errors
  }
  return null;
}

function writeStorage(key: string, value: string | null): void {
  try {
    if (typeof localStorage !== "undefined") {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    }
  } catch {
    // Ignore storage write errors
  }
  try {
    if (typeof sessionStorage !== "undefined") {
      if (value === null) sessionStorage.removeItem(key);
      else sessionStorage.setItem(key, value);
    }
  } catch {
    // Ignore storage write errors
  }
}

export function App() {
  const session = useMemo(() => {
    const created = createInvestigationSession();
    // M3 validated save and recovery persistence. Restores committed session facts
    // across reloads and episode continuity.
    const saved = readStorage(RECOVERY_STORAGE_KEY);
    if (saved) created.restoreRecovery(saved);

    if (typeof window !== "undefined") {
      const phase = pathToPhase(
        window.location.pathname,
        window.location.hash,
        import.meta.env.BASE_URL,
      );
      if (phase) created.goToPhase(phase);
    }
    return created;
  }, []);

  // Save session state on updates and before unload.
  useEffect(() => {
    const save = () => {
      const json = session.serializeRecovery();
      writeStorage(RECOVERY_STORAGE_KEY, json);
    };
    const unsubscribe = session.subscribe(save);
    window.addEventListener("beforeunload", save);
    return () => {
      unsubscribe();
      window.removeEventListener("beforeunload", save);
    };
  }, [session]);

  const snapshot = useInvestigationSnapshot(session.subscribe, session.getSnapshot);
  const [captured, setCaptured] = useState(true);
  const [reminder, setReminder] = useState<KeyboardToast | null>(null);
  const reminderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const releaseButtonRef = useRef<HTMLButtonElement>(null);
  const sceneTopRef = useRef<HTMLDivElement>(null);
  const surfaceHostRef = useRef<HTMLDivElement>(null);

  usePhaseNavigation(session, snapshot.phase);

  // Standard mode refuses pointer chrome; nudge keyboard users with the exact chord.
  const showReminder = useCallback((toast: KeyboardToast) => {
    setReminder(toast);
    if (reminderTimer.current) clearTimeout(reminderTimer.current);
    reminderTimer.current = setTimeout(() => setReminder(null), 2000);
  }, []);

  useEffect(
    () => () => {
      if (reminderTimer.current) clearTimeout(reminderTimer.current);
    },
    [],
  );

  const focusSurface = useCallback(() => {
    surfaceHostRef.current?.querySelector<HTMLElement>("[data-surface]")?.focus();
  }, []);

  const handleRequestHint = useCallback(() => {
    session.requestHint();
    focusSurface();
  }, [session, focusSurface]);

  const handleReturnToTitle = useCallback(() => {
    session.returnToTitle();
  }, [session]);

  const engage = useCallback(() => {
    setCaptured(true);
    focusSurface();
  }, [focusSurface]);

  const release = useCallback(() => {
    setCaptured(false);
    releaseButtonRef.current?.focus();
  }, []);

  // Host blur voids a pending prefix in the store (decided hold policy):
  // story and assessment observe the committed blur entry.
  useEffect(() => {
    const onBlur = () => {
      if (!captured) return;
      session.dispatch({ kind: "host", origin: "host", host: "blur" });
      release();
    };
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [captured, release, session]);

  // Scenes cut, never scroll the page into motion; move DOM focus to the
  // scene heading for screen-reader and keyboard users on each phase change.
  useEffect(() => {
    if (snapshot.phase === "workspace") focusSurface();
    else sceneTopRef.current?.focus();
  }, [focusSurface, snapshot.phase, snapshot.application.herdrLaunched]);

  const handlePreviewKey = useCallback(
    (input: PreviewKeyInput) => {
      const { application, herdr } = session.getSnapshot();
      const event = toInputEvent(input, application.herdrLaunched ? herdr : null);
      return event ? (session.dispatch(event)?.consumed ?? false) : false;
    },
    [session],
  );

  const inWorkspace = snapshot.phase === "workspace";
  const showChrome = inWorkspace || snapshot.phase === "response";

  const coldOpenTranscript = useMemo(() => COLD_OPEN_TRANSCRIPT, []);

  // Native chrome controls route through the session's chrome dispatcher
  // (playerAction false: external chrome modality, never keybinding-transfer
  // credit). Standard mode refuses them: no dispatch, no focus change, one
  // brief keyboard reminder. Accessible mode dispatches; post-click focus
  // returns to the surface only when capture is engaged so native Tab escape
  // stays safe.
  const handleSelectWorkspace = useCallback(
    (workspaceId: string) => {
      if (!session.dispatchChrome({ action: "select-workspace", workspaceId })) {
        showReminder({
          chord: "Ctrl+B W",
          action: "to navigate workspaces",
        });
        if (captured) focusSurface();
        return;
      }
      if (captured) focusSurface();
    },
    [session, captured, focusSurface, showReminder],
  );

  const handleSelectTab = useCallback(
    (tabId: string) => {
      if (!session.dispatchChrome({ action: "select-tab", tabId })) {
        showReminder({
          chord: "Ctrl+B P",
          altChord: "Ctrl+B N",
          action: "to switch tabs",
        });
        if (captured) focusSurface();
        return;
      }
      if (captured) focusSurface();
    },
    [session, captured, focusSurface, showReminder],
  );

  const handleNewTab = useCallback(() => {
    if (!session.dispatchChrome({ action: "new-tab" })) {
      showReminder({
        chord: "Ctrl+B C",
        action: "to create a new tab",
      });
      if (captured) focusSurface();
      return;
    }
    if (captured) focusSurface();
  }, [session, captured, focusSurface, showReminder]);

  const handleFocusPane = useCallback(
    (paneId: string) => {
      if (!session.dispatchChrome({ action: "focus-pane", paneId })) {
        showReminder({
          chord: "Ctrl+B H/J/K/L",
          action: "to switch panes",
        });
        if (captured) focusSurface();
        return;
      }
      if (captured) focusSurface();
    },
    [session, captured, focusSurface, showReminder],
  );

  const actions = useMemo<MandateActions>(
    () => ({
      selectWorkspace: handleSelectWorkspace,
      selectTab: handleSelectTab,
      newTab: handleNewTab,
      focusPane: handleFocusPane,
    }),
    [handleSelectWorkspace, handleSelectTab, handleNewTab, handleFocusPane],
  );

  return (
    <main className="mandate">
      <div ref={sceneTopRef} tabIndex={-1} className="mandate-focus-anchor">
        {snapshot.phase === "title" ? (
          <TitleScene
            title={snapshot.presentation.title}
            episode={snapshot.presentation.episode}
            canContinue={snapshot.canContinue}
            onNew={() => session.newInvestigation()}
            onContinue={() => session.continueInvestigation()}
          />
        ) : snapshot.phase === "cold-open" ? (
          <ColdOpenScene
            text={snapshot.presentation.coldOpen}
            transcript={coldOpenTranscript}
            episode={snapshot.presentation.episode}
            cinematic={{
              src: COLD_OPEN_VIDEO,
              poster: COLD_OPEN_POSTER,
              captions: COLD_OPEN_CAPTIONS,
            }}
            onSkip={() => session.skipPresentation()}
          />
        ) : snapshot.phase === "episode" ? (
          <EpisodeScene
            text={snapshot.presentation.episode}
            onAdvance={() => session.advancePresentation()}
            onSkip={() => session.skipPresentation()}
          />
        ) : snapshot.phase === "briefing" ? (
          <BriefingScene
            episode={snapshot.presentation.episode}
            date={snapshot.story.date}
            briefing={snapshot.presentation.briefing}
            onOpen={() => session.advancePresentation()}
            onSkip={() => session.skipPresentation()}
          />
        ) : snapshot.phase === "response" ? (
          <ResponseScene
            text={snapshot.presentation.response}
            onContinue={() => session.advancePresentation()}
          />
        ) : snapshot.phase === "complete" ? (
          <CompleteScene onReturn={() => session.returnToTitle()} />
        ) : snapshot.phase === "not-found" ? (
          <NotFoundScene
            onReturn={() => session.returnToTitle()}
            onWorkspace={() => session.goToPhase("workspace")}
          />
        ) : null}
      </div>

      {showChrome ? (
        <ActionsProvider actions={actions}>
          <div className="workspace-screen">
            <GameHud
              releaseButtonRef={releaseButtonRef}
              level={snapshot.level}
              objectives={snapshot.assessment.objectives}
              hints={snapshot.presentation.hints}
              hintsUsed={snapshot.assessment.hintsUsed}
              application={snapshot.application}
              story={snapshot.story}
              responseReady={snapshot.phase === "response"}
              captured={captured && inWorkspace}
              accessible={snapshot.inputPolicy === "accessible"}
              onReturnToTitle={handleReturnToTitle}
              onRequestHint={handleRequestHint}
              onToggleCapture={captured ? release : engage}
              onSetAccessible={(on) => session.setAccessibleMode(on)}
            />
            <div className="terminal" ref={surfaceHostRef}>
              {snapshot.application.herdrLaunched ? (
                <MandatePreview
                  snapshot={snapshot.herdr}
                  paneInputs={snapshot.application.paneInputs}
                  captured={captured && inWorkspace}
                  reminder={reminder}
                  onPreviewKey={handlePreviewKey}
                />
              ) : (
                <StartupTerminal
                  workspaceName={snapshot.herdr.workspaces[0]?.name}
                  application={snapshot.application}
                  captured={captured && inWorkspace}
                  onPreviewKey={handlePreviewKey}
                />
              )}
            </div>
          </div>
        </ActionsProvider>
      ) : null}
    </main>
  );
}
