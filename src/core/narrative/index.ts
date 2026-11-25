// Pure story state for the approved L1-L3 slice (docs/NARRATIVE_DESIGN.md,
// docs/STORY_ARC.md, docs/STORY_BIBLE.md). No Herdr bindings, no wall clock,
// no React/DOM/adapters. Story events are idempotent and gated by story state.

export type Level = 1 | 2 | 3 | 4 | 5;

export type StoryEventId =
  "SE-L1-assignment" | "SE-L2-artifact" | "SE-L3-interview" | "SE-L4-filing" | "SE-L5-retention1";

export type StoryActionId =
  | "read-memo"
  | "acknowledge-assignment"
  | "examine-artifact"
  | "record-consent"
  | "complete-interview"
  | "draft-vn12"
  | "file-vn12-paraphrase"
  | "file-vn12-detail"
  | "submit-finding";

export type StoryFlag =
  | "assignment-accepted"
  | "consent-recorded"
  | "source-protection-paraphrase"
  | "source-protection-detail"
  | "vn12-filed"
  | "retention1-submitted";

export interface StoryState {
  readonly level: Level;
  /** Fictional date from the ARC table; advances only on declared events. */
  readonly date: string;
  readonly events: readonly StoryEventId[];
  readonly flags: readonly StoryFlag[];
}

const LEVEL_DATE: Record<Level, string> = {
  1: "2026-11-12",
  2: "2026-11-12",
  3: "2026-11-13",
  4: "2026-11-13",
  5: "2026-11-14",
};

const EVENT_DATE: Record<StoryEventId, string> = {
  "SE-L1-assignment": "2026-11-12",
  "SE-L2-artifact": "2026-11-12",
  "SE-L3-interview": "2026-11-13",
  "SE-L4-filing": "2026-11-13",
  "SE-L5-retention1": "2026-11-14",
};

export function initialStory(level: Level): StoryState {
  return { level, date: LEVEL_DATE[level], events: [], flags: [] };
}

function fire(story: StoryState, event: StoryEventId): StoryState {
  if (story.events.includes(event)) return story;
  return { ...story, date: EVENT_DATE[event], events: [...story.events, event] };
}

function flag(story: StoryState, value: StoryFlag): StoryState {
  if (story.flags.includes(value)) return story;
  return { ...story, flags: [...story.flags, value] };
}

/**
 * Story actions are the in-world modality (memo opened, artifact examined,
 * consent recorded). They never grant keyboard-transfer credit; assessment
 * observes Herdr facts separately.
 */
function applyL1StoryAction(story: StoryState, action: StoryActionId): StoryState {
  if (action === "read-memo") return fire(story, "SE-L1-assignment");
  if (action === "acknowledge-assignment" && story.events.includes("SE-L1-assignment")) {
    return flag(story, "assignment-accepted");
  }
  return story;
}

function applyL2StoryAction(story: StoryState, action: StoryActionId): StoryState {
  if (action === "examine-artifact") return fire(story, "SE-L2-artifact");
  return story;
}

function applyL3StoryAction(story: StoryState, action: StoryActionId): StoryState {
  if (action === "record-consent") return flag(story, "consent-recorded");
  if (action === "complete-interview" && story.flags.includes("consent-recorded")) {
    return fire(story, "SE-L3-interview");
  }
  return story;
}

function applyL4StoryAction(story: StoryState, action: StoryActionId): StoryState {
  if (action === "draft-vn12") return fire(story, "SE-L4-filing");
  if (action === "file-vn12-paraphrase") {
    return fire(flag(flag(story, "source-protection-paraphrase"), "vn12-filed"), "SE-L4-filing");
  }
  if (action === "file-vn12-detail") {
    return fire(flag(flag(story, "source-protection-detail"), "vn12-filed"), "SE-L4-filing");
  }
  return story;
}

function applyL5StoryAction(story: StoryState, action: StoryActionId): StoryState {
  if (action === "submit-finding") {
    return fire(flag(story, "retention1-submitted"), "SE-L5-retention1");
  }
  return story;
}

export function applyStoryAction(story: StoryState, action: StoryActionId): StoryState {
  switch (story.level) {
    case 1:
      return applyL1StoryAction(story, action);
    case 2:
      return applyL2StoryAction(story, action);
    case 3:
      return applyL3StoryAction(story, action);
    case 4:
      return applyL4StoryAction(story, action);
    case 5:
      return applyL5StoryAction(story, action);
  }
}

/** Story condition for the earned response, per level. */
export function storyConditionMet(story: StoryState): boolean {
  if (story.level === 1) {
    return story.events.includes("SE-L1-assignment") && story.flags.includes("assignment-accepted");
  }
  if (story.level === 2) return story.events.includes("SE-L2-artifact");
  if (story.level === 3) return story.events.includes("SE-L3-interview");
  if (story.level === 4) return story.events.includes("SE-L4-filing");
  if (story.level === 5) return story.events.includes("SE-L5-retention1");
  return false;
}

