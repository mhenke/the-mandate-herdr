# NARRATIVE_DESIGN — The Mandate: Herdr (PROPOSAL, not approved)

> Fictional content only. Trigger contracts describe story-state transitions inside simulated terminal content (documents, receipts, memos, interview transcripts). They do not specify Herdr bindings, layout, or components — those belong to later lanes (LEVEL.md, learning pass on verified research). Story event IDs are stable; implementation maps them later. S01–S12 curriculum references are informational (parent owns LEARNING_DESIGN.md); this doc maps story needs to practical information work, never to key sequences.

## 1. Quality mechanisms borrowed from Yazi Quest (mechanism, not plot/style)

Reference clone: `/tmp/opencode/the-mandate-research/yazi-quest` at commit `7220cfd0180a004f5a00db52c9cca6193395374f` (2026-11-23; upstream `https://github.com/mhenke/yazi-quest.git`). Docs read: `docs/STORY_ARC.md`, `docs/NARRATIVE_DESIGN.md`, `docs/HAUNTED_MACHINE_SUMMARY.md`, `docs/plans/2026-02-20-haunted-machine-design.md`. No dialogue or plot copied; no Yazi story content reused.

| Yazi mechanism | Herdr adaptation (content-level only) | Why |
|---|---|---|
| Triggered internal monologue, phased by episode (terminal thoughts) | Player's unsent verifier notebook: working notes shown as content in the working file, voice shifting E1 caution → E2 suspicion → E3 precision. Never in Herdr chrome. | Character growth without touching immutable UI |
| Prior-self voice with priority + cooldown (ghost dialogue) | Ellison marginalia on her lodged copies: method-only annotations ("Check the origin line, not the letterhead."), max 1/level, never hints the solution. | Guidance without walkthrough |
| Environment evolution by episode (boot sequences) | Room/posting evolution: cooperative board → EIAB intake notices → hearing summons, as content files. | Environmental storytelling inside fiction |
| Named-voice antagonist paper (broadcasts, mail) | Procedural paper with distinct registers: Vane memos, Beck deficiency slips, Desai checklists, Adebayo edit notes, counsel relays. All arrive as documents in the in-fiction inbox. | Adversary acts through paperwork, per limits |
| Breadcrumb files reinterpreting earlier actions | Re-read triggers: SUB-ACK-12 (L4) → INT-RECEIPT-12 (L5 arrival, L7 re-read), R-1/R-3 faces (L9→L10), IG-E3-02 §5 (L11→L14). Originals never edited; annotations are new dated entries. | Fair-play delayed revelation; logs stay append-only |
| Differentiated failure states | Procedural failures: Beck deficiency slips (missing element named, answer never given), Sam witness rejections, editor pushback, counsel conditions. Cure-and-refile loops. No game-over. | Failure teaches filing rules |

Explicitly NOT borrowed: AI-consciousness plot, hauntings, UI glitch overlays, threat meters, New Game+ loop. Tone stays procedural-thriller, not horror.

## 2. Story event IDs and trigger contracts

Naming: `SE-<level>-<slug>`. All events are **idempotent** (re-fire returns current state; no duplicate log entries — key = event ID + level ID), **re-entrant** (leaving and returning replays the content state, not the animation), and **gated** (prerequisites are EV possession / story flags, never keystrokes). Story clock advances on declared events only — never wall-time, never skill speed. A missed narrative deadline uses explicit recovery; evidence is never rewritten.

Practical information-work needs per event (maps to LEARNING_DESIGN S01–S12 territory without prescribing bindings): arrange/compare views, track provenance, record interviews, file/retract notes. Exact skill predicates belong in LEVEL.md.

