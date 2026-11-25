# Learning design

Milestone 2 authorizes gameplay for L1–L3. L4–L15 describe future levels, not approved implementation.

## One transfer goal

Players learn to launch and operate the pinned Herdr TUI by keyboard. They should be able to organize a real session, direct input to the intended pane, locate agents, read status, and preserve a running session without game-specific instructions.

Simulated Claude Code gives players work to organize. The newsroom configures its fictional MCP tools before play. Prompt quality, tool choice, source evaluation, and case reasoning never earn Herdr credit. They can change the story.

Apply two tests to each level:

1. Remove the Herdr operations. The level must no longer work as designed. Standard mode requires committed Herdr outcomes, not just the right document.
2. Replace the MCP source with an equivalent newsroom record. The Herdr objective and its evidence must not change.

## One progression

`LEVEL.md` owns per-level predicates and narrative outcomes. `HERDR_FIDELITY.md` and `HERDR_RESEARCH.md` own verified upstream behavior. Use only the pinned defaults documented there.

| Skill | Introduce | Guided practice | Independent use | Cumulative check |
|---|---|---|---|---|
| S01 — Launch Herdr at an open terminal and use its prefix | L1 | L2–L3 | L4 onward | L5, L10, L15 (prefix in context) |
| S02 — Find active bindings in authentic Help | L4 | L6–L7 | Voluntary after introduction | L15 |
| S03 — Navigate the workspace, tab, pane, and process hierarchy | L1 | L2–L4 | L6 onward | L5, L10, L15 |
| S04 — Create, name, switch, and rename tabs | L1 (create), L2 (switch), L3 (rename) | L2–L4 | L6 onward | L5, L10, L15 |
| S05 — Split panes for comparison | L3 | L4, L6 | L8 onward | L5, L10, L15 |
| S06 — Move focus and direct input | L3 | L4, L6 | L7 onward | L5, L10, L15 |
| S07 — Create and navigate workspaces | L1 (create), L4 (navigator) | L4, L6, L9 | L11 onward | L5 (create), L10, L15 |
| S08 — Locate a process with Goto | L6 | L8–L9 | L10 onward | L10, L15 |
| S09 — Zoom a pane and restore its layout | L6 | L7, L9 | L10 onward | L10, L15 |
| S10 — Navigate to agents using Herdr status and inspect pane output | L7 | L8–L9 | L10 onward | L10, L15 |
| S11 — Search and copy from scrollback | L8 (search), L9 (copy) | L9–L11 | L12–L14 | L10 (search), L15 (search and copy) |
| S12 — Preserve a running session across detach and reattach | L11–L12 | L13 | L14 | L15 |

L5 and L10 introduce no assessed operation. They start with fresh work and no automatic key sequences. L5 checks arrangement and focus, including split and focus after one guided repetition at L4. L10 checks navigation across workspaces and agents, zoom, and scrollback search. L15 combines known operations across an active hearing session. It reports five distinct results. Filing and disclosure are story milestones, not proof of keyboard skill.

## Guidance and assessment

- Give each level one story objective, one short reason, and three to five actions. Strike each action when its result commits. A new operation names the keys and the intended result. A repeated operation describes the intended result instead of assigning an isolated drill.
- Start with explicit instructions. After two successful uses in changed contexts, omit the binding from the primary prompt. Checkpoints start with an outcome brief even when a skill has fewer guided repetitions. Keep optional conceptual hints, binding help, and practice available.
- Credit a player keyboard action only when its accepted transition produces the intended Herdr result. Launch credit comes from the player's successful `herdr` submission, not from restored state. Compare target IDs and before/after state. A click, scripted transition, fixture, tool response, or cinematic skip cannot earn keyboard credit.
- A help request can mark a result assisted. It never blocks the story. Record independent, assisted, practiced, or not observed per skill. Do not infer mastery from a percentage or overall story completion.
- Standard mode is keyboard-first by game rule. Native Herdr supports mouse navigation. Accessible alternatives can achieve the same arrangement without certifying a keyboard action.
- Use the story-clock and cure path in `LEVEL.md`. An optional timer pauses for help, released capture, and Accessible Navigation. Running out of real time never blocks the story.
