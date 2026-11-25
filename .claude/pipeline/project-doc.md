# Project Documentation
> Generated: 2026-11-25T17:08:00Z | Mode: DELTA

## Tech Stack
- Runtime: Node.js >= 22.12.0
- Language: TypeScript 5.9.3
- Framework: React 19.3.1 (React Strict Mode enabled)
- Bundler / Dev Server: Vite 8.3.8
- Testing Frameworks:
  - Unit / Integration / Property: Vitest 5.1.1
  - Property Testing: fast-check 4.11.0
  - Mutation Testing: Stryker 10.1.1
  - End-to-End / Visual / Accessibility: Playwright 1.65.1 with @axe-core/playwright 4.14.0
- Code Quality & Linting:
  - Linter: ESLint 10.15.0 with typescript-eslint 8.74.0, eslint-plugin-react-hooks 7.1.1
  - Styles: Stylelint 18.1.0
  - Formatter: Prettier 3.10.1
  - Dead Code / Hygiene: Knip 6.48.0, Fallow 3.47.0

## Dependencies
- Core / Runtime:
  - `react`: 19.3.1
  - `react-dom`: 19.3.1
- Development & Tooling:
  - `typescript`: 5.9.3
  - `vite`: 8.3.8
  - `@vitejs/plugin-react`: 6.3.0
- Testing & Quality:
  - `vitest`: 5.1.1
  - `fast-check`: 4.11.0
  - `playwright`: 1.65.1
  - `@axe-core/playwright`: 4.14.0
  - `eslint`: 10.15.0
  - `stylelint`: 18.1.0
  - `prettier`: 3.10.1
  - `knip`: 6.48.0
  - `fallow`: 3.47.0
  - `stryker`: 10.1.1

## Architecture Pattern
Hexagonal / Clean Architecture with strict architectural boundaries:
- **Pure Core (`src/core/*`)**: Zero external dependencies (no React, no DOM, no browser globals). Pure functional state transitions over immutable models.
  - `src/core/herdr`: Deterministic simulation of the pinned upstream Herdr multiplexer (workspaces, tabs, panes, process tree, overlays, keymaps).
  - `src/core/applications`: Pure deterministic in-terminal simulation (`index.ts` and `screen.ts`): persistent simulated shell (`pwd`, `ls`, `cd`, `cat`, `clear`, `herdr`, `claude`), simulated Claude Code v2.0.24 under the Cooperative Managed Environment (one-time launch notice, brief context-sensitive limitation replies, per-pane conversational memory for follow-ups, token relevance document vault, read receipts, line-editing engine), and pure `TerminalScreenModel` span data (ADR 0007).
  - `src/core/narrative`: Story state machines for Episode I (L1–L5: opening desk triage, SOC comparison, Theo Park consent interview, VN-12 filing & Quill choice, Retention Checkpoint 1 / Episode I finale), canon episodes, briefings, and narrative progression triggers.
  - `src/core/assessment`: Learning objective evaluators (L1–L5), evidence provenance tracking, and mastery verification.
- **Adapters (`src/adapters/*`)**: Mediate between the pure simulation cores and the host browser runtime.
  - `investigation-session.ts`: Glues story, assessment, applications, and herdr cores into a unified session. Enforces `InputPolicy` ("standard" | "accessible"), coordinates transitions, and provides dev reload recovery v4.
  - `herdr-browser.ts`: Translates physical browser KeyboardEvents into canonical Herdr `InputEvent`s without losing modifier states.
  - `navigation.ts`: Pure URL path and hash parser with pushState route synchronization and popstate browser traversal without simulation state teardown.
