# Level contracts

Milestone 2 authorizes L1–L3 gameplay only. L4–L15 are design contracts. This document joins the story to one curriculum: authentic Herdr operations. `LEARNING_DESIGN.md` defines the skills and fading rules. `HERDR_FIDELITY.md` and `HERDR_RESEARCH.md` govern pinned Herdr v0.9.5 behavior.

## Standing rules (apply to every block below)

- **The dual clock system: real tension without punishing learning.**
  - **Story clock (fictional deadline).** Fictional dates and times come from the ARC date table. The
    story clock advances strictly on declared story events (filings, receipts, hearings). Never
    wall-time, never typing speed. Statutory deadline is 08:00 EST November 24. A missed story deadline
    produces an explicit recovery (Beck untimely slip + one cure path during the 10:00–10:30
    Housekeeping window); evidence is never rewritten and the ending is never blocked.
  - **Optional Boss Challenge clock (mastery countdown).** An illustrative 15:00 real-time challenge
    for players seeking high-pressure operational triage in Episode III. Automatically pauses when the
    authentic help overlay (`prefix+?`) is open, when input capture is released, or when Accessible
    Navigation mode is active. Never alters evidence, invalidates proof, or prevents the correct
    ending. Finishing within the challenge window earns a distinct "Speed Mastery Commendation" on the
    final case record card.
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
  Deficiency slips name missing elements, never supply answers. Retry preserves evidence. Zero new Herdr skills.
- **Herdr-only progression.** Introduce an operation, guide its use in new work, then ask for an outcome without naming the keys. Checkpoints combine known operations. Claude and the newsroom's preconfigured tools supply the work, not a second curriculum. Tool names in L4–L15 identify planned fictional surfaces, not implemented APIs.
- **Mission HUD.** Give the player an objective, a reason, and three to five short steps. Mark progress on committed outcomes. Start the level with a live problem. Do not insert shortcut drills that add nothing to the investigation.
- **Design test.** Each mission needs a Herdr arrangement or navigation outcome. An equivalent record from a different connector must leave the Herdr predicate unchanged. Story conditions can require a receipt, choice, or filing, but none can award keyboard credit.
- **L15.** Five separately scored subtasks, each with its own action/result predicate and score line.
  The disclosure (reading into the log) is required process evidence and is never sufficient alone.
- **Fidelity.** A lesson may teach only verified contracts. Anything routing through an unresolved
  contract carries a `BLOCKED-ON` line naming the blocker and its Gate-1/feasibility dependency.
  Avoided branches are stated as hard constraints in the contract, not silently skipped.
- **Feasibility gate.** `docs/FEASIBILITY_KEYBOARD.md` carries a **published envelope (user
  authorization, 2026-11-23)**: Chromium 158 evidenced (synthetic 18/18 + two physical chords),
  Firefox accepted by user decision with Ctrl+W risk-chord handling, IME/AltGr outside taught
  scope. A capture lesson ships only under that envelope and the decided hold policies (void-on-blur,
  Herdr-owned Escape, external capture release, clipboard-failure fallback); probe item numbers below refer to that document's
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

## Episode I — The Leak

### L1 — Nov 12 — “Stringer Rates”

- **Objective and stakes:** Accept June Adebayo's assignment without exposing the source. Read CPA-01A before contact.
- **Starting state:** Open terminal at `$`. No memo, player workspace, or Claude session. The landing page offers the skippable cold open. `/workspace` goes straight to the terminal.
- **New Herdr operations:** Launch (`herdr`, Enter), use the prefix, create a workspace (`prefix+shift+n`), and create a research tab (`prefix+c`). The default session precedes the player's workspace. One investigation workspace and one agent in its research tab are active for the assignment.
- **HUD route:** Start Herdr → create the investigation workspace → open a research tab → type `claude` and ask for the memo → inspect the original and tell Claude to accept the assignment. Show exact keys for new operations. Clear each completed instruction.
- **Assessment:** `L1-O1` is a successful player-origin shell launch. `L1-O2` is a committed keyboard workspace creation. `L1-O3` is a committed keyboard tab creation in that workspace. Neither the launch of Claude nor the response is graded.
- **Story and tools:** Claude searches the preconfigured document index and reads CPA-01A. The transcript shows both calls and the original memo: verify origin, preserve attribution, and avoid claiming corroboration from one origin. June acknowledges acceptance only after retrieval. No new helper clue. The equipment and evidence stay available in L2.
- **Recovery:** Unknown commands, unrecognized requests, and denied reads leave the current terminal and evidence intact. Retry without replaying the cold open.

