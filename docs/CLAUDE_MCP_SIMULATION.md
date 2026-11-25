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

## Task phases, process events, and Herdr status (ADR 0007)

The system enforces a strict tripartite boundary across simulated execution:

1. **Application task phase (`ApplicationTaskPhase`)**: Internal state owned by `src/core/applications` (`queued`, `working`, `waiting_for_input`, `settled`, `failed`).
2. **ProcessEvent (`ProcessEvent`)**: Observable facts emitted by simulated processes into the Herdr runtime (`agentState`, `output`, `consumeInput`).
3. **Herdr agent status (`RawAgentState` / `ProjectedAgentState`)**: Authentic multiplexer status projected by Herdr (`idle`, `working`, `blocked`, `unknown`, and projected `done`).

Streaming output is an application activity, not a Herdr status. A background task that settles transitions to `idle` in the process table and may project `done` in Herdr until the focused client acknowledges it; `done` is an attention indicator, never proof of investigative correctness or task success.

### Pane switching, detach, and lifecycle

- **Pane & tab navigation**: Switching panes, tabs, or workspaces is purely a client layout operation. It never resets running agent tasks, reassigns ownership, fabricates completion, or discards output. Background tasks continue to settle deterministically.
- **Pane-local history vs. shared records**: Each pane maintains its own command prompt, input buffer, cursor, and agent history. Canonical fictional documents are shared across all sessions in the central store.
- **Pane closure vs. client detach**:
  - Closing a pane (`applyClosePane`): Terminates the pane runtime and clears its local history from memory.
  - Client detach (`session detach`): Leaves the background server, sessions, panes, processes, and agent histories running and intact.
- **Blocked-work recovery**: A denied search or read transitions the agent to `failed` and status `blocked`. The pane remains interactive; typing an alternate query or clearing the input returns the agent to `waiting_for_input`.
- **Determinism**: Progression is sequential and deterministic. Browser wall-clock timers are non-authoritative and never drive deadlines or completion.