export interface PresentationText {
  readonly title: string;
  readonly coldOpen: string;
  readonly episode: string;
  readonly briefing: string;
  readonly response: string;
  /** Tier 0..3, fading scaffolding. */
  readonly hints: readonly string[];
}

const TITLE = "The Mandate: Herdr";

const COLD_OPEN =
  "Washington, November 2026. A source has provided information about a vendor security " +
  "incident. An assignment arrives from June Adebayo at the cooperative: establish what " +
  "is known before anyone contacts the source.";

const EPISODE = "Episode I — THE LEAK";

const BRIEFING: Record<Level, string> = {
  1:
    "Your newsroom desk is live. Start Herdr with 'herdr', then launch Claude Code with 'claude'. " +
    "Check your morning schedule or email to retrieve June Adebayo's lead, review the source-handling rules, " +
    "and accept the assignment.",
  2:
    "The cooperative received SOC Memo UM-1109-88 with its origin headers removed. Keep the shared " +
    "copy in a second Herdr tab beside CPA-01A. Ask Claude to retrieve the record so June can decide " +
    "what the document does and does not establish.",
  3:
    "Theo Park agreed to an interview about the load-test misfire. Keep the audit and transcript " +
    "visible in separate Herdr panes. Ask Claude to retrieve the transcript before June reviews the case.",
  4:
    "Drafting Verifier Note VN-12 requires strict separation from your live investigation. " +
    "Create a new workspace named filing (Ctrl+B Shift+N), split it with Ctrl+B V to stage the draft beside your notes, " +
    "and submit VN-12. Use the workspace navigator (Ctrl+B W) or authentic Help (Ctrl+B ?) to return to your reading workspace.",
  5:
    "Morning paperwork delivers INT-RECEIPT-12: VN-12 is entered into the EIAB queue as R-2 with status " +
    '"independent pending verification". A fresh batch of intake records requires triage. ' +
    "Create a triage workspace without closing your investigation, arrange tabs, stage a comparison split, " +
    "and file your finding on the fresh set.",
};

const RESPONSE: Record<Level, string> = {
  1:
    'Assignment accepted on the record. Adebayo, editor: "Stringer rates. Verify origin. ' +
    "Preserve attribution. Do not assume independent confirmation. " +
    'Open a new research tab in Herdr with Ctrl+B C to review incoming records while keeping this desk log open."',
  2:
    "Adebayo: The shared copy gives us the banner and the five-minute window. " +
    "It does not tell us where the report began. Theo Park has agreed to speak off the record. " +
    "Keep his account beside this report.",
  3:
    "Adebayo: Park's account matches the portal and the five-minute window. " +
    "The scan happened. That does not make this an independent report. " +
    "Keep LT-47B with the transcript. We will need it when we write VN-12.",
  4:
    "Adebayo: Verifier Note VN-12 filed at 19:05 EST. Submission acknowledgement SUB-ACK-12 returned on the wire: " +
    '"Origin blank (form default). Retraction always receivable prior to formal certification. ' +
    'Counting review next cycle." Keep both workspaces intact—morning paperwork arrives tomorrow.',
  5:
    "EPISODE I FINALE — THE THIRD COUNT\n\n" +
    "INT-RECEIPT-12 committed to the docket: 3 of 3 required corroborating submissions recorded. " +
    "Emergency package F-47-E3 recommended for Board vote on November 24. " +
    "Why did three distinct channels report the same five-minute misfire as separate events?",
};

const HINTS: Record<Level, readonly string[]> = {
  1: [
    "Type herdr and press Enter to open your newsroom workspace.",
    "Type claude and press Enter to start Claude Code.",
    "Ask Claude: 'What's on my schedule today?' or 'Do I have any email?'",
    "Ask Claude about source-handling procedures, then tell it: 'Accept the assignment'.",
  ],
  2: [
    "Open and name a second tab for the shared report.",
    "Switch to the source tab, then return to the report.",
    "Ask Claude to retrieve UM-1109-88.",
  ],
  3: [
    "Split the active tab so both records stay visible.",
    "Move focus to the new pane before you type.",
    "Name the tab for the witness record.",
    "Ask Claude to retrieve Park's interview.",
  ],
  4: [
    "Create a new workspace named filing: press Ctrl+B then Shift+N.",
    "Split the tab with Ctrl+B V, then switch panes with Ctrl+B H and Ctrl+B L.",
    "Start Claude in the draft pane and file VN-12 (specify paraphrase or detail).",
    "Press Ctrl+B then W to open the workspace navigator and return to your investigation workspace.",
  ],
  5: [
    "Create a dedicated triage workspace for the fresh intake batch.",
    "Organize and name multiple tabs for the incoming records.",
    "Stage a comparison split to analyze the records side-by-side.",
    "Direct input to the target pane and submit your finding on the fresh set.",
  ],
};

export function presentationFor(level: Level): PresentationText {
  return {
    title: TITLE,
    coldOpen: COLD_OPEN,
    episode: EPISODE,
    briefing: BRIEFING[level],
    response: RESPONSE[level],
    hints: HINTS[level],
  };
}
