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

/**
 * Canonical L1 documents the player actually reads. Kept as plain lines so the
 * adapter seeds them as committed process output; never React strings.
 * No misfire, script ID, or later-episode facts appear here.
 */
export const L1_ASSIGNMENT_LINES: readonly string[] = [
  "FROM: June Adebayo, The Cooperative — Desk Assignment",
  "RE: Vendor security incident — supplied goods",
  "Establish what is known before anyone contacts the source.",
  "Review the source-handling rules beside this assignment before you decide.",
  "Nothing here is independent confirmation.",
];

export const L1_MEMO_LINES: readonly string[] = [
  "SOURCE-HANDLING RULES — COOPERATIVE DESK",
  "1. Verify origin. Confirm where the material came from before relying on it.",
  "2. Preserve attribution. Keep the source's exact words and the chain of custody.",
  "3. Do not assume independent confirmation. One origin is one claim, not corroboration.",
  "Protected source: do not burn identity.",
];

const TITLE = "The Mandate: Herdr";

const COLD_OPEN =
  "Washington, November 2026. A source has provided information about a vendor security " +
  "incident. An assignment arrives from June Adebayo at the cooperative: establish what " +
  "is known before anyone contacts the source.";

const EPISODE = "Episode I — THE LEAK";

const BRIEFING: Record<Level, string> = {
  1:
    "Incoming assignment: verify the vendor security incident. The source-handling memo sits " +
    "beside the assignment in one workspace — read it before you decide. Quill stays out of " +
    "the copy; nothing here is independent confirmation yet.\n\n" +
    "COOPERATIVE SECURITY NOTICE — this remote console is running keyboard-only for the " +
    "secure session. Pointer operations are unavailable inside the investigation workspace; " +
    "all navigation goes through the console's own keybindings. Accessible-investigation " +
    "assist remains available from the console footer.",
  2:
    "The cooperative shared the SOC memo as a PDF with its headers stripped. Examine the " +
    "shared copy: banner text, window, and the origin line as it actually appears.",
  3:
    "Theo Park has agreed to a consent interview about the load-test misfire. Record the " +
    "consent, then take the transcript in a named tab. Script ID LT-47B is the floor.",
};

const RESPONSE: Record<Level, string> = {
  1:
    'Assignment accepted on the record. Adebayo, editor: "Stringer rates. Verify origin. ' +
    'Preserve attribution. Do not assume independent confirmation." The shared artifact is next.',
  2:
    "Artifact examined: the banner checks out, the origin line is blank by the share's " +
    "nature. Adebayo wants the window and the script ID before anyone places the event.",
  3:
    "Interview logged: LT-47B, a misfire, and a self-report timeline. The event is real " +
    'and owned. Adebayo: "Now write it up — and mind what you can actually attest to."',
};

const HINTS: Record<Level, readonly string[]> = {
  1: [
    "The prefix arms exactly one follow-up key; ordinary keys go straight to the focused pane.",
    "Focus moves between panes with the prefix plus a direction key; the pane you focus receives your typing.",
    "Help lists the active bindings. Filter it, clear the filter, then leave it.",
    "Worked example: prefix, then the left direction key, then type into the assignment pane.",
  ],
  2: [
    "A new tab opens with its own pane; the tab bar shows which tab is active.",
    "Rename the artifact tab through the field, then switch away and back to confirm it is active.",
    "Help stays available; consulting it is recorded, never punished.",
    "Worked example: prefix+c, prefix+shift+t, type a name, Enter, then prefix+p and prefix+n.",
  ],
  3: [
    "A split creates a second live pane and focus lands in it.",
    "Move focus deliberately, then declare which pane should receive your typing.",
    "The interview belongs in a named tab, not an unnamed one.",
    "Worked example: prefix+v, prefix+h, declare the left pane, then type.",
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
