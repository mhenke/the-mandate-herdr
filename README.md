# The Mandate: Herdr

A keyboard-first browser political thriller set in Washington, D.C., in November 2026. Investigate a missing analyst, uncover Directive 47, and learn authentic Herdr TUI workflows.

All institutions, characters, and conspiracy events are fictional. The working design targets fifteen interconnected levels across three episodes, with retention checkpoints at levels 5 and 10 and a cumulative mastery challenge at level 15.

## Status

Research and design in progress. **Gameplay implementation is not approved.**

Repository: [mhenke/the-mandate-herdr](https://github.com/mhenke/the-mandate-herdr).
The local checkout currently remains named `the-mandate`.

## Design documents

Documents below are planned deliverables; links become available as each research and design lane finishes.

- Research: [Herdr research](docs/HERDR_RESEARCH.md), [fidelity contracts](docs/HERDR_FIDELITY.md), [Yazi Quest analysis](docs/YAZI_QUEST_ANALYSIS.md).
- Narrative: [story bible](docs/STORY_BIBLE.md), [story arc](docs/STORY_ARC.md), [narrative design](docs/NARRATIVE_DESIGN.md), [level specifications](docs/LEVEL.md).
- Learning and implementation proposal: [learning design](docs/LEARNING_DESIGN.md), [architecture](docs/ARCHITECTURE.md), [implementation plan](docs/IMPLEMENTATION_PLAN.md).

## Behavioral authority

[Herdr documentation](https://herdr.dev/tui/docs/quick-start/) and [upstream source](https://github.com/herdrdev/herdr) determine interface behavior. Research records the exact upstream baseline and unresolved discrepancies. Yazi Quest is a design reference, not a template or behavioral authority.

The game may simulate fictional terminal content and processes. It must preserve authentic surrounding Herdr bindings, layout, focus, state, and lifecycle behavior.

## Review gate

Before gameplay code, review the complete story including its ending, fifteen-level progression, evidence trail, learning matrix, fidelity risks, architecture alternatives, and acceptance tests. Documentation completion alone does not establish design quality or authorize implementation.
