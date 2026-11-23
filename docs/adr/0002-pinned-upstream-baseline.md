---
status: proposed
---

# Pinned upstream baseline per learning edition

The game's teaching claims are only as true as the Herdr version they were verified against, and upstream Herdr changes bindings, chrome, and lifecycle behavior over time. We decided each released learning edition freezes one upstream commit and one documented configuration profile; behavior contracts in `docs/HERDR_RESEARCH.md` and `docs/HERDR_FIDELITY.md` cite that commit, and nothing teaches behavior from an unpinned or newer baseline.

## Consequences

- Upgrading the baseline is a release event, not a dependency bump: source/docs diff review, fidelity-fixture update, re-run of affected browser input tests, learning/narrative reconciliation, an explicit save/replay compatibility decision, and re-approval of changed teaching claims.
- Saves and replays record the baseline they were played under; an old save is never silently reinterpreted under new rules.
- The game displays the pinned version to the player, so a discrepancy between the game and a player's installed Herdr is explainable rather than mysterious.
- License terms for the pinned upstream (Apache-2.0 for herdrdev/herdr at inspection) apply to anything copied; attribution and change notices are part of each release.
