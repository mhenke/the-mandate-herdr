// Pure screen model for simulated Claude Code and terminal sessions (ADR 0007).
// Pure data: zero React, zero DOM imports, zero host dependencies.

export type SpanStyle =
  | "plain"
  | "bold"
  | "dim"
  | "coral"
  | "userBlock"
  | "bullet"
  | "cursor"
  | "rule"
  | "footer";

export interface ScreenSpan {
  readonly text: string;
  readonly style: SpanStyle;
}

export interface ScreenLine {
  readonly spans: readonly ScreenSpan[];
  readonly kind?: "banner" | "user" | "reply" | "rule" | "input" | "footer" | "blank" | "plain";
}

export interface TerminalScreenModel {
  readonly lines: readonly ScreenLine[];
}

export const CLAUDE_MASCOT_ROWS = [
  "  █ █  █ █    ",
  " ██████████   ",
  " ██ █  █ ██   ",
  " ██████████   ",
  "  █      █    ",
] as const;

export function buildClaudeBanner(cwd: string): readonly ScreenLine[] {
  return [
    {
      kind: "banner",
      spans: [
        { text: CLAUDE_MASCOT_ROWS[0], style: "coral" },
        { text: "Claude Code", style: "bold" },
        { text: " v2.0.24", style: "dim" },
      ],
    },
    {
      kind: "banner",
      spans: [
        { text: CLAUDE_MASCOT_ROWS[1], style: "coral" },
        { text: "Sonnet 4.5 · Newsroom License", style: "dim" },
      ],
    },
    {
      kind: "banner",
      spans: [
        { text: CLAUDE_MASCOT_ROWS[2], style: "coral" },
        { text: cwd, style: "dim" },
      ],
    },
    {
      kind: "banner",
      spans: [{ text: CLAUDE_MASCOT_ROWS[3], style: "coral" }],
    },
    {
      kind: "banner",
      spans: [{ text: CLAUDE_MASCOT_ROWS[4], style: "coral" }],
    },
    {
      kind: "blank",
      spans: [{ text: "", style: "plain" }],
    },
  ];
}

export interface ClaudeScreenInput {
  readonly history: readonly { readonly role: "user" | "assistant" | "tool"; readonly content: string }[];
  readonly cwd: string;
  readonly inputBuffer: string;
  readonly inputCursor: number;
  readonly phase?: string;
  readonly isFocused?: boolean;
}

export function buildClaudeScreenModel(input: ClaudeScreenInput): TerminalScreenModel {
  const lines: ScreenLine[] = [];
  lines.push(...buildClaudeBanner(input.cwd));

  for (const entry of input.history) {
    if (entry.role === "user") {
      lines.push({
        kind: "user",
        spans: [{ text: `> ${entry.content}`, style: "userBlock" }],
      });
      lines.push({ kind: "blank", spans: [{ text: "", style: "plain" }] });
    } else if (entry.role === "assistant") {
      const contentLines = entry.content.split("\n");
      for (let i = 0; i < contentLines.length; i++) {
        const text = contentLines[i] ?? "";
        const isDim =
          text.startsWith("[tool:") ||
          text.startsWith("MCP CALL") ||
          text.startsWith("MCP RESULT");
        if (i === 0) {
          lines.push({
            kind: "reply",
            spans: [
              { text: "● ", style: "bullet" },
              { text, style: isDim ? "dim" : "plain" },
            ],
          });
        } else {
          lines.push({
            kind: "reply",
            spans: [{ text: "  " + text, style: isDim ? "dim" : "plain" }],
          });
        }
      }
      lines.push({ kind: "blank", spans: [{ text: "", style: "plain" }] });
    }
  }

  if (input.phase === "working") {
    lines.push({
      kind: "reply",
      spans: [
        { text: "● ", style: "bullet" },
        { text: "Thinking…", style: "dim" },
      ],
    });
    lines.push({ kind: "blank", spans: [{ text: "", style: "plain" }] });
  }

  // Input Area bounded by horizontal rules
  lines.push({
    kind: "rule",
    spans: [{ text: "────────────────────────────────────────────────────────────────────────────", style: "rule" }],
  });

  const buffer = input.inputBuffer;
  const cursor = Math.max(0, Math.min(input.inputCursor, buffer.length));
  const before = buffer.slice(0, cursor);
  const charAtCursor = buffer[cursor];
  const cursorChar: string = charAtCursor !== undefined ? charAtCursor : " ";
  const after = cursor < buffer.length ? buffer.slice(cursor + 1) : "";

  lines.push({
    kind: "input",
    spans: [
      { text: "> ", style: "dim" },
      { text: before, style: "plain" },
      { text: cursorChar, style: input.isFocused !== false ? "cursor" : "plain" },
      { text: after, style: "plain" },
    ],
  });

  lines.push({
    kind: "rule",
    spans: [{ text: "────────────────────────────────────────────────────────────────────────────", style: "rule" }],
  });

  lines.push({
    kind: "footer",
    spans: [
      { text: "? for shortcuts", style: "footer" },
      { text: "Thinking off (tab to toggle)", style: "footer" },
    ],
  });

  return { lines };
}

export function screenToPlainLines(model: TerminalScreenModel): readonly string[] {
  return model.lines.map((line) => line.spans.map((span) => span.text).join(""));
}
