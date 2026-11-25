# Glossary — The Mandate: Herdr

Single project context. Two language groups share this file because both are load-bearing across the design docs; split with `GLOSSARY-MAP.md` if either grows its own dialect. Terms are canonical proposals (the design itself is not yet approved). Specific instance data (IDs, dates, characters) lives in `docs/STORY_BIBLE.md`, not here.

## Investigation domain (fiction)

**The Cooperative (Capital Press & Analyst Cooperative)**:
The independent journalist and analyst network the player belongs to as a credentialed verifier. Operates the Desk Feed, assigns verifiers to stories, and maintains the newsroom log (NL-1). Holds no regulatory, subpoena, or law enforcement power; its records serve as the required independent corroborating source.
_Avoid_: News syndicate, press company, intelligence agency

**Desk Feed / Secure Dispatch**:
The restricted intake channel between the Cooperative's Editor of Record and stringers in the field. Delivers verified leads, editorial directives, and off-record assignments without exposing confidential source identities.
_Avoid_: Mission inbox, ticket feed, alert notification

**Newsroom log (NL-1)**:
The cooperative's attributable publication and correction ledger maintained by the Editor of Record. Entries carry sequential entry identifiers, fictional timestamps, action references, related evidence IDs, and explicit amendment links; corrections append new entries preserving prior versions without silent rewriting. An accurate entry proves only that the cooperative recorded an action—it corroborates internal newsroom chronology, but cannot establish underlying factual truth or manufacture independent corroboration for external vendor events.
_Avoid_: Audit trail, change log, revision history, tamper-proof ledger

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

**Stringer**:
An independent credentialed verifier affiliated with the cooperative network who files signed verifier notes.
_Avoid_: Reporter, freelance agent, private investigator, auditor

**Simulated Claude Code session (deterministic agent CLI)**:
A deterministic, in-terminal simulation of an automated LLM coding agent (Claude Code v1.0.12) running as a child process inside a dedicated Herdr pane. Emits bounded, reproducible log outputs, hashes, and audit extractions without connecting to external networks or requiring API credentials.
_Avoid_: Real Claude API, backend LLM integration, chatbot widget

**Token relevance matching**:
The prompt-matching mechanism where natural language requests are scored against document IDs (hyphenated and unhyphenated), titles, and search terms, replacing rigid regular expression matching.
_Avoid_: NLP model, fuzzy regex, vector search, semantic embedder

**Bounded task assignment**:
Directing a simulated agent with narrow, falsifiable verification questions (e.g. audit metadata, extract timestamp, calculate hash) rather than unbounded open-ended prompts, producing structured evidence suitable for cross-examination.
_Avoid_: Prompt engineering, agent chat, freeform prompting

**Source-handling protocol (Protocol CPA-01A)**:
The governing investigative rules enforced across the Cooperative network: (01) Verify origin before relying on material, (02) Preserve attribution and the chain of custody, and (03) Assume nothing confirmed—one origin is one claim, not independent corroboration.
_Avoid_: Editorial guidelines, newsroom rules, style guide