### L2 — Nov 12 (afternoon) — “Supplied Goods”

- **Objective and stakes:** Compare the shared SOC report with the handling memo. The shared copy lacks an origin header.
- **New and reused Herdr operations:** Reuse the investigation workspace and tab creation. Add a named report tab and navigate back to the research tab and then the report. Keep the prior agent and transcript live. One investigation workspace, two agents: source guidance and SOC material.
- **Assessment and guidance:** `L2-O1` checks a player-created and named tab. `L2-O2` checks a keyboard traversal away from and back to it. Give the first switching sequence (`prefix+p`, `prefix+n`); mark it complete once the result commits. Do not grade a conclusion about report provenance.
- **Story and tools:** Claude retrieves UM-1109-88 through document search/read. The original shared copy gives the portal, banner, five-minute window, and absent header. June permits a follow-up with Park, not a claim of a second source. No separate helper clue. Carry both agents and reports into L3.
- **Recovery:** Return to the intended tab and retry after a wrong-target request. The prior document stays readable.

### L3 — Nov 13 (morning) — “Five Minutes”

- **Objective and stakes:** Keep the SOC report visible while you consult Park's off-record account. His statement may explain the five-minute window.
- **New and reused Herdr operations:** Split the report tab (`prefix+v` right or `prefix+minus` down), use directional focus, and rename the tab (`prefix+shift+t`). Reuse the workspace and prefix. One investigation workspace, three agents: reference memo, SOC report, and Park transcript.
- **Assessment and guidance:** `L3-O1` links a new split, a keyboard focus transition, and typed input in the new pane. `L3-O2` checks a nonempty keyboard rename. Show the new split and focus keys. Do not grade witness consent or whether the player draws the right inference.
- **Story and tools:** Claude retrieves `PARK-INTERVIEW-11-13` through document search/read. Park names `LT-47B`, the genuine misfire, and its five-minute window. Consent is part of the record. No new helper clue. June's response leads toward the VN-12 decision. The existing skippable outro follows the committed interview event where staged. The playable slice stops here.
- **Recovery:** Return focus to the transcript pane and retry. The report remains in the other pane.

### Remaining Episode I contracts

## L4 — Nov 13 (evening, 19:05 filing) — file note — CHOICE 1 (source protection) — "Filed 19:05"

**Discoveries:** VN-12 filed (origin blank, form default); SUB-ACK-12 same-night return (blank
origin + retraction-always-receivable + counting-review-next-cycle visible). CHOICE 1 recorded in
NL-1: paraphrase (Quill safe; VN-12 thinner) vs identifying detail (VN-12 stronger now; exposure
risk follows to L9/L13).

**Investigative problem:** Drafting Verifier Note VN-12 requires strict separation. Editing in the
active interview/audit workspace risks terminal input confusion or accidental tampering with live
transcripts. The player needs a separate workspace to prepare VN-12 while keeping the entire
investigative interview and agent session running and intact in the background.

**Herdr and story work:** Introduce workspace navigation (`prefix+w`) and Help (`prefix+?`). Reuse workspace creation, splits, and directed input. Keep two workspaces: the live investigation and filing. Two agents supply the interview basis and draft check. Use the document and filing surfaces. Show the new navigator and Help keys, not the prefix lesson again. An optional filing-margin lead appears after submission (D1 in the private ledger).

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

**Investigative problem:** Morning paperwork delivers `INT-RECEIPT-12`, showing that the player's note
`VN-12` has been entered into the EIAB queue as `R-2` with the designation "independent pending
verification". A fresh batch of intake documents arrives that must be independently organized,
cross-referenced, and filed without unsolicited prompts or hand-holding.

**Herdr and story work:** No new skills. Triage the intake batch in a new workspace with named tabs, a comparison split, and deliberate input focus. Two workspaces and two agents separate open investigations from fresh intake. Claude fetches intake records and a second copy through documents and receipts. No helper clue here. Start with outcome-only prompts.

**Objectives:**
- O1: useful tab arrangement for the fresh set (≥2 tabs, named, stated purpose). Provenance:
  player action. FIDELITY: Tabs row.
- O2: player-created comparison split (split created this level by the player — a fixture
  pre-split grants nothing). Provenance: player action (action + learning evidence).
  FIDELITY: split row (focus lands in new pane).
