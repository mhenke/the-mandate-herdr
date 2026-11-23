# Herdr interface reference captures

These are **illustrative references only — never fidelity authority.** The iron rule stands: the pinned upstream source (`e8d7d9705a7a2c89cef4dd42079379f05685af87`, docs 0.9.5) and its documentation are the only behavioral and visual authority.

| File | What it shows | Provenance | Permitted use |
|---|---|---|---|
| `herdr-fork-session-blog.jpg` | A Herdr **fork** in use: sidebar (spaces + agents with state rows), tab bar, three panes with named agents (`Codex: layout`, `Claude: review`, `Copilot: tests`), agent status indicators (working/idle/blocked) | Blog screenshot of a community fork demo, 1527×860 | Layout/mood orientation for the visual-regression fixture plan. NOT a baseline: fork chrome may differ from upstream in unknown ways |
| `termsplit-project-terminals.jpg` | A **different product** (TermSplit): project-centric terminal workspaces, notes panel, agent panels | Third-party product screenshot, 1408×860 | Contrast/reference for what The Mandate is NOT. Do not copy its layout |

**Visual-regression baselines** must be captured from a real build of the pinned upstream Herdr during M2 (run upstream in a terminal, screenshot the taught states), version-pinned alongside the commit they came from. These two images are never compared against the game's UI as authority.
