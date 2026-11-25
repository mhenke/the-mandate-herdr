# M2 Exit Report — Vertical Slice (L1–L3)

Status: **M2 exit requested.** This report closes the authorized Milestone 2 scope and requests authorization for Milestone 3 (full content). Date: 2026-11-24.

## 1. Executive Summary

Milestone 2 delivered a connected, theatrical L1–L3 vertical slice for *The Mandate: Herdr* adhering strictly to the architecture, fidelity, and narrative contracts established in M0 and M1.

All exit criteria defined in `docs/IMPLEMENTATION_PLAN.md` and `AGENTS.md` have been met and verified:
- **Zero pure-simulation contamination**: Core modules (`src/core/herdr`, `src/core/applications`, `src/core/narrative`, `src/core/assessment`) have zero dependencies on React, DOM APIs, or adapters, enforced via ESLint rules and automated AST inspection in bare Node.
- **Authentic Escape and input capture**: Escape is Herdr-owned inside the simulated console (canceling prefix mode, closing resize mode, dismissing help overlay). Host capture release is exclusively operated via an external accessible control (`Tab` reachable).
- **Protected browser shortcuts**: Chords `Ctrl+R`, `Ctrl+Shift+R`, `Ctrl+W`, `Ctrl+T`, and navigation shortcuts are never intercepted, preserving browser reload and tab controls.
- **Unbroken slice continuity**: A continuous session carries the investigation across L1 -> L2 -> L3 with unbroken document receipts (`CPA-01A` -> `UM-1109-88` -> `PARK-INTERVIEW-11-13`), preserving workspaces, tabs, split panes, and agent histories. Clean recovery is proven for unknown commands and permission denials.
- **Provenance-gated assessment**: Learning credit is granted strictly to player-origin keyboard actions (`isPlayerAction`). Accessible chrome controls allow story progression without conferring false keyboard mastery credit.
- **Visual baseline fidelity**: Verified against pinned upstream Herdr v0.9.5 (`e8d7d97`). Single-pane full bleed, clean `$ ` prompt with block cursor, mode bar isolation, and full-height sidebar confirmed across 412×740, 1200×800, and 1440×900 viewports.
- **Scope discipline**: L4–L15 remain strictly unauthorized and untouched in code.

## 2. Verification Evidence Table

| Criterion / Gate | Test Suite / Artifact | Pass Count / Evidence | Status |
| --- | --- | --- | --- |
| **Pure Simulation Boundary** | `tests/core-purity.test.ts`, `eslint.config.js` | 3/3 AST & bare-Node tests passing; zero forbidden imports or browser globals | **VERIFIED** |
| **Keyboard Policy & Escape** | `tests/adapter-browser.test.ts`, `tests/e2e/keyboard-policy.spec.ts` | 14/14 adapter tests, 10/10 e2e keyboard tests passing; `defaultPrevented: false` verified on reload chords | **VERIFIED** |
| **L1–L3 Slice Continuity** | `tests/investigation-l1.test.ts`, `tests/investigation-l2.test.ts`, `tests/investigation-l3.test.ts`, `tests/fictional-applications.test.ts`, `tests/e2e/level-2-journey.spec.ts` | 26 unit/integration tests and e2e full-journey test passing; receipts `["CPA-01A", "UM-1109-88", "PARK-INTERVIEW-11-13"]` verified | **VERIFIED** |
| **Provenance-Gated Assessment** | `tests/assessment-properties.test.ts`, `tests/investigation-l1.test.ts`, `tests/investigation-l2.test.ts` | 4/4 fast-check properties passing (100 runs each); non-player events yield zero credit; chrome clicks advance story only | **VERIFIED** |
| **Accessibility Floor** | `tests/e2e/axe-floor.spec.ts` | Axe-core zero critical/serious violations across landing, title, Herdr surface | **VERIFIED** |
| **Visual Parity & Chrome** | `tests/e2e/chrome-visual.spec.ts`, `tests/e2e/shots.spec.ts`, `tests/herdr-chrome.test.ts` | Upstream Herdr commit `e8d7d97` baseline fidelity confirmed; visual regression passing across viewports | **VERIFIED** |
| **Full Unit/Property Suite** | `pnpm test` (Vitest v5.1.1) | 21 test files, 198 tests passed (0 failures) | **VERIFIED** |
| **Full E2E Suite** | `pnpm test:e2e` (Playwright v1.65.1) | 7 spec files, 26 tests passed (0 failures) | **VERIFIED** |
| **Static Analysis** | `pnpm typecheck`, `pnpm lint` | TypeScript 5.9.3 strict (0 errors), ESLint 10, Stylelint 18, Prettier (0 errors) | **VERIFIED** |

## 3. Residual Risks & Stored Assumptions

1. **Browser Envelope**: Chromium 158 verified via CDP Playwright tests and user physical observations. Firefox remains accepted on the user's explicit authorization of 2026-11-23; measured Firefox certification reopens Gate 1.
2. **Persistence Boundary**: Session persistence in M2 is limited to dev reload recovery in memory/storage; full M3 persistence and save validation remain scheduled for M3.

## 4. Requested Decision

Accept Milestone 2 and authorize commencement of **Milestone 3 (Full Content: L4–L15)**.
