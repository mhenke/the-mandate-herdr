# Claude and newsroom document tools

Claude Code and MCP are story surfaces, not curricula. The newsroom configures access before play. No tools call a server, open a host file, execute a command, or ask for credentials. L1–L3 share one fictional document store. Later systems are design contracts in `LEVEL.md`.

## Player interaction

The terminal starts in `~/Projects/the-mandate`. Run `herdr` there to open the default simulated session. It has one workspace named `the-mandate`, tab `1`, and a shell with a single live `$` prompt. The player types `claude` in a Herdr pane to start a simulated session. Each pane has its own input, agent history, and last task. The interpreter recognizes record IDs and ordinary descriptions. For example, “Find CPA-01A” and “Show me the source-handling memo” lead to the same record. The player does not select an MCP tool.

The launch prompt shows the simulated working folder. The first Herdr workspace takes its name from that folder, not from the player's machine. Backspace deletes text and repeats while held. `Ctrl+U` clears the current line and `Ctrl+C` discards it without submitting. The focused prompt and Herdr report which keys they use. The browser keeps unused keys, including Space in Resize mode and `Ctrl+R` or `Ctrl+Shift+R`. Escape stays with the captured Herdr surface.

A recognized request prints search, the matched record, a read call, and the original document text. Agent summaries are separate from the original. A denial leaves the session usable for a different request. A document receipt means the tool returned the text. It does not certify that the player read it or that the document is true.

## L1–L3 tool contracts

| Tool | Input | Success | Errors and permissions | Persistent effect |
| --- | --- | --- | --- | --- |
| `documents.search` | `{ query: string }`. The interpreter resolves the record and searches for its ID. | A list of matching document IDs and titles. | Empty query: `invalid_query`. No match: `not_found`. A restricted match: `permission_denied`. The tool does not return restricted content. | No change to records or receipts. The session records the call and result. |
| `documents.read` | `{ id: string }`. Match the normalized ID exactly. | The original record with its title, access class, and text. | Empty ID: `invalid_id`. Unknown ID: `not_found`. Restricted record: `permission_denied`. Cooperative and public records are readable under the existing newsroom role. | A successful agent read adds at most one receipt per document and pane. Requests, tool calls, and replies stay in pane-local history. No record is modified. |

L1 uses CPA-01A. L2 uses the shared copy of UM-1109-88. L3 uses Park's consent transcript. The earlier documents and agent histories stay available across the level transitions. June's acknowledgment is a narrative event, not a tool or Herdr command. The application has no filing, archive, mail, or custody connector in this slice.

The shared store includes later slice records from the start, but the agent reports `not_found` before their release level. The report must be opened in a tab separate from the memo. The interview must be opened in a pane next to the report. A misplaced retrieval does not advance the story. The transcript gives a placement cue, and the player can repeat the request in the intended pane.

Herdr owns the destination and lifecycle of terminal input. The application emits deterministic output and agent-state facts. Narrative consumes the document and acknowledgment facts. Assessment consumes player-origin Herdr actions and their committed results. Neither tool results nor session status can grant keyboard skill credit.
