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
| Breadcrumb files reinterpreting earlier actions | Re-read triggers: INT-RECEIPT-12 (L4→L7), R-1/R-3 faces (L9→L10), IG-E3-02 §5 (L11→L14). Originals never edited; annotations are new dated entries. | Fair-play delayed revelation; logs stay append-only |
| Differentiated failure states | Procedural failures: Beck deficiency slips (missing element named, answer never given), Sam witness rejections, editor pushback, counsel conditions. Cure-and-refile loops. No game-over. | Failure teaches filing rules |

Explicitly NOT borrowed: AI-consciousness plot, hauntings, UI glitch overlays, threat meters, New Game+ loop. Tone stays procedural-thriller, not horror.

## 2. Story event IDs and trigger contracts

Naming: `SE-<level>-<slug>`. All events are **idempotent** (re-fire returns current state; no duplicate log entries — key = event ID + level ID), **re-entrant** (leaving and returning replays the content state, not the animation), and **gated** (prerequisites are EV possession / story flags, never keystrokes). Story clock advances on declared events only — never wall-time, never skill speed. A missed narrative deadline uses explicit recovery; evidence is never rewritten.

Practical information-work needs per event (maps to LEARNING_DESIGN S01–S12 territory without prescribing bindings): arrange/compare views, track provenance, record interviews, file/retract notes. Exact skill predicates belong in LEVEL.md.

| Event ID | Level | Fires when (story condition) | Effect (content state) | Re-entry / failure / optional |
|---|---|---|---|---|
| SE-L1-assignment | L1 | Assignment memo opened | Task + source-handling rules available | Re-entry: memo persists. No fail. |
| SE-L2-artifact | L2 | Shared PDF examined | Artifact state: banner verified, origin-blank noted on face | Re-entry: annotations persist. |
| SE-L3-interview | L3 | Park interview completed (consent on record) | Transcript logged; script ID `LT-47B` + self-report timeline citable | Re-entry: transcript persists. Optional: follow-up question once. |
| SE-L4-filing | L4 | VN-12 submitted | Note filed; INT-RECEIPT-12 issued to player file (blank origin + "independent pending verification" visible) | Choice: paraphrase vs detail (recorded in NL-1). Failure: incomplete basis → Sam-equivalent clerk return, re-file same night. |
| SE-L5-retention1 | L5 | Finding submitted on fresh set | Beck-style rubric pass/fail (uses only revealed authorities) | Failure: deficiency slip naming missing element; evidence preserved; retry. No plot lock. |
| SE-L6-finding | L6 | F-47-E3 opened | Finding + vote date known; R-1/R-3/R-2 listed | Re-entry: finding persists. |
| SE-L7-reread | L7 | VN-12 matched to R-2 via receipt | Re-read annotation on INT-RECEIPT-12; counterfactual stated by Beck line | Optional re-read anytime. |
| SE-L8-trace | L8 | R-3 path traced to OCC forward | Forwarding record + hours-narrowing memo available | Choice: briefing vs independent (standing weight recorded). |
| SE-L9-crosswalk | L9 | R-1/R-3 comparison recorded + profile diff requested | Copy artifact + M-47-FWD-03 + profile diff citable | Choice: publish vs hold (correction cost recorded). Failure: incomplete cross-walk → deficiency, retry. |
| SE-L10-retention2 | L10 | Common-root proof submitted (faces + receipts + comparison only) | Pass → E3 story flag | Failure: deficiency slip; retry. No lodging, no law text needed. |
| SE-L11-law | L11 | D-47 §4 + IG-E3-02 read in full | Genuine-independence standard + rebuttable-presumption + Cole §5 duty citable; re-read annotations on R-faces activate as dated entries | Re-entry: annotations persist. |
| SE-L12-lodging | L12 | C-1 requested via BCR request | Lodged originals + receipt available; copy-vs-original comparison citable (no tamper-proof claim) | Failure: malformed request → Desai checklist return, retry. |
| SE-L13-counsel | L13 | Counsel relay opened | Ellison index + leave/credential facts; Quill interview (conditions vary by L4) | Choice: immediate request vs map-first (chain weight recorded). No puzzle, no key. |
| SE-L14-draft | L14 | CPF-9 draft submitted | Beck deficiency loop until two-source rule met (missing elements named, answers never given) | Choice: retraction scope; choice: naming. Complete on curable draft meeting the rule — not on perfection. |
| SE-L15-filing | L15 | CPF-9 filed by 08:00 story-clock | Filed stamp; hearing unlocks. Late → Beck "untimely" slip with one explicit recovery (never rewritten evidence, never hard-lock). | Skill-subtask evidence recorded per learning pass; filing alone never passes. |
| SE-L15-reading | L15 | Hearing reached AND filing complete AND required skill evidence present | Live finale: retraction + findings read into the log (assessed disclosure with resulting state); Board orders; ending card | Once; idempotent replay. Ending card reflects all five choices. Scene entry alone completes nothing. |

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

