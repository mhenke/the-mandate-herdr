# STORY_BIBLE — The Mandate: Herdr (PROPOSAL, not approved)

> Status: proposed design for review. Not canon until approved.
> All institutions, characters, directives, guidance, reports, and crisis events are fictional. Any resemblance to real offices or persons is coincidental. The November 2026 crisis is a fictional election-security advisory escalation. It asserts nothing about any real election, real results, or real agency actions. Any resemblance to real advisory-counting or newsroom practice is inspiration material only; no claims about actual November 2026 events are made.

**Title:** The Mandate: Herdr
**Genre:** Browser keyboard-first educational thriller, Washington DC, November 2026.
**Player role:** Credentialed independent verifier (stringer) in a journalist/analyst cooperative network. Verifies tips, protects sources, files signed notes oversight bodies can count on.
**Tagline (intent, not UI copy):** "Democracy is a process. Someone rewrote the procedure."
**Episodes:** E1 THE LEAK (L1–L5: curiosity/suspicion/fear) · E2 THE CONTAINMENT (L6–L10: confidence/paranoia) · E3 THE MANDATE (L11–L15: revelation/responsibility).
**Player authority:** Can verify, interview (with consent), cite, file and retract signed verifier notes. Cannot move originals, sign transfers, grant access, edit any log, or compel testimony. Standing to file a counter-provenance case comes from a public filer rule (any credentialed verifier may file; only two-source-corroborated filings force Board review) — not employment, access, or special status.

## 1. Premise (novella paragraph)

On Nov 9 a vendor's misconfigured load-test script probes a demonstration election-night reporting portal for five minutes — a real, minor, self-reported event. One genuine incident becomes three "independent" threat reports when two of the three copies lose their originating event ID in transit: once by a form default, once by a forwarding profile configured to strip it. A fixed counting procedure mistakes distinct receipt paths for independent sources, issues a corroborated-pattern finding, and recommends an extraordinary information-control package. The player's own early verification note, filed in good faith on Nov 13, arrives third — the vote that certifies the emergency. An analyst who spots the shared origin is put on directed leave with filing credentials suspended before she can stop it. From Nov 12 to Nov 24 the player must prove all three reports derive from the single root event, retract their own contribution on the record, and force the Board to reject the extraordinary package while leaving the legitimate standard response (advisory, patch, monitoring) intact.

## 2. The bounded mechanism: the independent-corroboration trap

**ONE root event.** EVT-1109-A: Nov 9, 21:47–21:52, vendor load-test misfire against a demo results-preview portal. Genuine, low-severity, self-reported within the hour. Standard response (advisory + patch + monitoring) is legitimate and still running at game's end.

**The law requires real independence.** Continuity Directive 47 (fictional, ratified Oct 14 2026, public notice Oct 17) §4:

> "The Board may authorize Standard Measures immediately upon a validated incident, and may authorize one Extraordinary Package — temporary public-portal freeze plus restricted pre-certification briefings, single period not exceeding 72 hours, no renewals — only upon an EIAB finding of a corroborated pattern, defined as three genuinely independent observations of the same threat pattern."

**The shortcut lives one level down, in subordinate guidance.** EIAB Implementation Guidance IG-E3-02 (signed by EIAB Deputy Director Ana Reyes, Jan 2026, public) §3:

> "Intake may presume independence where reports arrive via distinct receipt paths, show overlapping indicators, and bear no shared Origin-Event-ID on their faces. Presumption is rebuttable by timely counter-provenance filing meeting the two-source rule."

The guidance is lawful and reasonable at volume — but it counts faces, not roots. The exploit feeds it three genuine faces with blank origin fields. The emergency approval is therefore procedurally valid and substantively wrong: defeatable by rebuttal, not by waving a hidden illegality. There is no withheld NOT RATIFIED label anywhere in this design.

**Why fabrication controls don't catch it.** EIAB Registry anti-fabrication checks verify (a) credentialed filer signature, (b) registered source identity, (c) intake timestamp. All three reports pass: the vendor ticket is signed, the SOC memo comes from a registered campus source, the player's note is credentialed. The controls answer *who filed* and *is the source registered* — they do not answer *did these two registered sources observe the same upstream event*. Inventing a fourth registered witness would fail (registry cross-check against vendor/SOC enrollment). Reusing real reports with stripped origins passes, because every signature is genuine. That asymmetry is why laundering is cheaper than invention, and it is stated in-fiction by Beck at L10.

**THREE pipelines, ONE root — with derivation markers:**

