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

**Provenance / Accuracy / Timing / Intent** — four distinct questions about any artifact: where it came from, whether it is true, when it was made, and why. Evidence of one never establishes another. Authentication (hash, signature) speaks only to provenance-against-a-comparison-original.

**Level knowledge vs underlying truth** — what the player can know at a given level versus the full chronology. Knowledge trails truth by stated gaps; no level consumes knowledge the fiction has not delivered.

**Story clock** — fictional time advancing only on declared story events. Never wall-clock; never skill-speed. A missed deadline uses explicit recovery and never rewrites evidence.

## Assessment and interface domain

**Prefix sequence** — press the prefix key, release, then press the action key. Sequential by contract; a simultaneous chord (e.g., plain Ctrl+W) is a different event and may never reach the page.

**Detach vs close pane** — detach ends the client connection while the session and all processes keep running; closing a pane removes it and stops that terminal's runtime. Never presented as equivalent. Page reload/pause is neither.

**Done (agent status)** — a per-client presentation of an Idle state whose completion is not yet acknowledged. A done badge is one client's projection, never proof of completion or of story truth.

**Action evidence / process evidence / learning evidence** — three kinds, never interchangeable: a fictional artifact produced, a Herdr operation performed, and the player's deliberate use of a taught operation. Narrative scripts can manufacture process evidence; they cannot manufacture player-action evidence.

**Keyboard transfer vs story completion** — separate outcomes. A player may finish the story with external/accessible controls and earn no keyboard-transfer credit; the record states which.

**Retention checkpoint** — a level that assesses only previously taught skills with faded scaffolding. A checkpoint that introduces a new skill is a curriculum defect.

**Capture context** — the host state machine (ordinary page, deliberate capture, suspended) distinct from Herdr's own modes. Loading or scene changes must never silently capture input; escape from capture must be keyboard-reachable.

**Logical clock** — deterministic simulation time advancing only through recorded events. Browser suspension freezes it; resume never applies wall-clock catch-up.

**Supported envelope** — the OS/browser/layout/assistive-technology matrix with a recorded test history. No envelope is supported until its physical-key test record exists; synthetic events are never certifying.

**Certifying evidence** — only what the claim requires: physical-key tests for interception claims, action+state provenance for skill claims, replay for determinism claims. Everything else is labeled non-certifying.
