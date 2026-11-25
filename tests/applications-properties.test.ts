import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  createApplicationState,
  stepApplication,
  type ApplicationInput,
  type ApplicationState,
} from "../src/core/applications";
import { buildClaudeScreenModel, screenToPlainLines } from "../src/core/applications/screen";

const LEVELS = [1, 2, 3, 4, 5] as const;
const PANES = ["p1", "p2", "p3"] as const;

function launchHerdr(): ApplicationState {
  let state = createApplicationState();
  state = stepApplication(state, { kind: "paste", origin: "player", text: "herdr" }).state;
  return stepApplication(state, { kind: "key", origin: "player", key: "enter" }).state;
}

function submitLine(state: ApplicationState, line: string, paneId: string, level = 1) {
  const pasted = stepApplication(
    state,
    { kind: "paste", origin: "player", paneId, text: line },
    level,
  );
  return stepApplication(
    pasted.state,
    { kind: "key", origin: "player", paneId, key: "enter" },
    level,
  );
}

const arbitraryRestrictedPrompt: fc.Arbitrary<string> = fc.oneof(
  fc
    .constantFrom("create", "build", "write", "develop", "generate")
    .chain((verb) =>
      fc
        .constantFrom("a web application", "a python script", "a backend api", "a typescript app")
        .map((target) => `${verb} ${target}`),
    ),
  fc
    .constantFrom("npm install", "pip install", "pnpm add", "cargo add")
    .chain((cmd) =>
      fc.constantFrom("axios", "express", "lodash", "flask").map((pkg) => `${cmd} ${pkg}`),
    ),
  fc.constantFrom("run bash script", "execute a shell command", "sudo rm -rf /tmp"),
  fc.constantFrom(
    "browse the web for updates",
    "search the internet for vendor",
    "curl https://example.com",
  ),
  fc.constantFrom("delete all files", "remove all files", "format disk"),
);

const arbitraryConversationalPrompt: fc.Arbitrary<string> = fc.oneof(
  fc.constantFrom(
    "what do i have going on today? also do i have any outstanding email?",
    "what is on my schedule today?",
    "do i have any unread email?",
    "read it",
    "open the email",
    "what did june say?",
    "show me that document",
    "what about the other message?",
    "how can you help?",
    "what is the weather today?",
    "search for city budget report",
    "find CPA-01A",
    "find UM-1109-88",
    "find Theo Park's interview",
    "read RESTRICTED-EIAB-DRAFT",
    "accept the assignment",
  ),
  arbitraryRestrictedPrompt,
  fc
    .string({ maxLength: 60 })
    .filter((s) => !["exit", "quit", "/exit"].includes(s.trim().toLowerCase())),
);

const arbitraryEditInput: fc.Arbitrary<ApplicationInput> = fc.oneof(
  fc
    .constantFrom(
      "a",
      "B",
      "0",
      " ",
      "-",
      "?",
      "arrowleft",
      "arrowright",
      "home",
      "end",
      "backspace",
      "delete",
      "enter",
    )
    .map((key): ApplicationInput => ({ kind: "key", origin: "player", paneId: "p1", key })),
  fc.constantFrom("a", "e", "u", "w").map((key): ApplicationInput => ({
    kind: "key",
    origin: "player",
    paneId: "p1",
    key,
    modifiers: ["ctrl"],
  })),
  fc
    .string({ maxLength: 20 })
    .filter((s) => !["exit", "quit", "/exit"].includes(s.trim().toLowerCase()))
    .map((text): ApplicationInput => ({ kind: "paste", origin: "player", paneId: "p1", text })),
);

