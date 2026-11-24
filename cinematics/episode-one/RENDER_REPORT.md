# Render & Audit Report — Episode I Cold Open Cinematic (HyperFrames POC)

**Date:** 2026-11-23  
**Project:** The Mandate — Episode I: The Leak (Cold Open Cinematic)  
**Location:** `cinematics/episode-one`  
**Output Target:** `public/cinematics/episode-one/cold-open.mp4`

---

## 1. Executive Summary

The cold-open cinematic for Episode I ("The Leak") has been authored, verified, and rendered offline using HyperFrames 0.9.86. The final deliverable is an austere, 25.0-second 1920×1080 30fps progressive H.264 silent MP4 adhering to the aesthetic of an investigative political thriller.

All product-ad and SaaS tropes (rounded floating cards, mint accents, bouncy spring reveals, and modal banners) have been eliminated. Artificial gradient overlays (`#grade` and `#vignette`) and container blur filters were removed, resolving the transition contrast flash and establishing consistent photographic lighting throughout. Transitions are executed via uniform dips to black across a single continuous timeline.

The Impeccable review recommendations were fully applied: volumetric rain depth passes in Beat 1, hardened transparent editorial classification stamp in Beat 2, grounded physical dossier framing with 34px/28px rule hierarchy in Beat 3, and diegetic status bar integration for `YOUR DESK IS LIVE` in Beat 4.

The composition passed all mechanical and technical checks (`impeccable detect` = 0 issues, HyperFrames = 0 errors, 54/54 contrast tests passed).

---

## 2. Environment & Toolchain Versions

- **HyperFrames:** 0.9.86 (pinned local installation in `cinematics/episode-one/package.json`)
- **GSAP:** 3.14.2 (bundled locally at `assets/vendor/gsap.min.js`, zero external CDN dependencies)
- **Browser:** Google Chrome (`/usr/bin/google-chrome`, version 158.0.8127.36)
- **FFmpeg / FFprobe:** 6.1.1-3ubuntu5 (`/usr/bin/ffmpeg`, `/usr/bin/ffprobe`)
- **Node.js / npm:** Node v24.22.2, npm 11.19.1
- **Platform:** Linux x86_64

---

## 3. Composition Architecture & Timeline (25.0s Total)

- **Root:** `index.html` (`data-composition-id="main"`, 1920×1080, 30fps, duration 25.0s, single track `data-track-index="0"`)
- **Scene 1 (0.0s – 7.0s):** `compositions/title.html` (`scene-title`)
  - Establishing shot: Rainy Capitol Avenue at night (`assets/capitol-avenue.webp`) on locked tripod (zero pan, zero zoom drift).
  - Procedural deterministic volumetric rain: dual-pass mulberry32 PRNG (160 background mist drops + 32 foreground heavy lens streaks) with continuous coordinate wrapping.
  - High-contrast lower-left documentary teletype docket (`WASHINGTON, D.C. / CAPITOL AVENUE // 23:47 EST / PRECIPITATION: CONTINUOUS`) with dedicated dark backing placard and amber accent border.
  - Imposing bone-white title lockup (`THE MANDATE`) with dedicated archival classification placard for `EPISODE ONE // THE LEAK` (36px bold bone-white, amber `//` slash accent, dark slate backing).
  - **Stationary Hold:** 4.7s dead-still hold from 2.0s to 6.7s (`data-hold`).
  - Clean uniform dip to black (`0.28s`).
- **Scene 2 (7.0s – 13.5s):** `compositions/briefing.html` (`scene-briefing`)
  - Cooperative desk plate (`assets/cooperative-desk.webp`) on locked tripod camera.
  - Atmospheric window rain: exterior rain streaks falling across the night sky over the illuminated Capitol dome, plus slow glass condensation trickles with head beads running down the pane.
  - Editorial wire dispatch docket (`[ OFF-RECORD // RESTRICTED ]` transparent stamp, sender, recipient, subject, and reference metadata).
  - Subject: *"A source has come forward on a vendor security incident. Confirm what is known before contact."*
  - **Stationary Hold:** 5.3s dead-still reading hold from 0.9s to 6.2s (`data-hold`).
  - Clean uniform dip to black (`0.28s`).
- **Scene 3 (13.5s – 19.0s):** `compositions/memo.html` (`scene-memo`)
  - Standing Source-Handling Memorandum (CPA Protocol 01-A) with grounded border and 3 rules:
    - `01 // VERIFY ORIGIN.` (34px bold header / 28px description: Establish where a claim was first observed.)
    - `02 // PRESERVE ATTRIBUTION.` (34px bold header / 28px description: Protect identity; attribute only what was shared.)
    - `03 // ASSUME NOTHING CONFIRMED.` (34px bold header / 28px description: A tip is a lead; not confirmation.)
  - **Stationary Hold:** 4.5s dead-still reading hold from 0.7s to 5.2s (`data-hold`).
  - Clean uniform dip to black (`0.28s`).
