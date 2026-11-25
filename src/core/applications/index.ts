export * from "./screen";

export type DocumentAccess = "cooperative" | "public" | "restricted";

export interface FictionalDocument {
  readonly id: string;
  readonly title: string;
  readonly access: DocumentAccess;
  readonly availableFromLevel?: 2 | 3 | 4 | 5;
  readonly body: readonly string[];
  readonly searchTerms: readonly string[];
}

export interface ReadReceipt {
  readonly documentId: string;
  readonly paneId: string;
}

export type ToolError = "invalid_query" | "invalid_id" | "not_found" | "permission_denied";

export type DocumentSearchResult =
  | { readonly ok: true; readonly matches: readonly Pick<FictionalDocument, "id" | "title">[] }
  | { readonly ok: false; readonly error: ToolError };

export type DocumentReadResult =
  | { readonly ok: true; readonly document: FictionalDocument }
  | { readonly ok: false; readonly error: ToolError };

export interface AgentHistoryEntry {
  readonly role: "user" | "assistant" | "tool";
  readonly content: string;
}

export type ApplicationTaskPhase =
  "queued" | "working" | "waiting_for_input" | "settled" | "failed";

export type AgentTopic = "schedule" | "inbox" | "assignment" | "document" | "filing" | "intake";

export interface AgentSession {
  readonly status: "ready" | "blocked";
  readonly phase?: ApplicationTaskPhase;
  readonly history: readonly AgentHistoryEntry[];
  readonly lastTask: "completed" | "blocked" | "unrecognized" | null;
  readonly lastReferencedMessageId?: string;
  readonly lastReferencedDocumentId?: string;
  readonly lastTopic?: AgentTopic;
}

export interface VirtualFile {
  readonly name: string;
  readonly type: "file";
  readonly content: readonly string[];
}

export interface VirtualDirectory {
  readonly name: string;
  readonly type: "dir";
  readonly children: Readonly<Record<string, VirtualNode>>;
}

export type VirtualNode = VirtualFile | VirtualDirectory;

export interface ApplicationState {
  readonly herdrLaunched: boolean;
  readonly terminal: {
    readonly input: string;
    readonly output: readonly string[];
    readonly cursor?: number;
    readonly cwd?: string;
  };
  readonly paneInputs: Readonly<Record<string, string>>;
  readonly paneCursors?: Readonly<Record<string, number>>;
  readonly paneCwds?: Readonly<Record<string, string>>;
  readonly agents: Readonly<Record<string, AgentSession>>;
  readonly records: readonly FictionalDocument[];
  readonly readReceipts: readonly ReadReceipt[];
  readonly assignmentAcknowledged: boolean;
  readonly managedNoticeShown?: boolean;
}

export type ApplicationInput =
  | {
      readonly kind: "key";
      readonly origin: "player" | "process" | "fixture" | "script";
      readonly key: string;
      readonly paneId?: string;
      readonly modifiers?: readonly string[];
    }
  | {
      readonly kind: "paste";
      readonly origin: "player" | "process" | "fixture" | "script";
      readonly text: string;
      readonly paneId?: string;
    };

export type ApplicationEffect =
  | { readonly kind: "terminal-output"; readonly line: string }
  | { readonly kind: "herdr-started" }
  | { readonly kind: "pane-output"; readonly paneId: string; readonly line: string }
  | { readonly kind: "pane-clear"; readonly paneId: string }
  | { readonly kind: "claude-started"; readonly paneId: string }
  | { readonly kind: "claude-exited"; readonly paneId: string }
  | { readonly kind: "assignment-acknowledged" }
  | { readonly kind: "document-read"; readonly documentId: string }
  | { readonly kind: "vn12-filed"; readonly choice: "paraphrase" | "detail" }
  | { readonly kind: "finding-submitted" };

export interface ApplicationTransition {
  readonly state: ApplicationState;
  readonly effects: readonly ApplicationEffect[];
  readonly ignored?: true;
}

const RECORDS: readonly FictionalDocument[] = [
  {
    id: "CPA-01A",
    title: "SOURCE-HANDLING MEMORANDUM // CPA-01A",
    access: "cooperative",
    searchTerms: [
      "memo",
      "source",
      "sources",
      "handling",
      "cpa-01a",
      "quill",
      "assignment",
      "procedure",
      "procedures",
      "rules",
      "policy",
      "guidelines",
      "confidential",
    ],
    body: [
      "SOURCE-HANDLING MEMORANDUM // CPA-01A",
      "01 // VERIFY ORIGIN. Confirm where the material came from before relying on it.",
      "02 // PRESERVE ATTRIBUTION. Keep the source's exact words and the chain of custody.",
      "03 // ASSUME NOTHING CONFIRMED. One origin is one claim, not corroboration.",
      "Protected source: do not burn identity.",
    ],
  },
  {
    id: "UM-1109-88",
    title: "SOC Memo UM-1109-88 (Shared Copy)",
    access: "cooperative",
    availableFromLevel: 2,
    searchTerms: ["soc", "um-1109-88", "artifact", "banner", "shared copy", "vendor"],
    body: [
      "SOC MEMORANDUM // UM-1109-88 (SHARED COPY)",
      "SOURCE: Campus SOC via cooperative transfer.",
      "NOTE: Transmission headers are absent from this shared copy.",
      "TARGET: Vendor Demonstration Portal (VP-1109).",
      "WINDOW: 2026-11-09 21:47–21:52 EST.",
      "BANNER: MAINTENANCE ADVISORY: DIAGNOSTIC SCRIPT EXECUTION IN PROGRESS.",
      "ORIGIN-EVENT-ID: [BLANK ON SHARED COPY].",
    ],
  },
  {
    id: "PARK-INTERVIEW-11-13",
    title: "Theo Park — Consent Interview (Nov 13)",
    access: "cooperative",
    availableFromLevel: 3,
    searchTerms: ["park", "transcript", "lt-47b", "interview", "five minutes"],
    body: [
      "WITNESS TRANSCRIPT // THEO PARK (VENDOR NOC TECHNICIAN)",
      "STATUS: Consent recorded · off-record.",
      "PARK: 'Load-test script LT-47B misfired against demo portal VP-1109.'",
      "PARK: 'Execution window was 21:47 to 21:52 EST. Five minutes total.'",
    ],
  },
  {
    id: "SUB-ACK-12",
    title: "SUBMISSION ACKNOWLEDGEMENT // SUB-ACK-12",
    access: "cooperative",
    availableFromLevel: 4,
    searchTerms: ["sub-ack-12", "ack", "acknowledgement", "receipt", "vn-12", "submission"],
    body: [
      "SUBMISSION ACKNOWLEDGEMENT // SUB-ACK-12",
      "FILING: Verifier Note VN-12 (EIAB Intake Desk).",
      "ORIGIN: [BLANK ON RECORD - FORM DEFAULT].",
      "STATUS: RECEIVED // PENDING INTAKE CYCLE REVIEW.",
      "NOTE: Retraction always receivable prior to formal certification.",
      "RECORD COMMITTED 19:05 EST.",
    ],
  },
  {
    id: "INT-RECEIPT-12",
    title: "INTAKE RECEIPT // INT-RECEIPT-12 (EIAB QUEUE ENTRY R-2)",
    access: "cooperative",
    availableFromLevel: 5,
    searchTerms: ["int-receipt-12", "receipt", "dr-2", "r-2", "intake", "morning paperwork"],
    body: [
      "INTAKE RECEIPT // INT-RECEIPT-12 (EIAB QUEUE ENTRY R-2)",
      "SOURCE NOTE: VN-12.",
      "CLASSIFICATION: INDEPENDENT PENDING VERIFICATION.",
      "DOCKET: EIAB-2026-47-E3.",
      "COUNTING LINE: 3 OF 3 REQUIRED CORROBORATING SUBMISSIONS COMMITTED.",
      "ACTION: EMERGENCY PACKAGE FORMATION RECOMMENDED.",
    ],
  },
  {
    id: "INTAKE-BATCH-1114",
    title: "INTAKE BATCH MANIFEST // 2026-11-14",
    access: "cooperative",
    availableFromLevel: 5,
    searchTerms: ["intake", "batch", "manifest", "1114", "intake-batch-1114", "triage"],
    body: [
      "INTAKE BATCH MANIFEST // 2026-11-14",
      "ENTRY 01 // VENDOR ADVISORY NOTICE (VP-1109)",
      "ENTRY 02 // EIAB QUEUE LOG (R-1, R-2, R-3)",
      "ENTRY 03 // MORNING DISPATCH ACKNOWLEDGEMENT",
      "STATUS: Triage required before morning press cycle.",
    ],
  },
  {
    id: "RESTRICTED-EIAB-DRAFT",
    title: "Restricted EIAB draft",
    access: "restricted",
    searchTerms: ["restricted-eiab-draft", "eiab restricted draft"],
    body: ["RESTRICTED — not available to the cooperative."],
  },
];

