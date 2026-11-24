# The Mandate — Episode I Cold Open Cinematic (HyperFrames POC)

This directory contains the HyperFrames source and local asset pipeline for The Mandate's Episode I cold-open cinematic proof-of-concept.

## Deliverables

Outputs are rendered into `../../public/cinematics/episode-one/`:
- `cold-open.mp4`: 18.0s 1920×1080 30fps H.264 video (silent by design)
- `cold-open-poster.png`: 1920×1080 still image for video poster and reduced-motion fallback
- `cold-open.vtt`: WebVTT subtitle track mirroring the six caption beats
- `cold-open.txt`: Plain-text transcript

## Project Structure

- `index.html`: Root composition (`main`, 1920×1080, 30fps, 18s duration)
- `compositions/title.html`: Scene 1 — Washington D.C., Capitol Avenue establishing shot with procedural deterministic canvas rain
- `compositions/briefing.html`: Scene 2 — Cooperative desk feed, incoming envelope card from June Adebayo
- `compositions/memo.html`: Scene 3 — Source-Handling Memo (three standing rules)
- `compositions/workspace.html`: Scene 4 — Herdr simulated workspace mock (panes, tabs, incoming assignment banner)
- `compositions/captions.html`: Closed captions track (track kind `captions`, 6 groups)
- `assets/`: Background plates (`capitol-avenue.webp`, `cooperative-desk.webp`) and bundled vendor libraries (`assets/vendor/gsap.min.js`)
- `hyperframes.json`: HyperFrames configuration
- `RENDER_REPORT.md`: Audit and validation report

## Reproducible Commands

All commands run inside `cinematics/episode-one/`:

### 1. Check & Lint Verification
```bash
npx --no-install hyperframes@0.9.86 check --json
```

### 2. Capture Verification Snapshots
```bash
npx --no-install hyperframes@0.9.86 snapshot --at 1,3,5,8,12,14.8,17
```

### 3. Render Output MP4
```bash
HYPERFRAMES_BROWSER_PATH=/usr/bin/google-chrome npx --no-install hyperframes@0.9.86 render --quality looks -o ../../public/cinematics/episode-one/cold-open.mp4
```

### 4. Extract Validation Frames & Poster
```bash
# Poster still
ffmpeg -y -ss 00:00:03.000 -i ../../public/cinematics/episode-one/cold-open.mp4 -frames:v 1 ../../public/cinematics/episode-one/cold-open-poster.png

# Frame validation suite
mkdir -p /tmp/opencode/coldopen-frames
ffmpeg -y -ss 00:00:00.500 -i ../../public/cinematics/episode-one/cold-open.mp4 -frames:v 1 /tmp/opencode/coldopen-frames/start.png
ffmpeg -y -ss 00:00:09.000 -i ../../public/cinematics/episode-one/cold-open.mp4 -frames:v 1 /tmp/opencode/coldopen-frames/middle.png
ffmpeg -y -ss 00:00:17.500 -i ../../public/cinematics/episode-one/cold-open.mp4 -frames:v 1 /tmp/opencode/coldopen-frames/end.png
```