| Pipeline | Observation basis (what was actually seen) | Transmission chain | Concrete derivation marker (on the face) | What was verified vs what was NOT |
|----------|--------------------------------------------|--------------------|------------------------------------------|-----------------------------------|
| P-A vendor-direct → R-1 | Vendor NOC engineer watches load-test script fire against demo portal (firsthand) | NOC auto-log → signed ticket VT-1109-0214 (origin EVT-1109-A retained) → EIAB direct intake, receipt DR-1 | Origin field populated; script-run ID `LT-47B` and 21:47–21:52 window on face | Verified: event occurred, time, script ID. NOT verified: scope beyond demo portal (never claimed). |
| P-B SOC observation → cooperative → player → R-2 | Campus SOC analyst watches same scan hit SOC sensor (firsthand, same event, second vantage) | SOC memo UM-1109-88 (origin retained in SOC copy) → shared with cooperative as PDF without headers (source Quill) → player verifies portal *banner screenshot supplied by SOC*, files Verifier Note VN-12 with form-default blank origin → EIAB intake, receipt DR-2 | Player attachment hash equals SOC-shared PDF bytes; portal access logs show no session for player credentials during claimed window; VN-12 "basis" line reads "remote banner verification of supplied artifact" | Verified: banner text accurate. NOT verified: independent observation — the player re-observed SOC's artifact, not the event. This is the trap's hinge and must be proved, not assumed: same root *could* have been independently re-observed, but these markers prove it wasn't. |
| P-C vendor-ticket copy → OCC forward → R-3 | No new observation — OCC forwards a copy of VT-1109-0214 | Vendor ticket copy → OCC inbox → CONTINUITY-FWD profile (per memo M-47-FWD-03) strips Origin-Event-ID → EIAB intake, receipt DR-3 | R-3 body identical to R-1 including `LT-47B` and a truncated timestamp `21:4_` (copy artifact); profile diff shows `drop Origin-Event-ID` rule active from Nov 12 11:00 | Verified: content accurate (it *is* the ticket). NOT verified: independence — R-3 is R-1's twin with the origin field removed. |

**The count.** EIAB Rule E-3 intake applies IG-E3-02: R-1 (Nov 10) + R-3 (Nov 13) + R-2 (Nov 14) = three distinct receipt paths, overlapping indicators, no shared origin on faces → finding F-47-E3 (Nov 14, 16:00) → extraordinary package recommended → Board vote Nov 24. Remove any one report and the count falls to two: no finding. The player's VN-12 is the third received — the counterfactual is material (see revision audit in STORY_ARC).

**Fair-play receipt artifact (no late gotcha).** The moment the player files VN-12 (L4), the fiction returns intake receipt INT-RECEIPT-12 on screen, kept in the player's file thereafter:

> INT-RECEIPT-12 — R-2 accepted 11/14 09:00. Basis metadata: ORIGIN-EVENT-ID: [blank — optional field]. Counting status: independent pending verification. Retraction receivable at any time. — EIAB Intake

The blank, the presumption, and the retraction right are visible *before* any reveal. L7 re-reads this same receipt with new understanding — reinterpretation, not ambush.

**Genuine event vs false independence (repeated in-fiction):** the scan happened; the patch is deserved; standard measures continue. What is false is that three reports are three sightings. Proving common source must never imply "no threat" — the ending keeps standard measures running while rejecting only the extraordinary package.

## 3. Authority constraints and adversary limits

- EIAB counts faces under IG-E3-02 but must review a timely counter-provenance filing meeting the two-source rule. It cannot investigate provenance unasked.
- The Board decides only on the logged record at the Nov 24 vote. It may reject the extraordinary package while continuing standard measures.
- OPCI mirrors filings nightly, adjudicates timeliness and corroboration count. Inspector Beck enforces the two-source rule even against the player.
- The player cannot compel testimony or move originals; only signed notes, consent-based interview records, and cited records. A retraction of one's own note is always receivable and always on the record.
- Adversary limits: Deputy Liaison Carter Vane (OCC) cannot forge, edit any log, order EIAB/BCR staff, or suspend credentials himself (he requests; BCR deputies sign the personnel order). His tools: requesting the forwarding-profile configuration he is authorized to request, curating which copies travel which path, delaying/narrowing access in writing, flooding channels with compliant-looking aids. Every move leaves paper.
- Singular accountability: Vane signs M-47-FWD-03 directing the CONTINUITY-FWD profile to drop Origin-Event-ID "to avoid double-count suppression." Dana Okafor (Continuity Systems Desk) implements the written order and later testifies to that fact. Responsibility attaches to the signer.