| Event ID | Level (date) | Fires when (story condition) | Effect (content state) | Re-entry / failure / optional |
|---|---|---|---|---|
| SE-L1-assignment | L1 (Nov 12) | Assignment memo opened | Task + source-handling rules available | Re-entry: memo persists. No fail. |
| SE-L2-artifact | L2 (Nov 12) | Shared PDF examined | Artifact state: banner verified, origin-blank noted on face | Re-entry: annotations persist. |
| SE-L3-interview | L3 (Nov 13 AM) | Park interview completed (consent on record) | Transcript logged; script ID `LT-47B` + self-report timeline citable | Re-entry: transcript persists. Optional: follow-up question once. |
| SE-L4-filing | L4 (Nov 13) | VN-12 submitted | Note filed; SUB-ACK-12 issued to player file same night (blank origin + retraction always receivable + counting review next cycle) | Choice: paraphrase vs detail (recorded in NL-1). Failure: incomplete basis → clerk return, re-file same night. |
| SE-L5-retention1 | L5 (Nov 14 AM) | Finding submitted on fresh set; INT-RECEIPT-12 (= DR-2) arrives in morning paperwork | Accepted receipt adds counting line ("independent pending verification" — not yet understood); rubric pass/fail (uses only revealed authorities) | Failure: deficiency slip naming missing element; evidence preserved; retry. No plot lock. |
| SE-L6-finding | L6 (Nov 16) | F-47-E3 opened; leave/personnel order posts as new paperwork; Q-118 content readable via mirror | Finding + vote date known; R-1/R-3/R-2 listed; Ellison "asked and was removed" lands here | Re-entry: finding persists. |
| SE-L7-reread | L7 (Nov 17) | VN-12 matched to R-2 via accepted receipt (INT-RECEIPT-12) | Re-read annotation on accepted receipt; counterfactual stated by Beck line | Optional re-read anytime. |
| SE-L8-trace | L8 (Nov 18–19) | R-3 path traced to OCC forward | Forwarding record + hours-narrowing memo (dated 11/19) available | Choice: briefing vs independent (standing weight recorded). |
| SE-L9-crosswalk | L9 (Nov 19–20) | R-1/R-3 comparison recorded + profile diff requested | Copy artifact + M-47-FWD-03 + profile diff citable | Choice: publish vs hold (correction cost recorded). Failure: incomplete cross-walk → deficiency, retry. |
| SE-L10-retention2 | L10 (Nov 20) | Common-root proof submitted (faces + receipts + comparison only) | Pass → E3 story flag | Failure: deficiency slip; retry. No lodging, no law text needed. Optional (not scored, never required): IQ-1 snapshot (released Nov 17, in L10 paperwork) examinable as queue-depth-vs-finding-date comparison predicate. |
| SE-L11-law | L11 (Nov 21 AM) | D-47 §4 + IG-E3-02 read in full | Genuine-independence standard + rebuttable-presumption + Cole §5 duty citable; re-read annotations on R-faces activate as dated entries | Re-entry: annotations persist. |
| SE-L12-lodging | L12 (Nov 21–22) | C-1 requested via BCR request | Lodged originals + receipt available; copy-vs-original comparison citable (no tamper-proof claim) | Failure: malformed request → Desai checklist return, retry. |
| SE-L13-counsel | L13 (Nov 22) | Counsel relay opened | Ellison index + leave/credential facts; Quill interview (conditions vary by L4) | Choice: immediate request vs map-first (chain weight recorded). No puzzle, no key. |
| SE-L14-draft | L14 (Nov 23) | CPF-9 draft submitted | Beck deficiency loop until two-source rule met (missing elements named, answers never given) | Choice: retraction scope; choice: naming. Complete on curable draft meeting the rule — not on perfection. |
| SE-L15-filing | L15 (Nov 24, 08:00) | CPF-9 filed by 08:00 story-clock | Filed stamp; hearing-room move unlocks. Late → Beck "untimely" slip with one explicit recovery (never rewritten evidence, never hard-lock). | The move: detach from prep workspace (everything keeps running; state restores on reattach) → reattach at hearing-room terminal. Corpus must already be organized/geometr­y-set because mid-hearing restructuring is not permitted. Skill-subtask evidence recorded per learning pass; filing alone never passes. |
| SE-L15-reading | L15 (Nov 24, 10:00) | Hearing reached AND filing complete AND required skill evidence present | Live finale: retraction + findings read into the log (assessed disclosure with resulting state); Board orders; ending card. Verbatim passage located + copied into reading packet beforehand (search/copy); retraction text state verified before standing (verify output) | Once; idempotent replay. Ending card reflects all five choices. Scene entry alone completes nothing. |

Global rules: no event writes twice into the log; leaving mid-level preserves EV possession; deficiency slips never reveal answers; optional disclosures (marginalia, re-reads, follow-ups) never gate progress.

## 3. Pacing and environmental techniques (content-only)

