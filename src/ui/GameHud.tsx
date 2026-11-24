// Cooperative Intelligence Desk — Game HUD.
// Sits cleanly outside the simulated Herdr TUI, framing the educational
// mission, active objective, keyboard capture state, and investigative docket.

import type { JSX, ReactNode, Ref } from "react";
import type { ObjectiveRecord } from "../core/assessment";

export interface GameHudProps {
  readonly releaseButtonRef?: Ref<HTMLButtonElement>;
  readonly level: number;
  readonly objectives: readonly ObjectiveRecord[];
  readonly hints: readonly string[];
  readonly hintsUsed: number;
  readonly focusedApp: string | null;
  readonly memoRead: boolean;
  readonly assignmentAccepted: boolean;
  readonly artifactExamined: boolean;
  readonly captured: boolean;
  readonly accessible: boolean;
  readonly onRequestHint: () => void;
  readonly onToggleCapture: () => void;
  readonly onSetAccessible: (on: boolean) => void;
}

function HudStep({
  badge,
  heading,
  instruction,
  complete,
}: {
  readonly badge: string;
  readonly heading: string;
  readonly instruction?: ReactNode;
  readonly complete?: boolean;
}): JSX.Element {
  return (
    <div className={complete ? "hud-objective-complete" : "hud-objective-active"}>
      <span className={complete ? "hud-step-badge hud-step-badge-done" : "hud-step-badge"}>
        {badge}
      </span>
      <span className="hud-step-heading">{heading}</span>
      {instruction ? (
        <>
          <span className="hud-step-sep" aria-hidden="true">
            ·
          </span>
          <span className="hud-step-instruction">{instruction}</span>
        </>
      ) : null}
    </div>
  );
}

function HudCaptureIndicator({
  captured,
  releaseButtonRef,
  onToggleCapture,
}: {
  readonly captured: boolean;
  readonly releaseButtonRef?: Ref<HTMLButtonElement>;
  readonly onToggleCapture: () => void;
}): JSX.Element {
  return (
    <div className="game-hud-capture-indicator">
      <span
        className={captured ? "hud-dot hud-dot-captured" : "hud-dot hud-dot-released"}
        aria-hidden="true"
      >
        {captured ? "●" : "○"}
      </span>
      <button
        ref={releaseButtonRef}
        type="button"
        onClick={onToggleCapture}
        className="release-link hud-capture-btn"
        aria-pressed={captured}
        aria-describedby="capture-desc"
      >
        {captured ? "Release capture" : "Engage capture"}
      </button>
      <span id="capture-desc" className="release-hint">
        {captured
          ? "Keys go to the simulated surface. Tab leaves it."
          : "Released: keys stay in the page."}
      </span>
    </div>
  );
}

function LevelOneMission({
  memoRead,
  assignmentAccepted,
}: {
  readonly memoRead: boolean;
  readonly assignmentAccepted: boolean;
}): JSX.Element {
  if (!memoRead) {
    return (
      <HudStep
        badge="Objective 1 of 2"
        heading="Review the source-handling memo in the right pane."
        instruction={
          <>
            Shortcut: <kbd>Ctrl+B</kbd> then <kbd>O</kbd> (or <kbd>L</kbd>) to cycle pane focus
          </>
        }
      />
    );
  }
  if (!assignmentAccepted) {
    return (
      <HudStep
        badge="Objective 2 of 2"
        heading="Return to the assignment pane and accept the cooperative assignment."
        instruction={
          <>
            Shortcut: <kbd>Ctrl+B</kbd> then <kbd>H</kbd> to return to left pane
          </>
        }
      />
    );
  }
  return (
    <HudStep
      badge="✓ Objectives Met"
      heading="Assignment accepted. Origin verified. Desk ready for filing."
      complete
    />
  );
}

function LevelTwoMission({
  artifactExamined,
}: {
  readonly artifactExamined: boolean;
}): JSX.Element {
  if (!artifactExamined) {
    return (
      <HudStep
        badge="Level 2 Objective"
        heading="Create a new tab and examine the supplied goods artifact."
        instruction={
          <>
            Shortcut: <kbd>Ctrl+B</kbd> <kbd>C</kbd> (new tab), <kbd>Ctrl+B</kbd> <kbd>Shift+T</kbd>{" "}
            (rename)
          </>
        }
      />
    );
  }
  return (
    <HudStep
      badge="✓ Level 2 Complete"
      heading="Artifact examined. Evidence docket updated."
      complete
    />
  );
}

