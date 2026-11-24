# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users, equally weighted: a thriller player who wants a playable investigation (learning the interface should feel incidental, not tutorial-shaped) and a learner evaluating/adopting Herdr, the real terminal workspace the game simulates. Both must be served by the same experience; neither audience is primary over the other.

## Product Purpose

The Mandate: Herdr is a keyboard-first browser political thriller that teaches authentic Herdr workflows. The player is a credentialed stringer in Washington, November 2026, investigating an election-security incident using a faithful simulation of Herdr (pinned upstream commit `e8d7d9705a7a2c89cef4dd42079379f05685af87`, v0.9.5). Success means: a player completes the playable slice by performing real interface operations with action provenance — never by pressing keys blindly — and comes away able to use the actual Herdr tool.

## Positioning

The mechanism a competitor could not truthfully copy: the game's central mystery is constructed from **true facts that support misleading interpretations** (three reports that share one origin), and every interface operation the player performs is a faithful reproduction of pinned Herdr behavior — the workflow the player learns is the same workflow the story weaponizes. Interface mastery and plot are one system, not a tutorial bolted to a story.

## Operating Context

- Runs in a desktop browser with a physical keyboard; keyboard-first interaction throughout.
- Behavioral authority: `docs/HERDR_FIDELITY.md` and `docs/HERDR_RESEARCH.md`, verified against the pinned upstream commit. No invented bindings; Escape inside the simulated TUI is Herdr-owned; keyboard capture uses a separate accessible external release control.
- Browser support claims are evidence-based: synthetic Chromium input plus limited physical observations; Firefox unmeasured (accepted risk, must stay visible in release notes).
- Cinematic presentation is produced offline (HyperFrames, local MP4 assets) and stays out of the application runtime; cinematics are skippable, captioned, reduced-motion compatible, and never gate objective credit.
- Story canon lives in `docs/STORY_BIBLE.md`, `docs/STORY_ARC.md`, `docs/NARRATIVE_DESIGN.md`, `docs/LEVEL.md`; when these disagree with code, the escalation rule applies (stop and report, never pick silently).

## Capabilities and Constraints

- Current authorized scope: M2 — L1–L3 vertical slice (Episode I opening). L4–L15 require separate approval; no early reveals of the common-root/VN-12 twist or later-episode content.
- Objective completion requires player-action provenance (committed before/after state + player journal evidence); scripted, cinematic, or story-control actions never grant skill credit.
- Continue/resume is in-memory only until the deferred M3 persistence work; no save library.
- Audio is optional, off until the player initiates playback, and never carries story information unavailable in text.
- Copy-cache restoration across focus changes and copy search fidelity are deferred; current search is a stub and must not be presented as faithful.
- Stack is minimal: React (presentation only) + CSS + deterministic TypeScript core subscribed via `useSyncExternalStore`; no additional libraries without a concrete requirement and user approval.

## Brand Commitments

- Title: "The Mandate: Herdr". Episode I: THE LEAK. Setting: Washington DC, November 2026.
- Voice: the procedural-thriller register already established in the story bible (paper-native character voices — Adebayo, Beck, Vane; dry, precise, no sales language) is binding for in-world copy.
- Concept artwork in `images/` (rainy Capitol avenue, cooperative desk, intelligence workspace) is illustrative fiction support only — never an upstream Herdr visual baseline and never presented as authentic interface truth.

## Evidence on Hand

- Story canon and design docs in `docs/` (story bible, arc, narrative design, level contracts, learning design, fidelity/research with pinned source citations).
- Six concept images in `images/` (webp) plus earlier `assets/images/` set; conspiracy-board and hearing-room images are reserved for later episodes (spoiler risk).
- A pinned, locally built upstream Herdr binary at `/tmp/opencode/the-mandate-research/herdr/target/release/herdr` for research and future baseline captures; real upstream screenshot baselines with full provenance are still pending.
- Playable L1 sequence (title → cold open → briefing → workspace → earned response) implemented with 30+ passing runtime tests, including provenance and false-credit regressions; browser E2E coverage still thin (single smoke spec).

## Product Principles

1. The story creates the need; Herdr enables the action; the discovery responds. No operation exists for its own sake.
2. Fidelity over convenience: simulated behavior may deviate from upstream only with a recorded, justified shortcut — never silently, never for teaching convenience.
3. Provenance is the integrity contract: what the player did must be provable from committed state, or it did not happen.
4. Mystery is staged, not narrated: the player investigates misleading-but-true facts; the reveal lands because they participated in the workflow that caused it.
5. Accessibility is structural: keyboard paths, reduced motion, captions, and the separate capture release are part of the product, not accommodations bolted on.

## Accessibility & Inclusion

- Full keyboard operability is a product requirement, including a visible, reachable capture-release control that never competes with Herdr-owned keys.
- Cinematics and scene transitions must honor `prefers-reduced-motion` and provide text equivalents (captions/transcript); skip must be immediate and available from the first frame.
- An axe-core accessibility floor runs in E2E coverage; color-only status indicators are prohibited in the simulated chrome.
