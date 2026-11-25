---
status: accepted
---

# Deterministic in-terminal agent simulation and fresh session topology

Herdr is the sole learning objective. Simulated Claude Code supplies realistic terminal work for the player to organize. We chose a deterministic pane application over a live API, an external chat widget, or pre-opened evidence.

## Considered options

- **A. Deterministic in-terminal CLI simulation (chosen).** Level 1 starts at an open terminal. The player starts Herdr, creates a workspace and research tab, and launches simulated Claude Code there. The app emits reproducible transcript lines from preconfigured fictional records.
- **B. Live Claude API / Anthropic SDK integration (rejected).** Live LLM calls introduce external credentials, per-user token costs, network latency, non-deterministic model variance, and potential offline failures. Inconsistent model responses would break automated vitest property checks and test grading.
- **C. External web chat UI widget (rejected).** Rendering agent interaction in a floating web side-drawer or popup breaks the core premise of Herdr. Developers use multiplexers specifically because real CLI agents (Claude Code, Aider, OpenCode) live inside terminals. An external widget would fail to teach pane splitting, tab isolation, and session persistence.
- **D. Static pre-split fixture files (rejected).** Starting levels with pre-opened split panes containing static text (e.g. "Review memo in right pane") felt contrived and confusing to players who expected an authentic terminal environment. It bypassed the fundamental workflow of launching tools within a workspace.

## Consequences

- The simulation runs offline and needs no external credentials.
- `src/core/applications` owns pane histories and shared records. Herdr owns layout and focus. Narrative observes tool effects and assessment observes Herdr actions.
- No prompting, MCP, or source-evaluation skill is assessed. See `../CLAUDE_MCP_SIMULATION.md` for the tool contract.
- L2 reuses the first session. L3 introduces splits because the report and transcript need to stay visible together.
