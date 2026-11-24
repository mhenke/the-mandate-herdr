// Theatrical L1 shell: title -> cold open -> episode -> briefing ->
// workspace -> earned response. React renders the runtime view model only;
// every transition comes from the session's methods. Escape stays
// core-owned inside the simulated surface; the external release control is
// the separate accessible capture control.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createInvestigationSession, RECOVERY_STORAGE_KEY } from "./adapters/investigation-session";
import { toInputEvent } from "./adapters/herdr-browser";
import { MandatePreview } from "./ui/MandatePreview";
import { useInvestigationSnapshot } from "./ui/useHerdrSnapshot";
import {
  BriefingScene,
  ColdOpenScene,
  CompleteScene,
  EpisodeScene,
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

export function App() {
  const session = useMemo(() => {
    const created = createInvestigationSession();
    // Development-only reload recovery: Vite full reloads wipe the in-memory
    // session. Restore committed state when the versioned snapshot matches.
    // Not a save system; production persistence is deferred to M3.
    if (import.meta.env.DEV && typeof sessionStorage !== "undefined") {
      const saved = sessionStorage.getItem(RECOVERY_STORAGE_KEY);
      if (saved) created.restoreRecovery(saved);
    }
    return created;
  }, []);

  // Save on unload only in development; a fresh title clears any stale snapshot.
  useEffect(() => {
    if (!import.meta.env.DEV || typeof sessionStorage === "undefined") return;
    const save = () => {
      const json = session.serializeRecovery();
      if (json === null) sessionStorage.removeItem(RECOVERY_STORAGE_KEY);
      else sessionStorage.setItem(RECOVERY_STORAGE_KEY, json);
    };
    window.addEventListener("beforeunload", save);
    return () => window.removeEventListener("beforeunload", save);
  }, [session]);

  const snapshot = useInvestigationSnapshot(session.subscribe, session.getSnapshot);
  const [captured, setCaptured] = useState(true);
  const [reminder, setReminder] = useState(false);
  const reminderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const releaseButtonRef = useRef<HTMLButtonElement>(null);
  const sceneTopRef = useRef<HTMLDivElement>(null);
  const surfaceHostRef = useRef<HTMLDivElement>(null);

  // Standard mode refuses pointer chrome; nudge keyboard users once, briefly.
  const showReminder = useCallback(() => {
    setReminder(true);
    if (reminderTimer.current) clearTimeout(reminderTimer.current);
    reminderTimer.current = setTimeout(() => setReminder(false), 2000);
  }, []);

  useEffect(
    () => () => {
      if (reminderTimer.current) clearTimeout(reminderTimer.current);
    },
    [],
  );

  // After a scene action the runtime commits new state; restore DOM focus to
  // the surface so subsequent real keys keep routing to the simulation.
  const focusSurface = useCallback(() => {
    surfaceHostRef.current?.querySelector<HTMLElement>("[data-surface]")?.focus();
  }, []);

  const handleReadMemo = useCallback(() => {
    session.storyAction("read-memo");
    focusSurface();
  }, [session, focusSurface]);

  const handleAcknowledge = useCallback(() => {
    session.storyAction("acknowledge-assignment");
    focusSurface();
  }, [session, focusSurface]);

  const handleRequestHint = useCallback(() => {
    session.requestHint();
    focusSurface();
  }, [session, focusSurface]);

  const engage = useCallback(() => {
    setCaptured(true);
  }, []);

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
    sceneTopRef.current?.focus();
  }, [snapshot.phase]);

  const handlePreviewKey = useCallback(
    (input: {
      readonly key: string;
      readonly code: string;
      readonly ctrlKey: boolean;
      readonly altKey: boolean;
      readonly shiftKey: boolean;
      readonly metaKey: boolean;
      readonly repeat: boolean;
    }) => {
      // Plain Tab never reaches the runtime — it moves DOM focus so keyboard
      // users can always reach the release control. This is a browser
      // accessibility constraint of this preview, not authentic upstream
      // behavior (Herdr binds prefix+Tab to cycle panes). Escape stays
      // core-owned inside the captured surface.
      if (input.key === "Tab") return;
      const { event, handled } = toInputEvent(input);
      if (!handled) return;
      if (!event) return;
      session.dispatch(event);
    },
    [session],
  );

  const inWorkspace = snapshot.phase === "workspace";
  const showChrome = inWorkspace || snapshot.phase === "response";
  const herdr = snapshot.herdr;
  const activeWorkspace = herdr.workspaces.find((w) => w.id === herdr.activeWorkspaceId);
  const activeTab = activeWorkspace?.tabs.find((t) => t.id === activeWorkspace.activeTabId);
  const focusedApp = activeTab?.panes.find((p) => p.id === activeTab.focusedPaneId)?.app ?? null;

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
        showReminder();
        return;
      }
      if (captured) focusSurface();
    },
    [session, captured, focusSurface, showReminder],
  );

  const handleSelectTab = useCallback(
    (tabId: string) => {
      if (!session.dispatchChrome({ action: "select-tab", tabId })) {
        showReminder();
        return;
      }
      if (captured) focusSurface();
    },
    [session, captured, focusSurface, showReminder],
  );

  const handleNewTab = useCallback(() => {
    if (!session.dispatchChrome({ action: "new-tab" })) {
      showReminder();
      return;
    }
    if (captured) focusSurface();
  }, [session, captured, focusSurface, showReminder]);

  const handleFocusPane = useCallback(
    (paneId: string) => {
      if (!session.dispatchChrome({ action: "focus-pane", paneId })) {
        showReminder();
        return;
      }
      if (captured) focusSurface();
    },
    [session, captured, focusSurface, showReminder],
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
        ) : null}
      </div>

      {showChrome ? (
        <div className="terminal" ref={surfaceHostRef}>
          <MandatePreview
            snapshot={herdr}
            captured={captured && inWorkspace}
            accessible={snapshot.inputPolicy === "accessible"}
            reminder={reminder}
            focusedApp={focusedApp}
            assignmentAccepted={snapshot.story.flags.includes("assignment-accepted")}
            memoRead={snapshot.story.events.includes("SE-L1-assignment")}
            onPreviewKey={handlePreviewKey}
            onReleaseRequest={engage}
            onSetAccessible={(on) => session.setAccessibleMode(on)}
            onReadMemo={handleReadMemo}
            onAcknowledgeAssignment={handleAcknowledge}
            onSelectWorkspace={handleSelectWorkspace}
            onSelectTab={handleSelectTab}
            onNewTab={handleNewTab}
            onFocusPane={handleFocusPane}
          />
          <div className="terminal-under">
            <p className="objectives-quiet" aria-live="polite">
              {snapshot.assessment.objectives.some((o) => o.met)
                ? `Objectives met: ${snapshot.assessment.objectives
                    .filter((o) => o.met)
                    .map((o) => o.id)
                    .join(", ")}`
                : "No objectives met yet."}
            </p>
            {inWorkspace ? (
              <details className="hints-quiet">
                <summary>
                  Hints (optional
                  {snapshot.assessment.hintsUsed > 0 ? ", recorded" : ""})
                </summary>
                {snapshot.presentation.hints.length > 0 ? (
                  <ol>
                    {snapshot.presentation.hints.map((hint, index) => (
                      <li key={index}>{hint}</li>
                    ))}
                  </ol>
                ) : (
                  <p>Requesting a hint records assistance — never punishment.</p>
                )}
                <button type="button" onClick={handleRequestHint}>
                  Request a hint
                </button>
              </details>
            ) : null}
            <details className="provenance-quiet">
              <summary>About this preview</summary>
              <p>
                Preview mock: visual approximation of a Herdr-style workspace, not an authentic
                baseline. Live simulation state only. Preview slice L1–L3 ·{" "}
                {`session ${herdr.sessionId} · ${herdr.attached ? "attached" : "detached"}`}
              </p>
            </details>
          </div>
          <div className="mandate-release">
            <button
              ref={releaseButtonRef}
              type="button"
              onClick={captured ? release : engage}
              aria-pressed={captured}
              aria-describedby="capture-desc"
              className="release-link"
            >
              {captured ? "Release capture" : "Engage capture"}
            </button>
            <span id="capture-desc" className="release-hint">
              {captured
                ? "Keys go to the simulated surface. Tab leaves it."
                : "Released: keys stay in the page."}
            </span>
          </div>
        </div>
      ) : null}
    </main>
  );
}
