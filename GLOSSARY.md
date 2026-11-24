# Glossary — The Mandate: Herdr

Single project context. Two language groups share this file because both are load-bearing across the design docs; split with `GLOSSARY-MAP.md` if either grows its own dialect. Terms are canonical proposals (the design itself is not yet approved). Specific instance data (IDs, dates, characters) lives in `docs/STORY_BIBLE.md`, not here.

## Investigation domain (fiction)

**Origin event**:
The one real upstream incident a report derives from. Exactly one exists in the story; reports may share it without any of them being false.
_Avoid_: Incident, breach, root cause

**Origin-Event-ID**:
The stable identifier linking a report to its origin event. A blank origin field means the ID was never carried (form default or configured stripping); it is not evidence of redaction or tampering on its own.
_Avoid_: Incident ID, ticket number, tracking key

**Receipt path**:
The route a report traveled from source to intake. Distinct receipt paths are about transportation, never about who observed what.
_Avoid_: Delivery channel, intake route, transmission path

**Independent observation**:
A distinct observer making a distinct observation of the event. Genuine independence is about observation, not delivery. Three reports on three receipt paths may be zero, one, two, or three independent observations.
_Avoid_: Separate report, distinct delivery, external filing

**Derivative report**:
A report whose content derives from an earlier artifact rather than from its filer's own observation. A derivative report can be entirely accurate and still not independent.
_Avoid_: Duplicate report, copycat filing, secondary ticket

**Corroborated pattern**:
The procedural state produced when the intake rule counts three facially independent reports. Procedurally valid and substantively wrong are simultaneously possible; that gap is the story's mechanism.
_Avoid_: Verified fact, confirmed event, validated pattern

**Rebuttable presumption**:
The intake guidance's assumption of independence from faces, which a timely counter-provenance filing can overturn. Presumption rebutted ≠ rule broken: the shortcut lives in subordinate guidance, not the ratified law.
_Avoid_: Legal fact, binding conclusion, verified intake

**Verifier note (VN)**:
The player's signed, retractable report. Any credentialed verifier may file one; only a two-source-corroborated filing forces review.
_Avoid_: Investigation report, audit memo, analyst note

**Counter-provenance filing (CPF)**:
The affirmative instrument proving common source and retracting the filer's own contribution. Subtraction alone (withdrawing a report) is never sufficient; the filing must establish the shared origin.
_Avoid_: Retraction notice, correction ticket, appeal

**Retraction**:
The author's own withdrawal of their report, always receivable, always on the record, always costly. Only the author can retract; this is why the player is both the emergency's cause and its only cure.
_Avoid_: Deletion, expungement, revocation

**Dispatch receipt**:
The intake-side record of when a report arrived on which path. Timestamps three deliveries; proves nothing about independence.
_Avoid_: Delivery confirmation, shipping note, ingress receipt

**Submission acknowledgment vs intake receipt**:
Two different artifacts: the acknowledgment issued at the moment of filing; the intake receipt issued when the report is counted, on a later intake cycle. Their dates differ by design.
_Avoid_: Filing receipt, confirmation email, receipt record

**Fair-play artifact**:
An on-screen document available to the player before a revelation that later re-reads with new meaning. The test: the clue must be visible at the moment of the player's action, not introduced afterward.
_Avoid_: Clue, Easter egg, foreshadowing prop

**Fair-play window**:
The span between a clue's first visibility and its payoff. The twist stress test must test the window's start, not only its end: a clue first visible at level 3 is fair play from level 3, even if the story only tests the guesser at level 7.
_Avoid_: Clue lifespan, revelation delay, foreshadowing interval

**Negative evidence**:
A proof of absence (for example, no player session in an access log). Valid only with a stated custodian, a request route the player can actually use, and a declared completeness limit; it never proves more than its limit, and its absence-claim is itself subject to the provenance/accuracy/timing/intent distinction.
_Avoid_: Missing record, absence proof, gap analysis

**Clue-audit row**:
The per-clue record the fairness discipline requires: first visible (level and date), payoff level, the alternative reading preserved, and the specific observation that excludes that reading. Major clues get one; a stress-test claim with no staged disproof is a defect, not a flourish.
_Avoid_: Clue tracker, plot ledger, revelation matrix

**Provenance / Accuracy / Timing / Intent**:
Four distinct questions about any artifact: where it came from, whether it is true, when it was made, and why. Evidence of one never establishes another. Authentication (hash, signature) speaks only to provenance-against-a-comparison-original.
_Avoid_: Authenticity, credibility, truthfulness

**Level knowledge vs underlying truth**:
What the player can know at a given level versus the full chronology. Knowledge trails truth by stated gaps; no level consumes knowledge the fiction has not delivered.
_Avoid_: Player knowledge vs spoiler, gameplay knowledge vs canon

