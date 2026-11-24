// Domain types for the pinned Herdr subset (docs/HERDR_FIDELITY.md).
// Pure data: no React, DOM, adapters, narrative or assessment imports.

import type { Rect, SplitNode } from "./layout";

/** Client shell modes (src/client/shell/state.rs:271-277). */
export type Mode = "terminal" | "prefix" | "navigate" | "resize" | "copy";

/** Raw agent states (src/detect/mod.rs:9-20). There is no raw "done". */
export type RawAgentState = "idle" | "working" | "blocked" | "unknown";

/** "done" is presentation: Idle not yet acknowledged by this client (src/app/agent_view.rs:325-333). */
export type ProjectedAgentState = RawAgentState | "done";

/** Fictional pane applications for L1-L3 (docs/LEVEL.md). */
export type PaneApp = "assignment" | "memo" | "transcript" | "reading" | "artifact" | "shell";

export type Modifier = "ctrl" | "alt" | "shift" | "meta";
export type KeyPhase = "press" | "release" | "repeat";

/**
 * Provenance of an event. Only "player" key presses are player actions; a
 * scripted, fixture or simulated-process event can never carry that marker.
 */
export type EventOrigin = "player" | "process" | "fixture" | "script" | "host";

export interface KeyEvent {
  readonly kind: "key";
  readonly origin: EventOrigin;
  readonly key: string;
  readonly modifiers: readonly Modifier[];
  readonly phase: KeyPhase;
}

export type ProcessPayload =
  | { readonly kind: "agentState"; readonly paneId: string; readonly state: RawAgentState }
  | { readonly kind: "output"; readonly paneId: string; readonly line: string };

export interface ProcessEvent {
  readonly kind: "process";
  readonly origin: EventOrigin;
  readonly process: ProcessPayload;
}

export interface HostEvent {
  readonly kind: "host";
  readonly origin: EventOrigin;
  /** "intercepted" records a key the host consumed before the page saw it. */
  readonly host: "blur" | "focus" | "reattach" | "intercepted";
  readonly key?: string;
  readonly modifiers?: readonly Modifier[];
}

/** Chrome controls are mouse/native-control activation, never keyboard transfer. */
export type ChromeOrigin = "player" | "script" | "fixture";

export type ChromeEvent =
  | {
      readonly kind: "chrome";
      readonly origin: ChromeOrigin;
      readonly action: "select-workspace";
      readonly workspaceId: string;
    }
  | {
      readonly kind: "chrome";
      readonly origin: ChromeOrigin;
      readonly action: "select-tab";
      readonly tabId: string;
    }
  | { readonly kind: "chrome"; readonly origin: ChromeOrigin; readonly action: "new-tab" }
  | {
      readonly kind: "chrome";
      readonly origin: ChromeOrigin;
      readonly action: "focus-pane";
      readonly paneId: string;
    };

export type InputEvent = KeyEvent | ProcessEvent | HostEvent | ChromeEvent;

export type Effect =
  | "none"
  | "forwarded"
  | "prefix-armed"
  | "prefix-resolved"
  | "prefix-forwarded"
  | "prefix-cancelled"
  | "prefix-consumed"
  | "prefix-voided"
  | "mode-changed"
  | "action";

export interface JournalEntry {
  readonly seq: number;
  readonly event: InputEvent;
  /** True only for host-delivered player key presses while attached. */
  readonly playerAction: boolean;
  readonly effect: Effect;
  /** Resolved intent for assessment, e.g. "help", "split-right", "invalid-consumed". */
  readonly action: string | null;
}

export interface AgentState {
  readonly raw: RawAgentState;
  readonly seq: number;
  readonly acknowledgedSeq: number;
  readonly completedSeq: number;
}

export interface PaneState {
  readonly id: string;
  readonly app: PaneApp;
  readonly title: string;
  readonly output: readonly string[];
  /** Keys forwarded to this pane's process (input-destination evidence). */
  readonly input: readonly string[];
  readonly agent: AgentState;
}

export interface TabState {
  readonly id: string;
  readonly name: string;
  readonly root: SplitNode;
  readonly focusedPaneId: string;
  readonly prevFocusId: string | null;
  readonly zoomedPaneId: string | null;
  /** Fixture declaration: the fictional app a new split opens here. */
  readonly splitApp: PaneApp;
  readonly panes: readonly PaneState[];
}

export interface WorkspaceState {
  readonly id: string;
  readonly name: string;
  readonly tabs: readonly TabState[];
  readonly activeTabId: string;
  /** Fixture declaration: the fictional app a new tab opens here. */
  readonly newTabApp: PaneApp;
}

export interface CopySearchPrompt {
  readonly direction: "forward" | "backward";
  readonly query: string;
}

export interface CopyState {
  readonly paneId: string;
  readonly cursor: { readonly row: number; readonly col: number };
  readonly selection: boolean;
  readonly searchPrompt: CopySearchPrompt | null;
  readonly searchQuery: string;
  readonly searchMatches: number;
  readonly searchCurrent: number | null;
}

export type Overlay =
  | {
      readonly kind: "help";
      readonly query: string;
      readonly searchFocused: boolean;
      readonly scroll: number;
    }
  | {
      readonly kind: "rename";
      readonly target: "tab" | "workspace";
      readonly id: string;
      readonly text: string;
    }
  | {
      // overlay_input.rs:386-408: NewTab with default prompt_new_tab_name opens
      // a rename overlay titled "new tab", pre-filled with the next tab number.
      readonly kind: "rename";
      readonly target: "new-tab";
      readonly workspaceId: string;
      readonly text: string;
      readonly defaultName: string;
    }
  | { readonly kind: "confirmClose"; readonly tabId: string; readonly paneId: string };

export interface HerdrState {
  readonly sessionId: string;
  readonly attached: boolean;
  readonly terminalArea: Rect;
  readonly workspaces: readonly WorkspaceState[];
  readonly activeWorkspaceId: string;
  readonly mode: Mode;
  readonly overlay: Overlay | null;
  readonly sidebarVisible: boolean;
  readonly navigateSelection: number;
  readonly copy: CopyState | null;
  readonly nextPaneId: number;
  readonly nextTabId: number;
  readonly nextWorkspaceId: number;
  readonly journal: readonly JournalEntry[];
}

export interface PaneView {
  readonly id: string;
  readonly app: PaneApp;
  readonly title: string;
  readonly output: readonly string[];
  readonly input: readonly string[];
  readonly agent: { readonly raw: RawAgentState; readonly projected: ProjectedAgentState };
  readonly rect: Rect;
}

export interface TabView {
  readonly id: string;
  readonly name: string;
  readonly focusedPaneId: string;
  readonly zoomedPaneId: string | null;
  readonly zoomPill: boolean;
  readonly panes: readonly PaneView[];
}

export interface WorkspaceView {
  readonly id: string;
  readonly name: string;
  readonly activeTabId: string;
  readonly tabs: readonly TabView[];
}

export interface HerdrSnapshot {
  readonly sessionId: string;
  readonly attached: boolean;
  readonly mode: Mode;
  readonly overlay: Overlay | null;
  readonly activeWorkspaceId: string;
  readonly workspaces: readonly WorkspaceView[];
  readonly chrome: {
    readonly tabBarPosition: "top";
    readonly sidebarVisible: boolean;
    readonly sidebarWidth: number;
  };
  /** Mode bar renders at the bottom of the pane surface (src/client/shell/render.rs:31-51). */
  readonly modeBar: {
    readonly placement: "pane-surface-bottom";
    readonly visible: boolean;
    readonly mode: Mode;
  };
}
