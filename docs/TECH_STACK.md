# Tech stack

Status: **selected for review (user decisions, extended).** Documentation and technology selection only; no gameplay implementation, scaffolding, or dependency installation before milestone approval (M1 remains feasibility-only). Versions verified against the npm registry on 2026-11-23; install targets are the exact versions below, never blind `latest`.

## Application

| Package | Verified | Role | Notes |
|---|---|---|---|
| React | 19.3.1 | Presentation projection of committed simulation state | React Strict Mode ON in development; `eslint-plugin-react-hooks` 7.1.1 with recommended rules; `@types/react` 19.3.0 + `@types/react-dom` 19.3.0 (verified 2026-11-23, matching 19.3.1). Rendering must stay pure: re-rendering a pane cannot advance the story, record a keybinding, or evaluate a level twice |
| TypeScript | **5.9.3 strict** | Domain contracts | TS 7.0.2 exists but typescript-eslint 8.74.0 caps `typescript < 6.1.0` — type-aware lint does not tool TS 7 yet. Locked to 5.9.3 until support lands |
| Vite | 8.3.8 | Build/dev server | `@vitejs/plugin-react` 6.3.0 requires Vite `^8.0.0`; Node `^20.19.0 \|\| >=22.12.0` |
| CSS Modules + CSS custom properties | (built-in) | Styling system | Chosen over Tailwind: Herdr's dense terminal geometry (row heights, borders, spacing, focus states) is explicit CSS agents can reason about. No original "Herdr-like" theme may be invented; tokens extracted from the pinned upstream source. No external fonts, no runtime CDN — self-contained assets |
| IndexedDB | (platform) | Persistence | Versioned manifests, deterministic event replay; React never owns it |

**Subscription boundary (user decision, 2026-11-23):** `useSyncExternalStore` is the React-to-simulation subscription seam — immutable snapshots, stable subscription identity, no state mutation during rendering. React state libraries (Zustand etc.), routers (React Router, TanStack Router, Expo), server-state caches (TanStack Query), Tailwind, shadcn/ui, and React Hook Form are **not adopted** absent a concrete requirement; the deterministic TypeScript simulation is the authoritative state owner. Runtime save validation is deferred to the persistence milestone (M3): at that point, compare Zod against explicit validation functions for versioned checkpoints and imported event journals — no validation library is installed in M2.

**Validation scope (user refinement, 2026-11-23):** the validation question is about **trust boundaries only** — data loaded from IndexedDB or an imported save file must be validated at runtime before entering the deterministic core (TypeScript alone does not verify restored or imported data: `{ level: 99, activePaneId: null, schemaVersion: -1 }` must be rejected). Zod (verified: 4.6.7 current) is the leading candidate for that boundary. It is **not** to be used for internal objects or state transitions, which TypeScript already covers and where runtime checks duplicate its responsibilities and add overhead. The Zod-vs-explicit-functions comparison at M3 therefore decides (a) the library choice and (b) the narrow set of boundary schemas — expected: save manifest, checkpoint payloads, imported event journals — nothing else.

Structure sketch (proposal): `src/core/herdr` (pure simulation) · `src/core/narrative` · `src/core/assessment` · `src/content` (levels, fictional evidence) · `src/adapters` (browser, storage, clipboard) · `src/ui` (React presentation, `herdr/` chrome components + fictional-app components separated) · `src/styles` (`tokens.css`, `typography.css`, `themes.css`, `accessibility.css`).

## Testing

| Package | Verified | Role |
|---|---|---|
| Vitest | 5.1.1 | Unit + integration runner (peers accept Vite `^8`) |
| fast-check | 4.11.0 | **Required** property-based testing: Herdr transitions/invariants, replay determinism, assessment provenance (no action sequence manufactures action evidence from scripted origins) |
| @playwright/test | 1.65.1 | E2E, synthetic-input harness (non-certifying for interception), and **visual regression** |
| @axe-core/playwright | 4.14.0 (axe-core 4.14.1) | Automated accessibility checks in Playwright runs — a floor, never a substitute for manual screen-reader/keyboard audits |
| @stryker-mutator/core + vitest-runner | 10.1.1 | **Targeted** mutation testing of `src/core/*` only. Runs as a scheduled/manual CI job, not per-PR; starts in report-only mode, evidence-based thresholds after baseline. Selected core modules may become blocking later |

### Visual regression (P0)

Playwright screenshot comparisons with fixed viewports, seeded states, deterministic fonts:

- **Baselines come from a real build of pinned upstream Herdr** (captured during M2 from the taught states) plus the game's own rendered states. Baselines are committed and pinned alongside the upstream commit they were captured from.
- The two reference images in `assets/reference/` are illustrative only (one is a community fork, one is a different product) — never baselines, never authority.
- Acceptance rule: an agent changing CSS attaches before/after screenshots for affected Herdr interface states; updating a baseline to make a test pass requires recorded justification and reviewer sign-off.
- One screenshot infrastructure (Playwright). Vitest browser-mode visual testing is not adopted to avoid dual maintenance.

## Quality