| Lv | Story verb | Discovers | Depends on | Unlocks |
|----|-----------|-----------|------------|---------|
| L1 | accept assignment | assignment memo + source rules | — | L2 |
| L2 | inspect artifact | SOC-shared PDF (origin-blank noted) | L1 | L3 |
| L3 | interview technician | Park transcript: `LT-47B`, misfire, self-report | L2 | L4 |
| L4 | file note (CHOICE 1: source protection) | VN-12 + INT-RECEIPT-12 (fair-play artifact) | L3 | L5 |
| L5 | compile finding (retention I) | provenance-backed finding on fresh set | L2–L4 story states | E2 |
| L6 | read finding | F-47-E3; player note is R-2; vote set | L5 | L7 |
| L7 | re-read receipt | counterfactual (no R-2, no finding); `LT-47B` recurrence | INT-RECEIPT-12 + F-47-E3 | L8 |
| L8 | trace path (CHOICE 2: briefing) | R-3→OCC forward; hours memo | L7 | L9 |
| L9 | cross-walk twins (CHOICE 3: publish) | R-1/R-3 identity; M-47-FWD-03; profile diff | L8 | L10 |
| L10 | prove common root (retention II) | R-1/R-3 shared root + VN-12 non-independence, from faces/receipts | L7–L9 states | E3 |
| L11 | read law + guidance | D-47 §4 genuine-independence; IG-E3-02 presumption; Cole §5 duty | L10 | L12 |
| L12 | request lodging | C-1 originals + receipt; comparison discipline | L11 | L13 |
| L13 | meet via counsel (CHOICE 4: now vs map-first) | Ellison index; Quill interview second chain | L12 | L14 |
| L14 | draft retraction (CHOICE 5a scope + 5b naming) | CPF-9 meeting two-source rule | L9–L13 states | L15 |
| L15 | file + read aloud (cumulative) | Board rejection of package; standard measures continue; referrals + costs on record | CPF-9 + skill evidence | — |

No level requires keystroke data; all story gates are EV-possession + filing-quality states. Skill predicates and receipt/config/hearing dates feed LEVEL.md; exact timestamps live in STORY_BIBLE §6.

## 6. Revision audit (explicit; no self-approval)

- **Counterfactual (remove player):** R-1 + R-3 = two reports; IG-E3-02 needs three; no finding, no vote — but the profile stays armed and Q-118 stays buried. Player is both cause and only cure (only the author retracts; only retraction + proof meets the rule). Material, not decorative.
- **Early clue consistency:** blank origin on the shared PDF (L2) + blank on INT-RECEIPT-12 (L4) + truncation artifact (L9) + script-ID recurrence (L7) are all on-screen before their payoffs; L7/L10/L11 re-reads reinterpret, never ambush.
- **Underlying chronology vs level knowledge:** truth table in STORY_BIBLE §6; level knowledge trails truth by stated gaps (R-3 exists pre-L6; counted status lands L7; memo L9; law L11; lodging L13). No level consumes undelivered knowledge.
- **Witness access:** Vane never sees C-1/SM-1 contents (no memo references them); Beck never sees the lodging before L12 request; Desai never learns Quill's identity; Ellison on leave has no intake access (credential suspension stated). Sam witnesses every player log action.
- **Evidence alternatives preserved:** hostile-probe reading (ruled out: script config + self-report); independent-third-observation reading (kept live until L10 disproves for *these* reports — same root *could* be re-observed, these markers prove it wasn't); selective-curation reading of C-1 (answered: completeness + declared gaps); good-faith-acceleration motive (preserved as motive, demolished as exoneration).
- **Choices/endings:** five stable choices (L4, L8, L9, L13, L14-scope, L14-naming — L14 holds two recorded decisions, one choice point with two dimensions; no hidden sixth). All Endings reject the package + continue standard measures; they differ in credit cost, corroboration weight, collaborator outcomes, and ending-card lines. No content locked; failures procedural with explicit recovery.
- **Checks actually run:** lexicon sweep (no hack/breach-cyber/decrypt/backdoor/mole/rigged outside avoidance lines); title/episode-name consistency across all three docs; ID stability (every ID in ARC tables exists in BIBLE §7 and NARRATIVE_DESIGN §5; no orphan references — verified by cross-read); chronology walk (receipt order R-1 Nov 10 → R-3 Nov 13 → R-2 Nov 14 matches finding Nov 14; no 72-hour apparatus remains); Yazi refs pinned to commit above with no copied dialogue.
- **Remaining weaknesses (same five as STORY_ARC, for LEVEL.md pass):** copy-artifact weight, Cole corroboration depth, publish-path correction staging, Vane monotony, E2 interview texture. Plus: LEARNING_DESIGN reconciliation (skill predicates per level) is parent's lane — this doc maps story needs only.
