# LEVEL.md — Per-level contracts (PROPOSAL, not approved)

> Status: proposal for review. Companion to STORY_BIBLE / STORY_ARC / NARRATIVE_DESIGN (proposals).
> This document owns the per-level join between story beats and interface lessons. It teaches no Herdr
> behavior beyond `HERDR_FIDELITY.md` (pinned upstream `e8d7d97`, docs edition 0.9.5) and
> `HERDR_RESEARCH.md`. Canonical terms follow the root `GLOSSARY.md` (action evidence / process
> evidence / learning evidence, story clock, capture context, certifying evidence, keyboard transfer
> vs story completion).

## Standing rules (apply to every block below)

- **Story clock.** Fictional dates come from the ARC date table. The clock advances only on declared
  story events (filings, receipts, postings). Never wall-time, never skill speed. A missed story
  deadline produces an explicit recovery (Beck untimely slip + one cure path); evidence is never
  rewritten.
- **Capture context.** Herdr-operation lessons run under deliberate capture, engaged and released via
  a page-level control outside the simulated Herdr surface. Capture entry/exit is keyboard-reachable,
  is never a Herdr binding, is never scored, and is never `prefix+q` or Herdr `Esc`. Where a level
  teaches or assesses prefix sequences, the contract says so and names its gates.
- **Three evidence kinds.** Every objective states provenance: **player action** (produces action
  evidence and, where a taught operation is deliberately used, learning evidence), **fixture**
  (pre-created state; never credited as player action), or **simulated process event** (produces
  process evidence only; narrative scripts cannot manufacture player-action evidence).
- **Story completion vs keyboard transfer.** Separate outcomes. External accessible controls may
  perform any story step; that earns story progress with modality recorded and no keyboard-transfer
  credit. The record reports per skill: independent / assisted / practiced / not observed. No opaque
  mastery percentage.
- **Checkpoints (L5, L10).** Previously-taught skills only, faded scaffolding, tier-0 start.
  Deficiency slips name missing elements, never supply answers. Retry preserves evidence.
- **L15.** Five separately scored subtasks, each with its own action/result predicate and score line.
  The disclosure (reading into the log) is required process evidence and is never sufficient alone.
- **Fidelity.** A lesson may teach only verified contracts. Anything routing through an unresolved
  contract carries a `BLOCKED-ON` line naming the blocker and its Gate-1/feasibility dependency.
  Avoided branches are stated as hard constraints in the contract, not silently skipped.