export const INITIAL_FS: VirtualDirectory = {
  name: "root",
  type: "dir",
  children: {
    home: {
      name: "home",
      type: "dir",
      children: {
        investigator: {
          name: "investigator",
          type: "dir",
          children: {
            Projects: {
              name: "Projects",
              type: "dir",
              children: {
                "the-mandate": {
                  name: "the-mandate",
                  type: "dir",
                  children: {
                    "README.md": {
                      name: "README.md",
                      type: "file",
                      content: [
                        "# The Mandate — Newsroom Investigative Desk",
                        "Cooperative Press investigative workstation.",
                        "Preconfigured assistant: Claude Code (run 'claude')",
                        "Standard operating procedures in docs/source-policy.txt",
                      ],
                    },
                    notes: {
                      name: "notes",
                      type: "dir",
                      children: {
                        "assignment.txt": {
                          name: "assignment.txt",
                          type: "file",
                          content: [
                            "Desk Assignment: Review vendor security incident report.",
                            "Consult Claude Code for morning inbox and schedule.",
                            "Remember Directive 47 source-handling standards.",
                          ],
                        },
                        "contacts.txt": {
                          name: "contacts.txt",
                          type: "file",
                          content: [
                            "June Adebayo — Cooperative Desk Editor <j.adebayo@cooperative.press>",
                            "Newsroom Wire Desk — extension 404",
                          ],
                        },
                      },
                    },
                    docs: {
                      name: "docs",
                      type: "dir",
                      children: {
                        "source-policy.txt": {
                          name: "source-policy.txt",
                          type: "file",
                          content: [
                            "DIRECTIVE 47 EXCERPT: CONFIDENTIAL SOURCE HANDLING",
                            "1. Origin verification is mandatory before reporting vendor incidents.",
                            "2. Preserve attribution and maintain isolated audit workspaces.",
                            "3. Do not disclose confidential sources without consent.",
                          ],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export const DEFAULT_CWD = "/home/investigator/Projects/the-mandate";

export function displayCwd(path: string): string {
  if (path === "/home/investigator") return "~";
  if (path.startsWith("/home/investigator/")) {
    return "~" + path.slice("/home/investigator".length);
  }
  return path;
}

export function resolvePath(cwd: string, target?: string): string {
  if (!target || target === "~") return "/home/investigator";
  let abs = target;
  if (target.startsWith("~/")) {
    abs = "/home/investigator/" + target.slice(2);
  } else if (!target.startsWith("/")) {
    abs = `${cwd.replace(/\/+$/, "")}/${target}`;
  }
  const parts = abs.split("/").filter(Boolean);
  const resolved: string[] = [];
  for (const part of parts) {
    if (part === ".") continue;
    if (part === "..") {
      resolved.pop();
    } else {
      resolved.push(part);
    }
  }
  return "/" + resolved.join("/");
}

export function getFsNode(fs: VirtualDirectory, path: string): VirtualNode | null {
  const parts = path.split("/").filter(Boolean);
  let current: VirtualNode = fs;
  for (const part of parts) {
    if (current.type !== "dir") return null;
    const child: VirtualNode | undefined = current.children[part];
    if (!child) return null;
    current = child;
  }
  return current;
}

export interface ShellResult {
  readonly nextCwd: string;
  readonly lines: readonly string[];
  readonly clear?: boolean;
  readonly launchHerdr?: boolean;
  readonly launchClaude?: boolean;
}

export function executeShellCommand(
  cmdLine: string,
  cwd: string,
  fs: VirtualDirectory = INITIAL_FS,
): ShellResult {
  const trimmed = cmdLine.trim();
  if (!trimmed) {
    return { nextCwd: cwd, lines: [] };
  }
  const parts = trimmed.split(/\s+/);
  const command = parts[0]?.toLowerCase() ?? "";
  const arg = parts[1];

  switch (command) {
    case "pwd":
      return { nextCwd: cwd, lines: [displayCwd(cwd)] };

    case "ls": {
      const targetPath = arg ? resolvePath(cwd, arg) : cwd;
      const node = getFsNode(fs, targetPath);
      if (!node) {
        return {
          nextCwd: cwd,
          lines: [`ls: cannot access '${arg}': No such file or directory`],
        };
      }
      if (node.type === "file") {
        return { nextCwd: cwd, lines: [node.name] };
      }
      const names = Object.values(node.children)
        .map((child) => (child.type === "dir" ? `${child.name}/` : child.name))
        .sort((a, b) => a.localeCompare(b));
      return { nextCwd: cwd, lines: names.length > 0 ? [names.join("  ")] : [] };
    }

    case "cd": {
      const targetPath = resolvePath(cwd, arg);
      const node = getFsNode(fs, targetPath);
      if (!node) {
        return {
          nextCwd: cwd,
          lines: [`cd: no such file or directory: ${arg ?? ""}`],
        };
      }
      if (node.type !== "dir") {
        return {
          nextCwd: cwd,
          lines: [`cd: not a directory: ${arg ?? ""}`],
        };
      }
      return { nextCwd: targetPath, lines: [] };
    }

    case "cat": {
      if (!arg) {
        return { nextCwd: cwd, lines: ["cat: missing file operand"] };
      }
      const targetPath = resolvePath(cwd, arg);
      const node = getFsNode(fs, targetPath);
      if (!node) {
        return {
          nextCwd: cwd,
          lines: [`cat: ${arg}: No such file or directory`],
        };
      }
      if (node.type === "dir") {
        return { nextCwd: cwd, lines: [`cat: ${arg}: Is a directory`] };
      }
      return { nextCwd: cwd, lines: node.content };
    }

    case "clear":
      return { nextCwd: cwd, lines: [], clear: true };

    case "help":
      return {
        nextCwd: cwd,
        lines: [
          "Supported shell commands:",
          "  claude      Start Claude Code investigative assistant",
          "  pwd         Print working directory",
          "  ls [path]   List directory contents",
          "  cd [path]   Change directory",
          "  cat [file]  Display file contents",
          "  clear       Clear terminal output",
          "  help        Display this help message",
          "  exit        Exit current shell or assistant",
        ],
      };

    case "exit":
      return {
        nextCwd: cwd,
        lines: ["[Process completed - press Enter to restart shell]"],
      };

    case "claude":
      return {
        nextCwd: cwd,
        lines: [],
        launchClaude: true,
      };

    case "herdr":
      return {
        nextCwd: cwd,
        lines: [],
        launchHerdr: true,
      };

    default:
      return {
        nextCwd: cwd,
        lines: [`${parts[0]}: command not found. Type 'help' for available commands.`],
      };
  }
}

export function createApplicationState(): ApplicationState {
  return {
    herdrLaunched: false,
    terminal: { input: "", output: ["$ "], cursor: 0, cwd: DEFAULT_CWD },
    paneInputs: {},
    paneCursors: {},
    paneCwds: {},
    agents: {},
    records: RECORDS,
    readReceipts: [],
    assignmentAcknowledged: false,
    managedNoticeShown: false,
  };
}

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export function searchDocuments(
  records: readonly FictionalDocument[],
  query: string,
): DocumentSearchResult {
  const normalized = normalize(query);
  if (!normalized) return { ok: false, error: "invalid_query" };
  const matches = records.filter((record) => {
    const haystack = normalize(`${record.id} ${record.title} ${record.searchTerms.join(" ")}`);
    return normalized.split(" ").some((term) => haystack.includes(term));
  });
  if (matches.some((record) => record.access === "restricted")) {
    return { ok: false, error: "permission_denied" };
  }
  if (matches.length === 0) return { ok: false, error: "not_found" };
  return { ok: true, matches: matches.map(({ id, title }) => ({ id, title })) };
}

export function readDocument(
  records: readonly FictionalDocument[],
  id: string,
): DocumentReadResult {
  const normalized = id.trim().toUpperCase();
  if (!normalized) return { ok: false, error: "invalid_id" };
  const document = records.find((record) => record.id === normalized);
  if (!document) return { ok: false, error: "not_found" };
  if (document.access === "restricted") return { ok: false, error: "permission_denied" };
  return { ok: true, document };
}

function setAgent(state: ApplicationState, paneId: string, agent: AgentSession): ApplicationState {
  return { ...state, agents: { ...state.agents, [paneId]: agent } };
}

function addHistory(
  agent: AgentSession,
  role: AgentHistoryEntry["role"],
  content: string,
): AgentSession {
  return { ...agent, history: [...agent.history, { role, content }] };
}

function paneOutput(paneId: string, lines: readonly string[]): ApplicationEffect[] {
  return lines.map((line) => ({ kind: "pane-output", paneId, line }));
}

function tokenize(text: string): readonly string[] {
  const normalized = normalize(text);
  const words = normalized
    .replace(/[^a-z0-9-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const tokens: string[] = [];
  for (const word of words) {
    tokens.push(word);
    if (word.includes("-")) {
      tokens.push(word.replace(/-/g, ""));
      tokens.push(...word.split("-"));
    }
  }
  return tokens;
}

const ACCEPT_VERBS = new Set([
  "accept",
  "accepts",
  "accepted",
  "agree",
  "agrees",
  "confirm",
  "confirmed",
]);

function isAssignmentAcceptanceIntent(request: string): boolean {
  const norm = normalize(request);
  if (
    request.includes("?") ||
    /\b(why|should|would|don'?t|do not|not ready|before|explain|what is|know anything)\b/i.test(
      norm,
    )
  ) {
    return false;
  }
  const tokens = norm
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const tokenSet = new Set(tokens);
  const hasAccept = tokens.some((token) => ACCEPT_VERBS.has(token));
  if (tokens.length === 1 && hasAccept) return true;
  if (norm.startsWith("i accept") || norm.startsWith("i agree") || norm.startsWith("we accept"))
    return true;
  return hasAccept && (tokenSet.has("assignment") || tokenSet.has("terms") || tokenSet.has("task"));
}

function isAssignmentBriefIntent(request: string): boolean {
  const norm = normalize(request);
  if (/\b(memo|document|transcript|cpa-01a|um-1109|lt-47b|receipt|report)\b/i.test(norm)) {
    return false;
  }
  return (
    /\b(assignment|what should i (do|investigate)|what is (the|my) (assignment|task|lead)|what did june|june'?s? assignment|know anything about it)\b/i.test(
      norm,
    ) && !isAssignmentAcceptanceIntent(request)
  );
}

function isScheduleIntent(request: string): boolean {
  const norm = normalize(request);
  if (/\b(schedule|calendar|agenda|morning check-in|my day|on my plate)\b/i.test(norm)) return true;
  if (/\b(going on|happening|plans?|tasks?)\b/i.test(norm) && /\btoday\b/i.test(norm)) return true;
  if (norm.includes("what do i have going on") || norm.includes("what do i have today"))
    return true;
  return false;
}

function isInboxIntent(request: string): boolean {
  const norm = normalize(request);
  if (/\b(memo|document|transcript|cpa-01a|um-1109|lt-47b|receipt|report)\b/i.test(norm)) {
    return false;
  }
  return /\b(email|mail|inbox|messages?|unread|outstanding)\b/i.test(norm);
}

function isIncidentIntent(request: string): boolean {
  const norm = normalize(request);
  return /\b(incident|misfire|telemetry|breach|what happened)\b/i.test(norm);
}

const VN12_KEYWORDS = ["vn-12", "vn12", "verifier note", "note", "filing"] as const;
const FILE_KEYWORDS = ["file", "draft", "submit", "commit"] as const;
const PARAPHRASE_KEYWORDS = ["paraphrase", "quill safe", "protect source"] as const;
const DETAIL_KEYWORDS = ["detail", "identifying", "stronger"] as const;
const FINDING_ACTIONS = ["submit", "file", "compile", "triage", "provenance"] as const;
const FINDING_PHRASES = [
  "submit finding",
  "compile finding",
  "file finding",
  "triage intake",
] as const;

function hasAnyKeyword(text: string, keywords: readonly string[]): boolean {
  return keywords.some((k) => text.includes(k));
}

function vn12Choice(text: string): "paraphrase" | "detail" | null {
  if (hasAnyKeyword(text, PARAPHRASE_KEYWORDS)) return "paraphrase";
  if (hasAnyKeyword(text, DETAIL_KEYWORDS)) return "detail";
  return null;
}

function isVn12FilingIntent(request: string): {
  filing: boolean;
  choice: "paraphrase" | "detail" | null;
} {
  const norm = normalize(request);
  const choice = vn12Choice(norm);
  if (choice !== null) return { filing: true, choice };
  const mentionsVn12 = hasAnyKeyword(norm, VN12_KEYWORDS);
  const mentionsFile = hasAnyKeyword(norm, FILE_KEYWORDS);
  if (mentionsVn12 && mentionsFile) return { filing: true, choice: null };
  return { filing: false, choice: null };
}

function isFindingSubmissionIntent(request: string): boolean {
  const norm = normalize(request);
  if (FINDING_PHRASES.some((phrase) => norm.includes(phrase))) return true;
  return norm.includes("finding") && hasAnyKeyword(norm, FINDING_ACTIONS);
}

function documentForRequest(state: ApplicationState, request: string): FictionalDocument | null {
  const queryTokens = new Set(tokenize(request));
  if (queryTokens.size === 0) return null;

  let bestDoc: FictionalDocument | null = null;
  let bestScore = 0;

  for (const doc of state.records) {
    let score = 0;
    const docIdTokens = tokenize(doc.id);
    const searchTokens = doc.searchTerms.flatMap(tokenize);
    const titleTokens = tokenize(doc.title);

    const normalizedId = doc.id.toLowerCase();
    const collapsedId = normalizedId.replace(/-/g, "");
    if (queryTokens.has(normalizedId) || queryTokens.has(collapsedId)) {
      score += 50;
    }

    for (const qToken of queryTokens) {
      if (docIdTokens.includes(qToken)) score += 20;
      if (searchTokens.includes(qToken)) score += 10;
      if (titleTokens.includes(qToken)) score += 5;
    }

    if (score > bestScore) {
      bestScore = score;
      bestDoc = doc;
    }
  }

  return bestScore >= 10 ? bestDoc : null;
}

function availableRecordHints(records: readonly FictionalDocument[], level: number): string {
  const available = records
    .filter((doc) => doc.access !== "restricted" && (doc.availableFromLevel ?? 1) <= level)
    .map((doc) => doc.id);
  return available.length > 0 ? ` Available records: ${available.join(", ")}.` : "";
}

function classifyPolicyRestriction(request: string): string | null {
  const norm = normalize(request);

  // 1. Software development / code generation / app creation
  if (
    /\b(create|build|write|develop|generate|make|deploy|scaffold|code)\b.*\b(app|application|web app|website|software|script|python|javascript|typescript|program|backend|frontend|api|microservice|database)\b/i.test(
      norm,
    ) ||
    /\b(write|create|generate|code)\b.*\b(code|script|function|component|module)\b/i.test(norm) ||
    /\b(create a web application|build a website|write python|write some code)\b/i.test(norm)
  ) {
    return (
      "I can't build or execute application code in this newsroom session—development tools are disabled here. " +
      "I can still discuss a proposed application or talk through its design with you."
    );
  }

  // 2. Package installation
  if (
    /\b(npm (i|install)|pip install|cargo add|pnpm add|gem install|brew install)\b/i.test(norm) ||
    /\b(install|download)\b.*\b(package|library|dependency|module)\b/i.test(norm)
  ) {
    return "Package installation is disabled on this workstation, so I can only use the preconfigured newsroom tools.";
  }

  // 3. Arbitrary shell / system command execution
  if (
    /\b(run (a )?(bash|shell|command)|execute (a )?(bash|shell|command)|run bash|run shell|sudo|chmod|chown|rm -rf)\b/i.test(
      norm,
    )
  ) {
    return "Shell tool execution isn't enabled in this session. You can run supported local commands directly in your Herdr shell pane instead.";
  }

  // 4. External network / web browsing / scraping
  if (
    /\b(browse (the )?web|search (the )?internet|google|curl |fetch http|download from|scrape)\b/i.test(
      norm,
    )
  ) {
    return "External internet access isn't available here—I can only search the cooperative archives, newsroom mail, and intake feeds.";
  }

  // 5. Arbitrary filesystem modification
  if (
    /\b(delete (all )?files?|remove (all )?files?|modify (system )?files?|write to (root|\/)|format (disk|drive))\b/i.test(
      norm,
    )
  ) {
    return "Direct filesystem modifications aren't permitted from this session—I only have access to approved newsroom records and intake queues.";
  }

  return null;
}

interface AgentContextUpdate {
  readonly lastReferencedMessageId?: string;
  readonly lastReferencedDocumentId?: string;
  readonly lastTopic?: AgentTopic;
}

function replyWithAgentLines(
  state: ApplicationState,
  paneId: string,
  agent: AgentSession,
  replyLines: readonly string[],
  fallbackPrompt: string,
  context: AgentContextUpdate = {},
): ApplicationTransition {
  const nextAgent: AgentSession = {
    ...addHistory(
      { ...agent, status: "ready", phase: "settled", lastTask: "completed" },
      "assistant",
      replyLines.join("\n"),
    ),
    ...context,
  };
  return {
    state: setAgent(state, paneId, nextAgent),
    effects: paneOutput(paneId, [
      "> " + (agent.history.at(-1)?.content ?? fallbackPrompt),
      ...replyLines,
    ]),
  };
}

function handlePolicyRestrictionRequest(
  state: ApplicationState,
  paneId: string,
  agent: AgentSession,
  explanation: string,
): ApplicationTransition {
  return replyWithAgentLines(state, paneId, agent, [explanation], "restricted request");
}

function isGeneralGuidanceRequest(request: string): boolean {
  const norm = normalize(request);
  return (
    /^(hello|hi|hey|help|what can you do|how can you help|where do we start|what next|options?|what should i do)(\?|!)?$/i.test(
      norm,
    ) || /\b(what can you do|how can you help|guide me|what are my options)\b/i.test(norm)
  );
}

function handleGeneralGuidanceRequest(
  state: ApplicationState,
  paneId: string,
  agent: AgentSession,
): ApplicationTransition {
  const guidance = [
    "I can help with today's desk work:",
    "  • Check your morning schedule or unread newsroom email",
    "  • Review June Adebayo's assignment on the vendor incident",
    "  • Look up cooperative source-handling procedures",
    "  • Search newsroom archives and incident records",
    "",
    "Where would you like to start?",
  ];
  return replyWithAgentLines(state, paneId, agent, guidance, "guidance");
}

function isOtherMessagesFollowUp(request: string): boolean {
  const norm = normalize(request);
  return (
    /\b(other (messages?|emails?)|any other|more (messages?|emails?)|what about the other|are there (any )?other)\b/i.test(
      norm,
    ) && /\b(email|mail|inbox|message)\b/i.test(norm)
  );
}

function handleOtherMessagesRequest(
  state: ApplicationState,
  paneId: string,
  agent: AgentSession,
): ApplicationTransition {
  const replyLines = [
    "[tool: newsroom_mail.list_inbox()]",
    "There are no other unread messages in your newsroom inbox.",
    "",
    "MSG-1112-01 from June Adebayo is the only pending priority item today. Your archived folders and newsroom distribution lists are current.",
  ];
  return replyWithAgentLines(state, paneId, agent, replyLines, "other messages", {
    lastReferencedMessageId: "MSG-1112-01",
    lastTopic: "inbox",
  });
}

const EMAIL_FOLLOWUP_PHRASES = new Set([
  "read it",
  "open it",
  "read message",
  "open email",
  "read the email",
]);

function isReadEmailFollowUp(request: string, agent: AgentSession): boolean {
  const norm = normalize(request);
  if (
    /\b(the email|the message|the unread message|june'?s? email|june'?s? message)\b/i.test(norm) ||
    /\bwhat did june (say|write|send)\b/i.test(norm) ||
    /\bwhat does (the email|the message|it) say\b/i.test(norm)
  ) {
    return true;
  }
  return agent.lastTopic === "inbox" && EMAIL_FOLLOWUP_PHRASES.has(norm);
}

const DOCUMENT_FOLLOWUP_PHRASES = new Set([
  "show me that document",
  "show that document",
  "open that document",
  "read that document",
  "pull up that document",
  "show the document",
  "open the document",
  "read the document",
  "pull up the document",
]);

const GENERIC_FOLLOWUP_PRONOUNS = new Set(["read it", "open it", "show it"]);

function isReadDocumentFollowUp(request: string, agent: AgentSession): boolean {
  const norm = normalize(request);
  if (DOCUMENT_FOLLOWUP_PHRASES.has(norm)) return true;
  if (!GENERIC_FOLLOWUP_PRONOUNS.has(norm)) return false;
  return (
    agent.lastTopic === "assignment" ||
    agent.lastTopic === "document" ||
    agent.lastReferencedDocumentId !== undefined
  );
}

function handleScheduleRequest(
  state: ApplicationState,
  paneId: string,
  agent: AgentSession,
): ApplicationTransition {
  const replyLines = [
    "[tool: newsroom_schedule.get_today()]",
    "Here is your newsroom schedule for today (November 12, 2026):",
    "",
    "  • 09:00 EST — Editorial morning check-in",
    "  • 09:30 EST — Priority lead triage with June Adebayo (Cooperative Desk)",
    "  • 14:00 EST — Wire monitoring & intake queue",
    "  • 17:00 EST — Daily publication deadline",
    "",
    "June Adebayo flagged an urgent confidential lead in your inbox regarding a vendor incident.",
  ];
  return replyWithAgentLines(state, paneId, agent, replyLines, "schedule", {
    lastReferencedMessageId: "MSG-1112-01",
    lastTopic: "schedule",
  });
}

function handleInboxRequest(
  state: ApplicationState,
  paneId: string,
  agent: AgentSession,
): ApplicationTransition {
  const replyLines = [
    "[tool: newsroom_mail.list_inbox()]",
    "You have 1 unread message in your newsroom inbox:",
    "",
    "  • [MSG-1112-01] From: June Adebayo <j.adebayo@cooperative.press>",
    "    Subject: Priority: Vendor security incident & protected source (08:42 EST)",
    "    Preview: We have an unverified report of a vendor incident. Review our source-handling rules before contact.",
    "",
    "June notes that an anxious source reached out regarding an oversight records incident, and asks that we review our source-handling rules (CPA-01A) before making contact.",
  ];
  return replyWithAgentLines(state, paneId, agent, replyLines, "inbox", {
    lastReferencedMessageId: "MSG-1112-01",
    lastTopic: "inbox",
  });
}

function handleScheduleAndInboxRequest(
  state: ApplicationState,
  paneId: string,
  agent: AgentSession,
): ApplicationTransition {
  const replyLines = [
    "[tool: newsroom_schedule.get_today()]",
    "[tool: newsroom_mail.list_inbox()]",
    "Here is what you have on your calendar and in your inbox today (November 12, 2026):",
    "",
    "Schedule:",
    "  • 09:00 EST — Editorial morning check-in",
    "  • 09:30 EST — Priority lead triage with June Adebayo (Cooperative Desk)",
    "  • 14:00 EST — Wire monitoring & intake queue",
    "  • 17:00 EST — Daily publication deadline",
    "",
    "Inbox (1 unread message):",
    "  • [MSG-1112-01] From: June Adebayo <j.adebayo@cooperative.press>",
    "    Subject: Priority: Vendor security incident & protected source (08:42 EST)",
    "    Preview: We have an unverified report of a vendor incident. Review our source-handling rules before contact.",
    "",
    "June flagged an urgent priority lead regarding a vendor incident, and asked that we review our source-handling procedures before making contact.",
  ];
  return replyWithAgentLines(state, paneId, agent, replyLines, "schedule and inbox", {
    lastReferencedMessageId: "MSG-1112-01",
    lastTopic: "inbox",
  });
}

function handleAssignmentBriefRequest(
  state: ApplicationState,
  paneId: string,
  agent: AgentSession,
): ApplicationTransition {
  const replyLines = [
    '[tool: newsroom_mail.get_message(id: "MSG-1112-01")]',
    "Here is June Adebayo's assignment message:",
    "",
    "From: June Adebayo <j.adebayo@cooperative.press>",
    "To: Investigative Desk (Stringer)",
    "Date: Nov 12, 2026, 08:42 EST",
    "Subject: Priority: Vendor security incident & protected source",
    "",
    "\"A confidential campus SOC analyst ('Quill') sent the Cooperative a partial SOC memo",
    "yesterday reporting a five-minute probe against a demonstration election-night reporting",
    "portal on Nov 9.",
    "",
    "I need a credentialed verifier to check whether the shared artifact holds up and whether",
    "it merits a signed Verifier Note—without exposing Quill's identity or overclaiming",
    "corroboration. Standard stringer rates apply.",
    "",
    "Before I route you the shared SOC copy:",
    "  1. Review our newsroom source-handling procedures (CPA-01A).",
    "  2. Confirm your acceptance of the assignment under those handling terms.",
    '  3. Keep your working notes in a separate tab so we maintain a clean audit trail."',
  ];
  return replyWithAgentLines(state, paneId, agent, replyLines, "assignment", {
    lastReferencedMessageId: "MSG-1112-01",
    lastReferencedDocumentId: "CPA-01A",
    lastTopic: "assignment",
  });
}

function handleAssignmentRequest(
  state: ApplicationState,
  paneId: string,
  agent: AgentSession,
): ApplicationTransition {
  const hasReadCpa = state.readReceipts.some((receipt) => receipt.documentId === "CPA-01A");
  if (!hasReadCpa) {
    const nextAgent = addHistory(
      { ...agent, lastTask: "blocked", phase: "failed" },
      "assistant",
      "Read CPA-01A before you accept June's assignment.",
    );
    const nextState = setAgent(state, paneId, { ...nextAgent, status: "ready", phase: "failed" });
    return {
      state: nextState,
      effects: paneOutput(paneId, [
        "> " + (agent.history.at(-1)?.content ?? "accept assignment"),
        "Claude: June's instructions require reviewing the source-handling procedures before accepting the assignment.",
        "Ask me about our 'source handling procedures' first.",
      ]),
    };
  }
  const replyLines = [
    '[tool: newsroom_mail.reply(to: "j.adebayo@cooperative.press", body: "Assignment accepted. Handling rules confirmed.")]',
    "Reply dispatched to June Adebayo.",
    "",
    "JUNE ADEBAYO // Cooperative editor",
    '"Acknowledged. Verify origin, preserve attribution, and do not claim more than the record supports."',
    '"Open a new research tab in Herdr to begin reviewing incoming records while keeping this desk log open."',
  ];
  const nextAgent = addHistory(
    { ...agent, lastTask: "completed", phase: "settled" },
    "assistant",
    replyLines.join("\n"),
  );
  const nextState = setAgent({ ...state, assignmentAcknowledged: true }, paneId, nextAgent);
  return {
    state: nextState,
    effects: [
      ...paneOutput(paneId, [
        "> " + (agent.history.at(-1)?.content ?? "accept assignment"),
        ...replyLines,
      ]),
      { kind: "assignment-acknowledged" },
    ],
  };
}

function handleIncidentOverviewRequest(
  state: ApplicationState,
  paneId: string,
  agent: AgentSession,
): ApplicationTransition {
  const replyLines = [
    "[tool: newsroom_incidents.get_summary()]",
    "Newsroom Incident Summary:",
    "  Incident ID: INC-1112-VENDOR",
    "  Status: Active investigation // Unverified lead",
    "  Subject: A source alleges a 5-minute telemetry misfire during a vendor maintenance test on November 9.",
    "  Source Status: Protected source (confidential). Detailed SOC records (UM-1109-88) will be transferred once the investigation tab is opened.",
    "",
    "June Adebayo is supervising this inquiry. Ensure CPA-01A rules are observed before direct source interaction.",
  ];
  return replyWithAgentLines(state, paneId, agent, replyLines, "incident overview", {
    lastTopic: "intake",
    lastReferencedDocumentId: "CPA-01A",
  });
}

function handleVn12FilingRequest(
  state: ApplicationState,
  paneId: string,
  agent: AgentSession,
  choice: "paraphrase" | "detail" | null,
): ApplicationTransition {
  if (!choice) {
    const nextAgent = addHistory(
      { ...agent, lastTask: null, phase: "waiting_for_input" },
      "assistant",
      "Specify source protection choice: paraphrase or detail.",
    );
    return {
      state: setAgent(state, paneId, nextAgent),
      effects: paneOutput(paneId, [
        "CLAUDE CODE // VN-12 FILING STAGING",
        "CHOICE 1 (Source Protection):",
        "  Option A: 'paraphrase' — Paraphrase witness account (Quill safe; thinner filing basis).",
        "  Option B: 'detail' — Include specific technical details from LT-47B log (stronger now; exposure risk follows).",
        "Type 'paraphrase' or 'detail' to commit Verifier Note VN-12 to the wire.",
      ]),
    };
  }

  const choiceLabel =
    choice === "paraphrase"
      ? "Paraphrase witness account (Source Quill protected)"
      : "Identifying technical detail (LT-47B log specifics included)";
  const ackDoc = state.records.find((r) => r.id === "SUB-ACK-12");
  const subReceipt = { documentId: "SUB-ACK-12", paneId };
  const readReceipts = state.readReceipts.some(
    (item) => item.documentId === "SUB-ACK-12" && item.paneId === paneId,
  )
    ? state.readReceipts
    : [...state.readReceipts, subReceipt];

  const wireOutput = [
    "SUBMITTING VERIFIER NOTE VN-12 TO EIAB INTAKE…",
    `CHOICE COMMITTED: ${choiceLabel}`,
    "--- WIRE ACKNOWLEDGEMENT FOLLOWS ---",
    ...(ackDoc?.body ?? [
      "SUBMISSION ACKNOWLEDGEMENT // SUB-ACK-12",
      "FILING: Verifier Note VN-12.",
      "STATUS: RECEIVED // PENDING INTAKE CYCLE REVIEW.",
    ]),
    "EIAB WIRE STATUS: 19:05 EST — Filing acknowledged. Retraction always receivable.",
  ];
  const nextAgent = addHistory(
    { ...agent, lastTask: "completed", phase: "settled" },
    "assistant",
    wireOutput.join("\n"),
  );
  return {
    state: setAgent({ ...state, readReceipts }, paneId, nextAgent),
    effects: [
      ...paneOutput(paneId, wireOutput),
      { kind: "document-read", documentId: "SUB-ACK-12" },
      { kind: "vn12-filed", choice },
    ],
  };
}

function handleFindingSubmissionRequest(
  state: ApplicationState,
  paneId: string,
  agent: AgentSession,
): ApplicationTransition {
  const findingOutput = [
    "COOPERATIVE PROVENANCE AUDIT // INTAKE BATCH 1114",
    "FINDING COMPILED FOR INTAKE QUEUE:",
    "  1. INT-RECEIPT-12: VN-12 docketed as R-2 under 'independent pending verification'.",
    "  2. INTAKE-BATCH-1114: Triage complete across entries 01–03.",
    "  3. COUNTING LINE: 3 of 3 required corroborating submissions committed.",
    "STATUS: Finding committed to newsroom record. Emergency package recommendation noted.",
  ];
  const nextAgent = addHistory(
    { ...agent, lastTask: "completed", phase: "settled" },
    "assistant",
    findingOutput.join("\n"),
  );
  return {
    state: setAgent(state, paneId, nextAgent),
    effects: [...paneOutput(paneId, findingOutput), { kind: "finding-submitted" }],
  };
}

function isExplicitSearchRequest(request: string): boolean {
  const norm = normalize(request);
  return /\b(search|find|look up|get|pull up|fetch|open|read|show|check|query|document|record|memo|transcript|report|receipt)\b/i.test(
    norm,
  );
}

function handleDocumentSearchRequest(
  state: ApplicationState,
  paneId: string,
  agent: AgentSession,
  request: string,
  level: number,
): ApplicationTransition {
  const document = documentForRequest(state, request);
  if (!document) {
    const isSearch = isExplicitSearchRequest(request);
    const replyMessage = isSearch
      ? `No matching record was found in the cooperative archive for "${request}".${availableRecordHints(state.records, level)}`
      : `I could not identify a record or newsroom task for "${request}". You can ask about your schedule, email, June's assignment, or search cooperative records.${availableRecordHints(state.records, level)}`;

    const nextAgent: AgentSession = {
      ...addHistory(
        { ...agent, lastTask: "unrecognized", phase: "waiting_for_input" },
        "assistant",
        replyMessage,
      ),
      lastTopic: agent.lastTopic,
      lastReferencedDocumentId: agent.lastReferencedDocumentId,
      lastReferencedMessageId: agent.lastReferencedMessageId,
    };
    const nextState = setAgent(state, paneId, {
      ...nextAgent,
      status: "ready",
      phase: "waiting_for_input",
    });
    return {
      state: nextState,
      effects: paneOutput(paneId, [
        "> " + (agent.history.at(-1)?.content ?? request),
        replyMessage,
      ]),
    };
  }

  const query = document.id;
  const search =
    (document.availableFromLevel ?? 1) > level
      ? ({ ok: false, error: "not_found" } as const)
      : searchDocuments(state.records, query);
  let updatedAgent = addHistory(agent, "tool", `documents.search ${JSON.stringify({ query })}`);
  const lines = [
    "Searching the cooperative document index…",
    `MCP CALL documents.search(${JSON.stringify({ query })})`,
  ];
  if (!search.ok) {
    const errorMsg = `Record "${document.id}" is not available in the current investigative phase.`;
    lines.push(`MCP RESULT documents.search error: ${search.error}`);
    updatedAgent = addHistory(
      { ...updatedAgent, status: "blocked", phase: "failed", lastTask: "blocked" },
      "assistant",
      errorMsg,
    );
    return { state: setAgent(state, paneId, updatedAgent), effects: paneOutput(paneId, lines) };
  }

  lines.push(`MCP RESULT documents.search: ${document.id} — ${document.title}`);
  updatedAgent = addHistory(
    updatedAgent,
    "tool",
    `documents.search result ${JSON.stringify(search.matches)}`,
  );
  const read = readDocument(state.records, document.id);
  updatedAgent = addHistory(
    updatedAgent,
    "tool",
    `documents.read ${JSON.stringify({ id: document.id })}`,
  );
  lines.push(`MCP CALL documents.read(${JSON.stringify({ id: document.id })})`);
  if (!read.ok) {
    lines.push(`MCP RESULT documents.read error: ${read.error}`);
    updatedAgent = addHistory(
      { ...updatedAgent, status: "blocked", phase: "failed", lastTask: "blocked" },
      "assistant",
      read.error,
    );
    return { state: setAgent(state, paneId, updatedAgent), effects: paneOutput(paneId, lines) };
  }

  const receipt = { documentId: read.document.id, paneId };
  const readReceipts = state.readReceipts.some(
    (item) => item.documentId === receipt.documentId && item.paneId === paneId,
  )
    ? state.readReceipts
    : [...state.readReceipts, receipt];
  lines.push("MCP RESULT documents.read: original document follows", ...read.document.body);
  if (read.document.id === "CPA-01A") {
    lines.push(
      "CLAUDE FINDING: This memo gives handling rules. It does not corroborate the incident.",
    );
  }
  updatedAgent = addHistory(
    updatedAgent,
    "tool",
    `documents.read result ${JSON.stringify({ id: read.document.id, lines: read.document.body.length })}`,
  );
  updatedAgent = {
    ...addHistory(
      { ...updatedAgent, status: "ready", phase: "settled", lastTask: "completed" },
      "assistant",
      lines.join("\n"),
    ),
    lastReferencedDocumentId: read.document.id,
    lastTopic: "document",
  };
  return {
    state: setAgent({ ...state, readReceipts }, paneId, updatedAgent),
    effects: [
      ...paneOutput(paneId, lines),
      { kind: "document-read", documentId: read.document.id },
    ],
  };
}

function routeFollowUpAndPolicy(
  state: ApplicationState,
  paneId: string,
  agent: AgentSession,
  request: string,
  level: number,
): ApplicationTransition | null {
  const policyExplanation = classifyPolicyRestriction(request);
  if (policyExplanation) {
    return handlePolicyRestrictionRequest(state, paneId, agent, policyExplanation);
  }
  if (isGeneralGuidanceRequest(request)) {
    return handleGeneralGuidanceRequest(state, paneId, agent);
  }
  if (isOtherMessagesFollowUp(request)) {
    return handleOtherMessagesRequest(state, paneId, agent);
  }
  if (isReadEmailFollowUp(request, agent)) {
    return handleAssignmentBriefRequest(state, paneId, agent);
  }
  if (isReadDocumentFollowUp(request, agent)) {
    const docId = agent.lastReferencedDocumentId ?? "CPA-01A";
    return handleDocumentSearchRequest(state, paneId, agent, docId, level);
  }
  return null;
}

function isContactOrNextStepIntent(request: string): boolean {
  const norm = normalize(request);
  if (
    /\b(memo|document|transcript|cpa-01a|um-1109|lt-47b|receipt|report|procedures?|rules?)\b/i.test(
      norm,
    )
  ) {
    return false;
  }
  return (
    /\bwho\b.*\b(contact|reach out|talk to|reply to|email|message|is the source|source)\b/i.test(
      norm,
    ) ||
    /\b(what('?s| is| should i do)?\s+next|what do i do (now|next)|where do we go from here)\b/i.test(
      norm,
    )
  );
}

function contactReplyLines(
  state: ApplicationState,
  agent: AgentSession,
  level: number,
  hasReadCpa: boolean,
): readonly string[] {
  if (level >= 3) {
    return [
      "June Adebayo (j.adebayo@cooperative.press) is your editor of record for filings and escalations.",
      "For witness material, confirm off-record consent terms before relying on Theo Park's transcript or drafting VN-12.",
    ];
  }
  if (state.assignmentAcknowledged) {
    return [
      "You've already confirmed the assignment with June Adebayo.",
      "Next, keep this desk log open, open a new research tab in Herdr (Ctrl+B, then C), and pull up the shared SOC report before contacting any source or witness.",
    ];
  }
  const hasReadBrief = agent.history.some((h) => h.content.includes("newsroom_mail.get_message"));
  const briefSummary =
    "In her email, June explains that a confidential campus SOC analyst ('Quill') sent a partial SOC memo about a Nov 9 five-minute probe on a demo election-night reporting portal. She's asking if you'll verify whether the shared artifact holds up (standard stringer rates) without exposing Quill.";
  if (hasReadCpa) {
    return hasReadBrief
      ? [
          "Reply to June Adebayo (j.adebayo@cooperative.press) first—do not contact the protected source ('Quill') directly.",
          "Now that you've reviewed CPA-01A, tell me if you want to accept the assignment and I'll send your confirmation to June so she can route the shared SOC copy.",
        ]
      : [
          '[tool: newsroom_mail.get_message(id: "MSG-1112-01")]',
          "Your contact is June Adebayo (j.adebayo@cooperative.press), not the source directly.",
          "",
          briefSummary,
          "",
          "Since you've already reviewed CPA-01A, let me know if you want to accept the assignment and I'll reply to June so she can send over the shared SOC copy.",
        ];
  }
  return [
    ...(hasReadBrief ? [] : ['[tool: newsroom_mail.get_message(id: "MSG-1112-01")]']),
    "Your contact is June Adebayo (j.adebayo@cooperative.press)—the source ('Quill') is confidential and routed through the Cooperative.",
    "",
    briefSummary,
    "",
    "Before she sends the shared SOC copy, review our source-handling procedures (CPA-01A), then let me know if you want to take the assignment.",
  ];
}

function handleContactOrNextStepRequest(
  state: ApplicationState,
  paneId: string,
  agent: AgentSession,
  level: number,
): ApplicationTransition {
  const hasReadCpa = state.readReceipts.some((r) => r.documentId === "CPA-01A");
  const replyLines = contactReplyLines(state, agent, level, hasReadCpa);
  return replyWithAgentLines(state, paneId, agent, replyLines, "next step", {
    lastReferencedMessageId: "MSG-1112-01",
    lastReferencedDocumentId: "CPA-01A",
    lastTopic: "assignment",
  });
}

function routeScheduleOrInbox(
  state: ApplicationState,
  paneId: string,
  agent: AgentSession,
  request: string,
): ApplicationTransition | null {
  const wantsSchedule = isScheduleIntent(request);
  const wantsInbox = isInboxIntent(request);
  if (wantsSchedule && wantsInbox) return handleScheduleAndInboxRequest(state, paneId, agent);
  if (wantsSchedule) return handleScheduleRequest(state, paneId, agent);
  if (wantsInbox) return handleInboxRequest(state, paneId, agent);
  return null;
}

function routeNewsroomDeskRequest(
  state: ApplicationState,
  paneId: string,
  agent: AgentSession,
  request: string,
  level: number,
): ApplicationTransition | null {
  if (isAssignmentAcceptanceIntent(request)) {
    return handleAssignmentRequest(state, paneId, agent);
  }
  if (isAssignmentBriefIntent(request)) {
    return handleAssignmentBriefRequest(state, paneId, agent);
  }
  if (isContactOrNextStepIntent(request)) {
    return handleContactOrNextStepRequest(state, paneId, agent, level);
  }
  const scheduleOrInbox = routeScheduleOrInbox(state, paneId, agent, request);
  if (scheduleOrInbox) return scheduleOrInbox;
  if (isIncidentIntent(request) && level === 1) {
    return handleIncidentOverviewRequest(state, paneId, agent);
  }
  return null;
}

function routeLevelWorkflowRequest(
  state: ApplicationState,
  paneId: string,
  agent: AgentSession,
  request: string,
  level: number,
): ApplicationTransition | null {
  if (level === 4) {
    const vn12Intent = isVn12FilingIntent(request);
    if (vn12Intent.filing) {
      return handleVn12FilingRequest(state, paneId, agent, vn12Intent.choice);
    }
  }
  if (level === 5 && isFindingSubmissionIntent(request)) {
    return handleFindingSubmissionRequest(state, paneId, agent);
  }
  return null;
}

function runAgentRequest(
  state: ApplicationState,
  paneId: string,
  request: string,
  level: number,
): ApplicationTransition {
  let agent = state.agents[paneId];
  if (!agent) {
    return {
      state,
      effects: paneOutput(paneId, ["Claude Code is not running here. Type claude first."]),
    };
  }
  agent = addHistory(
    { ...agent, status: "ready", phase: "working", lastTask: null },
    "user",
    request,
  );
  const nextState = setAgent(state, paneId, agent);
  return (
    routeFollowUpAndPolicy(nextState, paneId, agent, request, level) ??
    routeNewsroomDeskRequest(nextState, paneId, agent, request, level) ??
    routeLevelWorkflowRequest(nextState, paneId, agent, request, level) ??
    handleDocumentSearchRequest(nextState, paneId, agent, request, level)
  );
}

function submitTerminal(state: ApplicationState): ApplicationTransition {
  const line = state.terminal.input;
  const cwd = state.terminal.cwd ?? DEFAULT_CWD;
  const prompt = `$ ${line}`;
  const res = executeShellCommand(line, cwd);

  if (res.launchHerdr) {
    return {
      state: {
        ...state,
        herdrLaunched: true,
        terminal: {
          input: "",
          output: [...state.terminal.output, prompt],
          cursor: 0,
          cwd,
        },
      },
      effects: [{ kind: "terminal-output", line: prompt }, { kind: "herdr-started" }],
    };
  }

  if (res.launchClaude) {
    const message = "Claude Code requires Herdr multiplexer. Type 'herdr' first.";
    return {
      state: {
        ...state,
        terminal: {
          input: "",
          output: [...state.terminal.output, prompt, message, "$ "],
          cursor: 0,
          cwd,
        },
      },
      effects: [
        { kind: "terminal-output", line: prompt },
        { kind: "terminal-output", line: message },
      ],
    };
  }

  if (res.clear) {
    return {
      state: {
        ...state,
        terminal: {
          input: "",
          output: ["$ "],
          cursor: 0,
          cwd: res.nextCwd,
        },
      },
      effects: [],
    };
  }

  const newOutput = [...state.terminal.output, prompt, ...res.lines, "$ "];
  return {
    state: {
      ...state,
      terminal: {
        input: "",
        output: newOutput,
        cursor: 0,
        cwd: res.nextCwd,
      },
    },
    effects: [
      { kind: "terminal-output", line: prompt },
      ...res.lines.map((l) => ({ kind: "terminal-output" as const, line: l })),
    ],
  };
}

const MANAGED_NOTICE_LINES = [
  "Cooperative Managed Environment · Newsroom research profile active.",
  "Approved tools: editorial mail, schedule, cooperative archives, and incident records.",
  "Code execution, package installs, arbitrary shell tools, and external network access are disabled.",
] as const;

function launchClaudeInPane(
  base: ApplicationState,
  paneId: string,
  echoed: string,
  nextCwd: string,
  nextCwds: Readonly<Record<string, string>>,
): ApplicationTransition {
  const showNotice = !base.managedNoticeShown;
  const newAgent: AgentSession = {
    status: "ready",
    phase: "waiting_for_input",
    history: showNotice ? [{ role: "assistant", content: MANAGED_NOTICE_LINES.join("\n") }] : [],
    lastTask: null,
  };
  return {
    state: {
      ...setAgent(base, paneId, newAgent),
      paneCwds: nextCwds,
      managedNoticeShown: true,
    },
    effects: [
      ...paneOutput(paneId, [
        echoed,
        "  █ █  █ █    Claude Code v2.0.24",
        " ██████████   Sonnet 4.5 · Newsroom License",
        " ██ █  █ ██   " + displayCwd(nextCwd),
        " ██████████",
        "  █      █",
        ...(showNotice ? ["", ...MANAGED_NOTICE_LINES] : []),
      ]),
      { kind: "claude-started", paneId },
    ],
  };
}

function submitShellPane(
  base: ApplicationState,
  paneId: string,
  line: string,
  cwd: string,
  echoed: string,
): ApplicationTransition {
  const res = executeShellCommand(line, cwd);
  const nextCwds = { ...(base.paneCwds ?? {}), [paneId]: res.nextCwd };
  if (res.launchClaude) {
    return launchClaudeInPane(base, paneId, echoed, res.nextCwd, nextCwds);
  }
  if (res.clear) {
    return {
      state: { ...base, paneCwds: nextCwds },
      effects: [{ kind: "pane-clear", paneId }],
    };
  }
  return {
    state: { ...base, paneCwds: nextCwds },
    effects: paneOutput(paneId, [echoed, ...res.lines]),
  };
}

function submitPane(state: ApplicationState, paneId: string, level: number): ApplicationTransition {
  const line = state.paneInputs[paneId] ?? "";
  const cwd = state.paneCwds?.[paneId] ?? DEFAULT_CWD;
  const echoed = `$ ${line}`;
  const base: ApplicationState = {
    ...state,
    paneInputs: { ...state.paneInputs, [paneId]: "" },
    paneCursors: { ...state.paneCursors, [paneId]: 0 },
  };

  if (!base.agents[paneId]) {
    return submitShellPane(base, paneId, line, cwd, echoed);
  }

  const trimmed = line.trim().toLowerCase();
  if (trimmed === "exit" || trimmed === "quit" || trimmed === "/exit") {
    const nextAgents = { ...base.agents };
    delete nextAgents[paneId];
    return {
      state: { ...base, agents: nextAgents },
      effects: [
        ...paneOutput(paneId, [`> ${line}`, "Exiting Claude Code. Returning to shell."]),
        { kind: "claude-exited", paneId },
      ],
    };
  }

  return runAgentRequest(base, paneId, line, level);
}

function ignoreInput(state: ApplicationState): ApplicationTransition {
  return { state, effects: [], ignored: true };
}

function insertAtCursor(
  text: string,
  cursor: number,
  insertion: string,
): { input: string; cursor: number } {
  const clamped = Math.max(0, Math.min(cursor, text.length));
  return {
    input: text.slice(0, clamped) + insertion + text.slice(clamped),
    cursor: clamped + insertion.length,
  };
}

function applyLineEdit(
  currentInput: string,
  rawCursor: number | undefined,
  input: ApplicationInput,
): { input: string; cursor: number } | null {
  if (input.kind !== "key") return null;
  const cursor = Math.max(0, Math.min(rawCursor ?? currentInput.length, currentInput.length));
  const rawKey = input.key;
  const commandKey = rawKey.toLowerCase();
  const control = input.modifiers?.length === 1 && input.modifiers[0] === "ctrl";
  const isCtrlA = control && commandKey === "a";
  const isCtrlE = control && commandKey === "e";
  const isCtrlW = control && commandKey === "w";
  const isCtrlU = control && (commandKey === "u" || commandKey === "c");
  const backspace = commandKey === "backspace";
  const forwardDelete = commandKey === "delete";
  const isLeft = commandKey === "arrowleft" || commandKey === "left";
  const isRight = commandKey === "arrowright" || commandKey === "right";
  const isHome = commandKey === "home";
  const isEnd = commandKey === "end";

  if (
    !isCtrlA &&
    !isCtrlE &&
    !isCtrlW &&
    !isCtrlU &&
    input.modifiers?.some((mod) => mod !== "shift")
  ) {
    return null;
  }

  if (isCtrlU) {
    return { input: "", cursor: 0 };
  }

  if (isCtrlA || isHome) {
    return { input: currentInput, cursor: 0 };
  }

  if (isCtrlE || isEnd) {
    return { input: currentInput, cursor: currentInput.length };
  }

  if (isCtrlW) {
    const before = currentInput.slice(0, cursor);
    const after = currentInput.slice(cursor);
    const trimmed = before.replace(/\s+$/, "");
    const lastSpace = trimmed.lastIndexOf(" ");
    const newBefore = lastSpace >= 0 ? trimmed.slice(0, lastSpace + 1) : "";
    return { input: newBefore + after, cursor: newBefore.length };
  }

  if (backspace) {
    if (cursor > 0) {
      return {
        input: currentInput.slice(0, cursor - 1) + currentInput.slice(cursor),
        cursor: cursor - 1,
      };
    }
    return { input: currentInput, cursor: 0 };
  }

  if (forwardDelete) {
    if (cursor < currentInput.length) {
      return {
        input: currentInput.slice(0, cursor) + currentInput.slice(cursor + 1),
        cursor,
      };
    }
    return { input: currentInput, cursor };
  }

  if (isLeft) {
    return { input: currentInput, cursor: Math.max(0, cursor - 1) };
  }

  if (isRight) {
    return { input: currentInput, cursor: Math.min(currentInput.length, cursor + 1) };
  }

  if (isHome) {
    return { input: currentInput, cursor: 0 };
  }

  if (isEnd) {
    return { input: currentInput, cursor: currentInput.length };
  }

  if (rawKey.length === 1 && /^[\x20-\x7e]$/.test(rawKey)) {
    return insertAtCursor(currentInput, cursor, rawKey);
  }

  return null;
}

export function stepApplication(
  state: ApplicationState,
  input: ApplicationInput,
  level = 1,
): ApplicationTransition {
  if (input.origin !== "player") return ignoreInput(state);

  if (input.kind === "paste") {
    const cleanText = input.text.replace(/[\r\n\x00-\x1f\x7f]/g, "");
    if (!cleanText) return ignoreInput(state);
    if (!state.herdrLaunched) {
      if (input.paneId) return ignoreInput(state);
      const next = insertAtCursor(
        state.terminal.input,
        state.terminal.cursor ?? state.terminal.input.length,
        cleanText,
      );
      return {
        state: {
          ...state,
          terminal: { ...state.terminal, input: next.input, cursor: next.cursor },
        },
        effects: [],
      };
    }
    if (!input.paneId) return ignoreInput(state);
    const paneId = input.paneId;
    const currentInput = state.paneInputs[paneId] ?? "";
    const currentCursor = state.paneCursors?.[paneId] ?? currentInput.length;
    const next = insertAtCursor(currentInput, currentCursor, cleanText);
    return {
      state: {
        ...state,
        paneInputs: {
          ...state.paneInputs,
          [paneId]: next.input,
        },
        paneCursors: {
          ...state.paneCursors,
          [paneId]: next.cursor,
        },
      },
      effects: [],
    };
  }

  const rawKey = input.key;
  const commandKey = rawKey.toLowerCase();
  const control = input.modifiers?.length === 1 && input.modifiers[0] === "ctrl";
  const clear = control && (commandKey === "u" || commandKey === "c");
  if (!clear && input.modifiers?.some((mod) => mod !== "shift")) {
    return ignoreInput(state);
  }
  if (!state.herdrLaunched) {
    if (input.paneId) return ignoreInput(state);
    if (commandKey === "enter") return submitTerminal(state);
    const next = applyLineEdit(state.terminal.input, state.terminal.cursor, input);
    if (!next) return ignoreInput(state);
    return {
      state: {
        ...state,
        terminal: { ...state.terminal, input: next.input, cursor: next.cursor },
      },
      effects: [],
    };
  }
  if (!input.paneId) return ignoreInput(state);
  const paneId = input.paneId;
  if (commandKey === "enter") return submitPane(state, paneId, level);
  const next = applyLineEdit(state.paneInputs[paneId] ?? "", state.paneCursors?.[paneId], input);
  if (!next) return ignoreInput(state);
  return {
    state: {
      ...state,
      paneInputs: {
        ...state.paneInputs,
        [paneId]: next.input,
      },
      paneCursors: {
        ...state.paneCursors,
        [paneId]: next.cursor,
      },
    },
    effects: [],
  };
}
