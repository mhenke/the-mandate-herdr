---
status: accepted
---

# ADR 0007: Deterministic In-Terminal Agent Simulation, Task Phases, and Herdr Status Projection

## Context

Herdr multiplexer workflows are the sole learning objective of *The Mandate*. In real-world software engineering, multiplexers are primary tools for isolating, monitoring, and managing in-terminal AI coding agents (Claude Code, OpenCode, Aider). Simulated Claude Code provides authentic terminal work for the player to organize across tabs and split panes without the non-deterministic latency, offline vulnerability, and test variance of live LLM APIs or out-of-band web chat drawers.

To prevent authority leakage between application simulation and Herdr multiplexer mechanics, the system must clearly separate application task execution, observable process events, and Herdr status projections.

## Decision

We formalize three distinct, non-interchangeable concepts across the application and simulation layers:

### 1. Tripartite Concept Separation

1. **Application Task Phase (`ApplicationTaskPhase`)**:
   - The internal, deterministic lifecycle of simulated Claude Code within `src/core/applications`:
     - `queued`: Request recognized and awaiting dispatch.
     - `working`: Active execution of tool calls (search, read) and line generation.
     - `waiting_for_input`: Prompt idle, waiting for the player's next query or command.
     - `settled`: Task successfully concluded with retrieved document or narrative acknowledgment.
     - `failed`: Task blocked due to invalid input or permission denial.
   - Owned entirely by application state; never directly mutates Herdr multiplexer data.

2. **ProcessEvent (`ProcessEvent`)**:
   - Discrete, observable facts emitted by simulated processes into the Herdr runtime:
     - `{ kind: "process", origin: "process", process: { kind: "agentState", paneId, state } }`
     - `{ kind: "process", origin: "process", process: { kind: "output", paneId, line } }`
   - Process events document what happened inside terminal runtimes. Narrative and assessment cores observe committed process events, but process events can never manufacture player action evidence or grant keyboard-transfer credit.

3. **Herdr Agent Status (`RawAgentState` and `ProjectedAgentState`)**:
   - The authentic multiplexer process status tracked and rendered by Herdr (`src/core/herdr`):
     - `idle`: Process running with zero pending output or CPU demand.
     - `working`: Process actively executing.
     - `blocked`: Process paused awaiting external intervention or permission.
     - `done`: **Presentation projection only.** An `idle` state that has not yet been acknowledged by the focused client.
   - `done` reflects client attention, **not task correctness**. A settled task may appear `done`, but inspecting agent output remains strictly necessary. Streaming output is application activity, not a Herdr status.

### 2. Session, Pane, and Lifecycle Rules

- **Pane-local history vs. shared records**: Each pane owns an isolated command prompt, input line, cursor position, and agent history (`AgentSession`). Canonical fictional documents reside in a shared store accessed via simulated tool calls (`documents.search`, `documents.read`).
- **Pane and tab navigation**: Switching panes, tabs, or workspaces is purely a Herdr client navigation event. It must never reset running agent progress, alter task ownership, fabricate task completion, or discard terminal output buffers. Background agent tasks continue to settle deterministically.
- **Pane closure vs. client detach**:
  - *Closing a pane (`applyClosePane`)*: Terminates the pane's runtime and removes its pane-local history.
  - *Client detach (`session detach`)*: Detaches the client viewing connection. The background server, sessions, panes, processes, agent phases, and history buffers remain running and completely intact.
- **Blocked-work recovery**: When an agent encounters an error or permission denial (transitioning to `failed` and status `blocked`), the pane remains interactive. The player can clear the input (`Ctrl+U`, `Ctrl+C`) or submit a new query to transition back to `waiting_for_input`.

### 3. Event Ordering & Determinism

- Task progression is strictly sequential and deterministic. Given the same input sequence, the application produces identical output lines, tool calls, and state transitions.
- Browser wall-clock timers (`setTimeout`, `setInterval`) are non-authoritative and must never govern task progression, deadlines, or objective completion.

## Consequences

- `src/core/applications` remains pure data with zero dependencies on React, DOM APIs, or Herdr store internals.
- Herdr's simulation remains faithful to upstream commit `e8d7d97`, recognizing process states without coupling to fictional agent semantics.
- Tests can deterministically verify agent execution, background persistence across layout changes, and distinction between detach and closure.
