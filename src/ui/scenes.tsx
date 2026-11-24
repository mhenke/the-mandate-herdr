// Theatrical scene shells for the L1–L3 slice. Presentation only: every word
// comes from the runtime view model, every transition from its methods.
// Artwork is illustrative scene-setting, never an authentic Herdr baseline.
// Scenes cut, never animate (no motion to reduce).
//
// Two distinct surface treatments:
// - Cinema (cold open): ONE dominant stage on a plain quiet surround. The
//   film and the backdrop are never the same artwork twice.
// - Workspace: full-viewport Herdr-style chrome (sidebar left full height,
//   tabs top-right of the main area, compact pane headers, bottom mode bar),
//   no rounded dashboard card, no max-width squeeze.

import { useEffect, useState, type JSX, type ReactNode } from "react";

function CinemaShell({
  labelledBy,
  children,
}: {
  readonly labelledBy: string;
  readonly children: ReactNode;
}): JSX.Element {
  return (
    <div className="cinema">
      <div className="cinema-card" role="region" aria-labelledby={labelledBy}>
        {children}
      </div>
    </div>
  );
}

function SceneShell({
  imageUrl,
  labelledBy,
  children,
}: {
  readonly imageUrl?: string;
  readonly labelledBy: string;
  readonly children: ReactNode;
}): JSX.Element {
  return (
    <div className="scene">
      {imageUrl ? (
        <div
          className="scene-bg"
          style={{ backgroundImage: `url("${imageUrl}")` }}
          aria-hidden="true"
        />
      ) : (
        <div className="scene-bg scene-bg-plain" aria-hidden="true" />
      )}
      <div className="scene-card" role="region" aria-labelledby={labelledBy}>
        {children}
      </div>
    </div>
  );
}

/**
 * Optional cinematic enhancement. Never required: the still + text + Skip is
 * the complete experience until the asset lands. Muted, no autoplay, player
 * initiates playback; Skip is available from frame 0 and video end lands in
 * the workspace via the runtime skip (no credit from playback or skip).
 * Missing/failed/stalled video and reduced-motion all fall back to the still.
 */
function CinematicPlayer({
  src,
  poster,
  captions,
  label,
  onEnded,
}: {
  readonly src: string;
  readonly poster: string;
  readonly captions?: string;
  readonly label: string;
  readonly onEnded?: () => void;
}): JSX.Element {
  const [failed, setFailed] = useState(false);
  const [stalled, setStalled] = useState(false);
  const prefersReduced =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (failed || stalled || prefersReduced) {
    return <img className="scene-poster" src={poster} alt="" data-fallback="still" />;
  }
  return (
    <video
      className="scene-video"
      src={src}
      poster={poster}
      muted
      playsInline
      preload="metadata"
      controls
      aria-label={label}
      onError={() => setFailed(true)}
      onStalled={() => setStalled(true)}
      onAbort={() => setFailed(true)}
      onEnded={onEnded}
      data-fallback="video"
    >
      {captions ? <track kind="captions" src={captions} label="English" /> : null}
    </video>
  );
}

function useSceneShortcuts(handler: (key: string, e: KeyboardEvent) => boolean | void): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (handler(e.key.toLowerCase(), e)) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handler]);
}

export function TitleScene({
  title,
  episode,
  canContinue,
  onNew,
  onContinue,
}: {
  readonly title: string;
  readonly episode: string;
  readonly canContinue: boolean;
  readonly onNew: () => void;
  readonly onContinue: () => void;
}): JSX.Element {
  useSceneShortcuts((key) => {
    if (key === "n" || key === "enter") {
      onNew();
      return true;
    }
    if (key === "c" && canContinue) {
      onContinue();
      return true;
    }
  });

  return (
    <SceneShell
      imageUrl="/images/Rainy%20Night%20Avenue%20to%20the%20Capitol-1.webp"
      labelledBy="title-heading"
    >
      <p className="scene-kicker">{episode} · November 12, 2026</p>
      <h1 id="title-heading">{title}</h1>
      <p className="scene-lede">
        Washington, November 2026. You are a credentialed stringer in a journalist cooperative. A
        source has provided information about a vendor security incident — verify it without burning
        the source.
      </p>
      <div className="scene-actions">
        <button type="button" autoFocus onClick={onNew} aria-keyshortcuts="N">
          <span className="key-badge" aria-hidden="true">
            N
          </span>{" "}
          New investigation
        </button>
        {canContinue ? (
          <button type="button" onClick={onContinue} aria-keyshortcuts="C">
            <span className="key-badge" aria-hidden="true">
              C
            </span>{" "}
            Continue investigation
          </button>
        ) : null}
      </div>
      <p className="scene-note">
        Keyboard required. Capture stays under your control: Tab always leaves the simulated
        surface, and a release control sits beside it.
      </p>
    </SceneShell>
  );
}

