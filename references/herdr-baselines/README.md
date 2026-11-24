# Herdr Reference Captures & Upstream Baselines

This directory contains interface reference artifacts for **The Mandate: Herdr**, divided into authoritative upstream baselines, full terminal transcripts, narrative transcripts, and illustrative references.

---

## 1. Pinned Upstream Herdr Baselines (32 States)

All 32 baseline states are located directly in this directory (`references/herdr-baselines/`). Every state includes a 1200×800 PNG screenshot, an exact 40-line tmux terminal transcript (`.txt`), and SHA-256 hash provenance recorded in [`manifest.json`](./manifest.json).

- **Upstream Commit**: `e8d7d9705a7a2c89cef4dd42079379f05685af87` (v0.9.5)
- **Binary Build**: Clean upstream checkout with Cargo `--release --locked --offline` and Zig 0.16.0
- **Binary SHA-256**: `85df1850d2c3b34f9ec0aad2c46fd5c806f6b48a0481a6afc74acb4294e09ee1`
- **Capture Environment**: Isolated named session (`--session capture-<id>`) inside Ghostty 1.3.1 (1200×800, DejaVu Sans Mono 13pt) on a private Xvfb display.

### Transcripts & Manifest
- **Combined Terminal Transcripts (Plain Text)**: [`combined-transcripts.txt`](./combined-transcripts.txt) — all 32 states' 40-line screen outputs concatenated with state headers.
- **Combined Terminal Transcripts (Markdown Viewer)**: [`transcripts.md`](./transcripts.md) — formatted markdown document with expandable terminal screens for all 32 states.
- **Provenance Manifest**: [`manifest.json`](./manifest.json) — state registry, SHA-256 hashes, terminal dimensions, and key bindings.

