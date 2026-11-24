import { useEffect, useRef, useState } from "react";
import styles from "./CinematicPlayer.module.css";

export type CinematicPlayerProps = {
  readonly title: string;
  readonly src: string;
  readonly poster: string;
  readonly vttSrc?: string;
  readonly transcriptText: string;
  readonly onDismiss: () => void;
};

export function CinematicPlayer({
  title,
  src,
  poster,
  vttSrc,
  transcriptText,
  onDismiss,
}: CinematicPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isReducedMotion, setIsReducedMotion] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === " ") {
        // Immediate skip without modal trapping
        event.preventDefault();
        onDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onDismiss]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleReducedMotion = () => {
    setIsReducedMotion((prev) => !prev);
  };

  return (
    <div
      className={styles.overlay}
      role="region"
      aria-label={`Cinematic: ${title}`}
    >
      <header className={styles.topBar}>
        <div className={styles.titleBlock}>
          <span className={styles.docketTag}>The Mandate // Cinematic</span>
          <span>{title}</span>
        </div>
        <div className={styles.controlsGroup}>
          <button
            type="button"
            className={styles.btn}
            onClick={toggleReducedMotion}
            aria-pressed={isReducedMotion}
          >
            Reduced Motion: {isReducedMotion ? "ON" : "OFF"}
          </button>
          {!isReducedMotion && (
            <button
              type="button"
              className={styles.btn}
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            >
              Audio: {isMuted ? "MUTED" : "ACTIVE"}
            </button>
          )}
          <button
            type="button"
            className={`${styles.btn} ${styles.skipBtn}`}
            onClick={onDismiss}
            aria-label="Skip cinematic"
          >
            Skip (Esc / Space)
          </button>
        </div>
      </header>

      <main className={styles.stageArea}>
        {isReducedMotion ? (
          <div className={styles.staticPosterCard}>
            <h1 className={styles.posterTitle}>{title}</h1>
            <div className={styles.posterText}>{transcriptText}</div>
            <button
              type="button"
              className={`${styles.btn} ${styles.skipBtn}`}
              onClick={onDismiss}
            >
              Continue to Workspace
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            className={styles.videoElement}
            src={src}
            poster={poster}
            autoPlay
            playsInline
            muted={isMuted}
            onEnded={onDismiss}
          >
            {vttSrc && (
              <track
                kind="subtitles"
                src={vttSrc}
                srcLang="en"
                label="English Captions"
                default
              />
            )}
            Your browser does not support HTML5 video playback.
          </video>
        )}
      </main>

      <aside className={styles.bottomDrawer}>
        <details className={styles.transcriptDetails}>
          <summary>View Complete Text Transcript</summary>
          <div className={styles.transcriptContent}>{transcriptText}</div>
        </details>
      </aside>
    </div>
  );
}
