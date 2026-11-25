// Pure story state for the approved L1-L3 slice (docs/NARRATIVE_DESIGN.md,
// docs/STORY_ARC.md, docs/STORY_BIBLE.md). No Herdr bindings, no wall clock,
// no React/DOM/adapters. Story events are idempotent and gated by story state.

export type Level = 1 | 2 | 3;

export type StoryEventId = "SE-L1-assignment" | "SE-L2-artifact" | "SE-L3-interview";

export type StoryActionId =
  | "read-memo"
  | "acknowledge-assignment"
  | "examine-artifact"
  | "record-consent"
  | "complete-interview";

export type StoryFlag = "assignment-accepted" | "consent-recorded";

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
};

const EVENT_DATE: Record<StoryEventId, string> = {
  "SE-L1-assignment": "2026-11-12",
  "SE-L2-artifact": "2026-11-12",
  "SE-L3-interview": "2026-11-13",
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
export function applyStoryAction(story: StoryState, action: StoryActionId): StoryState {
  switch (action) {
    case "read-memo":
      return story.level === 1 ? fire(story, "SE-L1-assignment") : story;
    case "acknowledge-assignment":
      return story.level === 1 && story.events.includes("SE-L1-assignment")
        ? flag(story, "assignment-accepted")
        : story;
    case "examine-artifact":
      return story.level === 2 ? fire(story, "SE-L2-artifact") : story;
    case "record-consent":
      return story.level === 3 ? flag(story, "consent-recorded") : story;
    case "complete-interview":
      return story.level === 3 && story.flags.includes("consent-recorded")
        ? fire(story, "SE-L3-interview")
        : story;
  }
}

/** Story condition for the earned response, per level. */
export function storyConditionMet(story: StoryState): boolean {
  if (story.level === 1) {
    return story.events.includes("SE-L1-assignment") && story.flags.includes("assignment-accepted");
  }
  if (story.level === 2) return story.events.includes("SE-L2-artifact");
  return story.events.includes("SE-L3-interview");
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
    "June Adebayo needs the source-handling rules checked before anyone contacts the protected source. " +
    "The terminal is ready. Type herdr, create an investigation workspace and a research tab, then " +
    "start Claude and retrieve CPA-01A. Read the original memo before you accept the assignment.",
  2:
    "The cooperative received SOC Memo UM-1109-88 with its origin headers removed. Keep the shared " +
    "copy in a second Herdr tab beside CPA-01A. Ask Claude to retrieve the record so June can decide " +
    "what the document does and does not establish.",
  3:
    "Theo Park agreed to an interview about the load-test misfire. Keep the audit and transcript " +
    "visible in separate Herdr panes. Ask Claude to retrieve the transcript before June reviews the case.",
};

const RESPONSE: Record<Level, string> = {
  1:
    'Assignment accepted on the record. Adebayo, editor: "Stringer rates. Verify origin. ' +
    'Preserve attribution. Do not assume independent confirmation." The shared artifact is next.',
  2:
    "Adebayo: The shared copy gives us the banner and the five-minute window. " +
    "It does not tell us where the report began. Theo Park has agreed to speak off the record. " +
    "Keep his account beside this report.",
  3:
    "Adebayo: Park's account matches the portal and the five-minute window. " +
    "The scan happened. That does not make this an independent report. " +
    "Keep LT-47B with the transcript. We will need it when we write VN-12.",
};

const HINTS: Record<Level, readonly string[]> = {
  1: [
    "The terminal is ready. Type herdr and press Enter.",
    "Press Ctrl+B. Release both keys, then press Shift+N. Name the workspace.",
    "Press Ctrl+B, then C. Name the tab research.",
    "Type claude. Ask Claude to find CPA-01A.",
    "Read the memo. Then tell Claude: Accept the assignment.",
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