- O3: correct focus/input destination (declared pane accepts input). Provenance: player action.
  FIDELITY: focus row.
- O4: provenance-backed finding on the fresh set (process evidence citing the fresh artifacts).
- O5 (S07): create the triage workspace without closing the live investigation. Provenance: player action. FIDELITY: Workspaces row.

**Input context:** deliberate capture for O1–O3/O5. External controls: story may complete assisted;
transfer credit withheld per skill.

**Fidelity dependencies:** FIDELITY Prefix table; Workspaces and Tabs rows; split/focus rows.

**BLOCKED-ON:** standing prefix line (assessed evidence valid only under Gate-1 hold policy).

**Failure/recovery:** deficiency slip naming the missing element (provenance gap vs wrong input
destination distinguished); evidence preserved; retry same story day. Pass → E2.

**Hints:** start tier 0. Tier 1 concept cue / tier 2 binding entry / tier 3 worked example in a
separate practice task — each recorded; an assisted pass completes the story but banks an assisted
mark, with a fresh equivalent task available for independent retrieval.

**Cinematic outro:** Episode I Finale — "The Third Count" (28s documentary sequence; morning paperwork arrival of `INT-RECEIPT-12`, counting line added, emergency recommendation sealed; cliffhanger question: why three distinct channels for one internal misfire?). Triggers only on committed `SE-L5-retention1`; skipping never awards objectives or bypasses progression (see `docs/PRESENTATION_PLAN.md`).

## Episode II — The Containment

## L6 — Nov 16 — read finding — "Three Votes"

**Discoveries:** F-47-E3 (filed Nov 14, released after stated weekend hold); Ellison leave/personnel
order (effective 09:00 — "asked and was removed" lands here); Q-118 content readable via mirror;
R-1/R-3/R-2 listing (player note is among them — not yet matched).

**Interface lesson:** S08 intro (goto picker `prefix+g`: rows grouped by workspace; `/` searches;
`j/k`/Up/Down move; Left/Right jump workspace sections without wrap; Esc/`Ctrl+[` exits — locate
the intake process among panes), S09 intro (zoom `prefix+z` the finding pane; pill state matches),
S05/S06 reinf (stage finding beside R-list in a split, with a further focus-transition sequence
declared and observed), S01/S03 further, S07 reinf (finding-analysis workspace).

**Work board:** Two workspaces (investigation and intake) and two agents (finding retrieval and mirror search). Use documents and public records. Introduce the Goto and Zoom keys, reuse workspace travel and splits, and surface the optional archive lead D2 only after Q-118 is available.

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

**Work board:** Two workspaces and two agents (intake receipt and finding). Use evidence records and the newsroom log. Introduce the Herdr status projection and focus cue. Reuse zoom and tabs with a reference to the intended records, not a key sequence. No new helper clue.

**Objectives:**
- O1 (S10): focus the verification-agent pane (pane-surface composition acknowledges; verified
  view), then locate the process output in its pane. Resulting state: the intended agent's output is
  visible and attributable to that pane. Citations are story actions, not keyboard credit.
  FIDELITY: Agent-status projection rows (raw Idle/Working/Blocked/Unknown, done-as-projection,
  seen per-client, state changes move no focus).
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

**Work board:** Two workspaces and two agents (OCC forward and EIAB intake). Use records and cooperative communications. Teach copy-mode search in the forward scrollback. Locate the other agent without repeating its Goto instructions. Optional D3 points to a records request, not the profile diff itself.

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

**Work board:** Two workspaces and three agents (vendor face, OCC forward, records request). Use documents, records requests, and newsroom communications. Explain new copy/selection keys and the safe scratch-pane close. Earlier operations get outcome-only prompts. No new clue; D3 pays off when the ordinary request returns records.

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

**Herdr and story work:** No new skills or unsolicited keys. Across three workspaces (analysis, receipts, vendor), three agents retrieve the two report faces and the credential-session record. Use documents, receipts, and records requests. Reuse established Goto, zoom, status, workspace, layout, and scrollback operations. No new helper clue. The proof is a story gate, not part of the keyboard score.

**Objectives:**
- O1 (S07): work across ≥2 workspaces (analysis + intake-record workspaces); arrangement stated.
  Provenance: player action. FIDELITY: Workspaces row.
- O2 (S08): locate the target verification process via goto (admissible: search or manual move;
  the objective states which use is assessed; authentic alternatives are not marked wrong where
  the contract does not require the picker — here the picker IS the assessed path and the
  contract says so). Provenance: player action. FIDELITY: Goto row.