- **UI / Presentation (`src/ui/*`, `src/App.tsx`)**:
  - React components render read-only projections of committed session snapshots.
  - `ActionsContext.tsx`: `ActionsProvider` and `useMandateActions()` eliminate prop-drilling across `App.tsx` and deeply nested preview components (`MandatePreview`, `ActiveTabView`, `WorkspaceItem`, `TabButton`).
  - `GameHud.tsx`: Cleanly separated Journalist Cooperative Mission HUD displaying current level objectives (L1–L5), keyboard shortcut guidance, and capture controls above the terminal.
  - `MandatePreview.tsx`: Authentic OneDark terminal projection matching pinned Herdr baselines, single `$ ` prompt line editing, mode bar integration, and `<TerminalScreen />` delegation for active Claude Code panes.
  - `TerminalScreen.tsx` / `TerminalScreen.css`: Dumb read-only React renderer for `TerminalScreenModel` (coral pixel mascot, banner, user blocks, bullets, horizontal rules, inverted cursor, footer).
  - UI components emit user actions via typed actions; zero direct mutation of core simulation or narrative state.

## Folder Structure
- `src/core/herdr/`: Pure deterministic Herdr simulation engine (types, store, keymaps, layouts).
- `src/core/applications/`: Pure deterministic in-terminal shell & Claude Code simulation engine (`index.ts`) and pure screen model (`screen.ts`).
- `src/core/narrative/`: Story canon, script runners, and level progression rules (Episode I L1–L5).
- `src/core/assessment/`: Objective evaluators, provenance verification, retention gates.
- `src/adapters/`: Browser adapters, keyboard decoders, session orchestrators, recovery persistence.
- `src/ui/`: React presentation components (`MandatePreview`, `TerminalScreen`, `GameHud`, `ActionsContext`, `scenes`, hooks).
- `src/styles/`: Application styles, typography tokens, layout CSS.
- `docs/`: Story bible, design contracts, architectural decision records (ADRs), research baselines.
- `docs/adr/`: Architecture Decision Records (0001 through 0007).
- `tests/`: Vitest test suites (25 files: purity, determinism, fidelity, copy reconciliation, L1–L5 journeys, fast-check properties).
- `tests/e2e/`: Playwright end-to-end suites (8 spec files: full Episode I L1–L5 journey, visual parity, smoke journeys, axe accessibility, keyboard policy).
- `public/`: Static assets (cinematic MP4, VTT captions, posters, transcripts).
- `scripts/`: Upstream baseline capture scripts, validation utilities, and `watch-ci.sh` (`pnpm ci:watch`).

## Code Style Conventions
- **Naming**: camelCase for functions, variables, and instances; PascalCase for types, interfaces, and React components; UPPER_SNAKE_CASE for constants.
- **File Naming**: kebab-case for modules and test files (`investigation-session.ts`, `herdr-chrome.test.ts`); PascalCase for React component files (`MandatePreview.tsx`, `ActionsContext.tsx`).
- **Immutability**: Readonly data structures throughout (`readonly` array and object properties). Pure reducer functions returning new state references.
- **Type Safety**: Strict TypeScript (`noEmit`, strict null checks, explicit return types where beneficial). No `any` escapes.

## Modularity Practices
- Architectural boundaries enforced by ESLint import rules and a bare-Node purity test (`tests/core-purity.test.ts`).
- `src/core` cannot import from `src/adapters`, `src/ui`, or React.
- `src/adapters` cannot import from `src/ui`.
- `src/ui` renders view models only and delegates all state mutations to session callbacks via `ActionsContext`.

## Data Architecture
- In-memory event-sourced journal: All state changes in the Herdr simulation are recorded as journal entries with provenance tags (`player`, `script`, `fixture`, `host`).
- Unidirectional snapshot subscriptions: React consumes `InvestigationSnapshot` via `useSyncExternalStore`-style listeners (`useInvestigationSnapshot`).
- Dev-only reload recovery (v4): Stores committed journal events, input policy, and in-terminal application state in `sessionStorage` during dev mode (`import.meta.env.DEV`), replaying state on hot reloads without fabricating learning credit.

## Cross-Cutting Concerns
- **Input & Keyboard Interception**: Authentic Herdr keybindings inside the simulated console. Host capture release control is an accessible external control; Escape is Herdr-owned.
- **Accessibility (WCAG 2.2)**: `axe-core` tests gate all views. Accessible navigation toggle enables pointer chrome modality for motor/assistive accessibility while preserving integrity of keyboard-transfer mastery evaluation.
- **Error Handling**: Provenance assertions and state invariants throw defensive errors in dev/test; UI degrades gracefully with fallbacks (e.g. video fallback to poster + text transcript).