| Package | Verified | Role |
|---|---|---|
| ESLint | 10.15.0 | Flat config; **import-boundary rules enforce the architecture** (see below) |
| typescript-eslint | 8.74.0 | Type-aware lint (the TS 5.9.3 cap) |
| eslint-plugin-react-hooks | 7.1.1 | React Hooks rules, recommended set (P0 enforcement of render purity) |
| Prettier | 3.10.1 | Formatting |
| Stylelint | 18.1.0 | CSS Modules + custom-property configuration; catches invalid CSS, enforces token usage |
| Knip | 6.48.0 | Unused exports/dependencies gate |
| fallow | 3.47.0 | `fallow audit --base origin/main` gate with recorded baselines (same pattern as yazi-quest) |

## Architecture boundary enforcement (P0)

Directory boundaries are enforced by ESLint import restrictions plus an architectural dependency check — TypeScript interfaces alone do not stop an agent from mixing assessment into React or creating cycles:

- `src/core/herdr` must not import React, DOM APIs, `src/ui`, `src/adapters`, or `src/core/narrative`/`assessment` (they may *observe* committed facts via the documented interface, never own state).
- `src/core/narrative` and `src/core/assessment` must not import React, DOM, or adapters.
- `src/ui` may import core types and view models only; it must not mutate simulation state.
- Property: the simulation core runs and replays in Node with zero browser APIs — enforced by a test that imports `src/core/*` in a bare Node context.

## Agent development tooling

| Tool | Role | Authority |
|---|---|---|
| **pstack** (official Cursor plugin, [cursor/plugins/pstack](https://github.com/cursor/plugins/tree/main/pstack), MIT) | Preferred engineering skill system for substantial coding tasks: `poteto-mode` playbook routing (architecture, investigation, implementation, testing, review, visual parity); prioritized skills `architect`, `tdd`, `interrogate`, `blast-radius`, `typescript-best-practices`, `correct`, and the verification-skill family (`create-verification-skill` gated on M2 producing a runnable app, `create-formal-verification-skill` for state-machine properties). Referenced, never vendored; supported installs: Cursor `/add-plugin pstack`, Claude Code marketplace adapter | Harness compatibility: the project's harnesses are **OpenCode, OMP, and Antigravity (agy)** — none has a documented pstack adapter, so verify per harness before relying on automation; fallback is reading the `SKILL.md` files as instructions. Cursor and Claude Code remain the officially documented pstack harnesses. Workflow contract, fidelity contracts, and milestone gates override any playbook step (see AGENT_WORKFLOW) |
| Graphify | 0.9.118 (PyPI `graphifyy`), local code-graph exploration, dependency tracing, boundary reviews | **Not an application dependency** — never bundled or imported. Output is an exploration aid, never an architectural authority; source and project contracts are authority. Complements pstack (no code-graph tool in pstack); not replaced by it |
| `docs/AGENT_WORKFLOW.md` | Agent workflow contract: understand → scope → implement → verify → inspect → review → report, plus the pstack boundaries | The workflow document is the contract; violations are review failures |

Explicitly **not adopted**: **obra/superpowers** (dependency, submodule, skill collection, or recommended workflow — excluded by user decision), MSW (no APIs exist), Storybook (deferred), Chromatic/Percy or any hosted visual-testing service (keep testing local), Changesets (single deployed application), hosted code-indexing services (Graphify local only).

## Infrastructure

| Item | Decision |
|---|---|
| CI | GitHub Actions: typecheck, ESLint, Stylelint, Prettier check, Vitest + fast-check, Playwright smoke + visual regression, Knip + fallow (recorded baselines), dependency vulnerability check, axe-core checks |
| Branch protection | Required status checks (typecheck, lint, tests, visual, audit gates); linear history; no force push; review required for fidelity/assessment-sensitive paths per AGENT_WORKFLOW |
| Dependency security | Dependabot with grouped minor/patch updates; **GitHub Actions pinned to immutable commit SHAs** (workflows can carry secrets/write tokens); vulnerability gate blocks merges on high/critical in the dependency graph |
| Deployment | GitHub Pages via Actions after required validation gates (M1 envelope for slices, M3/M4 gates for content releases). Static, HTTPS, no backend |
| StrykerJS policy | Scheduled/manual job first; report-only → thresholds earned from evidence → selected core modules blocking only after stable history |

## Runtime and package-manager pins

- Node: 22 LTS (exact minimum `22.12.0` per Vitest 5 peer range); recorded in `.nvmrc`/`engines` at M2.
- Package manager: **pnpm 12.23.0**, pinned via `packageManager` field; lockfile (`pnpm-lock.yaml`) committed at M2 installation time.
- Development commands (the contract `package.json` must implement): `pnpm install` · `pnpm dev` · `pnpm typecheck` · `pnpm lint` (ESLint + Stylelint + Prettier check) · `pnpm test` (Vitest incl. fast-check properties) · `pnpm test:e2e` (Playwright incl. visual + axe) · `pnpm audit:changed` (fallow + knip) · `pnpm mutation` (StrykerJS, scheduled/manual).

## Constraints carried forward

1. **Deterministic simulation core stays framework-independent** — React renders committed state and never owns simulation, narrative, or assessment transitions (boundary-enforced, not convention).
2. **Feasibility gate governs input work** — no stack choice changes what the browser delivers; M1's manual pass remains the certifying evidence.
3. **No dependency installation until M2 is explicitly approved.** This document records selection and verified compatibility only.
4. **Version changes re-verify this table** (compatibility, boundary rules, CI matrix) before any lockfile update.