- O3 (S10): use Herdr's status display to find and focus the agent that needs attention. Check the transcript rather than treating `done` as a finding. Only the focus and navigation result earns credit. The scenario uses the focused-pane acknowledgment rule. FIDELITY: Agent-status rows.
- O4 (S09): zoom/unzoom comparison panes without topology change. Provenance: player action.
- O5 (S01/S04–S06 retrieval): prefix discipline, tab handling, split/focus arrangement for the
  proof file. Provenance: player action.
- O6 (S11): search the report's scrollback and exit without changing its output. Provenance: player action.

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

**Cinematic outro:** Episode II Finale — "The Twin" (32s documentary sequence; common-root proof established; R-1 and R-3 proved twins; OCC forwarding rule exposed; containment turning point). Triggers only on committed `SE-L10-retention2`; skipping never awards objectives or bypasses progression (see `docs/PRESENTATION_PLAN.md`).

## Episode III — The Mandate

## L11 — Nov 21 (morning) — read law + guidance — "The Directive" (Understand the rules)

**Discoveries:** D-47 §4 (ratified, noticed; genuine-independence standard) + IG-E3-02 (Reyes-signed;
rebuttable presumption from faces); Cole §5 spot-check duty named. Re-read annotations on R-faces
activate as dated entries.

**Investigative problem:** Examine Directive 47 §4 (statutory genuine-independence requirement) and
Implementation Guidance IG-E3-02 §3 (rebuttable presumption from faces) while juggling active agent
work. Establish exactly what legal standard must be met before constructing the rebuttal.

**Starting arrangement:** 2 workspaces (`analysis`, `retrieval`), tabs for legal guidance and agent
scrapers.

**Claude session(s):** Agent 1 parsing legal text; Agent 2 monitoring Board docket updates.

**Tools and guidance:** Public records and docket documents. Introduce authentic detach with exact keys and carry the same running session into L12. Other goals are outcome-only. No new helper clue.