**Off-record consent gate**:
The procedural requirement where an investigative witness interview (such as Theo Park's account of misfire `LT-47B` in L3) cannot be unsealed or admitted into evidence until off-record consent terms are explicitly confirmed, triggering an authentic `blocked` state in the running process.
_Avoid_: Interview unlock, dialogue choice, Q&A prompt

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

**False credit**:
The accidental award of learning mastery from simulated process events, test fixtures, or external accessible controls rather than deliberate player keyboard actions.
_Avoid_: Free pass, unearned achievement, phantom completion

**Input policy**:
The session mode governing whether simulated chrome accepts pointer interaction. Standard enforces the in-world cooperative security restriction requiring keyboard-only operations on the remote console; Accessible permits alternative pointer navigation of simulated chrome without granting keyboard-transfer mastery credit.
_Avoid_: Mouse mode, easy mode, cheat mode, bypass

**Chrome event**:
An external host activation of simulated multiplexer navigation (workspace, tab, new-tab, or pane focus) recorded with non-player provenance (`playerAction: false`). Distinguishes host-level navigation from authentic player keyboard operations.
_Avoid_: Synthetic keystroke, simulated click, fake key

**New-tab prompt**:
The modal overlay opened by `prefix+c` when `prompt_new_tab_name` is true (the upstream Herdr default). Titled `new tab`, it pre-fills the next numerical index and commits tab creation only on `Enter`; `Escape` cancels without creating a tab. Differs from the tab rename field (`prefix+shift+t`), which modifies an already-existing tab and retains the current name on cancel or empty commit.
_Avoid_: Tab creation dialog, tab popup, new tab modal

**Capture release control**:
An accessible external host control that releases keyboard focus from the simulated terminal surface back to the browser page. Releases browser capture without consuming or redefining Herdr's own internal `Escape` key.
_Avoid_: Escape-to-release, global escape handler, modal escape

**Presentation event**:
A theatrical playback event (such as cold open playback, pause, resume, skip, or completion) scoped strictly to media projection. It is not a Herdr ChromeEvent, fictional ProcessEvent, Action evidence, or Learning evidence; it never advances the authoritative story clock and is kept outside the gameplay journal.
_Avoid_: Gameplay event, story trigger, terminal event, progression trigger

**Retention checkpoint**:
A level that assesses only previously taught skills with faded scaffolding. A checkpoint that introduces a new skill is a curriculum defect.
_Avoid_: Quiz level, test stage, boss fight

**Mouse chrome / hit targets (`hits`)**:
Clickable terminal grid regions active only when mouse capture is enabled. In the simulated TUI, hit targets translate pointer clicks directly to the corresponding Herdr key actions, exercising the exact same dispatch as keyboard chords without mutating state independently.
_Avoid_: UI buttons, overlay clicks, pointer shortcuts

**Mode bar**:
The authentic terminal status projection painted across row 40 during modal states (navigate, prefix, copy, resize) that places the mode indicator and key hints on a single unified line aligned with the sidebar collapse affordance. It is entirely unmounted in terminal mode and carries no artificial counters or synthetic status footers.
_Avoid_: Status bar, bottom dock, info footer, two-tier mode bar

**Compact sidebar**:
The 4-character collapsed sidebar state (upstream Herdr `14-sidebar-compact`) displaying workspace index numerals and process status dots while collapsing long names and header chrome. Preserves authentic 80-column terminal area on mobile or constrained viewports (`< 680px`).
_Avoid_: Collapsed menu, hamburger sidebar, mini dock

**Named session vs default server session**:
The process isolation boundary separating independent Herdr instances. A named session isolates Unix domain sockets and runtime state in dedicated user directories, allowing safe termination without affecting the shared default server session.
_Avoid_: Sandboxed session, isolated process, private server

**Capture context**:
The host state machine (ordinary page, deliberate capture, suspended) distinct from Herdr's own modes. Loading or scene changes must never silently capture input; release from capture is keyboard-reachable via the external release control, never via the Escape key, which is Herdr-owned inside the simulated TUI.
_Avoid_: Focus trap, modal lock, input grab

**Game HUD (Cooperative Mission HUD)**:
The external mission guidance, objective tracking, and capture status surface that sits outside and directly above the simulated Herdr console. It is entirely owned by the game host and Journalist Cooperative narrative layer, distinct from the Herdr TUI multiplexer chrome.
_Avoid_: Terminal header, TUI top bar, multiplexer banner, console HUD

**Fresh Herdr session**:
A clean multiplexer session starting with a single active tab and one un-split terminal pane in the default workspace. Does not pre-populate split panes or pre-open unearned reference documents.
_Avoid_: Pre-split template, default layout fixture, starter panes

**Single curriculum model (Herdr keyboard operations as sole curriculum)**:
The strict pedagogical boundary governing assessment: authentic Herdr multiplexer operations (S01–S12) constitute the sole assessed curriculum for keyboard-transfer credit. Fictional Claude Code agent orchestration and newsroom document tools supply the narrative work to organize, never an assessed skill. Prompt quality, tool choice, and investigative reasoning advance the story but never grant keyboard credit.
_Avoid_: Two-curricula model, prompt grading, agent curriculum, dual assessment

**Agent state rollup (`RawAgentState` / `Working`, `Blocked`, `Idle/Done`)**:
The three live process states projected in the Herdr spaces & agents sidebar: Working (🟢, active command execution or document search), Blocked (🟡, process suspended awaiting player intervention or confirmation, such as witness consent), and Idle/Done (⚪, task completed or terminal waiting for input, subject to client-side unviewed presentation).
_Avoid_: Agent status bar, task stage, process badge

**Client-side seen/unseen acknowledgment**:
The rule that a completed/idle agent remains flagged with its completion indicator in the local client's sidebar until the player focuses or views that specific pane surface, matching authentic Herdr v0.9.5 per-client composition rules.
_Avoid_: Server acknowledgment, read receipt, global seen flag

**Actions context (`ActionsProvider` / `useMandateActions`)**:
The presentation boundary providing a unified dispatcher for user-initiated multiplexer actions (workspace selection, tab switching, new tab, pane focus). Decouples presentation components without violating Standard mode's keyboard-only rule.
_Avoid_: Global state store, redux action, UI controller

**In-pane command line editing**:
Authentic terminal line editing inside focused shell panes where printable characters, Backspace, Ctrl+U (line clear), Ctrl+C (cancel), and cursor navigation operate directly on the live prompt buffer (`$ <input>`) without duplicating prompt glyphs or emitting synthetic key names.
_Avoid_: Form input, textbox edit, terminal textarea

**Reload recovery (Development state caching)**:
The development mechanism that preserves committed state across hot reloads via validated schema snapshots (for narrative, application, and assessment states) and journal event replay (for the Herdr multiplexer engine). Defers permanent persistence to Milestone 3 and never manufactures learning credit.
_Avoid_: Save game, checkpoint save, persistent database

**Purity compiler audit**:
The automated static verification using compiler AST analysis to inspect import declarations, export declarations, dynamic imports, CommonJS calls, and browser global identifier accesses across pure core simulation modules.
_Avoid_: Regex test, lint script, import scanner

**Spiral learning progression (`[I]`, `[G]`, `[Ind]`, `[M]`)**:
The four-stage progression advancing each skill through: Introduce (explicit binding prompt and safe initial trial), Guided Practice (contextual reminders and optional hints), Independent Retrieval (outcome-based goal with keybindings omitted from prompt), and Cumulative Mastery (checkpoint or final boss assessment under operational pressure).
_Avoid_: Difficulty curve, progression ladder, skill tree

**Scaffolding fading rule**:
The strict transition rule where a skill's explicit keybinding prompt is retired after one introduction (`[I]`) and two successful uses in changed contexts (`[G]`), converting subsequent prompts to outcome-based objectives while keeping voluntary help (`prefix+?`, HUD hints) available.
_Avoid_: Auto-hinting, difficulty scaling, dynamic difficulty

**Dual clock system (Story deadline vs Boss challenge clock)**:
The temporal structure separating the fictional statutory deadline (08:00 EST November 24, advancing exclusively on discrete story events) from the optional real-time countdown (15:00 Boss challenge clock in Episode III, pausing for help overlays, accessible mode, or capture release, and never altering evidentiary truth).
_Avoid_: Game timer, mission countdown, speedrun timer

**Herdr TUI (Simulated Console)**:
The pure multiplexer workspace consisting strictly of: the full-height spaces & agents sidebar, the top tab bar, the split panes, and the row 40 mode bar. It has zero awareness of game objectives, scores, or external web controls.
_Avoid_: Game screen, application UI, investigation window

**Manual Cinematic Transition (Non-Automatic Gate)**:
The transition policy where cinematic video playback pauses at its final frame upon completion (`onEnded`), requiring explicit player initiation (via S, Enter, or clicking the primary CTA) to enter the terminal workspace, preventing jarring auto-jumps.
_Avoid_: Auto-skip, auto-advance, video timeout, cutscene auto-redirect

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

**Herdr visual baseline**:
The 32 screen captures generated from a real build of pinned Herdr 0.9.5 (`e8d7d97`) in `references/herdr-baselines/`. Serves as the authoritative visual contract for layout, chrome, borders, and typography.
_Avoid_: Upstream baseline, mock screenshot, reference render, illustrative concept art

**Illustrative reference**:
Third-party and community fork screen captures (TermSplit, fork blog) in `references/illustrative/` used solely for mood orientation or contrasting layout patterns. Strictly non-authoritative.
_Avoid_: Baseline, behavioral authority, visual authority, specification

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
