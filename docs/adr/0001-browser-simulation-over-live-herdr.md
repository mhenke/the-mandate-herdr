---
status: proposed
---

# Browser simulation over a live Herdr connection

The game must teach Herdr deterministically, replayably, and around fictional story content, but a browser page cannot see keys the host intercepts and a backend running real Herdr processes for every player adds isolation, authentication, cleanup, and nondeterministic agent behavior that assessment cannot rely on. We decided the game simulates the pinned Herdr contracts and runs fictional terminal applications locally in the browser; a live Herdr connection is rejected for the initial scope.

## Considered options

- **A. Browser simulation (chosen).** Deterministic state transitions implement the contracts recorded in `docs/HERDR_FIDELITY.md`; fictional pane applications carry the story. Static deployment, no backend, replayable action evidence.
- **B. Same simulation with a framework presentation** (e.g. React). Viable later if presentation complexity earns it; not needed now. **Update:** selected in ADR-0004.
- **C. Live Herdr behind a backend (rejected).** Real upstream behavior, but real processes per player, nondeterministic timing, no replay guarantee, and the browser/host interception problem remains unsolved — it adds a second problem instead of fixing the first.

## Consequences

- The simulation can drift from upstream Herdr. ADR-0002 controls this: every learning release pins one upstream commit and its fidelity profile.
- The keyboard problem is unchanged: what the browser delivers is a feasibility question (Gate 1), not something the simulation can fix or fake.
- Reopening option C later is a separately reviewed scope change, not an incremental feature.
