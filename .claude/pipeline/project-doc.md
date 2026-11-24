# Project Documentation
> Generated: 2026-11-24T17:35:00Z | Mode: DELTA

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
  - `src/core/narrative`: Story state machines, canon episodes, briefings, in-world assignments, and narrative progression triggers.
  - `src/core/assessment`: Learning objective evaluators, evidence provenance tracking, and mastery verification.
- **Adapters (`src/adapters/*`)**: Mediate between the pure simulation cores and the host browser runtime.
  - `investigation-session.ts`: Glues story, assessment, and herdr cores into a unified session. Enforces `InputPolicy` ("standard" | "accessible"), coordinates transitions, and provides dev reload recovery v2.
  - `herdr-browser.ts`: Translates physical browser KeyboardEvents into canonical Herdr `InputEvent`s without losing modifier states.
- **UI / Presentation (`src/ui/*`, `src/App.tsx`)**:
  - React components render read-only projections of committed session snapshots.
  - UI components emit user actions via typed callbacks; zero direct mutation of core simulation or narrative state.

## Folder Structure
- `src/core/herdr/`: Pure deterministic Herdr simulation engine (types, store, keymaps, layouts).
- `src/core/narrative/`: Story canon, script runners, and level progression rules.
- `src/core/assessment/`: Objective evaluators, provenance verification, retention gates.
- `src/adapters/`: Browser adapters, keyboard decoders, session orchestrators, recovery persistence.
- `src/ui/`: React presentation components (MandatePreview, scenes, hooks).
- `src/styles/`: Application styles, typography tokens, layout CSS.
- `docs/`: Story bible, design contracts, architectural decision records (ADRs), research baselines.
- `docs/adr/`: Architecture Decision Records (0001 through 0006).
- `cinematics/`: Offline HyperFrames composition projects (cold open, L3 mission outro) generating static MP4/VTT assets.
- `tests/`: Vitest test suites (purity, determinism, fidelity, copy reconciliation, properties, cinematics).
- `tests/e2e/`: Playwright end-to-end suites (visual parity, smoke journeys, axe accessibility, keyboard policy).
- `public/`: Static assets (cinematic MP4, VTT captions, posters, transcripts).
- `references/`: Consolidated non-application reference collateral, Herdr behavioral baselines, research probes, concept art, and capture tooling.
  - `references/herdr-baselines/`: Pinned Herdr 0.9.5 TUI baselines (32 PNG captures, 32 transcripts, SHA-256 manifest, transcript viewer).
  - `references/illustrative/`: Third-party and fork comparison images (TermSplit, fork blog).
  - `references/feasibility/`: Milestone 1 keyboard feasibility probe (`keyboard-probe.html`).
  - `references/concept-art/`: Concept art series for setting and atmosphere.
  - `references/scripts/`: Upstream baseline capture harness (`capture-upstream-baselines.sh`) and Herdr isolation verification scripts (`herdr-isolation-probe.sh`).

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
- Dev-only reload recovery (v2): Stores committed journal events and input policy in `sessionStorage` during dev mode (`import.meta.env.DEV`), replaying state on hot reloads without fabricating learning credit.

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
  - 12 Vitest test files (**170 unit, property, fidelity, and cinematic integration tests passing**).
  - 6 Playwright test files (**18 E2E, accessibility, and visual tests passing**).
- Test patterns:
  - Core purity tests (bare Node process invocation).
  - Fast-check generative property tests for state transitions and determinism.
  - Axe accessibility floor verification.
  - End-to-end journey tests with synthetic CDP keystrokes and pointer refusal assertions.

## Entry Points
- `index.html`: Web application HTML shell.
- `src/main.tsx`: React DOM client root mounting `App` in `React.StrictMode`.
- `src/App.tsx`: Top-level scene router, session lifecycle, recovery listener, and keyboard capture coordinator.
- `vite.config.ts`: Vite build and development configuration.
- `playwright.config.ts`: Playwright test runner configuration.

## Changed Files
- `references/herdr-baselines/` (consolidated 32 Herdr TUI captures, 32 transcripts, manifest, and viewer)
- `references/illustrative/` (migrated TermSplit and fork blog captures)
- `references/feasibility/` (migrated M1 keyboard probe)
- `references/concept-art/` (migrated tone and atmosphere concept artwork)
- `references/scripts/` (migrated capture and isolation verification harnesses)
- `references/README.md` (new master reference index)
- `docs/README.md` (new 17-document architectural and narrative sitemap)
- `.gitignore` (hardened: `.gemini/`, `.fallow/`, `graphify-out/`, `.env.local`, logs)
- `.prettierignore` (protected `references/herdr-baselines`, `references/concept-art`, `references/feasibility`)
- `eslint.config.js` (updated `references/feasibility/**` ignore)
- `GLOSSARY.md` (sharpened Herdr visual baseline; added Illustrative reference definition)
- `README.md` & `PRODUCT.md` (updated concept art paths)
- `docs/HANDOFF.md` (updated reference path)

## Last Scanned
2026-11-24T19:20:00Z