## 4. Institutions (all fictional)

- **Election Incident Advisory Bureau (EIAB):** issues advisories, applies IG-E3-02 counting, makes findings. Intake Chief: Nadia Cole (the person who should have caught it — see §9).
- **Office of Civic Continuity (OCC):** continuity liaison; may request forwarding configurations for channels it owns. Deputy Liaison: Carter Vane.
- **Bureau of Civic Records (BCR):** custodian of records including personal-paper lodgings. One strand lives here: custody preserves the originals that prove common source. Acting Chief: Priya Desai.
- **Office of Public Custody Inspector (OPCI):** independent oversight; nightly mirrors; adjudicates filings. Inspector: Roland Beck.
- **Certification Review Board:** three-member panel voting Nov 24 on the extraordinary package, on the logged record only.
- **Capital Press & Analyst Cooperative ("the cooperative"):** player network — stringers, editor, SOC source, vendor technician contact. No government power; its records (sent-mail, newsroom log) are the corroborating second source the rules require.

## 5. Characters, motives, voices, obligations

- **Mara Ellison, Election-Security Analyst, EIAB detailee.** Motive: provenance integrity. Filed Q-118 (Nov 15) asking for origin IDs behind R-2/R-3. Concrete consequence: directed administrative leave with EIAB filing credentials suspended by personnel order — from inside, any filing she makes is non-countable, and her internal communications are subject to OCC "coordination review." The one task she can only do off-site: lodge personal-paper copies (vendor original + SOC sent-mail) with BCR as a private citizen, receipted (C-1), and communicate thereafter only through counsel — internal lodging would route through the same review she is challenging and forfeit privilege. Withholds nothing as a puzzle; her lodging index is relayed by counsel at L13 and obtainable by standard request. Voice: precise, dry. *"A report without an origin is a rumor with a receipt stamp."*
- **The player (stringer).** Obligation: verify without burning sources; retract in public when wrong. Carries the central cost: retraction damages their own credit and the cooperative's.
- **Carter Vane, Deputy Liaison, OCC.** Motive: paternalistic legitimacy — the scan justifies action; paperwork is acceleration, not invention. Never falsifies content; misleads by selection, timing, forwarding configuration. Signer of M-47-FWD-03. Voice: courteous, procedure-fluent. *"Distinct receipt paths, overlapping indicators — the rule counts what it sees."*
- **Nadia Cole, EIAB Intake Chief (should-have-caught).** Duty under IG-E3-02 §5: spot-check origin fields when 2+ reports share indicators within 72 hours. Didn't: surge week + Vane's memo normalized blanks as "expected migration artifacts" + the player's note looked like independent field verification. Cost: formal counseling on the record + assigned to draft the IG-E3-03 revision. No institution-wide stupidity; one named miss with a reason.
- **Roland Beck, Inspector, OPCI.** Rule integrity over outcome. Rejects sloppy filings even when sympathetic. *"1. Standing acknowledged. 2. Corroboration: one source shown; two required. 3. Cure by 08:00."*
- **Priya Desai, Acting Chief, BCR.** Keeps the room open; holds custody strand (lodging receipts, witnessed requests).
- **Sam Oyelaran, Night Clerk.** Witnesses log actions; an entry without his initials means it bypassed the room.
- **Collaborators with faces:** Dana Okafor (implemented M-47-FWD-03 under written order; testifies — cost: reassignment); SOC analyst "Quill" via counsel (confirms sent-mail; cost: exposure risk the player manages); vendor technician Theo Park (confirms misfire; cost: termination proceedings, stayed if player cites records before naming him); editor June Adebayo (negotiates hold vs publish; cost: a correction notice either way).

## 6. Underlying chronology (truth)