**Story clock**:
Fictional time advancing only on declared story events. Never wall-clock; never skill-speed. A missed deadline uses explicit recovery and never rewrites evidence.
_Avoid_: Game timer, wall clock, mission timer

## Assessment and interface domain

**Prefix sequence**:
Press the prefix key, release, then press the action key. Sequential by contract; a simultaneous chord (e.g., plain Ctrl+W) is a different event and may never reach the page.
_Avoid_: Chord, hotkey, key combination

**Detach vs close pane**:
Detach ends the client connection while the session and all processes keep running; closing a pane removes it and stops that terminal's runtime. Never presented as equivalent. Page reload/pause is neither.
_Avoid_: Exit, disconnect, quit

**Done (agent status)**:
A per-client presentation of an Idle state whose completion is not yet acknowledged. A done badge is one client's projection, never proof of completion or of story truth.
_Avoid_: Complete, finished, terminated

**Action evidence / process evidence / learning evidence**:
Three kinds, never interchangeable: a fictional artifact produced, a Herdr operation performed, and the player's deliberate use of a taught operation. Narrative scripts can manufacture process evidence; they cannot manufacture player-action evidence.
_Avoid_: Score, test pass, achievement

**Provenance kinds**:
The origin labels behind any resulting state: player action (performed by the player), fixture (pre-created state), or simulated process event (produced by fictional machinery). Fixtures and process events never count as player actions; the provenance kind recorded for an objective decides which evidence kinds it can earn.
_Avoid_: Event types, input origins, action sources

**Keyboard transfer vs story completion**:
Separate outcomes. A player may finish the story with external/accessible controls and earn no keyboard-transfer credit; the record states which.
_Avoid_: Win state, game clear, level passed

**Retention checkpoint**:
A level that assesses only previously taught skills with faded scaffolding. A checkpoint that introduces a new skill is a curriculum defect.
_Avoid_: Quiz level, test stage, boss fight

**Capture context**:
The host state machine (ordinary page, deliberate capture, suspended) distinct from Herdr's own modes. Loading or scene changes must never silently capture input; release from capture is keyboard-reachable via the external release control, never via the Escape key, which is Herdr-owned inside the simulated TUI.
_Avoid_: Focus trap, modal lock, input grab

**Logical clock**:
Deterministic simulation time advancing only through recorded events. Browser suspension freezes it; resume never applies wall-clock catch-up.
_Avoid_: Delta time, frame clock, render loop

**Supported envelope**:
The OS/browser/layout/assistive-technology matrix with a recorded evidence basis. Two flavors: **measured** (a physical-key test record exists) and **accepted** (an explicit user authorization stands in place of measurement). Synthetic events are never certifying for either. The Gate-1 envelope (2026-11-23) is accepted, not measured; a measured cross-browser claim reopens it.
_Avoid_: Compatibility list, system requirements, browser matrix

**Certifying evidence**:
Only what the claim requires: physical-key tests for interception claims, action+state provenance for skill claims, replay for determinism claims. Everything else is labeled non-certifying.
_Avoid_: Green build, passing test, functional proof

**Risk chord**:
A keyboard chord the browser or OS is presumed to consume before the page (Ctrl+W plain and Ctrl+W in field). No required game action, lesson predicate, or assessment may depend on a risk chord reaching the page; the probe's warning panel documents the interception for players.
_Avoid_: Dangerous key, conflict shortcut, reserved hotkey

**Voided attempt**:
An attempt whose pending prefix was discarded by host blur. Voided is re-triable and is never recorded as a failure; assessment counts only attempts that completed inside one capture context.
_Avoid_: Failed attempt, strike, error

**Partial introduction**:
A matrix cell that teaches part of a skill's content only (for example, the close half of the detach/reattach-versus-close skill). The matrix records the split explicitly; a later level's full introduction never backdates to the partial one.
_Avoid_: Incomplete lesson, teaser, preview

**Upstream visual baseline**:
The 28 screen captures generated from a real build of pinned Herdr 0.9.5 (`e8d7d97`) in `tests/e2e/__screenshots__/upstream/`. Serves as the authoritative visual contract for layout, chrome, borders, and typography.
_Avoid_: Illustrative concept art, mock screenshot, reference render

**Cold open cinematic**:
An atmospheric, 25-second silent establishing film introducing an episode before interactive gameplay begins, built with HyperFrames and locked camera framing.
_Avoid_: Product trailer, teaser video, explainer animation

**Mission outro**:
A short (15–25s) cinematic following verified completion of a significant narrative beat, confirming real consequences and introducing the next investigative lead.
_Avoid_: Level complete screen, win screen, mission victory

**Episode finale**:
A major cinematic sequence following the final level of an episode (L5, L10, L15), delivering the episode cliffhanger or turning point.
_Avoid_: Season finale, cutscene, chapter transition

**Game ending**:
A choice-sensitive final resolution following L15, reflecting the player's five moral decisions across characters and institutions.
_Avoid_: Epilogue cinematic, end credits sequence