- **Scene 4 (19.0s – 25.0s):** `compositions/workspace.html` (`scene-workspace`)
  - Authentic Herdr 0.9.5 TUI projection matching upstream baselines (`01-initial-layout.png`, `04-prefix-pending.png`, `08-focus-left.png`):
    - Left sidebar (26 cols width): `spaces` section with selected `the-mandate` (`main` branch) and pink status dot; `new · menu` divider; `agents grouped` section with active `the-mandate` operatives (`stringer`, `codex`); collapse toggle `«`.
    - Top tab bar: active tab ` 1 ` in periwinkle `#89b4fa` block with bold dark text; add tab button `+`.
    - Split terminal panes: focused left pane with periwinkle border `#89b4fa` (Assignment terminal: `$ cat assignment.txt`, June Adebayo dispatch lines, `$ herdr accept-assignment`, and `YOUR DESK IS LIVE. CREDENTIAL VERIFIED.`); unfocused right pane with slate border `#4b5263` (Interview terminal: Source-Handling Memorandum protocols).
    - Authentic bottom mode bar (Row 40 in Herdr): `PREFIX` periwinkle badge, `esc cancel`, `ctrl+b send prefix`, `w workspace nav`, `? keybinds`, and workspace/panes telemetry.
  - **Stationary Hold:** Clean hold from 1.5s to 6.0s with active block cursor blink (`█`). Holds frame directly into the playable game state.

---

## 4. Verification Gate Results

### Impeccable Anti-Pattern Detection:
```bash
/home/mhenke/.gemini/config/skills/impeccable/scripts/impeccable detect --json cinematics/episode-one/compositions/*.html
```
- **Exit Code:** `0`
- **Findings:** `0` issues.

### HyperFrames Audit:
```bash
npx --no-install hyperframes@0.9.86 check --json
```
- **Check Artifact:** `.hyperframes/artifacts/checks/dbb47f7a-39ef-46d1-8751-99dfe8094a8d.json`
- **Overall Verdict:** `Overall OK: True`
- **Subsystem Breakdown:**
  - **Lint:** `ok: true`, 0 errors, 0 warnings.
  - **Runtime:** `ok: true`, 0 errors, 0 warnings.
  - **Layout:** `ok: true`, 0 errors, 0 warnings (0 overflow, 0 text clip).
  - **Motion:** `ok: true`, 0 errors, 0 warnings.
  - **Contrast:** `ok: true`, 0 errors, 0 warnings (**54/54 elements passed WCAG AAA**).
  - **Craft:** `ok: true`, 0 errors, 1 intentional warning (`film_silent` accepted).

---

## 5. Render Validation (`ffprobe`)

```bash
ffprobe -hide_banner public/cinematics/episode-one/cold-open.mp4
```

- **File:** `public/cinematics/episode-one/cold-open.mp4`
- **Duration:** `25.000000` seconds (750 frames)
- **Dimensions:** 1920 × 1080 (16:9 widescreen)
- **Frame Rate:** 30.0 fps progressive
- **Video Codec:** H.264 / AVC (High Profile, yuv420p, bt709, CRF 16)
- **Bitrate:** ~4864 kb/s
- **Audio Stream:** None (0 audio streams, verified silent)

---

## 6. Deliverable Artifacts

| Deliverable | Path | Description |
|---|---|---|
| **Master MP4** | [cold-open.mp4](file:///home/mhenke/Projects/the-mandate/.worktrees/episode-one-cold-open/public/cinematics/episode-one/cold-open.mp4) | 25.0s 1080p 30fps silent H.264 video |
| **Poster Still** | [cold-open-poster.png](file:///home/mhenke/Projects/the-mandate/.worktrees/episode-one-cold-open/public/cinematics/episode-one/cold-open-poster.png) | 1920×1080 still (captured at t=3.5s title beat) |
| **WebVTT Captions** | [cold-open.vtt](file:///home/mhenke/Projects/the-mandate/.worktrees/episode-one-cold-open/public/cinematics/episode-one/cold-open.vtt) | External WebVTT subtitle track matching dialogue beats |
| **Transcript** | [cold-open.txt](file:///home/mhenke/Projects/the-mandate/.worktrees/episode-one-cold-open/public/cinematics/episode-one/cold-open.txt) | Plain-text transcript with 25s timestamps |
| **Audit Report** | [RENDER_REPORT.md](file:///home/mhenke/Projects/the-mandate/.worktrees/episode-one-cold-open/cinematics/episode-one/RENDER_REPORT.md) | This document |
| **Critique Snapshot** | [2026-11-23T22-00-02Z__cinematics-episode-one-index-html.md](file:///home/mhenke/Projects/the-mandate/.worktrees/episode-one-cold-open/.impeccable/critique/2026-11-23T22-00-02Z__cinematics-episode-one-index-html.md) | Archived Impeccable Critique review |

### Review Frames:
Stored at `/tmp/opencode/coldopen-frames/`:
- `start.png` (t=2.5s: establishing city plate + volumetric rain + high-contrast docket + title)
- `middle.png` (t=10.0s: Cooperative editorial assignment card + transparent classification stamp)
- `memo.png` (t=16.0s: Grounded Source-Handling Memo card with 34px/28px rule hierarchy)
- `end.png` (t=22.0s: Herdr terminal workspace mock with native status bar prompt)
