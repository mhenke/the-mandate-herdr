---
status: proposed
---

# Presentation and engineering toolchain selection

The architecture initially defaulted to native-DOM presentation with React as a non-required alternative. With implementation approaching, the user selected the full stack instead: React 19 (presentation only), strict TypeScript 5.9, Vite, CSS Modules with CSS custom properties, the Vitest/fast-check/Playwright/targeted-StrykerJS testing stack, ESLint (with React Hooks rules and import-boundary enforcement) + Prettier + Stylelint, Knip + Fallow, axe-core as the automated accessibility floor, pstack (referenced, not vendored) as the agent engineering skill system, Graphify for local exploration, and GitHub Actions/Pages/Dependabot for CI and deployment.

The decisive constraints: the simulation core must remain framework-independent and run in bare Node (enforced by lint boundaries plus an import test, not convention); React renders committed view models and never owns simulation, narrative, or assessment state; CSS Modules were chosen over utility-class frameworks because Herdr's dense terminal geometry is explicit CSS agents can reason about; visual-regression baselines come from the pinned upstream Herdr build, never from third-party screenshots; hosted testing and indexing services are rejected to keep verification local and auditable.

## Consequences

- ADR-0001's option B ("React not necessary now") is superseded by this selection; its core decision (simulation over live Herdr) stands.
- No dependency installation occurs until M2 approval; TECH_STACK.md records verified versions as install targets.
- pstack's harness support (Cursor, Claude Code) does not cover this repo's OpenCode/OMP agents; compatibility must be verified before its automation is relied on, with a read-the-skill-files fallback.
- Style conventions, boundary rules, and the agent workflow contract live in `docs/TECH_STACK.md` and `docs/AGENT_WORKFLOW.md`; this ADR records the selection and its trade-offs only.