describe("simulated Claude Code property tests", () => {
  it("property: managed-environment notice is displayed at most once across launches and prompts", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            paneId: fc.constantFrom(...PANES),
            action: fc.oneof(
              fc.constant<"launch">("launch"),
              fc.constant<"exit">("exit"),
              arbitraryConversationalPrompt.map((prompt) => ({ kind: "prompt" as const, prompt })),
            ),
          }),
          { minLength: 1, maxLength: 20 },
        ),
        (steps) => {
          let state = launchHerdr();
          let noticeOccurrences = 0;

          for (const step of steps) {
            const line =
              step.action === "launch"
                ? "claude"
                : step.action === "exit"
                  ? "exit"
                  : step.action.prompt;
            const res = submitLine(state, line, step.paneId);
            state = res.state;
            for (const effect of res.effects) {
              if (
                effect.kind === "pane-output" &&
                effect.line.includes("Cooperative Managed Environment")
              ) {
                noticeOccurrences += 1;
              }
            }
          }

          expect(noticeOccurrences).toBeLessThanOrEqual(1);
        },
      ),
    );
  });

  it("property: arbitrary Claude prompt sequences are deterministic and never mutate records", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LEVELS),
        fc.array(arbitraryConversationalPrompt, { minLength: 1, maxLength: 12 }),
        (level, prompts) => {
          const run = () => {
            let state = submitLine(launchHerdr(), "claude", "p1", level).state;
            const allEffects = [];
            for (const prompt of prompts) {
              const res = submitLine(state, prompt, "p1", level);
              state = res.state;
              allEffects.push(res.effects);
            }
            return { state, allEffects };
          };

          const first = run();
          const second = run();
          expect(first).toEqual(second);
          expect(first.state.records).toEqual(createApplicationState().records);
        },
      ),
    );
  });

  it("property: non-player origins never mutate Claude or terminal application state", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            origin: fc.constantFrom("script" as const, "fixture" as const, "process" as const),
            key: fc.constantFrom("a", "enter", "backspace", "escape"),
            paneId: fc.constantFrom(...PANES),
          }),
          { minLength: 1, maxLength: 15 },
        ),
        (inputs) => {
          const initial = submitLine(launchHerdr(), "claude", "p1").state;
          let state = initial;
          for (const input of inputs) {
            const res = stepApplication(state, { kind: "key", ...input });
            expect(res.state).toBe(state);
            expect(res.effects).toEqual([]);
            expect(res.ignored).toBe(true);
            state = res.state;
          }
          expect(state).toBe(initial);
        },
      ),
    );
  });

  it("property: restricted prompts give brief replies without repeating the notice or granting records", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LEVELS),
        fc.array(arbitraryRestrictedPrompt, { minLength: 1, maxLength: 8 }),
        (level, prompts) => {
          let state = submitLine(launchHerdr(), "claude", "p1", level).state;

          for (const prompt of prompts) {
            const res = submitLine(state, prompt, "p1", level);
            state = res.state;
            const output = res.effects
              .map((e) => (e.kind === "pane-output" ? e.line : ""))
              .join("\n");

            expect(output).not.toContain("Cooperative Managed Environment");
            expect(res.effects.some((e) => e.kind === "document-read")).toBe(false);
            expect(res.effects.some((e) => e.kind === "assignment-acknowledged")).toBe(false);
            expect(state.agents.p1?.status).toBe("ready");
            expect(state.agents.p1?.phase).toBe("settled");
          }

          expect(state.readReceipts).toEqual([]);
          expect(state.assignmentAcknowledged).toBe(false);
        },
      ),
    );
  });

  it("property: restricted and future-level documents never enter readReceipts", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LEVELS),
        fc.array(arbitraryConversationalPrompt, { minLength: 1, maxLength: 12 }),
        (level, prompts) => {
          let state = submitLine(launchHerdr(), "claude", "p1", level).state;
          for (const prompt of prompts) {
            state = submitLine(state, prompt, "p1", level).state;
          }

          for (const receipt of state.readReceipts) {
            const doc = state.records.find((r) => r.id === receipt.documentId);
            expect(doc).toBeDefined();
            expect(doc?.access).not.toBe("restricted");
            expect(doc?.availableFromLevel ?? 1).toBeLessThanOrEqual(level);
          }
        },
      ),
    );
  });
});

describe("simulated Claude Code editor & screen property tests", () => {
  it("property: pane line-editing keeps cursor in bounds and keeps Claude interactive", () => {
    fc.assert(
      fc.property(fc.array(arbitraryEditInput, { minLength: 1, maxLength: 40 }), (edits) => {
        let state = submitLine(launchHerdr(), "claude", "p1").state;

        for (const edit of edits) {
          state = stepApplication(state, edit).state;
          const buf = state.paneInputs.p1 ?? "";
          const cursor = state.paneCursors?.p1 ?? buf.length;
          expect(cursor).toBeGreaterThanOrEqual(0);
          expect(cursor).toBeLessThanOrEqual(buf.length);
          expect(state.agents.p1).toBeDefined();
        }
      }),
    );
  });

  it("property: interleaved prompts across panes preserve per-pane conversation isolation", () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryConversationalPrompt, { minLength: 1, maxLength: 6 }),
        fc.array(arbitraryConversationalPrompt, { minLength: 1, maxLength: 6 }),
        (p1Prompts, p2Prompts) => {
          let state = submitLine(launchHerdr(), "claude", "p1").state;
          state = submitLine(state, "claude", "p2").state;

          for (const prompt of p1Prompts) {
            state = submitLine(state, prompt, "p1").state;
          }
          const p1Snapshot = state.agents.p1;

          for (const prompt of p2Prompts) {
            state = submitLine(state, prompt, "p2").state;
          }

          expect(state.agents.p1).toEqual(p1Snapshot);
        },
      ),
    );
  });

  it("property: buildClaudeScreenModel always renders banner, bounded input, and footer for any cursor", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            role: fc.constantFrom("user" as const, "assistant" as const, "tool" as const),
            content: fc.string({ maxLength: 80 }),
          }),
          { maxLength: 10 },
        ),
        fc.string({ maxLength: 40 }),
        fc.integer({ min: -50, max: 100 }),
        fc.boolean(),
        (history, inputBuffer, inputCursor, isFocused) => {
          const model = buildClaudeScreenModel({
            history,
            cwd: "~/Projects/the-mandate",
            inputBuffer,
            inputCursor,
            isFocused,
          });
          const kinds = model.lines.map((line) => line.kind);
          expect(kinds.filter((k) => k === "banner").length).toBeGreaterThanOrEqual(5);
          expect(kinds.filter((k) => k === "rule").length).toBe(2);
          expect(kinds.filter((k) => k === "input").length).toBe(1);
          expect(kinds.filter((k) => k === "footer").length).toBe(1);

          const inputLine = model.lines.find((line) => line.kind === "input");
          const hasCursor = inputLine?.spans.some((s) => s.style === "cursor") ?? false;
          expect(hasCursor).toBe(isFocused);

          const plain = screenToPlainLines(model).join("\n");
          expect(plain).toContain("Claude Code");
        },
      ),
    );
  });
});
