# Glossary — The Mandate: Herdr

Single project context. Two language groups share this file because both are load-bearing across the design docs; split with `GLOSSARY-MAP.md` if either grows its own dialect. Terms are canonical proposals (the design itself is not yet approved). Specific instance data (IDs, dates, characters) lives in `docs/STORY_BIBLE.md`, not here.

## Investigation domain (fiction)

**Origin event** — the one real upstream incident a report derives from. Exactly one exists in the story; reports may share it without any of them being false.

**Origin-Event-ID** — the stable identifier linking a report to its origin event. A blank origin field means the ID was never carried (form default or configured stripping); it is not evidence of redaction or tampering on its own.

**Receipt path** — the route a report traveled from source to intake. Distinct receipt paths are about transportation, never about who observed what.

**Independent observation** — a distinct observer making a distinct observation of the event. Genuine independence is about observation, not delivery. Three reports on three receipt paths may be zero, one, two, or three independent observations.

**Derivative report** — a report whose content derives from an earlier artifact rather than from its filer's own observation. A derivative report can be entirely accurate and still not independent.

**Corroborated pattern** — the procedural state produced when the intake rule counts three facially independent reports. Procedurally valid and substantively wrong are simultaneously possible; that gap is the story's mechanism.

**Rebuttable presumption** — the intake guidance's assumption of independence from faces, which a timely counter-provenance filing can overturn. Presumption rebutted ≠ rule broken: the shortcut lives in subordinate guidance, not the ratified law.

**Verifier note (VN)** — the player's signed, retractable report. Any credentialed verifier may file one; only a two-source-corroborated filing forces review.

**Counter-provenance filing (CPF)** — the affirmative instrument proving common source and retracting the filer's own contribution. Subtraction alone (withdrawing a report) is never sufficient; the filing must establish the shared origin.

**Retraction** — the author's own withdrawal of their report, always receivable, always on the record, always costly. Only the author can retract; this is why the player is both the emergency's cause and its only cure.

**Dispatch receipt** — the intake-side record of when a report arrived on which path. Timestamps three deliveries; proves nothing about independence.

**Submission acknowledgment vs intake receipt** — two different artifacts: the acknowledgment issued at the moment of filing; the intake receipt issued when the report is counted, on a later intake cycle. Their dates differ by design.

**Fair-play artifact** — an on-screen document available to the player before a revelation that later re-reads with new meaning. The test: the clue must be visible at the moment of the player's action, not introduced afterward.

**Fair-play window** — the span between a clue's first visibility and its payoff. The twist stress test must test the window's start, not only its end: a clue first visible at level 3 is fair play from level 3, even if the story only tests the guesser at level 7.

**Negative evidence** — a proof of absence (for example, no player session in an access log). Valid only with a stated custodian, a request route the player can actually use, and a declared completeness limit; it never proves more than its limit, and its absence-claim is itself subject to the provenance/accuracy/timing/intent distinction.

**Clue-audit row** — the per-clue record the fairness discipline requires: first visible (level and date), payoff level, the alternative reading preserved, and the specific observation that excludes that reading. Major clues get one; a stress-test claim with no staged disproof is a defect, not a flourish.

**Provenance / Accuracy / Timing / Intent** — four distinct questions about any artifact: where it came from, whether it is true, when it was made, and why. Evidence of one never establishes another. Authentication (hash, signature) speaks only to provenance-against-a-comparison-original.

**Level knowledge vs underlying truth** — what the player can know at a given level versus the full chronology. Knowledge trails truth by stated gaps; no level consumes knowledge the fiction has not delivered.

**Story clock** — fictional time advancing only on declared story events. Never wall-clock; never skill-speed. A missed deadline uses explicit recovery and never rewrites evidence.

## Assessment and interface domain

**Prefix sequence** — press the prefix key, release, then press the action key. Sequential by contract; a simultaneous chord (e.g., plain Ctrl+W) is a different event and may never reach the page.

**Detach vs close pane** — detach ends the client connection while the session and all processes keep running; closing a pane removes it and stops that terminal's runtime. Never presented as equivalent. Page reload/pause is neither.

**Done (agent status)** — a per-client presentation of an Idle state whose completion is not yet acknowledged. A done badge is one client's projection, never proof of completion or of story truth.

**Action evidence / process evidence / learning evidence** — three kinds, never interchangeable: a fictional artifact produced, a Herdr operation performed, and the player's deliberate use of a taught operation. Narrative scripts can manufacture process evidence; they cannot manufacture player-action evidence.

**Provenance kinds** — the origin labels behind any resulting state: player action (performed by the player), fixture (pre-created state), or simulated process event (produced by fictional machinery). Fixtures and process events never count as player actions; the provenance kind recorded for an objective decides which evidence kinds it can earn.

**Keyboard transfer vs story completion** — separate outcomes. A player may finish the story with external/accessible controls and earn no keyboard-transfer credit; the record states which.

**Input policy** — the session mode governing whether simulated chrome accepts pointer interaction. Standard enforces the in-world cooperative security restriction requiring keyboard-only operations on the remote console; Accessible permits alternative pointer navigation of simulated chrome without granting keyboard-transfer mastery credit.
_Avoid_: Mouse mode, easy mode, cheat mode, bypass.

**Chrome event** — an external host activation of simulated multiplexer navigation (workspace, tab, new-tab, or pane focus) recorded with non-player provenance (`playerAction: false`). Distinguishes host-level navigation from authentic player keyboard operations.
_Avoid_: Synthetic keystroke, simulated click, fake key.

**Capture release control** — an accessible external host control that releases keyboard focus from the simulated terminal surface back to the browser page. Releases browser capture without consuming or redefining Herdr's own internal `Escape` key.
_Avoid_: Escape-to-release, global escape handler, modal escape.

**Retention checkpoint** — a level that assesses only previously taught skills with faded scaffolding. A checkpoint that introduces a new skill is a curriculum defect.

**Capture context** — the host state machine (ordinary page, deliberate capture, suspended) distinct from Herdr's own modes. Loading or scene changes must never silently capture input; release from capture is keyboard-reachable via the external release control, never via the Escape key, which is Herdr-owned inside the simulated TUI.

**Logical clock** — deterministic simulation time advancing only through recorded events. Browser suspension freezes it; resume never applies wall-clock catch-up.

**Supported envelope** — the OS/browser/layout/assistive-technology matrix with a recorded evidence basis. Two flavors: **measured** (a physical-key test record exists) and **accepted** (an explicit user authorization stands in place of measurement). Synthetic events are never certifying for either. The Gate-1 envelope (2026-11-23) is accepted, not measured; a measured cross-browser claim reopens it.

**Certifying evidence** — only what the claim requires: physical-key tests for interception claims, action+state provenance for skill claims, replay for determinism claims. Everything else is labeled non-certifying.

**Risk chord** — a keyboard chord the browser or OS is presumed to consume before the page (Ctrl+W plain and Ctrl+W in field). No required game action, lesson predicate, or assessment may depend on a risk chord reaching the page; the probe's warning panel documents the interception for players.

**Voided attempt** — an attempt whose pending prefix was discarded by host blur. Voided is re-triable and is never recorded as a failure; assessment counts only attempts that completed inside one capture context.

**Partial introduction** — a matrix cell that teaches part of a skill's content only (for example, the close half of the detach/reattach-versus-close skill). The matrix records the split explicitly; a later level's full introduction never backdates to the partial one.
