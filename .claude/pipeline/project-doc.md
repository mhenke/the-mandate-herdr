# Project Documentation
> Generated: 2026-11-24T17:44:00Z | Mode: DELTA

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
  - `src/core/applications`: Pure deterministic in-terminal agent simulation (simulated Claude Code v1.0.12, child process command loop, document vault, read receipts, and agent states per ADR 0007).
  - `src/core/narrative`: Story state machines, canon episodes, briefings, in-world assignments, and narrative progression triggers.
  - `src/core/assessment`: Learning objective evaluators, evidence provenance tracking, and mastery verification.
- **Adapters (`src/adapters/*`)**: Mediate between the pure simulation cores and the host browser runtime.
  - `investigation-session.ts`: Glues story, assessment, applications, and herdr cores into a unified session. Enforces `InputPolicy` ("standard" | "accessible"), coordinates transitions, and provides dev reload recovery v4.
  - `herdr-browser.ts`: Translates physical browser KeyboardEvents into canonical Herdr `InputEvent`s without losing modifier states.
  - `navigation.ts`: Pure URL path and hash parser with pushState route synchronization and popstate browser traversal without simulation state teardown.
- **UI / Presentation (`src/ui/*`, `src/App.tsx`)**:
  - React components render read-only projections of committed session snapshots.
  - `GameHud.tsx`: Cleanly separated Journalist Cooperative Mission HUD displaying current level objectives, keyboard shortcut guidance, and capture controls above the terminal.
  - `MandatePreview.tsx`: Authentic OneDark terminal projection matching pinned Herdr baseline 08-focus-left and cinematic workspace composition.
  - UI components emit user actions via typed callbacks; zero direct mutation of core simulation or narrative state.

## Folder Structure
- `src/core/herdr/`: Pure deterministic Herdr simulation engine (types, store, keymaps, layouts).
- `src/core/applications/`: Pure deterministic in-terminal agent CLI simulation engine (Claude Code v1.0.12, document vault, read receipts).
- `src/core/narrative/`: Story canon, script runners, and level progression rules.
- `src/core/assessment/`: Objective evaluators, provenance verification, retention gates.
- `src/adapters/`: Browser adapters, keyboard decoders, session orchestrators, recovery persistence.
- `src/ui/`: React presentation components (MandatePreview, scenes, hooks).
- `src/styles/`: Application styles, typography tokens, layout CSS.
- `docs/`: Story bible, design contracts, architectural decision records (ADRs), research baselines.
- `docs/adr/`: Architecture Decision Records (0001 through 0007).
- `tests/`: Vitest test suites (purity, determinism, fidelity, copy reconciliation, fast-check properties).
- `tests/e2e/`: Playwright end-to-end suites (visual parity, smoke journeys, axe accessibility, keyboard policy).
- `public/`: Static assets (cinematic MP4, VTT captions, posters, transcripts).
- `scripts/`: Upstream baseline capture scripts and validation utilities.

## Code Style Conventions
- **Naming**: camelCase for functions, variables, and instances; PascalCase for types, interfaces, and React components; UPPER_SNAKE_CASE for constants.
- **File Naming**: kebab-case for modules and test files (`investigation-session.ts`, `herdr-chrome.test.ts`); PascalCase for React component files (`MandatePreview.tsx`).
- **Immutability**: Readonly data structures throughout (`readonly` array and object properties). Pure reducer functions returning new state references.
- **Type Safety**: Strict TypeScript (`noEmit`, strict null checks, explicit return types where beneficial). No `any` escapes.

## Modularity Practices
- Architectural boundaries enforced by ESLint import rules and a bare-Node purity test (`tests/core-purity.test.ts`).
- `src/core` cannot import from `src/adapters`, `src/ui`, or React.
- `src/adapters` cannot import from `src/ui`.
- `src/ui` renders view models only and delegates all state mutations to session callbacks.

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
  - 20 Vitest test files (**181 unit, property, and fidelity tests**).
  - 7 Playwright test files (**22 E2E, accessibility, navigation, and visual tests passing**).
- Test patterns:
  - Core purity tests (bare Node process invocation).
  - Fast-check generative property tests for navigation, keymaps, layouts, session recovery, assessment provenance, determinism, and chrome routing.
  - Axe accessibility floor verification.
  - End-to-end journey tests with synthetic CDP keystrokes and pointer refusal assertions.
  - Browser history and popstate navigation tests across scenes.
  - Visual parity assertions against upstream Herdr baselines.

## Entry Points
- `index.html`: Web application HTML shell.
- `src/main.tsx`: React DOM client root mounting `App` in `React.StrictMode`.
- `src/App.tsx`: Top-level scene router, session lifecycle, recovery listener, and keyboard capture coordinator.
- `vite.config.ts`: Vite build and development configuration.
- `playwright.config.ts`: Playwright test runner configuration.

## Changed Files
- `GLOSSARY.md` (Domain modeling: added canonical entries for "Simulated Claude Code session", "Bounded task assignment", "Source-handling protocol CPA-01A", "Fresh Herdr session", "Two-curricula model", "Spiral learning progression", "Scaffolding fading rule", "Dual clock system")
- `docs/adr/0007-deterministic-in-terminal-agent-simulation.md` (ADR for simulated Claude Code CLI child processes in fresh Herdr session topology)
- `src/core/applications/index.ts` (Deterministic in-terminal CLI agent simulation, document vault, and read receipts)
- `docs/LEARNING_DESIGN.md` (15-level spiral learning progression map across Curriculum A S01-S12 and Curriculum B A01-A07)
- `docs/LEVEL.md` (Reconciled L1-L15 contracts with Curriculum A/B, fading rules, and dual clock)
- `src/core/herdr/store.ts` (Level 1 starts in a fresh single-pane terminal session in workspace `main`, added new-workspace overlay support)
- `src/core/assessment/index.ts` (Updated objective evaluation for terminal-driven workspace and tab creation)
- `src/adapters/investigation-session.ts` (Recovery v4, in-terminal agent integration, grounded story actions)
- `tests/navigation-properties.test.ts` (Fast-check: navigation roundtrip, URL fuzzing)
- `tests/session-recovery-properties.test.ts` (Fast-check: recovery serde roundtrip, corrupt JSON safety)
- `tests/layout-properties.test.ts` (Fast-check: area conservation, disjoint panes, split ratios)
- `tests/keymap-properties.test.ts` (Fast-check: normalization idempotence, backtab, prefix resolution)
- `tests/assessment-properties.test.ts` (Fast-check: non-player event immunity, objective monotonicity)
- `tests/fictional-applications.test.ts` (Unit tests for in-terminal agent simulation)
- `tests/investigation-l3.test.ts` (Level 3 vertical slice investigation journey test)

## Last Scanned
2026-11-24T17:44:00Z
