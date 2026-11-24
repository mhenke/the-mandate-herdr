# Handoff — The Mandate: Herdr, L1 browser slice

As of 2026-11-24. Working tree: `/home/mhenke/Projects/the-mandate/.worktrees/l1-browser-preview`, branch `lane/l1-browser-preview`. L1 slice committed as `ab03b98`, PR #9 open. Do not touch the main checkout's separate uncommitted work.

## Objective

Immediately playable browser political thriller where authentic Herdr keyboard operations advance the investigation and teach Herdr bindings. Prove the complete L1 sequence (title → cold open → briefing → workspace → earned response → L2 transition), then finish the authorized L1–L3 M2 slice.

## Gate

M0, M1 approved. **M2 (L1–L3) approved 2026-11-23, in progress.** L4–L15 unauthorized pending separate approval. `docs/AGENT_WORKFLOW.md` is binding: understand → scope → implement → verify → inspect → independent review → report commands/exits. Prohibitions: contract tampering, silent snapshot updates, weakened assertions, generated-artifact commits, authority leakage into React.

## Established decisions

- Simulated Herdr chrome events are genuine core `ChromeEvent`s (`select-workspace`/`select-tab`/`new-tab`/`focus-pane`), always `playerAction: false` — never keyboard-transfer credit.
- **Input policy lives in the adapter, not core**: `InputPolicy = "standard" | "accessible"`. Standard = keyboard-only inside simulated chrome; clicks dispatch nothing and show one fading reminder. Accessible = clicks navigate (alternative modality), story progresses, mastery credit never awarded. `settle()` in Accessible requires story condition only; `objectivesMet` keeps reporting unmet keyboard objectives. Fictional host restriction, not native Herdr behavior; bindings unchanged.
- Escape is Herdr-owned inside the simulated TUI; browser capture release is a separate accessible external control. Both paths tested.
- **New tab** follows real Herdr default (`prompt_new_tab_name: true`, config/model.rs:1214): `+`/prefix+c opens a `new tab` rename overlay pre-filled with the next tab number; Enter creates (custom name kept, unchanged/empty → auto name), Escape aborts with no tab. Sources: `actions.rs:135-139`, `overlay_input.rs:386-408/967-979`.
- Dev-only sessionStorage recovery: versioned snapshot key `mandate-dev-recovery:v2`; journal replay from pristine scenario (seeds are journaled events); committed story/assessment/policy carried verbatim; no manufactured credit; `import.meta.env.DEV` gate; saved on `beforeunload`. Production unchanged. Not a save system (persistence deferred to M3).
- Cinematic: 25 s silent cut; video-end → `skipPresentation` → workspace (verified). Reloads during edits were the "video resets to landing" cause; recovery now covers them in dev.

## Completed and verified

- Deterministic core committed as `6d05b11`; L1 runtime/provenance as `be08449`.
- L1 browser slice committed as `ab03b98`; PR open at https://github.com/mhenke/the-mandate-herdr/pull/9.
- Oracle-approved L1 runtime: 33 tests + 17 adversarial probes; Escape-based help-exit fix approved.
- Core `ChromeEvent` routing, new-tab prompt (core `types.ts`, `store.ts`), accessibility policy adapter (`investigation-session.ts`), L1 cooperative security notice in BRIEFING, recovery v2 — all on disk.
- Fixer visual pass: tabs inside main; quiet `+` in `.herdr-tabbar`; sidebar footer `grouped`; neutral divider; `« NAVIGATE` mode bar; overlay title `new tab`; axe green; `preload="metadata"` fallback fix. Evidence: `/tmp/opencode/mandate-final/final-*.png`, `l1-*.png`.
- Fixer UI wiring and e2e lane landed and verified:
  - Reminder toast on refused pointer chrome in Standard mode (`App.tsx`, `mandate-preview.css`).
  - Accessible toggle in host footer allowing alternative modality navigation (`App.tsx`, `MandatePreview.tsx`).
  - Full suite of keyboard-policy e2e tests (`tests/e2e/keyboard-policy.spec.ts`): Standard pointer refusal, Standard keyboard mastery, wrong-pane typing negative test, help overlay + hints, capture release/re-engage vs Herdr Escape, and Accessible progression without mastery credit.
- Verified gates:
  - `pnpm typecheck` (`tsc --noEmit`): exit 0
  - `pnpm test` (`vitest run`): **161/161 pass** across 10 test files
  - `pnpm lint` (`eslint . && stylelint "src/**/*.css" && prettier --check .`): exit 0 (clean)
  - `pnpm test:e2e` (`playwright test`): **16/16 pass** across 5 test suites (including axe floor and keyboard-policy)
  - `pnpm build` (`vite build`): exit 0

## In flight (do not duplicate)

None. L1 slice is committed and PR #9 is submitted. Awaiting PR CI completion and merge before proceeding to Level 2.

## Files

- `src/core/herdr/{types,store}.ts` — Overlay `target:"new-tab"`, `createNewTabState`, `routeChrome`.
- `src/adapters/investigation-session.ts` — policy, `dispatchChrome`, `settle`, recovery v2.
- `src/core/narrative/index.ts` — L1 BRIEFING security notice.
- `src/App.tsx`, `src/ui/MandatePreview.tsx`, `src/styles/mandate-preview.css` — presentation + host wiring (fixer lane).
- `tests/{herdr-chrome,investigation-l1,adapter-browser,herdr-fidelity,herdr-copy-reconcile}.test.ts` — runtime/policy/recovery/fidelity.
- `tests/e2e/` — Playwright suites incl. new keyboard-policy spec; screenshots `/tmp/opencode/mandate-final/`.
- Upstream pins: `/tmp/opencode/the-mandate-research/herdr/`; captures `/home/mhenke/Projects/the-mandate/references/herdr-baselines/` (pinned, read-only authority).

## Next steps

1. Watch PR #9 CI; inspect failure excerpts before assigning repairs. Merge only when green.
2. After merge, verify screenshots against pinned captures and confirm in-browser mouse refusal / Accessible no-credit behavior (Playwright policy spec already covers this in CI).
3. Continue authorized L1–L3 slice; stop at M2 review gate for approval. L4–L15 still unauthorized.

## Environment and risks

- Dev server `http://127.0.0.1:5173/` was Vite parent-owned; last observed background shell exited 143 (terminated). Restart only if browser work is needed, and never stop another process's server or run new live Herdr experiments.
- Vite has served stale transforms after heavy edits; restart **only our own** dev server and confirm served source before diagnosing missing exports.
- Designer subagent unavailable (provider credit error); fixer covers UI. FireFox unmeasured; prefix+`?` partial. Overlay geometry/colour still differs from upstream captures (largest visual gap). No persistence until M3.
- Never touch the user's live Herdr session; never rerun captures. Working claims must be backed by commands actually run.