function HudMission({
  level,
  memoRead,
  assignmentAccepted,
  artifactExamined,
}: {
  readonly level: number;
  readonly memoRead: boolean;
  readonly assignmentAccepted: boolean;
  readonly artifactExamined: boolean;
}): JSX.Element {
  return (
    <div className="game-hud-mission">
      {level === 1 ? (
        <LevelOneMission memoRead={memoRead} assignmentAccepted={assignmentAccepted} />
      ) : level === 2 ? (
        <LevelTwoMission artifactExamined={artifactExamined} />
      ) : (
        <HudStep badge="Level 3 Objective" heading="Split panes and complete the interview." />
      )}
    </div>
  );
}

export function GameHud({
  releaseButtonRef,
  level,
  objectives,
  hints,
  hintsUsed,
  memoRead,
  assignmentAccepted,
  artifactExamined,
  captured,
  accessible,
  onRequestHint,
  onToggleCapture,
  onSetAccessible,
}: GameHudProps): JSX.Element {
  const metCount = objectives.filter((o) => o.met).length;

  return (
    <header className="game-hud" aria-label="Investigation Desk HUD">
      <div className="game-hud-top">
        <div className="game-hud-brand">
          <span className="game-hud-kicker">Cooperative Intelligence Desk</span>
          <h1 className="game-hud-title">Episode I · Level {level}</h1>
          <span className="hud-sep" aria-hidden="true">
            ·
          </span>
          <p className="objectives-quiet" aria-live="polite">
            {metCount > 0
              ? `Objectives met: ${objectives
                  .filter((o) => o.met)
                  .map((o) => o.id)
                  .join(", ")}`
              : "No objectives met yet."}
          </p>
        </div>

        <div className="game-hud-controls">
          <HudCaptureIndicator
            captured={captured}
            releaseButtonRef={releaseButtonRef}
            onToggleCapture={onToggleCapture}
          />

          <label className="hud-access-toggle">
            <input
              type="checkbox"
              checked={accessible}
              onChange={(e) => onSetAccessible(e.target.checked)}
            />
            Accessible navigation
          </label>

          <details className="hints-quiet">
            <summary>Hints (optional{hintsUsed > 0 ? ", recorded" : ""})</summary>
            <div className="hints-body">
              {hints.length > 0 ? (
                <ol>
                  {hints.map((hint, index) => (
                    <li key={index}>{hint}</li>
                  ))}
                </ol>
              ) : (
                <p>Requesting a hint records assistance — never punishment.</p>
              )}
              <button type="button" onClick={onRequestHint}>
                <span className="key-badge" aria-hidden="true">
                  H
                </span>{" "}
                Request a hint
              </button>
            </div>
          </details>

          <details className="hud-shortcuts-menu">
            <summary>Shortcuts</summary>
            <div className="hud-shortcuts-popover">
              <p className="hud-popover-title">Herdr TUI Shortcuts</p>
              <div className="hud-shortcut-row">
                <span className="hud-shortcut-desc">Prefix chord</span>
                <kbd>Ctrl+B</kbd>
              </div>
              <div className="hud-shortcut-row">
                <span className="hud-shortcut-desc">Switch pane</span>
                <span>
                  <kbd>Ctrl+B</kbd> <kbd>O</kbd>
                </span>
              </div>
              <div className="hud-shortcut-row">
                <span className="hud-shortcut-desc">Directional focus</span>
                <span>
                  <kbd>Ctrl+B</kbd> <kbd>H</kbd> / <kbd>L</kbd>
                </span>
              </div>
              <div className="hud-shortcut-row">
                <span className="hud-shortcut-desc">Help modal</span>
                <span>
                  <kbd>Ctrl+B</kbd> <kbd>?</kbd>
                </span>
              </div>
              <div className="hud-shortcut-row">
                <span className="hud-shortcut-desc">New tab</span>
                <span>
                  <kbd>Ctrl+B</kbd> <kbd>C</kbd>
                </span>
              </div>
            </div>
          </details>
        </div>
      </div>

      <HudMission
        level={level}
        memoRead={memoRead}
        assignmentAccepted={assignmentAccepted}
        artifactExamined={artifactExamined}
      />
    </header>
  );
}