- **One-cycle delay:** institutional reactions arrive as next-level paperwork (mirror/intake cycle), never instant. Dread without surveillance.
- **Volume as pressure:** E2–E3 competing aids grow the corpus; pacing tool is triage load, not timers.
- **Room/posting evolution:** cooperative board → intake notices → hearing summons mark episode turns.
- **Re-read annotations:** dated addenda on old EVs (never edits) deliver reinterpretation beats.
- **Witness rhythm:** Sam initials every log action; a missing initial signals bypass.
- **Scarcity discipline:** Ellison has exactly two texts (opening desk-log line + counsel-relayed index) plus method marginalia. Vane never appears in person after the L8 offer — only paper. Adebayo and counsel carry the live voices E2–E3.
- **Repeated filing beats, varied:** L4 files a note; L9 negotiates publication; L13 records an interview; L14 drafts a retraction; L15 reads aloud. Each is a different information-work action with different obligations — never fifteen read-and-file episodes.

## 4. Scene samples (voice + terminal-environment storytelling, original — not adapted from Yazi)

**Sample 1 — L2 artifact inspection (player notebook voice, working file):**
```
> artifact UM-1109-88 (shared copy, headers stripped by sender)
> banner text matches portal demo prefix. window 21:47-21:52
  consistent with ticket VT-1109-0214.
> origin line: BLANK. not redacted — the share just never had it.
> notebook: i verified the banner. i did NOT see the event.
  write that down exactly, or someone will count this wrong.
```

**Sample 2 — L8 Vane briefing offer (courteous procedure, written):**
```
MEMORANDUM — Office of Civic Continuity — 11/19
TO: Credentialed verifiers (via intake)          FROM: C. Vane, Deputy Liaison
RE: Consolidated briefing on corroborated pattern F-47-E3
1. To spare staff repeated trips, this office offers one
   consolidated briefing covering all three reports, with
   cross-reference packet. Attendance logged as assistance.
2. Independent verification remains available through
   standard channels (current wait: 6 nights). — C.V.
[clerk pencil, margin: "6 nights is a choice, not a backlog."]
```

**Sample 3 — L14 Beck deficiency (strict-but-fair, teaches the rule):**
```
OPCI — DEFICIENCY SLIP — CPF-9 DRAFT, returned 02:14
1. Standing acknowledged. Credentialed filer, timely.
2. Corroboration: ONE chain shown (lodging comparison).
   TWO required. SOC headers or consent interview — your
   word about Quill is good. It is not corroboration.
3. Affirmative proof, not subtraction: show the shared root
   (script ID + window + profile diff), not merely that
   your note was wrong. Retract AND replace. — R.B.
```

## 5. Parent handoff: per-level discoveries/dependencies (for LEVEL.md)

| L1 (Nov 12) | accept assignment | assignment memo + source rules | — | L2 |
| L2 (Nov 12) | inspect artifact | SOC-shared PDF (origin-blank noted) | L1 | L3 |
| L3 (Nov 13 AM) | interview technician | Park transcript: `LT-47B`, misfire, self-report | L2 | L4 |
| L4 (Nov 13 PM) | file note (CHOICE 1: source protection) | VN-12 + SUB-ACK-12 (same-night ack) | L3 | L5 |
| L5 (Nov 14 AM) | compile finding (retention I) | INT-RECEIPT-12 (= DR-2) in morning paperwork + provenance-backed finding on fresh set | L2–L4 story states | E2 |
| L6 (Nov 16) | read finding | F-47-E3; player note is R-2; vote set; Ellison leave order posts; Q-118 content readable | L5 | L7 |
| L7 (Nov 17) | re-read receipt | counterfactual (no R-2, no finding); `LT-47B` recurrence | INT-RECEIPT-12 + F-47-E3 | L8 |
| L8 (Nov 18–19) | trace path (CHOICE 2: briefing) | R-3→OCC forward; hours memo; briefing offer 11/19 | L7 | L9 |
| L9 (Nov 19–20) | cross-walk twins (CHOICE 3: publish) | R-1/R-3 identity; M-47-FWD-03; profile diff | L8 | L10 |
| L10 (Nov 20) | prove common root (retention II) | R-1/R-3 shared root + VN-12 non-independence, from faces/receipts | L7–L9 states | E3 |
| L11 (Nov 21 AM) | read law + guidance | D-47 §4 genuine-independence; IG-E3-02 presumption; Cole §5 duty | L10 | L12 |
| L12 (Nov 21–22) | request lodging | C-1 originals + receipt; comparison discipline | L11 | L13 |
| L13 (Nov 22) | meet via counsel (CHOICE 4: now vs map-first) | Ellison index; Quill interview second chain | L12 | L14 |
| L14 (Nov 23) | draft retraction (CHOICE 5a scope + 5b naming) | CPF-9 meeting two-source rule | L9–L13 states | L15 |
| L15 (Nov 24) | file + read aloud (cumulative) | Board rejection of package; standard measures continue; referrals + costs on record | CPF-9 + skill evidence | — |