- **Nov 9, 21:47–21:52:** EVT-1109-A occurs. Vendor NOC auto-logs.
- **Nov 10, 09:12:** Vendor signs VT-1109-0214 (origin retained). **14:05:** EIAB intake → R-1 (receipt DR-1).
- **Nov 10, 22:30:** SOC memo UM-1109-88 written. **Nov 11, 11:20:** shared with cooperative (Quill; headers stripped in shared PDF).
- **Nov 12, 10:00:** Vane signs M-47-FWD-03. **11:00:** CONTINUITY-FWD profile active. **15:40:** OCC forwards ticket copy via stripped profile. **Nov 13, 08:20:** EIAB intake → R-3 (receipt DR-3).
- **Nov 12–13:** Player assignment (L1–L3). **Nov 13, 19:05:** player files VN-12 (origin blank). **Nov 14, 09:00:** EIAB intake → R-2 (receipt DR-2 = INT-RECEIPT-12).
- **Nov 14, 16:00:** EIAB finding F-47-E3 (R-1+R-2+R-3) → extraordinary package recommended. Board vote set Nov 24.
- **Nov 15, 10:30:** Ellison files Q-118. **Nov 16, 09:00:** directed leave + credential suspension effective; her final desk log entry (opening line): *"The vote wasn't the target. The response was. Find Directive 47 before they certify the emergency."* **Nov 16, 13:15:** BCR personal-paper lodging C-1, receipted.
- **Nov 21:** Counsel relays Ellison's lodging index. **Nov 24, 08:00:** counter-provenance filing due. **10:00:** hearing and vote.

No box moves, no renewals, no 72-hour chaining apparatus — deleted as non-load-bearing. The only 72-hour element is the extraordinary package's statutory maximum (single use, no renewal).

## 7. Evidence inventory (stable IDs; provenance ≠ accuracy ≠ timing ≠ intent)

| ID | Item | Provenance | Accuracy | Timing | Intent (shows / does NOT show) |
|----|------|------------|----------|--------|-------------------------------|
| EVT-1109-A | Root scan logs (NOC auto-log + portal banner) | Vendor systems, NOC-lead signed | Accurate: a real probe occurred | Nov 9, 21:47–21:52 | Shows an event happened. NOT malice/scope. Alternative (hostile probe) ruled out by script config + self-report within the hour. |
| VT-1109-0214 | Vendor ticket (signed) | Vendor → EIAB direct | Accurate, origin retained | Signed Nov 10 09:12; intake Nov 10 14:05 | True origin. Basis for R-1. |
| UM-1109-88 | SOC memo | Campus SOC → cooperative (Quill) | Accurate observation, same event | Written Nov 10 22:30; shared Nov 11 11:20 | Second vantage on same event. NOT independence by itself. |
| SM-1 | SOC sent-mail + headers | SOC mail store, Quill interview via counsel | Authenticates shared PDF against SOC original by comparison (not truth, not tamper-proof) | Nov 11 11:20 | Shows when/what shared. Content truth comes from VT + logs. |
| VN-12 | Player verifier note | Player → EIAB | Accurate banner reading; origin blank (form default) | Filed Nov 13 19:05; intake Nov 14 09:00 | Player's causal role. Retractable anytime. |
| INT-RECEIPT-12 | Intake receipt for VN-12 | EIAB intake → player file | Accurate as receipt | Nov 14 09:00 | Fair-play artifact: blank origin + "independent pending verification" visible pre-reveal. |
| M-47-FWD-03 | Forwarding memo (Vane-signed) | OCC file → obtained by request | Accurate as order text | Signed Nov 12 10:00; active 11:00 | Who authorized stripping + stated reason. Effect shown by profile diff + DR-3, not memo alone. |
| DR-1/DR-2/DR-3 | Dispatch receipts | EIAB intake log + OPCI mirror | Accurate receipt record | Nov 10 / Nov 14 / Nov 13 | Three paths + timestamps. NOT independence — that's the trap. |
| R-1/R-2/R-3 | EIAB designations | EIAB intake | Content accurate; R-2/R-3 origin blank | On intake | What the rule counted. |
| F-47-E3 | Corroborated-pattern finding | EIAB | Procedurally valid on faces; substantively wrong on independence | Nov 14 16:00 | The thing to defeat by rebuttal. |
| IG-E3-02 | Counting guidance (Reyes-signed) | Public record | Lawful, rebuttable presumption | Jan 2026 | The shortcut — not the crime. Cole's §5 duty lives here. |
| D-47 | Directive 47 §4 (ratified, noticed) | Public record | Narrow, genuine-independence standard | Ratified Oct 14; noticed Oct 17 | What the law actually requires. No hidden text. |
| Q-118 | Ellison query | EIAB file + OPCI mirror | Accurate as question | Filed Nov 15 10:30 | She asked; leave order is the consequence. Doesn't prove her claim (C-1 + SM-1 do). |
| C-1 | BCR lodging + receipt | BCR custody, Desai receipt | Copies authenticated against vendor/SOC originals by comparison (hash = copy-vs-original check only) | Lodged Nov 16 13:15 | Originals preserved with origins intact. Alternative (selective curation) answered by completeness + declared gaps. |
| NL-1 | Cooperative newsroom log | Cooperative records | Accurate publication record | Ongoing | Second-source timeline; records correction cost. |
| CPF-9 | Counter-provenance filing + VN-12 retraction | Player + corroborator | Must meet two-source rule | Due Nov 24 08:00 | The instrument. Affirmative common-source proof (not mere subtraction) is what kills the package. |