export function ColdOpenScene({
  text,
  transcript,
  episode,
  cinematic,
  onSkip,
}: {
  readonly text: string;
  readonly transcript: string;
  readonly episode: string;
  readonly cinematic?: {
    readonly src: string;
    readonly poster: string;
    readonly captions?: string;
  };
  readonly onSkip: () => void;
}): JSX.Element {
  const [videoEnded, setVideoEnded] = useState(false);

  useSceneShortcuts((key) => {
    if (key === "s" || key === " " || key === "escape" || key === "enter") {
      onSkip();
      return true;
    }
  });

  return (
    <CinemaShell labelledBy="coldopen-stage">
      <div className="cinema-header">
        <span className="cinema-kicker" id="coldopen-stage">
          {episode} · Cold Open
        </span>
        <span className="cinema-date">November 12, 2026 // 23:47 EST</span>
      </div>
      {cinematic ? (
        <div className="cinema-stage">
          <CinematicPlayer
            src={cinematic.src}
            poster={cinematic.poster}
            captions={cinematic.captions}
            label="Episode one cold open film"
            onEnded={() => setVideoEnded(true)}
          />
        </div>
      ) : null}
      <div className="cinema-row">
        <button
          type="button"
          className="cinema-primary"
          onClick={onSkip}
          autoFocus
          aria-keyshortcuts="S"
        >
          <span className="key-badge" aria-hidden="true">
            S
          </span>{" "}
          {videoEnded ? "Go to terminal" : "Skip to the workspace"}
        </button>
      </div>
      <div className="cinema-transcript-body" role="region" aria-label="Cold open transcript">
        <p className="cinema-transcript-lede">{text}</p>
        <p className="cinema-transcript-full">{transcript}</p>
      </div>
    </CinemaShell>
  );
}

export function EpisodeScene({
  text,
  onAdvance,
  onSkip,
}: {
  readonly text: string;
  readonly onAdvance: () => void;
  readonly onSkip: () => void;
}): JSX.Element {
  useSceneShortcuts((key) => {
    if (key === "c" || key === "enter") {
      onAdvance();
      return true;
    }
    if (key === "s") {
      onSkip();
      return true;
    }
  });

  return (
    <SceneShell
      imageUrl="/images/Rainy%20Night%20Intelligence%20Workspace-3.webp"
      labelledBy="episode-heading"
    >
      <p className="scene-kicker">Episode I · November 12, 2026 · the night desk</p>
      <h2 id="episode-heading">{text}</h2>
      <p className="scene-lede">
        Curiosity first. A credible tip becomes a dangerous investigation — if you verify it
        properly.
      </p>
      <div className="scene-actions">
        <button type="button" autoFocus onClick={onAdvance} aria-keyshortcuts="C">
          <span className="key-badge" aria-hidden="true">
            C
          </span>{" "}
          Continue
        </button>
        <button type="button" className="scene-skip-inline" onClick={onSkip} aria-keyshortcuts="S">
          <span className="key-badge" aria-hidden="true">
            S
          </span>{" "}
          Skip to the workspace
        </button>
      </div>
    </SceneShell>
  );
}

export function BriefingScene({
  episode,
  date,
  briefing,
  onOpen,
  onSkip,
}: {
  readonly episode: string;
  readonly date: string;
  readonly briefing: string;
  readonly onOpen: () => void;
  readonly onSkip: () => void;
}): JSX.Element {
  useSceneShortcuts((key) => {
    if (key === "o" || key === "enter") {
      onOpen();
      return true;
    }
    if (key === "s") {
      onSkip();
      return true;
    }
  });

  return (
    <SceneShell
      imageUrl="/images/Rainy%20Capitol%20Desk%20Investigation-5.webp"
      labelledBy="briefing-heading"
    >
      <p className="scene-kicker">
        {episode} · {date}
      </p>
      <h2 id="briefing-heading">Incoming assignment</h2>
      <p className="scene-lede">{briefing}</p>
      <div className="scene-actions">
        <button type="button" autoFocus onClick={onOpen} aria-keyshortcuts="O">
          <span className="key-badge" aria-hidden="true">
            O
          </span>{" "}
          Open the workspace
        </button>
        <button type="button" className="scene-skip-inline" onClick={onSkip} aria-keyshortcuts="S">
          <span className="key-badge" aria-hidden="true">
            S
          </span>{" "}
          Skip to the workspace
        </button>
      </div>
      <p className="scene-note">
        From June Adebayo, cooperative editor. Quill stays out of the copy; nothing here is
        independent confirmation yet.
      </p>
    </SceneShell>
  );
}

export function ResponseScene({
  text,
  onContinue,
}: {
  readonly text: string;
  readonly onContinue: () => void;
}): JSX.Element {
  useSceneShortcuts((key) => {
    if (key === "c" || key === "enter") {
      onContinue();
      return true;
    }
  });

  return (
    <SceneShell
      imageUrl="/images/Rainy%20Night%20Intelligence%20Workspace-3.webp"
      labelledBy="response-heading"
    >
      <p className="scene-kicker">The desk answers</p>
      <h2 id="response-heading">Filed</h2>
      <p className="scene-lede">{text}</p>
      <div className="scene-actions">
        <button type="button" autoFocus onClick={onContinue} aria-keyshortcuts="C">
          <span className="key-badge" aria-hidden="true">
            C
          </span>{" "}
          Continue the investigation
        </button>
      </div>
    </SceneShell>
  );
}

export function CompleteScene({ onReturn }: { readonly onReturn: () => void }): JSX.Element {
  useSceneShortcuts((key) => {
    if (key === "r" || key === "enter") {
      onReturn();
      return true;
    }
  });

  return (
    <SceneShell labelledBy="complete-heading">
      <p className="scene-kicker">End of the preview slice</p>
      <h2 id="complete-heading">The preview ends here</h2>
      <p className="scene-lede">
        The L1–L3 slice continues in later scope. Your attempt stays in memory until you start a new
        investigation.
      </p>
      <div className="scene-actions">
        <button type="button" autoFocus onClick={onReturn} aria-keyshortcuts="R">
          <span className="key-badge" aria-hidden="true">
            R
          </span>{" "}
          Return to the title screen
        </button>
      </div>
    </SceneShell>
  );
}