No level requires keystroke data; all story gates are EV-possession + filing-quality states. Skill predicates and receipt/config/hearing dates feed LEVEL.md; exact timestamps live in STORY_BIBLE §6.

## 6. Revision audit (explicit; no self-approval)

- **Counterfactual (remove player):** R-1 + R-3 = two reports; IG-E3-02 needs three; no finding, no vote — but the profile stays armed and Q-118 stays buried. Player is both cause and only cure (only the author retracts; only retraction + proof meets the rule). Material, not decorative.
- **Early clue consistency:** blank origin on the shared PDF (L2) + blank on SUB-ACK-12 (L4) + "independent pending verification" counting line on INT-RECEIPT-12 (L5 arrival, L7 re-read) + truncation artifact (L9) + script-ID recurrence (L7) are all on-screen before their payoffs; L7/L10/L11 re-reads reinterpret, never ambush.
- **Underlying chronology vs level knowledge:** truth table in STORY_BIBLE §6; per-level fictional dates in STORY_ARC §Per-level table. Level knowledge trails truth by stated gaps (R-3 exists pre-L6; counted status lands L7 via the accepted receipt; memo L9; law L11; lodging L13; IQ-1 released Nov 17, examinable at L10 as optional, never required). "Was removed" lands at L6 (Nov 16) via the leave/personnel order posting — both halves of the beat (query + removal) arrive together, since Q-118 was filed Nov 15, after E1 closed. F-47-E3 (filed Nov 14) is released to the player Nov 16 after a stated weekend hold. No level consumes undelivered knowledge.
- **Witness access:** Vane never sees C-1/SM-1 contents (no memo references them); Beck never sees the lodging before L12 request; Desai never learns Quill's identity; Ellison on leave has no intake access (credential suspension stated). Sam witnesses every player log action.
- **Evidence alternatives preserved:** hostile-probe reading (ruled out: script config + self-report); independent-third-observation reading (kept live until L10 disproves for *these* reports — same root *could* be re-observed, these markers prove it wasn't); selective-curation reading of C-1 (answered: completeness + declared gaps); good-faith-acceleration motive (preserved as motive, demolished as exoneration).
- **Choices/endings:** five stable choices (L4, L8, L9, L13, L14-scope, L14-naming — L14 holds two recorded decisions, one choice point with two dimensions; no hidden sixth). All Endings reject the package + continue standard measures; they differ in credit cost, corroboration weight, collaborator outcomes, and ending-card lines. No content locked; failures procedural with explicit recovery.
- **Checks actually run:** lexicon sweep (no hack/breach-cyber/decrypt/backdoor/mole/rigged outside avoidance lines); title/episode-name consistency across all three docs; ID stability (every ID in ARC tables exists in BIBLE §7 and NARRATIVE_DESIGN §5; no orphan references — verified by cross-read); chronology walk (receipt order R-1 Nov 10 → R-3 Nov 13 → R-2 Nov 14 matches finding Nov 14; no 72-hour apparatus remains); Yazi refs pinned to commit above with no copied dialogue.
- **Story-verb vs S01–S12 matrix (noted, not fixed — LEVEL.md lane):** story verbs name information-work actions, not Herdr operations, so no verb contradicts a matrix cell. Two watch-items for LEVEL.md: (a) L15's "file + read aloud" verb must not collapse its five skill demands (organize, compare, verify output, search/copy, detach-reattach) into one observable — the hearing-room move is designed to force them apart, but the level contract must score them as separate subtasks; (b) L5/L10 retention verbs ("compile finding," "prove common root") must map onto their checkpoint skill sets (L5: S01, S03–S06; L10: S07–S10 + retrieval) without adding new interface skills — current story text adds none. No changes made here; flagging for reconciliation.
- **Remaining weaknesses (same five as STORY_ARC, for LEVEL.md pass):** copy-artifact weight, Cole corroboration depth (RESOLVED-optional via IQ-1 — examinable L10, never scored), publish-path correction staging, Vane monotony, E2 interview texture. Plus: LEARNING_DESIGN reconciliation (skill predicates per level) is parent's lane — this doc maps story needs only.
