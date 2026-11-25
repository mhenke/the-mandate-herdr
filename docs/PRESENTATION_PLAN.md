# Presentation Plan — Theatrical Structure & Cinematics

> Status: Approved presentation plan extension for M2 and beyond. Defines the theatrical structure of *The Mandate: Herdr*, specifying offline HyperFrames cinematic production, React integration, accessibility guardrails, and the progression/idempotency contract.

---

## 1. Theatrical Structure

The Mandate structures its player journey as an authentic investigative procedural political thriller. Every chapter follows a deliberate theatrical rhythm:

$$\text{Cold Open} \longrightarrow \text{Herdr Investigation} \longrightarrow \text{Narrative Consequence} \longrightarrow \text{Cinematic Outro} \longrightarrow \text{Next Chapter}$$

Outros replace generic "Level Complete" screens with documentary-grade narrative payoffs, confirming real consequences and pointing to the next investigative lead.

### Outro Typology

| Type | When | Scope & Pacing | Purpose |
|---|---|---|---|
| **Mission Outro** | After significant narrative beats (e.g. L3) | 15–25s, focused, silent/subtle score, archival placards | Acknowledge ground truth established by player action, reveal immediate institutional reaction, introduce the next investigative lead. |
| **Episode Finale** | After L5, L10, L15 | 25–40s, cinematic documentary sequence | Deliver the episode cliffhanger, summarize the shifting evidentiary state, and mark major institutional escalations. |
| **Game Ending** | After L15 (following hearing disclosure) | 45–60s, branch-sensitive resolution | Reflect the cumulative consequences of the player's 5 moral choice points (6 recorded decisions) on characters, institutions, and the player's standing. |

---

## 2. Episodic Arc & Finale Map

### Episode I — The Leak (Levels 1–5)
- **Premise:** The investigation is no longer routine. The apparent confirmation of a threat raises the stakes.
- **L1–L2:** Cold Open establishing the desk, assignment memo, and initial banner verification.
- **L3 Mission Outro ("Five Minutes"):**
  - *Trigger:* Verified completion of L3 Theo Park consent interview (`SE-L3-interview`).
  - *Payoff:* Confirms the ground truth floor—night technician Theo Park self-reported a 5-minute misfire of script `LT-47B` on the demo portal. No external breach occurred.
  - *Next lead:* "Write it up. File Verifier Note VN-12 before the intake cycle closes."
- **L5 Episode I Finale ("The Third Count"):**
  - *Trigger:* Verified filing of findings and receipt arrival (`SE-L5-retention1`).
  - *Payoff:* Morning paperwork arrives with `INT-RECEIPT-12`. A third independent report has been procedurally recorded. Emergency package F-47-E3 is recommended.
  - *Cliffhanger:* *End on a disturbing question, not the answer.* Why did three separate channels corroborate an internal misfire?

### Episode II — The Containment (Levels 6–10)
- **Premise:** Evidence begins undermining the official interpretation, while institutional pressure mounts.
- **L10 Episode II Finale ("The Twin"):**
  - *Trigger:* Verified common-root proof submitted (`SE-L10-retention2`).
  - *Payoff:* R-1 and R-3 are twins; OCC's forwarding rule stripped the origin. The emergency is procedurally sealed by the player's own earlier note (R-2).
  - *Turning point:* *End with the player understanding what must be challenged.* Subtraction alone is useless; only an affirmative counter-provenance filing can break the count.

### Episode III — The Mandate (Levels 11–15)
- **Premise:** The record is heard. Decisions have consequences, including for the player's credibility and collaborators.
- **L15 Episode III Finale & Game Ending ("The Record"):**
  - *Trigger:* Verified hearing reading and Board orders (`SE-L15-reading`).
  - *Payoff:* Delivers the choice-sensitive resolution reflecting:
    1. *L4 Source Protection (Paraphrase vs Detail):* Quill's security vs exposure.
    2. *L8 Briefing vs Independent:* OCC single-source taint vs clean standing.
    3. *L9 Publish vs Hold:* Newsroom correction notice vs delayed public record.
    4. *L14 Retraction Scope & Naming:* Personal liability and Theo Park's protection vs institutional blame.

---

## 3. Behavioral and Architectural Contracts

### Rule 1: Earned Progression (No Video-Gated State)
Cinematics are rewards and narrative transitions, **never assessment gates**:
1. Authentic Herdr terminal objectives must be verified by `src/core/assessment`.
2. Narrative facts are committed by `src/core/narrative` (`SE-*` event).
3. The UI presents the cinematic outro.
4. The next level unlocks based on the committed narrative fact, **never** on video playback completion.

### Rule 2: Presentation Event Ownership & Story Clock Decoupling
- Cold opens, pauses, resumes, skips, and natural playback endings are strictly **Presentation events**.
- They are **not** Herdr `ChromeEvent`s, fictional `ProcessEvent`s, `Action evidence`, or `Learning evidence`.
- Playback never advances the authoritative story clock. The clock remains at $T_0$ until an explicitly declared narrative transition advances it (`SE-*`). The first terminal input does not automatically advance time.
- Cinematics may display an already-committed story transition, but playback does not create that transition.
- Presentation state stays strictly outside the authoritative gameplay journal (`HerdrState.journal`) unless recovery requires an isolated presentation cursor.

### Rule 3: Skipping Never Changes Evidence
- Skipping an outro skips **only presentation playback**.
- Skipping never awards unearned objectives, alters provenance, suppresses evidence, or bypasses prerequisites.
- The player can skip immediately via visible button (`Skip`) or keyboard shortcut (`Escape` or `Space`).

### Rule 3: Accessibility Floor (WCAG 2.2 AA)
Every cinematic produced must provide:
- **Immediate Skip Affordance:** Focusable, visible, keyboard-reachable button.
- **Full Text Equivalent:** Accessible `<details>` or tabbed transcript containing verbatim dialogue, dockets, and scene descriptions.
- **Reduced-Motion Alternative:** Respects `prefers-reduced-motion` and provides a manual toggle. When enabled, video autoplay is disabled, displaying a static archival placard with narration text.
- **Closed Captions:** Synchronized WebVTT (`.vtt`) files with high-contrast backing placed at `line:8%` (top viewport) to prevent collision with burned-in lower dockets.
- **Optional Audio:** Videos default to silent or subtle ambience with an explicit player audio toggle.

### Rule 4: Idempotence & Replayability
- Cinematic events are idempotent. Re-entering a completed level or reloading the application replays the content state without re-firing state mutations or duplicating log entries.
- Completed cinematics are archived in the player's documentary docket/case file for on-demand replay.

---

## 4. Production Pipeline (HyperFrames Offline)

Cinematics are developed offline using **HyperFrames**:
1. Scaffolding in `cinematics/<slug>/` with deterministic HTML/CSS/GSAP compositions.
2. Verified with `hyperframes check` (0 layout/contrast/motion errors; calm documentary styling with zero spatial drift).
3. Rendered to static MP4 (`hyperframes render --quality looks`, 1080p progressive, CRF 16).
4. Assets copied to `public/cinematics/<slug>/`:
   - `<slug>.mp4`: H.264 video stream
   - `<slug>.vtt`: Synchronized WebVTT captions
   - `<slug>.txt`: Full plain-text transcript
   - `<slug>-poster.png`: High-resolution poster frame
5. Projected in React via `src/ui/CinematicPlayer.tsx`.
