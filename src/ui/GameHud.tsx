import type { JSX, Ref } from "react";
import type { ApplicationState } from "../core/applications";
import type { ObjectiveRecord } from "../core/assessment";
import type { StoryState } from "../core/narrative";

export interface GameHudProps {
  readonly releaseButtonRef?: Ref<HTMLButtonElement>;
  readonly level: number;
  readonly objectives: readonly ObjectiveRecord[];
  readonly hints: readonly string[];
  readonly hintsUsed: number;
  readonly application: ApplicationState;
  readonly story: StoryState;
  readonly responseReady: boolean;
  readonly captured: boolean;
  readonly accessible: boolean;
  readonly onReturnToTitle?: () => void;
  readonly onRequestHint: () => void;
  readonly onToggleCapture: () => void;
  readonly onSetAccessible: (on: boolean) => void;
}

interface HudStep {
  readonly label: string;
  readonly instruction?: string;
  readonly complete: boolean;
}

function met(objectives: readonly ObjectiveRecord[], id: string): boolean {
  return objectives.some((objective) => objective.id === id && objective.met);
}

function missionL1(props: GameHudProps): {
  objective: string;
  why: string;
  steps: readonly HudStep[];
} {
  const { application, story } = props;
  const isClaudeRunning = Object.keys(application.agents).length > 0;
  return {
    objective: "Review your morning assignment and newsroom handling rules.",
    why: "Understand the terms before investigating the incident.",
    steps: [
      {
        label: "Start Herdr",
        instruction: "Type herdr, then press Enter.",
        complete: application.herdrLaunched,
      },
      {
        label: "Start the session",
        instruction: "Type claude and press Enter.",
        complete: isClaudeRunning,
      },
      {
        label: "Check assignment & source rules",
        instruction: "Ask Claude about your schedule, email, or source-handling procedures.",
        complete: story.events.includes("SE-L1-assignment"),
      },
      {
        label: "Read CPA-01A, then accept June's assignment",
        instruction: "Tell Claude: Accept the assignment.",
        complete: story.flags.includes("assignment-accepted"),
      },
    ],
  };
}

function missionL2(props: GameHudProps): {
  objective: string;
  why: string;
  steps: readonly HudStep[];
} {
  const { objectives, responseReady, story } = props;
  return {
    objective: "Compare the SOC report with the handling memo.",
    why: "The shared report has no origin header.",
    steps: [
      {
        label: "Add a report tab",
        instruction: "Press Ctrl+B, then C. Name it report.",
        complete: met(objectives, "L2-O1"),
      },
      {
        label: "Switch to the source, then back to the report",
        instruction: "Switch with Ctrl+B P, then Ctrl+B N.",
        complete: met(objectives, "L2-O2"),
      },
      {
        label: "Ask Claude for UM-1109-88",
        instruction: "Start Claude in the report tab. Ask for UM-1109-88.",
        complete: story.events.includes("SE-L2-artifact"),
      },
      {
        label: "Get June's update",
        complete: responseReady,
      },
    ],
  };
}

function missionL3(props: GameHudProps): {
  objective: string;
  why: string;
  steps: readonly HudStep[];
} {
  const { objectives, responseReady, story } = props;
  return {
    objective: "Put Park's account beside the SOC report.",
    why: "His account may explain what happened during those five minutes.",
    steps: [
      {
        label: "Split the report tab",
        instruction:
          "Press Ctrl+B V. Move with Ctrl+B H and Ctrl+B L. Type claude in the new pane.",
        complete: met(objectives, "L3-O1"),
      },
      {
        label: "Name the interview tab",
        instruction: "Press Ctrl+B, then Shift+T. Clear with Ctrl+U, then type park-interview.",
        complete: met(objectives, "L3-O2"),
      },
      {
        label: "Ask Claude for Park's transcript",
        instruction: "Ask Claude for Park's interview about LT-47B.",
        complete: story.events.includes("SE-L3-interview"),
      },
      {
        label: "Get June's update",
        complete: responseReady,
      },
    ],
  };
}

function missionL4(props: GameHudProps): {
  objective: string;
  why: string;
  steps: readonly HudStep[];
} {
  const { objectives, responseReady, story } = props;
  return {
    objective: "Draft and file Verifier Note VN-12.",
    why: "Keep drafting strictly separated from your live investigation transcripts.",
    steps: [
      {
        label: "Create a filing workspace",
        instruction: "Press Ctrl+B then Shift+N. Name it filing.",
        complete: met(objectives, "L4-O1") || met(objectives, "L4-O2"),
      },
      {
        label: "Split the filing tab to stage draft",
        instruction: "Press Ctrl+B V. Move between panes with Ctrl+B H and Ctrl+B L.",
        complete: met(objectives, "L4-O1") || met(objectives, "L4-O2"),
      },
      {
        label: "Draft and file VN-12 (paraphrase vs detail)",
        instruction: "Start Claude. Ask Claude to file VN-12 with paraphrase or detail.",
        complete: story.events.includes("SE-L4-filing"),
      },
      {
        label: "Navigate back to reading workspace",
        instruction: "Press Ctrl+B W to open navigator. Select your investigation workspace.",
        complete: met(objectives, "L4-O1"),
      },
      {
        label: "Receive submission acknowledgement",
        complete: responseReady,
      },
    ],
  };
}

