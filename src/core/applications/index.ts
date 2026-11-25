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

export interface AgentSession {
  readonly status: "ready" | "blocked";
  readonly phase?: ApplicationTaskPhase;
  readonly history: readonly AgentHistoryEntry[];
  readonly lastTask: "completed" | "blocked" | "unrecognized" | null;
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

function isAssignmentAcceptanceIntent(request: string): boolean {
  const norm = normalize(request);
  const tokens = norm.replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  const tokenSet = new Set(tokens);
  const hasAccept =
    tokenSet.has("accept") ||
    tokenSet.has("accepts") ||
    tokenSet.has("accepted") ||
    tokenSet.has("agree") ||
    tokenSet.has("agrees") ||
    tokenSet.has("confirm") ||
    tokenSet.has("confirmed");
  if (tokens.length === 1 && hasAccept) return true;
  if (norm.startsWith("i accept") || norm.startsWith("i agree") || norm.startsWith("we accept")) return true;
  if (hasAccept && (tokenSet.has("assignment") || tokenSet.has("terms") || tokenSet.has("task"))) return true;
  return false;
}

function isAssignmentBriefIntent(request: string): boolean {
  const norm = normalize(request);
  if (/\b(memo|document|transcript|cpa-01a|um-1109|lt-47b|receipt|report)\b/i.test(norm)) {
    return false;
  }
  return (
    /\b(assignment|what should i (do|investigate)|what is (the|my) (assignment|task|lead)|what did june|june'?s? assignment)\b/i.test(
      norm,
    ) && !isAssignmentAcceptanceIntent(request)
  );
}

function isScheduleIntent(request: string): boolean {
  const norm = normalize(request);
  return /\b(schedule|calendar|agenda|morning check-in|my day)\b/i.test(norm);
}

function isInboxIntent(request: string): boolean {
  const norm = normalize(request);
  if (/\b(memo|document|transcript|cpa-01a|um-1109|lt-47b|receipt|report)\b/i.test(norm)) {
    return false;
  }
  return /\b(email|mail|inbox|messages?|unread)\b/i.test(norm);
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

function handleScheduleRequest(
  state: ApplicationState,
  paneId: string,
  agent: AgentSession,
): ApplicationTransition {
  const replyLines = [
    "[tool: newsroom_schedule.get_today()]",
    "Date: November 12, 2026",
    "  09:00 EST — Editorial morning check-in",
    "  09:30 EST — Priority lead triage with June Adebayo (Cooperative Desk)",
    "  14:00 EST — Wire monitoring & intake queue",
    "  17:00 EST — Daily publication deadline",
    "Note: June Adebayo flagged an urgent confidential lead. Check newsroom email or ask about your assignment.",
  ];
  const nextAgent = addHistory(
    { ...agent, status: "ready", phase: "settled", lastTask: "completed" },
    "assistant",
    replyLines.join("\n"),
  );
  return {
    state: setAgent(state, paneId, nextAgent),
    effects: paneOutput(paneId, [
      "> " + (agent.history.at(-1)?.content ?? "schedule"),
      ...replyLines,
    ]),
  };
}

function handleInboxRequest(
  state: ApplicationState,
  paneId: string,
  agent: AgentSession,
): ApplicationTransition {
  const replyLines = [
    "[tool: newsroom_mail.list_inbox()]",
    "Inbox (1 unread message):",
    "  [MSG-1112-01] From: June Adebayo <j.adebayo@cooperative.press>",
    "  Subject: Priority: Vendor security incident & protected source (08:42 EST)",
    "  Preview: We have an unverified report of a vendor incident. Review our source-handling rules before contact.",
    "Ask me to read the message or ask: 'What did June assign me?'",
  ];
  const nextAgent = addHistory(
    { ...agent, status: "ready", phase: "settled", lastTask: "completed" },
    "assistant",
    replyLines.join("\n"),
  );
  return {
    state: setAgent(state, paneId, nextAgent),
    effects: paneOutput(paneId, [
      "> " + (agent.history.at(-1)?.content ?? "inbox"),
      ...replyLines,
    ]),
  };
}

function handleAssignmentBriefRequest(
  state: ApplicationState,
  paneId: string,
  agent: AgentSession,
): ApplicationTransition {
  const replyLines = [
    "[tool: newsroom_mail.get_message(id: \"MSG-1112-01\")]",
    "From: June Adebayo <j.adebayo@cooperative.press>",
    "To: Investigative Desk",
    "Date: Nov 12, 2026, 08:42 EST",
    "Subject: Priority: Vendor security incident & protected source",
    "",
    "We have an unverified report of a vendor incident affecting State oversight records.",
    "The source is anxious and requested strict confidentiality.",
    "",
    "Before you contact the source or open external lines:",
    "  1. Review our newsroom source-handling procedures (CPA-01A).",
    "  2. Confirm your acceptance of the handling terms.",
    "  3. Keep your working notes in a separate tab so we maintain a clean audit trail.",
    "",
    "Ask me: 'What are our source handling procedures?' to retrieve CPA-01A.",
  ];
  const nextAgent = addHistory(
    { ...agent, status: "ready", phase: "settled", lastTask: "completed" },
    "assistant",
    replyLines.join("\n"),
  );
  return {
    state: setAgent(state, paneId, nextAgent),
    effects: paneOutput(paneId, [
      "> " + (agent.history.at(-1)?.content ?? "assignment"),
      ...replyLines,
    ]),
  };
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
  const nextAgent = addHistory(
    { ...agent, lastTask: "completed", phase: "settled" },
    "assistant",
    "June Adebayo acknowledges the assignment.",
  );
  const nextState = setAgent({ ...state, assignmentAcknowledged: true }, paneId, nextAgent);
  return {
    state: nextState,
    effects: [
      ...paneOutput(paneId, [
        "> " + (agent.history.at(-1)?.content ?? "accept assignment"),
        "[tool: newsroom_mail.reply(to: \"j.adebayo@cooperative.press\", body: \"Assignment accepted. Handling rules confirmed.\")]",
        "Reply dispatched to June Adebayo.",
        "",
        "JUNE ADEBAYO // Cooperative editor",
        "\"Acknowledged. Verify origin, preserve attribution, and do not claim more than the record supports.\"",
        "\"Open a new research tab in Herdr to begin reviewing incoming records while keeping this desk log open.\"",
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
  const nextAgent = addHistory(
    { ...agent, status: "ready", phase: "settled", lastTask: "completed" },
    "assistant",
    "Provided incident background.",
  );
  return {
    state: setAgent(state, paneId, nextAgent),
    effects: paneOutput(paneId, [
      "> " + (agent.history.at(-1)?.content ?? "incident"),
      "[tool: editorial_records.search(query: \"vendor incident\")]",
      "Incident Overview:",
      "  A source alleges a 5-minute telemetry misfire during a vendor maintenance test on November 9.",
      "  Detailed SOC records (UM-1109-88) will be transferred once the investigation tab is opened.",
    ]),
  };
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

  const nextAgent = addHistory(
    { ...agent, lastTask: "completed", phase: "settled" },
    "assistant",
    `Filed VN-12 with ${choice}. Received SUB-ACK-12.`,
  );
  return {
    state: setAgent({ ...state, readReceipts }, paneId, nextAgent),
    effects: [
      ...paneOutput(paneId, [
        "SUBMITTING VERIFIER NOTE VN-12 TO EIAB INTAKE…",
        `CHOICE COMMITTED: ${choiceLabel}`,
        "--- WIRE ACKNOWLEDGEMENT FOLLOWS ---",
        ...(ackDoc?.body ?? [
          "SUBMISSION ACKNOWLEDGEMENT // SUB-ACK-12",
          "FILING: Verifier Note VN-12.",
          "STATUS: RECEIVED // PENDING INTAKE CYCLE REVIEW.",
        ]),
        "EIAB WIRE STATUS: 19:05 EST — Filing acknowledged. Retraction always receivable.",
      ]),
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
  const nextAgent = addHistory(
    { ...agent, lastTask: "completed", phase: "settled" },
    "assistant",
    "Compiled finding on fresh intake set.",
  );
  return {
    state: setAgent(state, paneId, nextAgent),
    effects: [
      ...paneOutput(paneId, [
        "COOPERATIVE PROVENANCE AUDIT // INTAKE BATCH 1114",
        "FINDING COMPILED FOR INTAKE QUEUE:",
        "  1. INT-RECEIPT-12: VN-12 docketed as R-2 under 'independent pending verification'.",
        "  2. INTAKE-BATCH-1114: Triage complete across entries 01–03.",
        "  3. COUNTING LINE: 3 of 3 required corroborating submissions committed.",
        "STATUS: Finding committed to newsroom record. Emergency package recommendation noted.",
      ]),
      { kind: "finding-submitted" },
    ],
  };
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
    const nextAgent = addHistory(
      { ...agent, lastTask: "unrecognized", phase: "waiting_for_input" },
      "assistant",
      "Name a record or an investigative question.",
    );
    const nextState = setAgent(state, paneId, {
      ...nextAgent,
      status: "ready",
      phase: "waiting_for_input",
    });
    return {
      state: nextState,
      effects: paneOutput(paneId, [
        `I could not identify a record. Name a document or record ID.${availableRecordHints(state.records, level)}`,
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
    lines.push(`MCP RESULT documents.search error: ${search.error}`);
    updatedAgent = addHistory(
      { ...updatedAgent, status: "blocked", phase: "failed", lastTask: "blocked" },
      "assistant",
      search.error,
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
  updatedAgent = addHistory(
    { ...updatedAgent, status: "ready", phase: "settled", lastTask: "completed" },
    "assistant",
    `Read ${read.document.id}; original text returned.`,
  );
  return {
    state: setAgent({ ...state, readReceipts }, paneId, updatedAgent),
    effects: [
      ...paneOutput(paneId, lines),
      { kind: "document-read", documentId: read.document.id },
    ],
  };
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

  if (isScheduleIntent(request)) {
    return handleScheduleRequest(nextState, paneId, agent);
  }

  if (isInboxIntent(request)) {
    return handleInboxRequest(nextState, paneId, agent);
  }

  if (isAssignmentBriefIntent(request)) {
    return handleAssignmentBriefRequest(nextState, paneId, agent);
  }

  if (isAssignmentAcceptanceIntent(request)) {
    return handleAssignmentRequest(nextState, paneId, agent);
  }

  if (isIncidentIntent(request) && level === 1) {
    return handleIncidentOverviewRequest(nextState, paneId, agent);
  }

  if (level === 4) {
    const vn12Intent = isVn12FilingIntent(request);
    if (vn12Intent.filing) {
      return handleVn12FilingRequest(nextState, paneId, agent, vn12Intent.choice);
    }
  }

  if (level === 5 && isFindingSubmissionIntent(request)) {
    return handleFindingSubmissionRequest(nextState, paneId, agent);
  }

  return handleDocumentSearchRequest(nextState, paneId, agent, request, level);
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

function submitPane(state: ApplicationState, paneId: string, level: number): ApplicationTransition {
  const line = state.paneInputs[paneId] ?? "";
  const cwd = state.paneCwds?.[paneId] ?? DEFAULT_CWD;
  const echoed = `$ ${line}`;
  const base: ApplicationState = {
    ...state,
    paneInputs: { ...state.paneInputs, [paneId]: "" },
    paneCursors: { ...state.paneCursors, [paneId]: 0 },
  };

  const agent = base.agents[paneId];
  if (!agent) {
    const res = executeShellCommand(line, cwd);
    const nextCwds = { ...(base.paneCwds ?? {}), [paneId]: res.nextCwd };

    if (res.launchClaude) {
      const newAgent: AgentSession = {
        status: "ready",
        phase: "waiting_for_input",
        history: [],
        lastTask: null,
      };
      return {
        state: { ...setAgent(base, paneId, newAgent), paneCwds: nextCwds },
        effects: [
          ...paneOutput(paneId, [
            echoed,
            "  █ █  █ █    Claude Code v2.0.24",
            " ██████████   Sonnet 4.5 · Newsroom License",
            " ██ █  █ ██   " + displayCwd(res.nextCwd),
            " ██████████",
            "  █      █",
            "",
          ]),
          { kind: "claude-started", paneId },
        ],
      };
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

  const trimmed = line.trim().toLowerCase();
  if (trimmed === "exit" || trimmed === "quit" || trimmed === "/exit") {
    const nextAgents = { ...base.agents };
    delete nextAgents[paneId];
    return {
      state: { ...base, agents: nextAgents },
      effects: [
        ...paneOutput(paneId, [
          `> ${line}`,
          "Exiting Claude Code. Returning to shell.",
        ]),
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

  if (!isCtrlA && !isCtrlE && !isCtrlW && !isCtrlU && input.modifiers?.some((mod) => mod !== "shift")) {
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
