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

export interface ApplicationState {
  readonly herdrLaunched: boolean;
  readonly terminal: {
    readonly input: string;
    readonly output: readonly string[];
    readonly cursor?: number;
  };
  readonly paneInputs: Readonly<Record<string, string>>;
  readonly paneCursors?: Readonly<Record<string, number>>;
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
  | { readonly kind: "claude-started"; readonly paneId: string }
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
    searchTerms: ["memo", "source", "handling", "cpa-01a", "quill", "assignment"],
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

export function createApplicationState(): ApplicationState {
  return {
    herdrLaunched: false,
    terminal: { input: "", output: ["$ "], cursor: 0 },
    paneInputs: {},
    paneCursors: {},
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

function isAssignmentIntent(request: string): boolean {
  const clean = normalize(request).replace(/[^a-z0-9 ]/g, " ");
  const tokens = clean.split(/\s+/).filter(Boolean);
  const tokenSet = new Set(tokens);
  const hasAccept =
    tokenSet.has("accept") ||
    tokenSet.has("accepts") ||
    tokenSet.has("accepted") ||
    tokenSet.has("agree") ||
    tokenSet.has("agrees");
  const hasAssignment =
    tokenSet.has("assignment") ||
    tokenSet.has("brief") ||
    tokenSet.has("task") ||
    tokenSet.has("mandate") ||
    tokenSet.has("directive");
  if (hasAccept && hasAssignment) return true;
  if (clean === "accept assignment" || clean.startsWith("accept the assignment")) return true;
  if (clean.startsWith("i accept") || clean.startsWith("i agree")) return true;
  return false;
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
  let nextState = setAgent(state, paneId, agent);

  if (isAssignmentIntent(request)) {
    if (
      !state.readReceipts.some(
        (receipt) => receipt.documentId === "CPA-01A" && receipt.paneId === paneId,
      )
    ) {
      agent = addHistory(
        { ...agent, lastTask: "blocked", phase: "failed" },
        "assistant",
        "Read CPA-01A before you accept June's assignment.",
      );
      nextState = setAgent(nextState, paneId, { ...agent, status: "ready", phase: "failed" });
      return {
        state: nextState,
        effects: paneOutput(paneId, ["June's assignment stays on hold until CPA-01A is read."]),
      };
    }
    agent = addHistory(
      { ...agent, lastTask: "completed", phase: "settled" },
      "assistant",
      "June Adebayo acknowledges the assignment.",
    );
    nextState = setAgent({ ...nextState, assignmentAcknowledged: true }, paneId, agent);
    return {
      state: nextState,
      effects: [
        ...paneOutput(paneId, [
          "JUNE ADEBAYO // Cooperative editor",
          "Acknowledged. Verify origin, preserve attribution, and do not claim more than the record supports.",
        ]),
        { kind: "assignment-acknowledged" },
      ],
    };
  }

  if (level === 4) {
    const vn12Intent = isVn12FilingIntent(request);
    if (vn12Intent.filing) {
      if (!vn12Intent.choice) {
        agent = addHistory(
          { ...agent, lastTask: null, phase: "waiting_for_input" },
          "assistant",
          "Specify source protection choice: paraphrase or detail.",
        );
        nextState = setAgent(nextState, paneId, agent);
        return {
          state: nextState,
          effects: paneOutput(paneId, [
            "CLAUDE CODE // VN-12 FILING STAGING",
            "CHOICE 1 (Source Protection):",
            "  Option A: 'paraphrase' — Paraphrase witness account (Quill safe; thinner filing basis).",
            "  Option B: 'detail' — Include specific technical details from LT-47B log (stronger now; exposure risk follows).",
            "Type 'paraphrase' or 'detail' to commit Verifier Note VN-12 to the wire.",
          ]),
        };
      }

      const choice = vn12Intent.choice;
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

      agent = addHistory(
        { ...agent, lastTask: "completed", phase: "settled" },
        "assistant",
        `Filed VN-12 with ${choice}. Received SUB-ACK-12.`,
      );
      nextState = setAgent({ ...nextState, readReceipts }, paneId, agent);
      return {
        state: nextState,
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
  }

  if (level === 5 && isFindingSubmissionIntent(request)) {
    agent = addHistory(
      { ...agent, lastTask: "completed", phase: "settled" },
      "assistant",
      "Compiled finding on fresh intake set.",
    );
    nextState = setAgent(nextState, paneId, agent);
    return {
      state: nextState,
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

  const document = documentForRequest(state, request);
  if (!document) {
    agent = addHistory(
      { ...agent, lastTask: "unrecognized", phase: "waiting_for_input" },
      "assistant",
      "Name a record or an investigative question.",
    );
    nextState = setAgent(nextState, paneId, {
      ...agent,
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
  agent = addHistory(agent, "tool", `documents.search ${JSON.stringify({ query })}`);
  const lines = [
    "Searching the cooperative document index…",
    `MCP CALL documents.search(${JSON.stringify({ query })})`,
  ];
  if (!search.ok) {
    lines.push(`MCP RESULT documents.search error: ${search.error}`);
    agent = addHistory(
      { ...agent, status: "blocked", phase: "failed", lastTask: "blocked" },
      "assistant",
      search.error,
    );
    return { state: setAgent(nextState, paneId, agent), effects: paneOutput(paneId, lines) };
  }

  lines.push(`MCP RESULT documents.search: ${document.id} — ${document.title}`);
  agent = addHistory(agent, "tool", `documents.search result ${JSON.stringify(search.matches)}`);
  const read = readDocument(state.records, document.id);
  agent = addHistory(agent, "tool", `documents.read ${JSON.stringify({ id: document.id })}`);
  lines.push(`MCP CALL documents.read(${JSON.stringify({ id: document.id })})`);
  if (!read.ok) {
    lines.push(`MCP RESULT documents.read error: ${read.error}`);
    agent = addHistory(
      { ...agent, status: "blocked", phase: "failed", lastTask: "blocked" },
      "assistant",
      read.error,
    );
    return { state: setAgent(nextState, paneId, agent), effects: paneOutput(paneId, lines) };
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
  agent = addHistory(
    agent,
    "tool",
    `documents.read result ${JSON.stringify({ id: read.document.id, lines: read.document.body.length })}`,
  );
  agent = addHistory(
    { ...agent, status: "ready", phase: "settled", lastTask: "completed" },
    "assistant",
    `Read ${read.document.id}; original text returned.`,
  );
  return {
    state: setAgent({ ...nextState, readReceipts }, paneId, agent),
    effects: [
      ...paneOutput(paneId, lines),
      { kind: "document-read", documentId: read.document.id },
    ],
  };
}

function submitTerminal(state: ApplicationState): ApplicationTransition {
  const command = state.terminal.input.trim();
  const printed = `$ ${command}`;
  if (command.toLowerCase() === "herdr") {
    return {
      state: {
        ...state,
        herdrLaunched: true,
        terminal: { input: "", output: [...state.terminal.output, printed], cursor: 0 },
      },
      effects: [{ kind: "terminal-output", line: printed }, { kind: "herdr-started" }],
    };
  }
  const message = command ? `command not found: ${command}.` : "";
  return {
    state: {
      ...state,
      terminal: {
        input: "",
        output: [...state.terminal.output, printed, ...(message ? [message] : []), "$ "],
        cursor: 0,
      },
    },
    effects: [
      { kind: "terminal-output", line: printed },
      ...(message ? [{ kind: "terminal-output" as const, line: message }] : []),
    ],
  };
}

function submitPane(state: ApplicationState, paneId: string, level: number): ApplicationTransition {
  const line = state.paneInputs[paneId] ?? "";
  const echoed = `$ ${line}`;
  const base = {
    ...state,
    paneInputs: { ...state.paneInputs, [paneId]: "" },
    paneCursors: { ...state.paneCursors, [paneId]: 0 },
  };
  if (line.trim() === "claude" && !base.agents[paneId]) {
    const agent: AgentSession = {
      status: "ready",
      phase: "waiting_for_input",
      history: [],
      lastTask: null,
    };
    return {
      state: setAgent(base, paneId, agent),
      effects: [
        ...paneOutput(paneId, [
          echoed,
          "Claude Code v1.0.12 (simulated)",
          "Ready. What should I investigate?",
        ]),
        { kind: "claude-started", paneId },
      ],
    };
  }
  if (line.trim() === "claude" && base.agents[paneId]) {
    return {
      state: base,
      effects: paneOutput(paneId, [echoed, "Claude Code is already running in this pane."]),
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
  const clear = control && (commandKey === "u" || commandKey === "c");
  const backspace = commandKey === "backspace";
  const forwardDelete = commandKey === "delete";
  const isLeft = commandKey === "arrowleft" || commandKey === "left";
  const isRight = commandKey === "arrowright" || commandKey === "right";
  const isHome = commandKey === "home";
  const isEnd = commandKey === "end";

  if (!clear && input.modifiers?.some((mod) => mod !== "shift")) {
    return null;
  }

  if (clear) {
    return { input: "", cursor: 0 };
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
