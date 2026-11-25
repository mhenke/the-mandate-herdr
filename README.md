# The Mandate: Herdr

![Investigator at terminal](references/concept-art/01-investigator-terminal.png)

A keyboard-first political thriller set in Washington, D.C., in November 2026. Investigate why three reports count as independent. Learn the authentic Herdr shortcuts you need to manage the work.

All institutions, characters, and conspiracy events are fictional. The working design targets fifteen interconnected levels across three episodes, with retention checkpoints at levels 5 and 10 and a cumulative mastery challenge at level 15.

## Concept art

| Episode | Image |
|---|---|
| — | ![Terminal](references/concept-art/01-investigator-terminal.png) |
| E1 THE LEAK | ![The Leak](references/concept-art/02-the-leak-office.png) |
| E2 THE CONTAINMENT | ![The Containment](references/concept-art/03-the-containment-investigation.png) |
| E3 THE MANDATE | ![The Mandate](references/concept-art/04-the-mandate-hearing.png) |
| — | ![Atmosphere](references/concept-art/05-political-thriller-atmosphere.png) |

*Concept renders for tone and setting; not in-game UI. All depicted institutions are fictional.*

## Status

Milestone 2 authorizes the L1–L3 browser slice. L4–L15 are design contracts, not playable levels.

Run `pnpm install` and `pnpm dev`. Open the local URL for the landing page. Choose **New investigation** for the cold open, or visit `/workspace` to go straight to the terminal. Type `herdr` and press Enter to start Herdr.

Claude Code and the newsroom document tools are fictional. The game never runs the real services or asks for credentials. Only Herdr operations earn learning credit.

Repository: [mhenke/the-mandate-herdr](https://github.com/mhenke/the-mandate-herdr).
The local checkout currently remains named `the-mandate`.

## Design documents

Start with the [specification index](docs/README.md).

- Research: [Herdr research](docs/HERDR_RESEARCH.md), [fidelity contracts](docs/HERDR_FIDELITY.md), [Yazi Quest analysis](docs/YAZI_QUEST_ANALYSIS.md).
- Narrative: [story bible](docs/STORY_BIBLE.md), [story arc](docs/STORY_ARC.md), [narrative design](docs/NARRATIVE_DESIGN.md), [level specifications](docs/LEVEL.md).
- Design and implementation: [learning design](docs/LEARNING_DESIGN.md), [architecture](docs/ARCHITECTURE.md), [simulated document tools](docs/CLAUDE_MCP_SIMULATION.md), [implementation plan](docs/IMPLEMENTATION_PLAN.md).

## Behavioral authority

[Herdr documentation](https://herdr.dev/tui/docs/quick-start/) and [upstream source](https://github.com/herdrdev/herdr) determine interface behavior. Research records the exact upstream baseline and unresolved discrepancies. Yazi Quest is a design reference, not a template or behavioral authority.

The game may simulate fictional terminal content and processes. It must preserve authentic surrounding Herdr bindings, layout, focus, state, and lifecycle behavior.

## Development

Follow the [agent workflow](docs/AGENT_WORKFLOW.md). The solo project works directly on `main`, with no mandatory pull request or branch protection. Run `pnpm typecheck`, `pnpm lint`, and `pnpm test`. Run `pnpm test:e2e` for the browser flow.