**Interface lesson:** S11 reinf (search the guidance text for the presumption + §5 duty lines),
S12 intro — detach half (close-of-business detach: `prefix+q`; everything keeps running; reattach
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

## L12 — Nov 21–22 — request lodging — "Original Record" (Establish the truth)

**Discoveries:** C-1 (vendor original + SOC sent-mail with headers) + Desai receipt via BCR request;
Sam witnesses intake. Copy-vs-original comparison discipline (hash = copy-vs-comparison-original
check only; no truth/tamper-proof claims). Reattached session from L11 detach opens the level.

**Investigative problem:** Multiple verification processes return evidence from BCR and SOC. Compare
lodged originals (C-1) against forwarded copies, extract cryptographic hashes, and prove the shared
source behind R-1 and R-2.

**Starting arrangement:** Reattached session from L11; split panes with lodged originals and earlier copies.

**Claude session(s):** Agent 1 verifying SHA-256 hashes of PDF attachments; Agent 2 diffing NOC auto-logs.

**Tools and guidance:** Two workspaces and two agents continue from L11. Use custody records, requests, and document reads. Guide reattachment. Give an outcome-only scrollback task. No new helper clue.

**Interface lesson:** S11 independent use — search the lodged originals
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

## L13 — Nov 22 — meet via counsel — "Counsel's Index" (Keep the investigation alive)

**Discoveries:** Ellison lodging index relayed by counsel (relayed Nov 21, opened Nov 22);
leave/credential facts stated (no puzzle, no key). Quill interview through counsel (consent;
conditions vary by L4 choice — paraphrase path cooperates readily; detail path requires counsel
conditions). CHOICE 4: request lodging-based chain immediately (faster; Beck notes single-chain
reliance, requires SOC interview for second source) vs complete independent mapping first (two
chains; acknowledged weight at hearing).

**Investigative problem:** Ellison's counsel delivers a critical lodging index while an agent needs
attention. Preserve the active session, organize the new material across workspaces, and prepare the
final evidence chain while managing source exposure.

**Starting arrangement:** 3 workspaces (`hearing-prep`, `counsel-link`, `bcr-archive`), concurrent
Claude sessions.

**Claude session(s):** Agent 1 verifying counsel index; Agent 2 parsing SOC sent-mail headers.

**Tools and guidance:** Custody records, documents, and consent relay. Reuse workspace routing, scrollback, and session continuity without unsolicited keys. D4 reveals who left the leads after the counsel relay, without granting evidence or access.

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

## L14 — Nov 23 — draft retraction — "Counter-Provenance" (Submit the case)

**Discoveries:** CPF-9 drafted: common-source proof + VN-12 retraction. Beck deficiency loop until
the two-source rule is met (deficiencies name missing elements, never supply answers). CHOICE 5a:
full public retraction (visible credit cost; full Board weight) vs narrow technical correction
(keeps some credit; Beck warns of discount; extra corroboration required). CHOICE 5b: name Vane as
signer (challenged on tone, not facts) vs cite role + memo number (same legal effect; better
Okafor/Desai outcomes). Publish path (L9) adds the concrete correction step here (W3): a public
correction notice filed and acknowledged BEFORE the CPF-9 counts as complete + Adebayo trust beat
(acknowledgment slip as process evidence).

**Investigative problem:** With the filing deadline approaching (08:00 EST Nov 24), assemble the
complete Counter-Provenance Packet CPF-9, retract VN-12 on the record, verify supporting records,
and satisfy Roland Beck's two-source corroboration rule under minimal guidance.

**Starting arrangement:** High-density multi-workspace layout with 3 active Claude verification runs.

**Claude session(s):** Agent A (Chain P-A), Agent B (Chain P-B + retraction basis), Agent C (Chain P-C + diff).

**Tools and guidance:** Three workspaces (draft, custody, transmission) and three agents. Use filing, evidence, and records tools. Name the case outcomes and dependencies, not key sequences. No new helper clue. Dana's documented role remains limited to executing the written order.

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

## L15 — Nov 24 (08:00 filing; 10:00 convene, Housekeeping to 10:30) — file + read aloud — "The Mandate" (The Final Confrontation — Boss Encounter)

**Discoveries:** CPF-9 filed by 08:00 story-clock (SE-L15-filing; late until 09:30 draws one untimely slip + one cure path under Housekeeping to 10:30); Board convenes 10:00, hearing from a separate
hearing-room client; Board rejects the extraordinary package, continues standard measures, enters
referrals + costs on the record (per Bible §10); ending card reflects all five choices.

**Herdr and story work:** No new operations. Give five outcome-based steps. Three workspaces hold the hearing packet, custody originals, and transmission records. Three agents return competing results through evidence and filing surfaces. Resolve their work by locating the correct panes and keeping the packet and comparison intact. No new helper clue. Record each Herdr result independently of the story. The optional 15:00 challenge cannot affect filing, recovery, or the ending.

**The final boss encounter:**
The Certification Review Board convenes. The record is about to close.
Your agents have returned conflicting findings across workspaces. Ellison's preserved originals are in
another workspace. The filing packet is incomplete. The Board is ready to hear the case.
The player must coordinate Claude Code, navigate Herdr, manage multiple workspaces, verify conflicting
evidence, and submit a defensible case before the deadline across five integrated subtasks:
1. Organize the case across workspaces and tabs (T1: S03/S04/S07).
2. Arrange and focus panes to compare records (T2: S05/S06/S09).
3. Locate the verification agent and open its actual output (T3: S08/S10/S02).
4. Search and copy the controlling passage (T4: S11).
5. Detach and reattach without losing the session (T5: S12/S01).

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
in the packet workspace (fixture). Find the Goto binding in authentic Help. Use the picker to locate the agent and focus its pane. Cite the output, not the badge, in the story packet. The Herdr result is the help lookup, picker selection, and correct focus. The citation is separate story evidence. FIDELITY: Goto, Agent-status, Help, and Field editing rows. **Score line T3: ___ independent / assisted / not observed.**

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

**Cinematic outro:** Episode III Finale & Game Ending — "The Record" (45–60s choice-sensitive documentary resolution; Board orders and personal/institutional consequences reflecting the five player choice points). Triggers only on committed `SE-L15-reading`; skipping never awards objectives or bypasses progression (see `docs/PRESENTATION_PLAN.md`).

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

## Acceptance across levels

- Confirm that every required operation has an observed player action and intended state change. Fixtures can supply work, not credit.
- Check that L5 and L10 introduce no required shortcut or operation. L15 reports five separate Herdr results and a separate narrative result.
- Check the clue dates in the private ledger against the story bible. Never show an early clue as authenticated evidence.
- Test deadline recovery and accessible alternatives without rewriting evidence or awarding keyboard proficiency.
- Apply the pinned fidelity contracts and the unresolved-item exclusions above before authorizing any later level.