| State Index & Name | File Links | Description |
| :--- | :--- | :--- |
| `00-default` | [PNG](./00-default.png) · [TXT](./00-default.txt) | Default launch screen |
| `01-initial-layout` | [PNG](./01-initial-layout.png) · [TXT](./01-initial-layout.txt) | Initial single pane and status line |
| `02-sidebar` | [PNG](./02-sidebar.png) · [TXT](./02-sidebar.txt) | Expanded workspace sidebar (`C-b b`) |
| `03-mode-bar` | [PNG](./03-mode-bar.png) · [TXT](./03-mode-bar.txt) | Status mode bar indicator |
| `04-prefix-pending` | [PNG](./04-prefix-pending.png) · [TXT](./04-prefix-pending.txt) | Prefix indicator active (`C-b`) |
| `05-copy-mode` | [PNG](./05-copy-mode.png) · [TXT](./05-copy-mode.txt) | Vi copy mode active (`C-b [`) |
| `06-help` | [PNG](./06-help.png) · [TXT](./06-help.txt) | Full keybinding help modal (`C-b ?`) |
| `07-help-filtered` | [PNG](./07-help-filtered.png) · [TXT](./07-help-filtered.txt) | Help modal filtered by query (`/split`) |
| `08-focus-left` | [PNG](./08-focus-left.png) · [TXT](./08-focus-left.txt) | Focus navigation to left pane (`C-b h`) |
| `09-split-down` | [PNG](./09-split-down.png) · [TXT](./09-split-down.txt) | Horizontal pane split (`C-b -`) |
| `10-new-tab` | [PNG](./10-new-tab.png) · [TXT](./10-new-tab.txt) | New tab prompt dialog (`C-b c`) |
| `11-rename-tab` | [PNG](./11-rename-tab.png) · [TXT](./11-rename-tab.txt) | Tab rename modal field (`C-b T`) |
| `12-named-tabs` | [PNG](./12-named-tabs.png) · [TXT](./12-named-tabs.txt) | Committed tab names |
| `13-zoom` | [PNG](./13-zoom.png) · [TXT](./13-zoom.txt) | Zoomed pane state (`C-b z`) |
| `14-sidebar-compact` | [PNG](./14-sidebar-compact.png) · [TXT](./14-sidebar-compact.txt) | Compact sidebar mode (`C-b b`) |
| `15-new-workspace` | [PNG](./15-new-workspace.png) · [TXT](./15-new-workspace.txt) | New workspace created (`C-b N`) |
| `15b-rename-workspace` | [PNG](./15b-rename-workspace.png) · [TXT](./15b-rename-workspace.txt) | Workspace rename dialog (`C-b W`) |
| `16-workspace-navigation` | [PNG](./16-workspace-navigation.png) · [TXT](./16-workspace-navigation.txt) | Workspace picker modal (`C-b w`) |
| `17-goto` | [PNG](./17-goto.png) · [TXT](./17-goto.txt) | Global session navigator (`C-b g`) |
| `18-goto-search` | [PNG](./18-goto-search.png) · [TXT](./18-goto-search.txt) | Search inside session navigator |
| `19-goto-blocked` | [PNG](./19-goto-blocked.png) · [TXT](./19-goto-blocked.txt) | Filtered to blocked agent status |
| `20-copy-search` | [PNG](./20-copy-search.png) · [TXT](./20-copy-search.txt) | Text search prompt inside copy mode |
| `21-copy-selection` | [PNG](./21-copy-selection.png) · [TXT](./21-copy-selection.txt) | Text visual selection highlighting |
| `22-agent-idle` | [PNG](./22-agent-idle.png) · [TXT](./22-agent-idle.txt) | Agent reported state transition (idle) |
| `23-close-confirmation` | [PNG](./23-close-confirmation.png) · [TXT](./23-close-confirmation.txt) | Close pane confirmation overlay (`C-b x`) |
| `24-omp` | [PNG](./24-omp.png) · [TXT](./24-omp.txt) | Real OMP agent running in terminal |
| `25-coding-agents` | [PNG](./25-coding-agents.png) · [TXT](./25-coding-agents.txt) | Split panes with multiple live coding agents |
| `26-opencode-zoom` | [PNG](./26-opencode-zoom.png) · [TXT](./26-opencode-zoom.txt) | Zoomed OpenCode pane view |
| `27-click-new-tab` | [PNG](./27-click-new-tab.png) · [TXT](./27-click-new-tab.txt) | Mouse click on `+` tab hit-target |
| `28-click-new-tab-committed` | [PNG](./28-click-new-tab-committed.png) · [TXT](./28-click-new-tab-committed.txt) | Mouse-created tab renamed & committed |
| `29-click-new-workspace` | [PNG](./29-click-new-workspace.png) · [TXT](./29-click-new-workspace.txt) | Mouse click on `+ New` sidebar hit-target |
| `30-click-new-workspace-committed` | [PNG](./30-click-new-workspace-committed.png) · [TXT](./30-click-new-workspace-committed.txt) | Mouse-created workspace renamed & committed |

---

## 2. Cinematic Narrative Transcripts

- **Episode One Cold Open (25s Paced Cut)**:
  - Text Transcript: [`cold-open-transcript.txt`](./cold-open-transcript.txt)
  - Subtitle Timings (WebVTT): [`cold-open.vtt`](./cold-open.vtt)

---

## 3. Illustrative Reference Captures (Non-Authoritative)

These are **illustrative references only — never fidelity authority.** The iron rule stands: the pinned upstream source (`e8d7d9705a7a2c89cef4dd42079379f05685af87`, docs 0.9.5) and its documentation are the only behavioral and visual authority.

| File | What it shows | Provenance | Permitted use |
| :--- | :--- | :--- | :--- |
| [`herdr-fork-session-blog.jpg`](./herdr-fork-session-blog.jpg) | A Herdr **fork** in use: sidebar (spaces + agents with state rows), tab bar, three panes with named agents (`Codex: layout`, `Claude: review`, `Copilot: tests`), agent status indicators (working/idle/blocked) | Blog screenshot of a community fork demo, 1527×860 | Layout/mood orientation for the visual-regression fixture plan. NOT a baseline: fork chrome may differ from upstream in unknown ways |
| [`termsplit-project-terminals.jpg`](./termsplit-project-terminals.jpg) | A **different product** (TermSplit): project-centric terminal workspaces, notes panel, agent panels | Third-party product screenshot, 1408×860 | Contrast/reference for what The Mandate is NOT. Do not copy its layout |