## Service Communication
- Pure client-side static application; no backend server.
- All processes, multiplexer operations, and story engines execute locally in the browser runtime.

## Test Coverage
- Overall coverage: 100% of critical paths across core, adapter, and UI.
- Test suites:
  - 25 Vitest test files (**223 unit, integration, property, and fidelity tests passing**).
  - 8 Playwright test files (**27 E2E, accessibility, navigation, visual, and keyboard policy tests passing**).
- Test patterns used:
  - Core purity tests (bare Node process invocation + TypeScript AST audit).
  - Fast-check generative property tests across 9 files (74 property tests): applications/Claude Code, navigation, keymaps, layouts, session recovery, assessment provenance, determinism, and chrome routing.
  - Axe accessibility floor verification.
  - End-to-end Episode I journey tests (L1–L5) with synthetic CDP keystrokes and pointer refusal assertions.
  - Browser history and popstate navigation tests across scenes.
  - Visual parity assertions against upstream Herdr baselines.

## Entry Points
- `index.html`: Web application HTML shell.
- `src/main.tsx`: React DOM client root mounting `App` in `React.StrictMode`.
- `src/App.tsx`: Top-level scene router, session lifecycle, recovery listener, and keyboard capture coordinator.
- `src/ui/ActionsContext.tsx`: Context provider for UI actions decoupling pointer chrome from prop chains.
- `src/ui/TerminalScreen.tsx`: Read-only renderer for `TerminalScreenModel` Claude Code sessions.
- `scripts/watch-ci.sh`: Post-push GitHub Actions CI watcher (`pnpm ci:watch`).
- `vite.config.ts`: Vite build and development configuration.
- `playwright.config.ts`: Playwright test runner configuration.

## Changed Files
- `src/core/applications/index.ts`: Added persistent simulated shell, Cooperative Managed Environment (one-time launch notice, brief context-sensitive restriction replies), conversational follow-up tracking (`lastReferencedMessageId`, `lastReferencedDocumentId`, `lastTopic`), deduplicated reply wiring (`replyWithAgentLines`), and decomposed routing/launch helpers (`routeFollowUpAndPolicy`, `routeNewsroomDeskRequest`, `routeLevelWorkflowRequest`, `launchClaudeInPane`, `submitShellPane`).
- `src/core/applications/screen.ts`: Added pure `TerminalScreenModel` builder (`buildClaudeScreenModel`, `buildClaudeBanner`, `screenToPlainLines`) with coral pixel mascot and bounded cursor rendering.
- `src/ui/TerminalScreen.tsx` & `src/ui/TerminalScreen.css`: Added dumb React renderer for simulated Claude Code panes.
- `src/ui/GameHud.tsx` & `src/ui/MandatePreview.tsx`: Updated L1–L5 mission HUD (default Herdr workspace start, no premature `CPA-01A` ID) and integrated `<TerminalScreen />`.
- `src/core/narrative/index.ts`, `src/core/assessment/index.ts`, `src/adapters/investigation-session.ts`: Completed Episode I Batch 1 (L4 "Filed 19:05" & L5 "Fit to File") and L1–L4 terminal-first gameplay alignment.
- `tests/applications-properties.test.ts`: Added 8 `fast-check` property tests for simulated Claude Code, managed environment, line editing, pane isolation, and screen model.
- `tests/fictional-applications.test.ts`, `tests/investigation-l1.test.ts`, `tests/investigation-l4.test.ts`, `tests/investigation-l5.test.ts`, `tests/specification-boundaries.test.ts`, `tests/e2e/episode-1-journey.spec.ts`: Added coverage for Managed Environment behavior, conversational follow-ups, and full L1–L5 Episode I progression.
- `scripts/watch-ci.sh`, `package.json`, `AGENTS.md`: Added `pnpm ci:watch` post-push CI monitoring workflow.
- `GLOSSARY.md` & `docs/README.md`: Added **Cooperative Managed Environment**, refreshed **Simulated Claude Code session**, and indexed ADR-0007.

## Last Scanned
2026-11-25T17:08:00Z
