# Handoff — The Mandate: Herdr

## Current scope

Milestone 2 is accepted. Milestone 3 is authorized, proceeding in sequential, playable batches beginning with Batch 1: Level 4 ("Filed 19:05") and Level 5 ("Fit to File"). L1–L3 slice is preserved. Work directly on `main` under `AGENT_WORKFLOW.md`. Do not implement future levels (L6–L15) in an uncontrolled pass.

Firefox remains unmeasured and this limitation must not be represented as resolved.

## Play the slice

1. Run `pnpm dev`. Open the local URL for the landing page. Choose **New investigation** for the cold open. Skip it or visit `/workspace` directly to reach the L1 terminal.
2. Type `herdr`. Follow the HUD to create a workspace and research tab.
3. Type `claude`. Ask for CPA-01A. Read the original returned by the document tool. Tell Claude to accept the assignment.
4. Continue the investigation in the same workspace. L2 adds the shared SOC report in another tab. L3 puts Park's transcript beside the report.

The HUD separates story steps from Herdr credit. Standard mode uses the pinned keyboard bindings. Accessible navigation can use alternate controls without keyboard credit for those controls. Escape belongs to Herdr while capture is active.

## State and evidence

- `src/core/applications` owns the simulated shell, pane-local agent state, and shared documents. The document tool contract is in `CLAUDE_MCP_SIMULATION.md`.
- `src/adapters/investigation-session.ts` routes committed input and process events. Herdr owns topology and focus. The narrative and assessment cores observe separate evidence.
- Development reload recovery is not production persistence or authentic detach/reattach. Browser recovery is versioned and never awards new credit.
- Use the pinned Herdr baselines in `references/herdr-baselines/`. Do not run the capture harness against the user's real session. Firefox remains unmeasured. The existing `prefix+?` host-delivery claim is partial.

Run the checks in `AGENTS.md` and the Chromium journey in `tests/e2e/`. The next milestone requires explicit approval. Do not implement archive or filing tools, Episode II/III gameplay, or the final hearing under M2.