- **Feasibility gate.** `docs/FEASIBILITY_KEYBOARD.md` carries a **published envelope (user
  authorization, 2026-11-23)**: Chromium 158 evidenced (synthetic 18/18 + two physical chords),
  Firefox accepted by user decision with Ctrl+W risk-chord handling, IME/AltGr outside taught
  scope. A capture lesson ships only under that envelope and the decided hold policies (void-on-blur,
  Esc release, clipboard-failure fallback); probe item numbers below refer to that document's
  checklist (#1 Ctrl+B alone, #2 sequential Ctrl+B-then-key, #3 Ctrl+W plain,
  #4 Ctrl+W in field, #5 prefix+letter chords incl. h/j/k/l, #6 Esc, #7 Ctrl+[ alone,
  #8 field keys, #9 Tab, #10 AltGr, #11 IME/composition; #12–#18: prefix+? help,
  prefix+shift+n/t, prefix+minus, prefix+h/j/k/l, sequential prefix+[ (copy-mode entry,
  the most-assessed chord), plain Enter).
- **Never taught, never touched.** Close-workspace confirmation branches, sidebar-list navigation
  keys, checkout-deletion claims, background-ack agent semantics, close-pane confirmation accept
  path, `--handoff` timing. Page reload/pause is neither detach nor reattach. A Reconnect-style
  control is never presented as reattach.
- **Standing paste rule.** Text entry into story note/packet fields and placement of copied passages
  happen through page-level story controls external to chrome. No browser clipboard behavior, paste
  key, or IME interaction is asserted; the assessed action is the resulting packet content, never a
  keybinding.

### Standing BLOCKED-ON (applies everywhere a prefix sequence is taught, recorded, or assessed)

> **RESOLVED 2026-11-23 by user authorization** (see FEASIBILITY_KEYBOARD "User authorization"):
> (i) browser delivery of prefix chords — FEASIBILITY items #1, #2, #5 recorded `delivered`
> (synthetic Chromium pass; Firefox accepted by user decision, Ctrl+W plain/in-field flagged as
> risk chords covered by hold policy); (ii) host-blur pending-prefix policy — **decided:** a blur
> between prefix and action key voids that attempt (re-triable, never failed it); capture release
> is a separate external control that never steals Herdr-owned Escape (**amended at M2 approval**,
> see FEASIBILITY hold policy 2). The void-on-blur, Herdr-owned-Escape, and never-behind-Ctrl+W
> rules are binding constraints on every capture lesson.

### Standing field-edge constraint (applies everywhere typing enters a Herdr-owned field or copy-mode search)

> Lesson scope is ASCII input plus the listed keys only (help: `/`, Backspace, `ctrl+u`;
> copy-mode search: `/`, `?`, `n`, `N`, printable query text, Enter/Esc; rename field: printable
> text, Backspace, Enter/Esc). IME/composition and AltGr behavior is untaught and out of scope
> (FIDELITY Unresolved #3; FEASIBILITY #10/#11 must at minimum record what arrives before the
> lesson ships to any envelope where such input is possible). `Ctrl+W` in fields is never a
> required key (FIDELITY Unresolved #1 field-context edge; FEASIBILITY #4).

---

## L1 — Nov 12 — accept assignment — "Stringer Rates"

**Discoveries:** assignment memo + source-handling rules (story content, no EV). Ends with the SOC-tip
assignment accepted.

**Interface lesson (matrix):** S01 intro (prefix sequence vs ordinary forwarded terminal input),
S02 intro (authentic help: `prefix+?`, list is exactly the pinned active bindings, `/` filters),
S03 intro (session/workspace/tab/pane/process hierarchy: one workspace, one tab, two panes —
assignment pane + memo pane).

**Objectives (testable predicates):**
- O1 (S01/S03): Starting from the memo pane focused, perform prefix-only pane focus via
  `prefix+h/l` (admissible alternative: no alternative at intro — guided demonstration first, then
  one guided attempt). Resulting state: focus in the assignment pane; a subsequent typed character
  is accepted by the assignment process (input-destination evidence). Provenance: player action
  (action + learning evidence). FIDELITY: Prefix table (arm/resolve/consume/Esc); Core five focus
  row (directional-overlap, no wrap, no focus loss).
- O2 (S02): Open help (`prefix+?`), filter with `/`, clear with `ctrl+u`, exit. Resulting state:
  help lists exactly the pinned bindings; filter cleared. Provenance: player action.
  FIDELITY: Prefix Help row. Field-edge constraint applies to the filter field.
- O3 (S01-negative): Press an invalid follow-up after prefix; observe consumption (nothing reaches
  the pane, prefix mode exits). Resulting state: mode returns to Terminal, pane log unchanged.
  Provenance: player action + fixture log comparison. FIDELITY: Prefix invalid-follow-up row.

**Input context:** deliberate capture for O1–O3 (page affordance, outside chrome). External controls
may complete O1–O3 as story access (modality recorded, no transfer credit).

**Fidelity dependencies:** FIDELITY Prefix table; Core-five focus row; Help row; Presentation safety
(effects after committed state).

**BLOCKED-ON:** standing prefix line applies (delivery #1–2–5; blur policy). Field-edge constraint
applies to O2 filter typing.

**Failure/recovery:** wrong-pane input is corrected by refocusing (clerk line, not a fail). No deadline.

**Hints:** tier 0 brief; tier 1 concept cue (prefix arms one key); tier 2 help entry (binding
assistance, recorded); tier 3 worked example in practice task. Assistance recorded per objective.

## L2 — Nov 12 (afternoon) — inspect artifact — "Supplied Goods"

**Discoveries:** SOC-shared PDF (basis UM-1109-88; headers stripped in the share, noted on its face);
origin line blank by the share's nature. No new EV; sets up UM-1109-88/SM-1.

**Interface lesson:** S04 intro (new tab `prefix+c`, rename `prefix+shift+t`, switch `prefix+n/p`;
tabs row), S01/S02/S03 reinf.

**Objectives:**
- O1 (S04/S03): From the reading tab, create a second tab for the artifact, rename it via the
  Herdr field (printable text + Backspace + Enter only), switch between tabs. Admissible
  alternatives: switching via `prefix+n/p` (either accepted; name-based check accepts any
  legitimate name). Resulting state: two tabs, artifact tab named, active tab is the artifact tab;
  hierarchy statable (which tab holds which process). Provenance: player action.
  FIDELITY: Tabs row; Field editing (rename field); field-edge constraint (rename typing).
- O2 (S01 reinf): invalid prefix follow-up inside the artifact tab is consumed (nothing forwarded).
  Provenance: player action. FIDELITY: Prefix invalid row.
- O3 (S02 reinf): voluntary help consultation available throughout; use recorded, never punished.

**Input context:** deliberate capture for O1–O2. External controls legitimate for story access.

**Fidelity dependencies:** FIDELITY Tabs row; Prefix table; Field editing; Help row.

**BLOCKED-ON:** standing prefix line. Field-edge constraint (rename typing; `Ctrl+W`/IME/AltGr
out of scope).

**Failure/recovery:** malformed rename (empty) returns the field uncommitted with a clerk line;
retry same session.

**Hints:** tiers 0–3; tier 2 = binding assistance (recorded).

## L3 — Nov 13 (morning) — interview technician — "Five Minutes"

**Discoveries:** Park consent-interview transcript: script ID `LT-47B`, misfire, self-report timeline.
Story floor established (EVT-1109-A genuine).

**Interface lesson:** S05 intro (split right `prefix+v` / down `prefix+minus`; focus lands in new
pane; split tree), S06 intro (directional focus to the intended input destination), S04 reinf
(dedicated interview tab), S01 reinf.

**Objectives:**
- O1 (S05/S06, with S01 reinforcement in a changed context): Starting from one pane, split to stage assignment beside transcript draft; move
  focus between panes to the intended destination; typed input lands in the intended process.
  Admissible alternatives: right vs down split (either accepted unless the task states geometry;
  geometry is not required here). Resulting state: split tree with two live panes; focus where the
  player declares; input accepted by declared pane. Provenance: player action.
  FIDELITY: Core-five split + focus rows (no wrap; focus lands in new pane).
- O2 (S04 reinf): interview conducted in a named tab; tab arrangement statable. Provenance:
  player action.

**Input context:** deliberate capture. Interview consent recorded as story content (process evidence
from simulated intake event, not a Herdr action).

**Fidelity dependencies:** FIDELITY Core-five split/focus rows; Tabs row.

**BLOCKED-ON:** standing prefix line.

**Failure/recovery:** input in wrong pane → refocus and re-enter (clerk line cites the transcript,
never fails the level).

**Hints:** tiers 0–3; fading begins (no unsolicited key sequences after this level's reinforcement).

## L4 — Nov 13 (evening, 19:05 filing) — file note — CHOICE 1 (source protection) — "Filed 19:05"

**Discoveries:** VN-12 filed (origin blank, form default); SUB-ACK-12 same-night return (blank
origin + retraction-always-receivable + counting-review-next-cycle visible). CHOICE 1 recorded in
NL-1: paraphrase (Quill safe; VN-12 thinner) vs identifying detail (VN-12 stronger now; exposure
risk follows to L9/L13).

**Interface lesson:** S07 intro (new workspace `prefix+shift+n` for the filing draft; navigate
`prefix+w` up/down + Enter/Esc), S04/S05/S06 reinf (filing tab + split + focus), S02 reinf
(voluntary help), S03 reinf.

**Objectives:**
- O1 (S07/S04/S05): create a filing workspace, split it to stage the draft beside the assignment reference, draft VN-12 there, navigate back to the reading
  workspace. Resulting state: two workspaces; filing workspace holds the draft tab beside its reference.
  Provenance: player action (workspace/tab ops); draft content = player action; SUB-ACK-12 arrival
  = simulated process event (process evidence — never credited as player action).
  FIDELITY: Workspaces row (create/navigate); Tabs row; Navigate-mode contract
  (up/down move, Enter selects, Esc/`Ctrl+[` exits).
- O2 (S06 reinf): focus/input-destination check before filing (typed filing line lands in the draft
  process). Provenance: player action. FIDELITY: focus row.

**Input context:** deliberate capture for workspace/tab/focus ops. Filing-field typing under
field-edge constraint. Choice recorded via story control (external to chrome either way).

**Fidelity dependencies:** FIDELITY Workspaces row; Tabs row; Prefix table; Presentation safety.

**BLOCKED-ON:** standing prefix line. Field-edge constraint (draft typing). Close-workspace is
never used (global avoidance).

**Failure/recovery:** incomplete basis → clerk return naming the missing element; re-file same night
(story clock advances on the filing event only).

**Hints:** tiers 0–3. Choice consequences stated before deciding (telegraphed, not a trap).

## L5 — Nov 14 (morning) — compile finding — RETENTION I — "Fit to File"

**Discoveries:** INT-RECEIPT-12 (= DR-2) in morning paperwork ("independent pending verification" —
not yet understood). No Ellison knowledge (Q-118 filed Nov 15). Fresh evidence set, outcome brief.

**Interface lesson: previously-taught skills only (S01 intro L1; S03 intro L1; S04 intro L2;
S05/S06 intro L3). No new skills. Tier-0 start. Faded scaffolding: no unsolicited key sequences.**
Assesses S01, S03–S06 (per LEARNING_DESIGN checkpoint) + S02 (resolve an unfamiliar task using help:
reach a tab via number-jump `prefix+1..9`, an admissible S04 alternative resolved through the help
overlay's filter — type a query fragment, Backspace/clear with listed field keys only (field-edge
constraint), Enter the filtered row; the matrix's list-navigation keys stay untaught).

**Objectives:**
- O1: useful tab arrangement for the fresh set (≥2 tabs, named, stated purpose). Provenance:
  player action. FIDELITY: Tabs row.
- O2: player-created comparison split (split created this level by the player — a fixture
  pre-split grants nothing). Provenance: player action (action + learning evidence).
  FIDELITY: split row (focus lands in new pane).
- O3: correct focus/input destination (declared pane accepts input). Provenance: player action.
  FIDELITY: focus row.
- O4: provenance-backed finding on the fresh set (process evidence citing the fresh artifacts).
- O5 (S02): number-jump to a tab resolved via the help overlay filter (listed field keys only; field-edge constraint). Provenance: player
  action. FIDELITY: Tabs row (jump); Help row; Field editing.

**Input context:** deliberate capture for O1–O3/O5. External controls: story may complete assisted;
transfer credit withheld per skill.

**Fidelity dependencies:** FIDELITY Prefix table; Tabs row; split/focus rows; Help row.

**BLOCKED-ON:** standing prefix line (assessed evidence valid only under Gate-1 hold policy).

**Failure/recovery:** deficiency slip naming the missing element (provenance gap vs wrong input
destination distinguished); evidence preserved; retry same story day. Pass → E2.

**Hints:** start tier 0. Tier 1 concept cue / tier 2 binding entry / tier 3 worked example in a
separate practice task — each recorded; an assisted pass completes the story but banks an assisted
mark, with a fresh equivalent task available for independent retrieval.

## L6 — Nov 16 — read finding — "Three Votes"

**Discoveries:** F-47-E3 (filed Nov 14, released after stated weekend hold); Ellison leave/personnel
order (effective 09:00 — "asked and was removed" lands here); Q-118 content readable via mirror;
R-1/R-3/R-2 listing (player note is among them — not yet matched).

**Interface lesson:** S08 intro (goto picker `prefix+g`: rows grouped by workspace; `/` searches;
`j/k`/Up/Down move; Left/Right jump workspace sections without wrap; Esc/`Ctrl+[` exits — locate
the intake process among panes), S09 intro (zoom `prefix+z` the finding pane; pill state matches),
S05/S06 reinf (stage finding beside R-list in a split, with a further focus-transition sequence
declared and observed), S01/S03 further, S07 reinf (finding-analysis workspace).

**Objectives:**
- O1 (S08): locate the intake process via the goto picker (admissible: `/` search or manual row
  move; sidebar-list keys are NOT taught and not accepted as Herdr actions). Resulting state:
  target row selected and opened. Provenance: player action. FIDELITY: Goto row.
- O2 (S09): zoom the finding pane to read; unzoom to restore (topology unchanged; pill updates).
  Provenance: player action. FIDELITY: Zoom row; Zoom-pill chrome row.
- O3 (S05/S06 reinf): stage finding beside R-list in a split; then a focus-transition sequence across the two panes (declared destination, observed input landing); focus discipline throughout.
  Provenance: player action. FIDELITY: split/focus rows.

**Input context:** deliberate capture. Sidebar visible as fixture chrome; sidebar-list navigation
explicitly untaught (global avoidance).

**Fidelity dependencies:** FIDELITY Goto row; Zoom row; split/focus rows; Workspaces row; Zoom-pill
row; Mode-bar placement (bottom pane area; default top tab bar — lesson shows it correctly).

**BLOCKED-ON:** standing prefix line. Sidebar-list navigation keys untouched (FIDELITY #6 avoidance
stated in contract).

**Failure/recovery:** wrong row selected → exit picker (Esc/`Ctrl+[`) and retry; no penalty.

**Hints:** tiers 0–3, recorded.

## L7 — Nov 17 — re-read receipt — "Pending Verification"

**Discoveries:** VN-12 matched to R-2 via INT-RECEIPT-12 (counting line now legible beside the
finding); counterfactual stated (no R-2, no finding); `LT-47B` recurrence R-1/R-3. Adebayo edit
note arrives (W4 beat, story content): editor asks for a line on the finding; player negotiates
hold pending verification (no new EV; posture recorded, affects L9 tone only).

**Interface lesson:** S10 intro (distinguish detected agent identity/status from process output and
task completion: a background verification process shows `done` — the lesson teaches done is this
client's projection of Idle-unacknowledged, never proof the verification is correct; check output
before citing), S09 reinf (zoom receipt beside finding), S04 reinf (comparison tabs created for the
receipt-vs-finding match), S01 further (prefix discipline across the zoom/goto sequences).

**Objectives:**
- O1 (S10): focus the verification-agent pane (pane-surface composition acknowledges; verified
  client rule), read its output, record the output's content separately from its status badge.
  Resulting state: citation references output lines, never the badge. Provenance: player action.
  FIDELITY: Agent-status projection rows (raw Idle/Working/Blocked/Unknown; done-as-projection;
  seen per-client; state changes move no focus). The background-completion-while-unfocused case is
  explicitly excluded from this scenario (see BLOCKED-ON).
- O2 (S09 reinf, with S01 prefix discipline recorded across the zoom sequence): zoom/unzoom receipt and finding for the match. Provenance: player action.
- O3 (S04 reinf): comparison tabs created for the receipt-vs-finding match (named, stated purpose). Provenance: player action. FIDELITY: Tabs row.

**Input context:** deliberate capture for picker/zoom/focus ops. Adebayo negotiation is story
content (external control legitimate).

**Fidelity dependencies:** FIDELITY Agent-status rows; Zoom row; focus row.

**BLOCKED-ON:** standing prefix line. Background-ack agent semantics (FIDELITY #7): scenario
stages only the focused-pane acknowledgment rule; any background-finish variant is out of scope
until the contract is resolved.

**Failure/recovery:** citing the badge instead of output → Beck-style line ("a badge is one
client's projection") with retry; output preserved.

**Hints:** tiers 0–3, recorded.

## L8 — Nov 18–19 — trace path — CHOICE 2 (briefing vs independent)

**Discoveries:** R-3 receipt path traced to the OCC forward; briefing-offer memo dated 11/19;
hours-narrowing memo in writing. CHOICE 2: accept briefing (faster; filing cites OCC packet =
single-source taint, Beck discounts weight at L14) vs independent verification (slower, preserves
two-source standing). Cole intake-call transcript obtained via records request (W5; story content,
no new EV — intake describes R-3's arrival path, nothing about content truth).

**Interface lesson:** S11 intro (copy-mode search: `prefix+[`, `/` query, `n`/`N` repeat,
case rule — locate the `Origin-Event-ID` line / truncation in the forward record), S08 reinf
(goto: find the OCC-forward process), S10 reinf (forward-process status read from output),
S05/S06 further (split/zoom-adjacent staging of forward record beside the R-3 face), S01 further.

**Objectives:**
- O1 (S11): enter copy mode, search for the origin-field line, repeat to next match, exit cleanly
  (exit `q`/unshifted-Esc path per verified contract; output stays live throughout).
  Resulting state: match position stated; pane output unaltered. Provenance: player action.
  FIDELITY: Copy-mode contract (movement/search/selection/copy/exit; case rule; live output;
  default prefix keeps its meaning — `ctrl+b` in copy mode enters prefix mode, not page-up).
  Field-edge constraint applies to query typing.
- O2 (S08/S10 reinf): locate forward process; read status from output. Provenance: player action.
- O3 (S05/S06 further): split-stage the forward record beside the R-3 face; focus discipline across the pair. Provenance: player action. FIDELITY: split/focus rows.

**Input context:** deliberate capture (copy-mode keys are plain keys under capture; capture
affordance itself stays outside chrome).

**Fidelity dependencies:** FIDELITY Copy-mode contract; Goto row; Agent-status rows.

**BLOCKED-ON:** standing prefix line. Copy-mode IME/AltGr edges (FIDELITY #3; lesson ships ASCII-only
until FEASIBILITY #10/#11 report).

**Failure/recovery:** lost in copy mode → exit and re-enter (clerk line); search state never gates
story progress (presentation-safety: effects/search never gate objective authority — the required
state is the stated match, re-obtainable).

**Hints:** tiers 0–3, recorded.

## L9 — Nov 19–20 — cross-walk twins — CHOICE 3 (publish vs hold)

**Discoveries:** R-1/R-3 body identity incl. `LT-47B` + `21:4_` copy artifact; profile diff obtained
via a stated in-fiction records-channel request (W1: the request step is an objective; the diff
arrives as a fixture document — process evidence); M-47-FWD-03 (Vane-signed). CHOICE 3: publish
preliminary (public correction costs later: L14 extra step + editor-trust dip/recover) vs hold
(cleaner record; L14 uses the SOC record path instead).

**Interface lesson:** close-half groundwork (close a disposable scratch pane after the cross-walk;
runtime stops synchronously — verified; explicitly contrasted with detach, which is NOT taught
here), S11 reinf (select + copy the `21:4_` artifact line: `v`/`Space` selection, `y` copy, exit),
S01/S03 further, S07 reinf (cross-walk workspace: move the twins between workspaces and state the
board), S08/S09/S10 reinf (locate/zoom/read twins — a further goto sequence plus zoom pass on the
twin faces).

**Objectives:**
- O1: records-channel request filed for the profile diff (story control; process evidence on
  delivery). Diff delivered as fixture document (never player action).
- O2 (S11 reinf): select the artifact line in copy mode, copy, exit; place it into the
  cross-walk note via the story control (standing paste rule — resulting content only, no paste
  key asserted). Provenance: player action. FIDELITY: Copy-mode contract.
- O3 (close-half groundwork for S12; full S12 detach/reattach is introduced at L11): close ONLY a non-last scratch pane (hard constraint: the workspace always
  retains ≥2 panes at close time, so the confirmation overlay path is never entered); state the
  contrast (closed pane's runtime stops; detach — untaught here — is the operation that preserves).
  Provenance: player action; runtime-stop observed in fixture chrome.
  FIDELITY: Close-pane row (synchronous runtime stop; platform kill per pinned platform; distinct
  from detach in every explanation).
- O4 (S07–S10 reinf): cross-walk staged across workspaces/panes with stated arrangement — a goto-located twin pair, zoomed for the line comparison, output-read (not badge-read). Fixture twins are re-located (not pre-opened) by the player. Focus is re-established explicitly at the start of O4 (no reliance on post-close focus placement).
  Provenance: player action. FIDELITY: Workspaces/Goto/Zoom/Agent rows.

**Input context:** deliberate capture for copy-mode/close/picker ops. Publish/hold choice via
story control.

**Fidelity dependencies:** FIDELITY Copy-mode contract; Close-pane row; Goto/Zoom/Agent rows;
Presentation safety (never present close as detach-like).

**BLOCKED-ON:** standing prefix line. Close-pane confirmation accept path (FIDELITY #5): contract
forbids last-pane closes — any lesson build that can reach a last-pane close is rejected at review.
Focus reflow after close (FIDELITY #4): L9 objectives never rely on post-close focus placement — after O3's close, O4 re-establishes focus explicitly rather than assuming where focus landed; the unresolved reflow contract is additionally named here.
Copy-mode IME edges (field-edge constraint).

**Failure/recovery:** close attempted on a last pane → refused by contract with a clerk line (the
overlay path is not entered, not taught); copy-mode fumbles → exit/retry.

**Hints:** tiers 0–3, recorded.

## L10 — Nov 20 — prove common root — RETENTION II — "Two Sources, One Root"

**Discoveries:** faces + receipts + comparison states (no lodging, no law text — required proof).
Proof argued from R-1/R-3 shared root + VN-12 non-independence (VP-1109 records request through the Theo Park vendor channel at L10; log shows no player-credential session in the L4–L13 window, demo portal only, stated completeness limit). L10 paperwork also carries the Beck intake registry-check record BC-10 (signatures verify, registry confirmed — which is WHY faces alone mislead; cited in the proof). IQ-1 (intake-queue snapshot, released Nov 17) present in the paperwork as OPTIONAL
examination — queue-depth-vs-finding-date comparison, explicitly not scored for retention; L10's
common-root proof requirements unchanged.

**Interface lesson: previously-taught skills only (S07 intro L4; S08/S09 intro L6; S10 intro L7).
No new skills. Tier-0 start.** Assesses S07–S10 (per LEARNING_DESIGN) + retrieves S01/S04–S06.
Scenario: multiple workspaces, ambiguous agent-status board, conflicting R-1/R-3 faces.

**Objectives:**
- O1 (S07): work across ≥2 workspaces (analysis + intake-record workspaces); arrangement stated.
  Provenance: player action. FIDELITY: Workspaces row.
- O2 (S08): locate the target verification process via goto (admissible: search or manual move;
  the objective states which use is assessed; authentic alternatives are not marked wrong where
  the contract does not require the picker — here the picker IS the assessed path and the
  contract says so). Provenance: player action. FIDELITY: Goto row.
- O3 (S10): interpret status without mistaking `done` for evidentiary correctness — focus the
  agent pane, read output, cite output lines. The scenario stages ONLY the focused-pane
  acknowledgment rule; no background-completion claim is required or accepted. Provenance: player
  action. FIDELITY: Agent-status rows.
- O4 (S09): zoom/unzoom comparison panes without topology change. Provenance: player action.
- O5 (S01/S04–S06 retrieval): prefix discipline, tab handling, split/focus arrangement for the
  proof file. Provenance: player action.

**Input context:** deliberate capture for assessed ops. External controls: story may complete;
transfer credit withheld per skill (honest reporting).

**Fidelity dependencies:** FIDELITY Workspaces/Goto/Zoom/Agent/Prefix/Tabs/split/focus rows;
Agent done/seen rule documented in the scenario brief (one consistent rule, per contract).

**BLOCKED-ON:** standing prefix line (assessed evidence under Gate-1 hold policy). Background-ack
(FIDELITY #7): excluded by design — scenario requires no background-finish reading; any build
needing it is rejected.

**Failure/recovery:** deficiency slip per missing element (location vs interpretation vs output-check
distinguished); evidence preserved; retry same story day. Pass → E3.

**Hints:** start tier 0; tiers 1–3 recorded as assisted (story may complete; independent retrieval
via a fresh equivalent task for transfer credit).

## L11 — Nov 21 (morning) — read law + guidance — "Genuine Independence"

**Discoveries:** D-47 §4 (ratified, noticed; genuine-independence standard) + IG-E3-02 (Reyes-signed;
rebuttable presumption from faces); Cole §5 spot-check duty named. Re-read annotations on R-faces
activate as dated entries.

**Interface lesson:** S11 reinf (search the guidance text for the presumption + §5 duty lines),
S12 reinf — detach half (close-of-business detach: `prefix+q`; everything keeps running; reattach
opens L12 with layout and running state restored), S04 further (guidance-reading tabs arranged and
named for the two texts), S07 further (guidance workspace separated from the analysis board),
S09/S10 further (zoom the §4 paragraph beside the §3 presumption; agent-process status for the
retrieval job read from output).

**Objectives:**
- O1 (S11 reinf, with S04/S07/S09/S10 further staging): copy-mode search/select/exit on the guidance document, staged in a named guidance-reading tab inside a guidance workspace; zoom the §4 paragraph beside the §3 presumption; retrieval-agent status read from output, not badge.
  Resulting state: match positions stated; dual-text arrangement statable. Provenance: player action. FIDELITY: Copy-mode contract; Tabs/Workspaces/Zoom/Agent rows.
- O2 (S12 reinf): detach the session client (verified: Detach flag only; server and processes
  continue); L12 opens by reattaching to the same session with state restored. Resulting state:
  layout + running processes identical across the detach boundary (fixture-verified per contract).
  Provenance: player action (detach + reattach). FIDELITY: Core-five detach row; RESEARCH
  lifecycle (Detach flag `shell/actions.rs:10–12`; server continues; reattach restores).
  Explicitly: this is not close (O3 L9 contrast cited in-fiction), not reload, not handoff
  (experimental `--handoff` untouched and unmentioned as an option).

**Input context:** deliberate capture for search/detach ops.

**Fidelity dependencies:** FIDELITY Copy-mode contract; Detach row; research detach chain.

**BLOCKED-ON:** standing prefix line. Copy-mode IME edges (field-edge constraint).

**Failure/recovery:** detach is always safe to retry (state preserved by contract); reattach failure
→ explicit recovery (reattach again; evidence never rewritten).

**Hints:** tiers 0–3, recorded.

## L12 — Nov 21–22 — request lodging — "Private Papers"

**Discoveries:** C-1 (vendor original + SOC sent-mail with headers) + Desai receipt via BCR request;
Sam witnesses intake. Copy-vs-original comparison discipline (hash = copy-vs-comparison-original
check only; no truth/tamper-proof claims). Reattached session from L11 detach opens the level.

**Interface lesson:** S11 further + S11 ASSESSMENT (matrix assess: 12) — search the lodged originals
for origin-ID lines, select + copy the controlling passage, exit; S05/S06/S08 further (stage
originals beside earlier copies), S01 further.

**Objectives:**
- O1 (S11 assess): locate both origin-ID lines via copy-mode search, select + copy the passage
  that will anchor CPF-9, exit cleanly with output live throughout. Starting state: lodged
  documents open in two panes (fixture). Admissible: `/` or `?` search, `n`/`N` repeats.
  Resulting state: copied passage present in the packet draft (placed via story control — standing paste rule); match
  positions stated. Provenance: search/select/copy/exit = player action (action + learning
  evidence); placement = player action via story control (content only); lodged documents = fixture; Desai receipt = simulated process event.
  FIDELITY: Copy-mode contract (all clauses).
- O2 (S05/S06/S08 further): originals-vs-copies split staging; focus discipline; goto between
  processes. Provenance: player action.

**Input context:** deliberate capture for assessed copy-mode ops. BCR request via story control.

**Fidelity dependencies:** FIDELITY Copy-mode contract; split/focus/goto rows.

**BLOCKED-ON:** standing prefix line. Copy-mode IME edges (assessed evidence is ASCII-only;
FEASIBILITY #10/#11 must report before shipping beyond ASCII-only envelopes).

**Failure/recovery:** missed match → deficiency naming the unfound element (never the answer);
retry with documents preserved.

**Hints:** tiers 0–3; tier 2+ marks the S11 assessment assisted (story may complete; transfer
credit requires an independent demonstration — fresh equivalent passage task available).

## L13 — Nov 22 — meet via counsel — CHOICE 4 (now vs map-first)

**Discoveries:** Ellison lodging index relayed by counsel (relayed Nov 21, opened Nov 22);
leave/credential facts stated (no puzzle, no key). Quill interview through counsel (consent;
conditions vary by L4 choice — paraphrase path cooperates readily; detail path requires counsel
conditions). CHOICE 4: request lodging-based chain immediately (faster; Beck notes single-chain
reliance, requires SOC interview for second source) vs complete independent mapping first (two
chains; acknowledged weight at hearing).

**Interface lesson:** S12 reinf (session detach after the counsel window; reattach L14 — state
survives), S07 further (counsel workspace separated from analysis), S10 further (counsel-relay
process output read from output, not badge), S03 further (hierarchy stated across three
workspaces), S11 further (search the relayed index for the lodging reference line).

**Objectives:**
- O1 (S12 reinf): detach after copying the index; reattach next session with state verified
  identical. Provenance: player action. FIDELITY: Detach row; research lifecycle.
- O2 (S07/S10 reinf, with S11 further search of the relayed index for the lodging reference line): counsel workspace created/used/left; relay output cited by content.
  Provenance: player action + simulated process event (relay delivery). FIDELITY: Workspaces/Agent rows; Copy-mode contract (search/exit only for the index lookup).

**Input context:** deliberate capture for detach/workspace ops. Interview/choice via story controls.

**Fidelity dependencies:** FIDELITY Detach row; Workspaces row; Agent-status rows.

**BLOCKED-ON:** standing prefix line.

**Failure/recovery:** procedural only (malformed request → Desai-style checklist return; retry).

**Hints:** tiers 0–3, recorded. Choice consequences stated before deciding.

## L14 — Nov 23 — draft retraction — CHOICE 5a (scope) + 5b (naming)

**Discoveries:** CPF-9 drafted: common-source proof + VN-12 retraction. Beck deficiency loop until
the two-source rule is met (deficiencies name missing elements, never supply answers). CHOICE 5a:
full public retraction (visible credit cost; full Board weight) vs narrow technical correction
(keeps some credit; Beck warns of discount; extra corroboration required). CHOICE 5b: name Vane as
signer (challenged on tone, not facts) vs cite role + memo number (same legal effect; better
Okafor/Desai outcomes). Publish path (L9) adds the concrete correction step here (W3): a public
correction notice filed and acknowledged BEFORE the CPF-9 counts as complete + Adebayo trust beat
(acknowledgment slip as process evidence).

**Interface lesson:** S12 further (mid-draft detach/reattach confidence check — the packet survives),
S11 further (search/cite profile-diff + lodging passages), S06/S08/S09 further (staging the filing
corpus: focus discipline across the draft, reshow, and check panes; a further goto pass re-locates
the verification process; zoom confirms the retraction-text state).

**Objectives:**
- O1 (S12 further): detach and reattach mid-draft; resulting state verified identical (packet
  intact). Provenance: player action. FIDELITY: Detach row.
- O2: CPF-9 draft meets the two-source rule (process evidence evaluated by Beck rules:
  R-1/R-2/R-3 share EVT-1109-A via signature + headers + receipts + diff + retraction).
  Correction-notice prerequisite enforced on the publish path (fixture check, not player action).
- O3 (S06/S08/S09 further): corpus staged — focus discipline across draft/reshow/check panes; verification process re-located via a further goto pass; zoom confirms the retraction-text state (read from output, never the badge).
  Provenance: player action. FIDELITY: focus/Goto/Zoom/Agent rows.

**Input context:** deliberate capture for detach/search/zoom ops. Drafting/choices via story
controls (field-edge constraint on draft typing).

**Fidelity dependencies:** FIDELITY Detach row; Copy-mode/Goto/Zoom/Agent/focus rows.

**BLOCKED-ON:** standing prefix line. Copy-mode IME edges (field-edge constraint).

**Failure/recovery:** Beck loop is the level (deficiency → cure → resubmit); filed-ready by night
(story event). No hard fail.

**Hints:** tiers 0–3, recorded. Scope/naming consequences stated before deciding; both recorded
for the ending card.

## L15 — Nov 24 (08:00 filing; 10:00 convene, Housekeeping to 10:30) — file + read aloud — "Into the Record" (CUMULATIVE)

**Discoveries:** CPF-9 filed by 08:00 story-clock (SE-L15-filing; late until 09:30 draws one untimely slip + one cure path under Housekeeping to 10:30); Board convenes 10:00, hearing from a separate
hearing-room client; Board rejects the extraordinary package, continues standard measures, enters
referrals + costs on the record (per Bible §10); ending card reflects all five choices.

**Operational circumstance (why each demand exists):** the hearing convenes on a separate
hearing-room client. Mid-hearing restructuring is not permitted, so the corpus must already be
organized; the R-1/R-3 comparison must be staged; the retraction text must be verified before
standing; the verbatim passage must be located and copied into the reading packet; the session
must survive the client move intact. Each demand below is scored separately.

**Subtask T1 — organize (S03/S04/S07):** Starting state: prep workspace with the full corpus open
(fixture tabs/panes, arrangement scrambled by fixture). Admissible: create/rename/switch tabs,
arrange across workspaces (any legitimate names; geometry required only for the comparison pair).
Resulting state: hearing packet tab + comparison workspace staged and stated. Provenance: player
action. FIDELITY: Tabs/Workspaces rows. **Score line T1: ___ independent / assisted / not observed.**

**Subtask T2 — compare (S05/S06/S09):** Starting state: T1 arrangement. Player-created comparison
split of R-1 vs R-3 (a fixture pre-split grants nothing), focus discipline, zoom/unzoom without
topology change. Resulting state: side-by-side staged; pill state correct; focus declared.
Provenance: player action. FIDELITY: split/focus/zoom rows. **Score line T2: ___ independent /
assisted / not observed.**

**Subtask T3 — verify output (S08/S10 + S02):** Starting state: verification-agent process running
in the packet workspace (fixture process). Use the help overlay (`prefix+?` + `/` filter, listed field keys only) to resolve which binding opens the goto picker, then perform that binding to locate the process (S02 unfamiliar-task assessment: the binding is documented in help itself — upstream Help lists bindings only, verified: no Home/End or on-screen overlay hints exist to discover from). Focus the agent pane, read output, cite output lines (never the
badge). Resulting state: citation on record; help consultation logged. Provenance: player action
(picker/focus/reading); agent output = simulated process event. FIDELITY: Goto row (rows/search/move/exit verified in overlay_input.rs:637–786 — no Home/End dependency); Agent-status rows; Help row; Field editing (filter typing). **Score line T3: ___ independent / assisted / not observed.**

**Subtask T4 — search/copy passage (S11):** Starting state: lodged-passage document open (fixture).
Locate the verbatim reading passage via copy-mode search, select + copy, exit cleanly; place it
into the reading packet via the story control (standing paste rule). Resulting state: packet contains the verbatim passage. Provenance: selected/copied = player action; placement = player action via story control (content only).
FIDELITY: Copy-mode contract. **Score line T4: ___ independent / assisted / not observed.**

**Subtask T5 — detach-reattach (S12 + S01):** Starting state: staged prep session. Detach the prep
client (`prefix+q`; everything keeps running), reattach at the hearing-room terminal with layout
and running state restored (verified per contract). Resulting state: identical session on the
hearing client; move attested. Provenance: player action. FIDELITY: Detach row; research lifecycle;
Prefix table. This is not reload, not Reconnect-as-reattach, not handoff. **Score line T5: ___
independent / assisted / not observed.**

**Disclosure (required, not sufficient):** read the retraction + findings into the log (SE-L15-reading;
process evidence with resulting state). Scene entry or filing alone completes nothing; all five
subtask predicates plus the disclosure are required for the level.

**Story-clock deadlines:** filing due 08:00 (declared event); late until 09:30 → Beck untimely slip + one
explicit recovery under Housekeeping (convenes 10:00, docket opens to 10:30); never rewritten evidence. No wall-time.

**Input context:** deliberate capture for T1–T5 (page affordance). External controls may complete
any subtask as story access (modality recorded, that subtask scores not-observed for transfer).

**BLOCKED-ON:** standing prefix line (prefix evidence in T5 under Gate-1 hold policy).
Copy-mode IME edges for T4 (field-edge constraint). Background-ack excluded (T3 uses the
focused-pane rule only).

**Failure/recovery:** any subtask deficiency → named missing element, retry with corpus preserved
(pre-hearing); post-filing gaps → explicit recovery path, never rewritten evidence.

**Hints:** start tier 0. Tiers 1–3 per subtask, each logged. An assisted L15 completes the story
with that subtask marked assisted (no in-hearing re-demonstration possible under the story clock;
fresh equivalent tasks after the hearing may still establish independent retrieval for the
transfer record).

---

## Weakness disposition (ARC self-audit W1–W5)

- **W1 — profile-diff obtainability: RESOLVED-in-contract.** L9 Objective O1 makes the
  records-channel request a required story step; the diff arrives as a fixture document and O2/O4
  predicate on comparing its drop-rule line. The diff is never merely described.
- **W2 — Cole corroboration depth: APPROVED-optional** (decision recorded in IMPLEMENTATION_PLAN.md
  §Review-gate decisions). IQ-1 is canon optional evidence (BIBLE §7): released Nov 17, present in
  L10 paperwork for examination, never required for retention scoring, not an E3 prerequisite.
  L8's Cole transcript + L11's §5 duty carry the required beat; IQ-1 deepens it for players who
  examine it.
- **W3 — publish-path correction staging: RESOLVED-in-contract.** The publish branch is kept (not
  reframed): L9 records the preliminary; L14 requires the public correction notice filed +
  acknowledged before CPF-9 counts as complete, plus the Adebayo acknowledgment slip (trust beat as
  process evidence). Hold branch uses the SOC record path instead (already in story contracts).
- **W4 — Vane escalation / Adebayo beat in L7: RESOLVED-in-contract.** L7 carries the Adebayo
  hold-negotiation beat (edit note + player posture recorded, affects L9 tone). Vane's escalation
  stays procedural-on-paper by design (request → narrow hours → flood → counsel challenge); no live
  confrontation is staged, and the contract states this as intent, not a gap.
- **W5 — E2 texture (Cole transcript): RESOLVED-in-contract.** L8 carries the Cole intake-call
  transcript via records request — story content, explicitly no new EV.

## Staging notes (decided items removed; open items only)

**LEARNING_DESIGN deltas proposed:** none. The matrix is followed exactly (see verification walk);
L12 S11 assessment is a matrix-sanctioned cell (S11 assess: 12). L15 T3's S02 assessment resolves a binding from the help overlay's own list — no untaught-key dependency.

## Verification checks performed (traceability walk, no self-approval)

- **Matrix coverage (every cell at its level, twice before L15 assessment):**
  S01: I1 R2 R3(L3 focus-transition sequences) R4 F6 F7 F9 F12 → A5 A10 A15 · S02: I1 R2 R4 → A5 A15 (voluntary throughout) ·
  S03: I1 R2 R4 F6 F7 F9 F12 F13 F14 → A5 A10 A15 · S04: I2 R3 R4 F6 F7 F9 F11 → A5 A10 A15 ·
  S05: I3 R4 R6 F8 F12 → A5 A10 A15 · S06: I3 R4 R6 F8 F12 F14 → A5 A10 A15 ·
  S07: I4 R6 R9 F11 F13 → A10 A15 · S08: I6 R8 R9 F12 F14 → A10 A15 ·
  S09: I6 R7 R9 F11 F14 → A10 A15 · S10: I7 R8 R9 F11 F13 → A10 A15 ·
  S11: I8 R9 R11 F12 F13 F14 → A12 A15 · S12: L9 close-half groundwork; full detach/reattach intro at L11 (matrix records the split); A15.
  (I=intro R=reinforcement F=further A=assessment; letters keyed to LEARNING_DESIGN matrix cells.)
- **Checkpoint purity:** L5 uses S01/S03–S06 + S02 only (all introduced L1–L4); L10 uses
  S07–S10 + S01/S04–S06 retrieval (all introduced ≤L9, where L9's close half is groundwork, not the S12 intro); L15 introduces no new commands and no
  story-critical facts (T3's S02 assessment resolves the goto-picker binding from the help overlay's own binding list).
- **Predicate provenance:** every objective states starting state, admissible actions (with authentic
  alternatives where the contract allows), resulting state, and provenance kind. Fixture-provided
  states (lodged docs, diff, relay deliveries, agent output) are never credited as player action.
- **Fidelity citations:** every taught operation cites its FIDELITY row (Prefix, Core five,
  Pane/tab/workspace, Field editing, Agent projection, Chrome, Presentation safety). Unresolved
  contracts touched carry BLOCKED-ON lines: browser delivery + host-blur (all capture levels),
  IME/AltGr edges (all typing/search lessons), background-ack (L7/L10/L15 excluded-by-design with
  lines), close-confirmation accept path (L9 avoidance constraint + line). Untouched contracts
  (close-workspace, sidebar-list keys, checkout-deletion, handoff timing) are globally excluded
  with the exclusion stated. Focus reflow (FIDELITY #4) additionally named at L9 (no-reliance statement + BLOCKED-ON).
- **Choice hooks:** five choice points, six recorded decisions (L14 holds scope + naming) — L4 (NL-1 + L9/L13
  conditions + L14 workload + ending card), L8 (single-source taint → L14 weight + ending card),
  L9 (publish → L14 extra step + trust beat; hold → SOC path; ending card), L13 (chain weight →
  Beck requirement + hearing weight + ending card), L14 scope + naming (Board weight, Okafor/Desai
  outcomes, credit cost, ending card).
- **Dates/story gates:** every block carries its ARC date-table date; receipt order
  (DR-1 Nov 10 → DR-3 Nov 13 → DR-2 Nov 14), SUB-ACK-12 vs INT-RECEIPT-12 split, L6 weekend-hold
  release, Q-118/leave at L6, VP-1109 request at L10 + BC-10 citation in L10 proof, IQ-1 Nov 17
  request-fulfillment, and docket-buffer recovery at L15 match the story docs. No level consumes
  undelivered knowledge.
- **Remaining for parent:** FIDELITY re-verification if the upstream baseline moves; a *measured*
  Firefox pass if a measured cross-browser envelope is ever claimed (user authorization of
  2026-11-23 closed Gate 1 on the Chromium-evidenced basis); playtest of correction-notice staging
  (W3) and copy-artifact readability (ARC W1-note carried into L9 O2).