function missionL5(props: GameHudProps): {
  objective: string;
  why: string;
  steps: readonly HudStep[];
} {
  const { objectives } = props;
  return {
    objective: "Triage fresh intake batch and file finding.",
    why: "Morning paperwork delivered INT-RECEIPT-12. Verify the intake batch independently.",
    steps: [
      {
        label: "Create triage workspace for fresh set",
        instruction: "Organize fresh intake in its own workspace without closing previous work.",
        complete: met(objectives, "L5-O5"),
      },
      {
        label: "Arrange and name tabs for intake records",
        instruction: "Set up at least two named tabs for intake documents.",
        complete: met(objectives, "L5-O1"),
      },
      {
        label: "Stage a comparison split",
        instruction: "Split panes to compare records side-by-side.",
        complete: met(objectives, "L5-O2"),
      },
      {
        label: "Direct input to the target pane",
        instruction: "Ensure input focus lands in the declared pane before issuing requests.",
        complete: met(objectives, "L5-O3"),
      },
      {
        label: "File finding on fresh set",
        instruction: "Ask Claude to retrieve intake records and compile the finding.",
        complete: met(objectives, "L5-O4"),
      },
    ],
  };
}

function mission(
  level: number,
  props: GameHudProps,
): {
  objective: string;
  why: string;
  steps: readonly HudStep[];
} {
  switch (level) {
    case 1:
      return missionL1(props);
    case 2:
      return missionL2(props);
    case 3:
      return missionL3(props);
    case 4:
      return missionL4(props);
    default:
      return missionL5(props);
  }
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
        {captured ? "Keys go to the simulated surface. Tab leaves it." : "Keys stay in the page."}
      </span>
    </div>
  );
}

export function GameHud(props: GameHudProps): JSX.Element {
  const {
    releaseButtonRef,
    level,
    objectives,
    hints,
    hintsUsed,
    captured,
    accessible,
    onReturnToTitle,
    onRequestHint,
    onToggleCapture,
    onSetAccessible,
  } = props;
  const { objective, why, steps } = mission(level, props);
  const nextStep = steps.findIndex((step) => !step.complete);
  const metCount = objectives.filter((objective) => objective.met).length;

  return (
    <header className="game-hud" aria-label="Investigation objectives">
      <div className="game-hud-top">
        <div className="game-hud-brand">
          <h1 className="game-hud-title">Episode I · Level {level}</h1>
          {onReturnToTitle ? (
            <button
              type="button"
              className="hud-return-btn"
              onClick={onReturnToTitle}
              title="Return to title"
            >
              Title
            </button>
          ) : null}
          <p className="objectives-quiet" aria-live="polite">
            {metCount} of {objectives.length} Herdr skills shown
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
              onChange={(event) => onSetAccessible(event.target.checked)}
            />
            Accessible navigation
          </label>
          <details className="hints-quiet">
            <summary>Hints{hintsUsed > 0 ? " (used)" : " (optional)"}</summary>
            <div className="hints-body">
              <ol>
                {hints.map((hint, index) => (
                  <li key={index}>{hint}</li>
                ))}
              </ol>
              <button type="button" onClick={onRequestHint}>
                Request a hint
              </button>
            </div>
          </details>
        </div>
      </div>

      <section className="game-hud-mission" aria-labelledby="mission-objective">
        <p id="mission-objective" className="mission-why">
          <strong>Objective:</strong> {objective}
        </p>
        <p className="mission-why">
          <strong>Why:</strong> {why}
        </p>
        <ol className="mission-steps">
          {steps.map((step, index) => {
            const complete = step.complete || props.responseReady;
            return (
              <li
                key={step.label}
                className={complete ? "mission-step is-complete" : "mission-step"}
                aria-label={complete ? `Complete: ${step.label}` : step.label}
              >
                {complete ? (
                  <s>{step.label}</s>
                ) : (
                  <>
                    <span className="hud-step-heading">{step.label}</span>
                    {step.instruction && (accessible || index === nextStep) ? (
                      <span className="hud-step-instruction">{step.instruction}</span>
                    ) : null}
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </header>
  );
}
