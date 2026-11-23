# Implementation plan

Status: proposal for review. No implementation is authorized; this plan defines what authorization would cover, in what order, and what each milestone must prove. Milestones map to the gates in `docs/ARCHITECTURE.md` §Gates; level content comes from `docs/LEVEL.md`; teaching claims are bounded by `docs/HERDR_FIDELITY.md` and `docs/HERDR_RESEARCH.md`.

## Milestone 0 — review gate (this document's exit)

Deliverable: the review-gate report and the user's approval decision. Inputs already on the repo: research baseline, fidelity contracts, architecture, learning design, story trio, ADRs 1–3, LEVEL.md, feasibility skeleton. Outstanding inputs at gate time:

1. Full-package reconciliation audit (skeptic) over all documents — narrative consistency, curriculum traceability, fidelity violations, cross-document contradictions. (Audit delivered; blocker fixes in progress — see the review-gate report.)
2. The manual keyboard pass, or an explicit user decision to gate shipping on "untested" (see M1). (Decision recorded: gate proceeds unresolved; M2 blocked until M1.)
3. Staged deltas: IQ-1 decision recorded (approved optional evidence, reconciled).

Acceptance: user approves (or amends) scope, story, curriculum, and the feasibility-first sequencing. Approval of M0 authorizes M1 only — not gameplay content.

## Milestone 1 — feasibility (authorized probe exists; expansion on approval)

Already done: `feasibility/keyboard-probe.html` (self-tested 9/9, zero external references) and `docs/FEASIBILITY_KEYBOARD.md` skeleton. Remaining:

1. Manual physical-key pass per browser/OS/layout the user intends to support; results filled into the matrix. Certifying.
2. Synthetic pass (parent-run, non-certifying) recorded as such.
3. Gate-1 hold-policy decisions: pending-prefix on host blur (void-vs-queue), capture-release affordance, clipboard failure behavior.
4. Decision rule: any taught chord that cannot be delivered on the chosen envelope narrows the envelope (explicitly approved) or blocks its lessons — never a replacement binding.

Exit: published support envelope + hold policy, recorded in FEASIBILITY_KEYBOARD.md and FIDELITY unresolved-items resolution notes.

## Milestone 2 — vertical slice (on M1 exit + explicit approval)

Scope: the smallest playable cut — L1–L3 only (per LEVEL.md contracts), no saves yet beyond an in-memory attempt, no settings surface.

1. Simulation core: pinned Herdr model subset (workspace/tab/pane/split-tree, prefix state machine, focus geometry, fictional pane apps for assignment/memo/transcript), typed transitions, ordered loop, narrative/assessment observers — per ARCHITECTURE boundaries.
2. Presentation: chrome projection (tab row, mode bar in bottom pane area, zoom pill), capture context state machine, external controls, transcript.
3. Assessment: L1–L3 predicates with three-evidence-kind provenance; assisted/independent recording.
4. Tests: fixture tests per cited FIDELITY row; determinism (same events → same state); replay without host effects; adversarial checks (completion click, fixture credit, scripted focus cannot satisfy objectives).

Exit: L1–L3 playable end-to-end on the M1 envelope with all L1–L3 predicates passing and zero dropped/misrouted keys in the input corpus.

## Milestone 3 — full content (on M2 acceptance)

Scope: L4–L15 per LEVEL.md, in episode batches (L4–L7, L8–L10, L11–L13, L14–L15), plus:

1. Persistence: IndexedDB checkpoints + event journal, versioned manifests, import/export validation (ARCHITECTURE §Persistence).
2. Settings: reduced motion, announcement policy, transcript, capture release — accessibility requirements from ARCHITECTURE §Presentation.
3. Checkpoint levels L5/L10 exactly per contract (no new skills, tier-0 start, deficiency-retry).
4. L15: five scored subtasks + hearing-room detach/reattach per the detach contract; disclosure never passes alone.
5. Content gates per batch: fidelity fixtures green, story triggers idempotent/re-entrant, dates and knowledge gates match the ARC table.

Exit: all 15 levels complete with batch acceptance records; playtest of the W3 correction-notice staging and L9 copy-artifact readability (ARC weaknesses carried into contracts).

## Milestone 4 — release validation

1. Accessibility: manual screen-reader, keyboard-only, reduced-motion, 200% zoom, capture-escape walks on the published envelope; results recorded.
2. Performance budgets measured on named hardware and the worst-case scene (ARCHITECTURE §Deployment): input latency, zero lost/duplicate/misrouted actions, render long tasks, persistence latency, import/replay bounds.
3. Learner study: novice playtest + delayed fresh-task retrieval (LEARNING_DESIGN §Validation) — honest per-skill reporting, no opaque mastery claim.
4. Release record: pinned upstream commit, fidelity profile, supported envelope, known limitations, license/attribution notes (ADR-0002).

## Standing constraints across all milestones

- Gameplay code, scaffolding, and dependencies require explicit user approval at each milestone boundary (M0 gate language).
- The feasibility probe stays a diagnostic page; nothing migrates into an application without post-gate approval.
- Any upstream Herdr baseline move re-triggers the ADR-0002 upgrade protocol before affected lessons ship.
- Narrative and assessment never share an authority path; story completion never manufactures keyboard-transfer credit.
- The manual pass remains the only certifying keyboard evidence; synthetic runs are labeled non-certifying wherever they appear.

## Current blocker summary

1. Skeptic full-package reconciliation (running) — gate input.
2. Manual keyboard pass — user action, gates M1 exit; initial proposed target Linux + Firefox + US-layout keyboard.
3. Gate-1 hold policies — parent decisions recorded at M1.
4. No runtime performance, accessibility, or learner-retention evidence exists yet — all are M3/M4 gates, not current claims.

## Review-gate decisions recorded (user)

1. **IQ-1 approved as optional evidence**: stage its Nov 17 release, reconcile across BIBLE/ARC/NARRATIVE_DESIGN/LEVEL, preserve L10 checkpoint purity — available before L10, examinable during L10, never required for retention scoring, existing common-root proof requirements unchanged, optional discovery recorded in the knowledge ledger without becoming an E3 prerequisite.
2. **Keyboard certification pending**: M0 proceeds unresolved; no manual-pass labels inferred from synthetic tests; Linux + Firefox + US-layout keyboard is the initial proposed test target; M2 blocked until M1 is accepted.
3. **Milestone structure accepted for review** — not an authorization for gameplay implementation. M1 is the next authorized work after M0 approval, subject to the same boundary; M2 requires separate approval.
4. **L15 detach/reattach must be validated as an authentic Herdr workflow** — a simulated page reload is never credited as a Herdr detach/reattach action (consistent with ARCHITECTURE §Fidelity and FIDELITY presentation-safety rules).