Comparison discipline: hashes and signatures authenticate a copy against a trusted comparison original. They say nothing about whether the original is true, when anything happened, or why. No "tamper-proof" claims.

## 8. Knowledge ledger

- After E1: a real scan happened; you verified part of it; your note went onward (you don't yet know it was counted). INT-RECEIPT-12 sits in your file, its "pending verification" line not yet understood.
- After L7: EIAB counted three reports; your note is R-2 (reinterpretation of the receipt).
- After L9: R-3 is R-1's twin (shared `LT-47B` + truncation artifact); profile + memo exist.
- After L11: full D-47 §4 + IG-E3-02 — the law demands genuine independence; the guidance presumed it from faces. The fight is provenance, not authority text.
- After L13: Ellison's lodging index via counsel; she is on leave and credential-barred, not hiding, not a puzzle.
- Never hidden: the scan was real; standard measures deserved. Never asked: who "really" ordered the scan (no one — documented misfire).

## 9. Moral agency: five stable choices with visible consequences

- **L4 — Source protection (paraphrase vs identifying detail).** Paraphrase: Quill safe; VN-12 thinner (more corroboration work later). Detail: VN-12 stronger now; exposure risk follows (L9 confrontation + L13 interview conditions change). In newsroom log either way.
- **L8 — Vane's consolidated briefing vs independent verification.** Accept: faster, but filing cites OCC's packet (single-source taint; Beck discounts weight at L14). Independent: slower under narrowed hours, preserves two-source standing. Telegraphed, not a trap.
- **L9 — Publish preliminary vs hold for oversight.** Publish: careful preliminary runs; later public correction costs (retraction scene gains a step; editor trust visibly dips then recovers). Hold: cleaner record, but L14 must use the SOC record path instead — still available.
- **L13 — Request lodging immediately vs complete independent mapping first.** Immediate: faster; Beck notes single-chain reliance, requires SOC interview for second source. Independent-first: mapping + C-1 arrive as two chains; acknowledged weight at hearing.
- **L14 — Retraction scope + naming.** Full public retraction (visible credit cost; full Board weight) vs narrow technical correction (keeps some credit; Beck warns of discount; extra corroboration required). Name Vane as signer (challenged on tone, not facts) vs cite role + memo number (same legal effect; better outcomes for Okafor/Desai). All on ending card.

No choice locks content. Failure is procedural and re-triable (cure-and-refile; missed story deadline = explicit recovery, never rewritten evidence).

## 10. Ending (resolves architects and human costs)

At the Nov 24 hearing the Board finds the counter-provenance filing meets the two-source rule: R-1/R-2/R-3 share EVT-1109-A (vendor signature + SOC headers + dispatch receipts + profile diff + retraction). It rejects the extraordinary package and continues standard measures (advisory stands, patch verified, monitoring extended 30 days). On the record: Vane's M-47-FWD-03 caused false independence (conduct referral; reassignment — stated); Okafor implemented a written order (retraining, no misconduct — stated); Cole counseled + assigned IG-E3-03 revision (stated); Ellison's leave lifted with back-crediting, testifies as custodian of Q-118; Park's termination stayed contingent on completed remediation (self-report credited); Quill's confidentiality holds unless the player exposed them in L4 (then the cooperative funds counsel — cost shown). The player reads the retraction aloud, is attested as corroborating verifier, and takes the credit hit. Final card reflects all five choices. The only open item is policy homework, not mystery: EIAB's rulemaking review of face-counting.

## 11. Lexicon

Use: verification, provenance, corroboration, retraction, receipt path, originating event, derivative report, rebuttal, finding aid. Avoid: hack, breach (cyber sense), decrypt, backdoor, mole, double-cross, stolen election, rigged. The crisis is a provenance dispute inside a real-but-minor incident — not a cyberattack, not a vote-tampering claim.

## 12. Explicitly out

No vote-machine tampering, no deleted-file recovery, no password cracking, no surveillance pulls, no betrayals, no assassinations, no real-election claims. Vane never forges content; Ellison never dies and never hides without the stated credential reason; Beck never bends rules; no log is ever edited; no single office grants itself authority.
