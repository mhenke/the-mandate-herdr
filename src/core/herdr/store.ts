// Deterministic Herdr simulation for the L1-L3 vertical slice.
// Every transition cites its docs/HERDR_FIDELITY.md row and the pinned upstream
// source path. No React, DOM, adapter, narrative or assessment imports.

import {
  collectPanes,
  findInDirection,
  paneCount,
  paneIds,
  paneNode,
  removePane,
  replacePaneNode,
  splitNode,
  type NavDirection,
  type Rect,
  type SplitDirection,
  type SplitNode,
} from "./layout";
import { helpRowCount, isPrefixKey, resolvePrefixBinding, type PrefixAction } from "./keymap";
import type {
  AgentState,
  ChromeEvent,
  CopyState,
  Effect,
  HerdrSnapshot,
  HerdrState,
  InputEvent,
  JournalEntry,
  KeyEvent,
  Mode,
  Modifier,
  Overlay,
  PaneApp,
  PaneState,
  PaneView,
  ProjectedAgentState,
  TabState,
  TabView,
  WorkspaceState,
  WorkspaceView,
} from "./types";

const TERMINAL_AREA: Rect = { x: 0, y: 0, width: 120, height: 40 };

const PRINTABLE = /^[\x20-\x7e]$/;

// --- construction -----------------------------------------------------------

interface PaneSeed {
  readonly app: PaneApp;
  readonly title: string;
  readonly output?: readonly string[];
}

interface TabSeed {
  readonly name: string;
  readonly panes: readonly PaneSeed[];
  readonly splitApp: PaneApp;
}

interface WorkspaceSeed {
  readonly name: string;
  readonly tabs: readonly TabSeed[];
  readonly newTabApp: PaneApp;
  readonly newTabOutput?: readonly string[];
}

const DEFAULT_APP_OUTPUT: Partial<Record<PaneApp, readonly string[]>> = {
  transcript: [
    "WITNESS TRANSCRIPT // THEO PARK (VENDOR NOC TECHNICIAN)",
    "STATUS: Consent pending · off-record",
    "PARK: 'Load-test script LT-47B misfired against demo portal VP-1109.'",
    "PARK: 'Execution window was 21:47 to 21:52 EST. Five minutes total.'",
    "CORROBORATION: Window and portal match Claude Code audit reference.",
  ],
};

function seedPane(id: string, seed: PaneSeed): PaneState {
  return {
    id,
    app: seed.app,
    title: seed.title,
    output: seed.output ?? DEFAULT_APP_OUTPUT[seed.app] ?? [],
    input: [],
    agent: { raw: "unknown", seq: 0, acknowledgedSeq: 0, completedSeq: 0 },
  };
}

function seedTab(id: string, seed: TabSeed, nextPaneId: number): [TabState, number] {
  const panes: PaneState[] = [];
  let cursor = nextPaneId;
  for (const pane of seed.panes) {
    panes.push(seedPane(`p${cursor}`, pane));
    cursor += 1;
  }
  const first = panes[0];
  if (!first) throw new Error("a tab needs at least one pane");
  const root = panes
    .slice(1)
    .reduce<SplitNode>(
      (node, pane) => splitNode(paneIds(node)[0] ?? first.id, "horizontal", pane.id, 0.5),
      paneNode(first.id),
    );
  return [
    {
      id,
      name: seed.name,
      root,
      focusedPaneId: panes[panes.length - 1]?.id ?? first.id,
      prevFocusId: null,
      zoomedPaneId: null,
      splitApp: seed.splitApp,
      panes,
    },
    cursor,
  ];
}

function buildState(seeds: readonly WorkspaceSeed[]): HerdrState {
  const workspaces: WorkspaceState[] = [];
  let nextPaneId = 1;
  let nextTabId = 1;
  let nextWorkspaceId = 1;
  for (const seed of seeds) {
    const tabs: TabState[] = [];
    for (const tabSeed of seed.tabs) {
      const [tab, cursor] = seedTab(`t${nextTabId}`, tabSeed, nextPaneId);
      nextPaneId = cursor;
      nextTabId += 1;
      tabs.push(tab);
    }
    const firstTab = tabs[0];
    if (!firstTab) throw new Error("a workspace needs at least one tab");
    workspaces.push({
      id: `w${nextWorkspaceId}`,
      name: seed.name,
      tabs,
      activeTabId: firstTab.id,
      newTabApp: seed.newTabApp,
      newTabOutput: seed.newTabOutput,
    });
    nextWorkspaceId += 1;
  }
  const firstWorkspace = workspaces[0];
  if (!firstWorkspace) throw new Error("at least one workspace is required");
  return {
    sessionId: "session-1",
    attached: true,
    terminalArea: TERMINAL_AREA,
    workspaces,
    activeWorkspaceId: firstWorkspace.id,
    mode: "terminal",
    overlay: null,
    sidebarVisible: true,
    navigateSelection: 0,
    copy: null,
    nextPaneId,
    nextTabId,
    nextWorkspaceId,
    journal: [],
  };
}

/**
 * L1 starts in Herdr's default shell workspace. Players create the story
 * workspace and research tab through Herdr's keyboard bindings.
 */
export function createScenario(level: 1 | 2 | 3): HerdrState {
  if (level === 1) {
    return buildState([
      {
        name: "the-mandate",
        newTabApp: "shell",
        tabs: [
          {
            name: "1",
            splitApp: "shell",
            panes: [{ app: "shell", title: "shell" }],
          },
        ],
      },
    ]);
  }
  if (level === 2) {
    return buildState([
      {
        name: "cooperative",
        newTabApp: "artifact",
        newTabOutput: [
          "Claude Code v1.0.12 (simulated session)",
          "$ claude review artifacts/um-1109-88.pdf --extract-metadata",
          "ATTACHMENT: UM-1109-88 / BANNER CAPTURE",
          "ORIGIN-EVENT-ID: [BLANK - FORM DEFAULT / STRIPPED]",
          "TARGET: Vendor Demonstration Portal (VP-1109)",
          "WINDOW: 2026-11-09 21:47 - 21:52 EST",
          "BANNER: 'MAINTENANCE ADVISORY: DIAGNOSTIC SCRIPT EXECUTION IN PROGRESS'",
          "BOUNDED AUDIT: Banner and window verified; root origin unverified.",
          "ATTRIBUTION: Remote banner verification of supplied artifact only.",
        ],
        tabs: [
          {
            name: "reading",
            splitApp: "artifact",
            panes: [
              {
                app: "reading",
                title: "Reading",
                output: [
                  "COOPERATIVE INTAKE — READING QUEUE",
                  "ITEM: SOC Memo UM-1109-88 (Shared Copy)",
                  "SOURCE: Campus SOC via Quill transfer",
                  "NOTE ON FACE: Headers stripped per external sharing policy.",
                  "Open a dedicated artifact tab to launch simulated Claude Code audit.",
                ],
              },
            ],
          },
        ],
      },
    ]);
  }
  return buildState([
    {
      name: "cooperative",
      newTabApp: "shell",
      tabs: [
        {
          name: "1",
          splitApp: "transcript",
          panes: [
            {
              app: "assignment",
              title: "Audit Reference",
              output: [
                "AUDIT REFERENCE // UM-1109-88 REVIEW (Claude Code)",
                "TARGET: Vendor Demonstration Portal (VP-1109)",
                "WINDOW: 2026-11-09 21:47 - 21:52 EST",
                "BANNER: 'MAINTENANCE ADVISORY: DIAGNOSTIC SCRIPT EXECUTION IN PROGRESS'",
                "ORIGIN-EVENT-ID: [BLANK - FORM DEFAULT / STRIPPED]",
                "NOTE: Split pane (Ctrl+B - or Ctrl+B V) to compare witness testimony.",
              ],
            },
          ],
        },
      ],
    },
  ]);
}

// --- helpers ----------------------------------------------------------------

function activeWorkspace(state: HerdrState): WorkspaceState {
  const ws = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
  if (!ws) throw new Error("active workspace missing");
  return ws;
}

function activeTab(state: HerdrState): TabState {
  const ws = activeWorkspace(state);
  const tab = ws.tabs.find((t) => t.id === ws.activeTabId);
  if (!tab) throw new Error("active tab missing");
  return tab;
}

/** input.rs:682-688 — return mode is Copy when the focused pane is the copy pane. */
function returnMode(state: HerdrState): Mode {
  return state.copy && state.copy.paneId === activeTab(state).focusedPaneId ? "copy" : "terminal";
}

function withTab(state: HerdrState, tab: TabState): HerdrState {
  const ws = activeWorkspace(state);
  return {
    ...state,
    workspaces: state.workspaces.map((w) =>
      w.id === ws.id ? { ...w, tabs: w.tabs.map((t) => (t.id === tab.id ? tab : t)) } : w,
    ),
  };
}

function withWorkspace(state: HerdrState, ws: WorkspaceState): HerdrState {
  return {
    ...state,
    workspaces: state.workspaces.map((w) => (w.id === ws.id ? ws : w)),
  };
}

function updatePane(tab: TabState, paneId: string, fn: (pane: PaneState) => PaneState): TabState {
  return { ...tab, panes: tab.panes.map((p) => (p.id === paneId ? fn(p) : p)) };
}

/** Pane input journal label: the key as the pane process receives it. */
function keyLabel(key: string, modifiers: readonly Modifier[]): string {
  return modifiers.length === 0 ? key : `${modifiers.join("+")}+${key}`;
}

function forwardKey(state: HerdrState, key: string, modifiers: readonly Modifier[]): HerdrState {
  const tab = activeTab(state);
  const paneId = tab.focusedPaneId;
  return withTab(
    state,
    updatePane(tab, paneId, (p) => ({ ...p, input: [...p.input, keyLabel(key, modifiers)] })),
  );
}

function setMode(state: HerdrState, mode: Mode): HerdrState {
  return { ...state, mode };
}

/** Acknowledge on pane-surface composition: focus landing acknowledges (FIDELITY Agent rows). */
function acknowledge(tab: TabState, paneId: string): TabState {
  return updatePane(tab, paneId, (p) => ({
    ...p,
    agent: { ...p.agent, acknowledgedSeq: p.agent.seq },
  }));
}

/**
 * Every composed pane surface acknowledges its panes
 * (src/client/shell/endpoint_agent_state.rs:43-175, `acknowledge_surface`).
 * Modelled as the frame boundary before each dispatch: any pane whose done
 * badge is still showing is acknowledged. Returns the same state when nothing
 * was pending, so inert dispatches keep snapshot identity.
 */
function composeSurface(state: HerdrState): HerdrState {
  const tab = activeTab(state);
  const pending = tab.panes.filter((p) => p.agent.acknowledgedSeq < p.agent.completedSeq);
  if (pending.length === 0) return state;
  const next: TabState = {
    ...tab,
    panes: tab.panes.map((p) =>
      p.agent.acknowledgedSeq < p.agent.completedSeq
        ? { ...p, agent: { ...p.agent, acknowledgedSeq: p.agent.seq } }
        : p,
    ),
  };
  return withTab(state, next);
}

function focusPane(state: HerdrState, paneId: string): HerdrState {
  const tab = activeTab(state);
  if (!tab.panes.some((p) => p.id === paneId)) return state;
  const next: TabState = {
    ...acknowledge(tab, paneId),
    focusedPaneId: paneId,
    prevFocusId: tab.focusedPaneId === paneId ? tab.prevFocusId : tab.focusedPaneId,
  };
  return withTab(state, next);
}

/**
 * Copy-mode reconciliation at the frame boundary, after a transition and before
 * the next input is routed (src/client/shell/state.rs:1478-1503, applied on
 * every snapshot):
 * - the copy pane is gone -> clear copy state and leave Copy mode;
 * - the copy pane is focused -> Copy mode is (re)entered from Terminal;
 * - the copy pane exists but is unfocused -> leave Copy mode.
 *
 * shortcut: this model permanently drops the copy cache on unfocus, so
 * refocusing does not restore Copy mode, cursor, or search state. Upstream
 * retains the cache and restores Copy mode on refocus (state.rs:1495-1517).
 * L1-L3 objectives do not require this persistence; implement it before
 * teaching copy-state persistence across focus changes.
 */
function reconcileCopy(state: HerdrState): HerdrState {
  const copy = state.copy;
  if (!copy) return state;
  const focused = activeTab(state).focusedPaneId;
  if (copy.paneId === focused) {
    // Legitimate return-to-copy: only Terminal re-enters Copy, so a pending
    // prefix (input.rs:721-730) is preserved.
    return state.mode === "terminal" ? { ...state, mode: "copy" } : state;
  }
  return { ...state, copy: null, mode: state.mode === "copy" ? "terminal" : state.mode };
}

function projectedAgent(agent: AgentState): ProjectedAgentState {
  // agent_view.rs:325-333 / api_helpers.rs:96-107: done = Idle not yet acknowledged.
  if (agent.raw === "idle" && agent.acknowledgedSeq < agent.completedSeq) return "done";
  return agent.raw;
}

/** Journal action name for assessment (M8): intent without diffing state. */
function actionName(action: PrefixAction): string {
  return action.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

function closeTabFromWorkspace(state: HerdrState, ws: WorkspaceState, tabId: string): HerdrState {
  const idx = ws.tabs.findIndex((t) => t.id === tabId);
  const tabs = ws.tabs.filter((t) => t.id !== tabId);
  let active = idx;
  if (active >= tabs.length) active = tabs.length - 1;
  else if (idx <= active && active > 0) active -= 1;
  const target = tabs[active];
  if (!target) return state;
  return withWorkspace(state, { ...ws, tabs, activeTabId: target.id });
}

function findTargetInDirection(
  tab: TabState,
  terminalArea: Rect,
  direction: NavDirection,
): string | null {
  const panes = collectPanes(tab.root, terminalArea);
  const source = panes.find((p) => p.id === tab.focusedPaneId);
  if (!source) return null;
  return findInDirection(source, direction, panes);
}

function actionNavDirection(action: PrefixAction): NavDirection {
  switch (action) {
    case "focusLeft":
    case "swapLeft":
      return "left";
    case "focusRight":
    case "swapRight":
      return "right";
    case "focusUp":
    case "swapUp":
      return "up";
    case "focusDown":
    case "swapDown":
    default:
      return "down";
  }
}

// --- actions ----------------------------------------------------------------

/** Immediate tab creation: the commit path of the new-tab prompt
 * (overlay_input.rs:967-979). label null → the auto name. */
function createNewTabState(state: HerdrState, label: string | null): HerdrState {
  const ws = activeWorkspace(state);
  const id = `t${state.nextTabId}`;
  const paneId = `p${state.nextPaneId}`;
  const name = label ?? `tab ${ws.tabs.length + 1}`;
  const tab: TabState = {
    id,
    name,
    root: paneNode(paneId),
    focusedPaneId: paneId,
    prevFocusId: null,
    zoomedPaneId: null,
    splitApp: ws.newTabApp,
    panes: [
      seedPane(paneId, {
        app: ws.newTabApp,
        title: name,
        output: ws.newTabOutput ? [...ws.newTabOutput] : undefined,
      }),
    ],
  };
  return {
    ...withWorkspace(state, { ...ws, tabs: [...ws.tabs, tab], activeTabId: id }),
    nextTabId: state.nextTabId + 1,
    nextPaneId: state.nextPaneId + 1,
  };
}

function promptNewTab(state: HerdrState): HerdrState {
  const ws = activeWorkspace(state);
  const defaultName = String(ws.tabs.length + 1);
  return {
    ...state,
    overlay: {
      kind: "rename",
      target: "new-tab",
      workspaceId: ws.id,
      text: defaultName,
      defaultName,
    },
  };
}

function createNewWorkspaceState(state: HerdrState, name: string): HerdrState {
  const id = `w${state.nextWorkspaceId}`;
  const tabId = `t${state.nextTabId}`;
  const paneId = `p${state.nextPaneId}`;
  const tab: TabState = {
    id: tabId,
    name: "1",
    root: paneNode(paneId),
    focusedPaneId: paneId,
    prevFocusId: null,
    zoomedPaneId: null,
    splitApp: "shell",
    panes: [seedPane(paneId, { app: "shell", title: "shell" })],
  };
  const workspace: WorkspaceState = {
    id,
    name,
    tabs: [tab],
    activeTabId: tabId,
    newTabApp: "shell",
  };
  return {
    ...state,
    workspaces: [...state.workspaces, workspace],
    activeWorkspaceId: id,
    nextWorkspaceId: state.nextWorkspaceId + 1,
    nextTabId: state.nextTabId + 1,
    nextPaneId: state.nextPaneId + 1,
  };
}

function promptNewWorkspace(state: HerdrState): HerdrState {
  const defaultName = `workspace ${state.nextWorkspaceId}`;
  return {
    ...state,
    overlay: { kind: "rename", target: "new-workspace", text: defaultName, defaultName },
  };
}

function cycleTab(state: HerdrState, delta: number): HerdrState {
  const ws = activeWorkspace(state);
  const current = ws.tabs.findIndex((t) => t.id === ws.activeTabId);
  const next = (current + delta + ws.tabs.length) % ws.tabs.length;
  const target = ws.tabs[next];
  return target ? withWorkspace(state, { ...ws, activeTabId: target.id }) : state;
}

function switchTab(state: HerdrState, index?: number): HerdrState {
  const ws = activeWorkspace(state);
  const target = index === undefined ? undefined : ws.tabs[index];
  return target ? withWorkspace(state, { ...ws, activeTabId: target.id }) : state;
}

function applyTabAction(state: HerdrState, action: PrefixAction, index?: number): HerdrState {
  if (action === "newTab") return promptNewTab(state);
  if (action === "nextTab") return cycleTab(state, 1);
  if (action === "previousTab") return cycleTab(state, -1);
  if (action === "switchTab") return switchTab(state, index);
  if (action === "renameTab") {
    const tab = activeTab(state);
    return { ...state, overlay: { kind: "rename", target: "tab", id: tab.id, text: tab.name } };
  }
  if (action === "closeTab") {
    const ws = activeWorkspace(state);
    return ws.tabs.length <= 1 ? state : closeTabFromWorkspace(state, ws, ws.activeTabId);
  }
  return state;
}

function pickReflowFocus(tab: TabState, ids: readonly string[], pos: number): string | undefined {
  const prev = tab.prevFocusId;
  if (prev && prev !== tab.focusedPaneId && ids.includes(prev)) {
    return prev;
  }
  return pos + 1 < ids.length ? ids[pos + 1] : ids[pos - 1];
}

function applyClosePane(state: HerdrState): HerdrState {
  const ws = activeWorkspace(state);
  const tab = activeTab(state);
  const singlePane = paneCount(tab.root) <= 1;
  const singleTab = ws.tabs.length <= 1;
  if (singlePane && singleTab) {
    return {
      ...state,
      overlay: { kind: "confirmClose", tabId: tab.id, paneId: tab.focusedPaneId },
    };
  }
  if (singlePane) {
    return closeTabFromWorkspace(state, ws, tab.id);
  }
  const ids = paneIds(tab.root);
  const pos = ids.indexOf(tab.focusedPaneId);
  const newFocus = pickReflowFocus(tab, ids, pos);
  const root = removePane(tab.root, tab.focusedPaneId);
  if (!root || !newFocus) return state;
  const next: TabState = {
    ...tab,
    root,
    panes: tab.panes.filter((p) => p.id !== tab.focusedPaneId),
    focusedPaneId: newFocus,
    prevFocusId: null,
    zoomedPaneId: tab.zoomedPaneId === tab.focusedPaneId ? null : tab.zoomedPaneId,
  };
  return withTab(state, acknowledge(next, newFocus));
}

function applySplitPane(state: HerdrState, tab: TabState, direction: SplitDirection): HerdrState {
  const newId = `p${state.nextPaneId}`;
  const root = replacePaneNode(
    tab.root,
    tab.focusedPaneId,
    splitNode(tab.focusedPaneId, direction, newId, 0.5),
  );
  const pane = seedPane(newId, { app: tab.splitApp, title: tab.splitApp });
  const next: TabState = {
    ...tab,
    root,
    panes: [...tab.panes, pane],
    prevFocusId: tab.focusedPaneId,
    focusedPaneId: newId,
  };
  return { ...withTab(state, acknowledge(next, newId)), nextPaneId: state.nextPaneId + 1 };
}

const FOCUS_ACTIONS = new Set<PrefixAction>(["focusLeft", "focusDown", "focusUp", "focusRight"]);
const SWAP_ACTIONS = new Set<PrefixAction>(["swapLeft", "swapDown", "swapUp", "swapRight"]);

function applySwapPane(state: HerdrState, tab: TabState, action: PrefixAction): HerdrState {
  const target = findTargetInDirection(tab, state.terminalArea, actionNavDirection(action));
  if (!target) return state;
  const swap = (node: SplitNode): SplitNode => {
    if (node.kind === "pane") {
      if (node.id === tab.focusedPaneId) return paneNode(target);
      if (node.id === target) return paneNode(tab.focusedPaneId);
      return node;
    }
    return { ...node, first: swap(node.first), second: swap(node.second) };
  };
  return withTab(state, { ...tab, root: swap(tab.root) });
}

function applyPaneAction(state: HerdrState, action: PrefixAction): HerdrState {
  const tab = activeTab(state);
  if (action === "splitRight") return applySplitPane(state, tab, "horizontal");
  if (action === "splitDown") return applySplitPane(state, tab, "vertical");
  if (FOCUS_ACTIONS.has(action)) {
    const target = findTargetInDirection(tab, state.terminalArea, actionNavDirection(action));
    return target ? focusPane(state, target) : state;
  }
  if (SWAP_ACTIONS.has(action)) return applySwapPane(state, tab, action);
  if (action === "closePane") return applyClosePane(state);
  if (action === "zoom") {
    return withTab(state, {
      ...tab,
      zoomedPaneId: tab.zoomedPaneId === tab.focusedPaneId ? null : tab.focusedPaneId,
    });
  }
  return state;
}

function applyModeAction(state: HerdrState, action: PrefixAction): HerdrState {
  switch (action) {
    case "resizeMode":
      return setMode(state, "resize");
    case "toggleSidebar":
      return { ...state, sidebarVisible: !state.sidebarVisible };
    case "help":
      return {
        ...state,
        overlay: { kind: "help", query: "", searchFocused: false, scroll: 0 },
      };
    case "newWorkspace":
      return promptNewWorkspace(state);
    case "workspacePicker": {
      const index = state.workspaces.findIndex((w) => w.id === state.activeWorkspaceId);
      return { ...setMode(state, "navigate"), navigateSelection: Math.max(0, index) };
    }
    case "detach":
      return { ...state, attached: false };
    case "copyMode": {
      const tab = activeTab(state);
      return {
        ...state,
        mode: "copy",
        copy: {
          paneId: tab.focusedPaneId,
          cursor: { row: 0, col: 0 },
          selection: false,
          searchPrompt: null,
          searchQuery: "",
          searchMatches: 0,
          searchCurrent: null,
        },
      };
    }
    default:
      return state;
  }
}

const TAB_ACTIONS = new Set<PrefixAction>([
  "newTab",
  "nextTab",
  "previousTab",
  "switchTab",
  "renameTab",
  "closeTab",
]);

const PANE_ACTIONS = new Set<PrefixAction>([
  "splitRight",
  "splitDown",
  "focusLeft",
  "focusDown",
  "focusUp",
  "focusRight",
  "swapLeft",
  "swapDown",
  "swapUp",
  "swapRight",
  "closePane",
  "zoom",
]);

const MODE_ACTIONS = new Set<PrefixAction>([
  "resizeMode",
  "toggleSidebar",
  "help",
  "workspacePicker",
  "detach",
  "copyMode",
  "newWorkspace",
]);

function applyAction(state: HerdrState, action: PrefixAction, index?: number): HerdrState {
  if (TAB_ACTIONS.has(action)) return applyTabAction(state, action, index);
  if (PANE_ACTIONS.has(action)) return applyPaneAction(state, action);
  if (MODE_ACTIONS.has(action)) return applyModeAction(state, action);
  return state;
}

// --- key routing ------------------------------------------------------------

interface Routed {
  readonly state: HerdrState;
  readonly effect: Effect;
  readonly action: string | null;
}

function routeChromeSelectWorkspace(
  state: HerdrState,
  workspaceId: string,
  action: string,
): Routed {
  if (!state.workspaces.some((workspace) => workspace.id === workspaceId)) {
    return { state, effect: "none", action };
  }
  return {
    state: { ...state, activeWorkspaceId: workspaceId },
    effect: "action",
    action,
  };
}

function routeChromeSelectTab(state: HerdrState, tabId: string, action: string): Routed {
  const ws = activeWorkspace(state);
  if (!ws.tabs.some((tab) => tab.id === tabId)) {
    return { state, effect: "none", action };
  }
  return {
    state: withWorkspace(state, { ...ws, activeTabId: tabId }),
    effect: "action",
    action,
  };
}

function routeChromeFocusPane(state: HerdrState, paneId: string, action: string): Routed {
  const tab = activeTab(state);
  if (!tab.panes.some((pane) => pane.id === paneId)) {
    return { state, effect: "none", action };
  }
  const next = focusPane(state, paneId);
  return next === state
    ? { state, effect: "none", action }
    : { state: next, effect: "action", action };
}

function routeChrome(state: HerdrState, event: ChromeEvent): Routed {
  if (!state.attached) return { state, effect: "none", action: event.action };
  if (state.overlay) {
    return {
      state: { ...state, overlay: null },
      effect: "mode-changed",
      action: "overlay-dismiss",
    };
  }
  switch (event.action) {
    case "select-workspace":
      return routeChromeSelectWorkspace(state, event.workspaceId, event.action);
    case "select-tab":
      return routeChromeSelectTab(state, event.tabId, event.action);
    case "new-tab": {
      const next = applyAction(state, "newTab");
      return next === state
        ? { state, effect: "none", action: event.action }
        : { state: next, effect: "action", action: event.action };
    }
    case "focus-pane":
      return routeChromeFocusPane(state, event.paneId, event.action);
  }
}

function routeModeKey(state: HerdrState, key: string, mods: readonly Modifier[]): Routed {
  switch (state.mode) {
    case "prefix":
      return routePrefixFollowUp(state, key, mods);
    case "navigate":
      return routeNavigateKey(state, key, mods);
    case "resize":
      return routeResizeKey(state, key);
    case "copy":
      return routeCopyKey(state, key, mods);
    default:
      if (isPrefixKey(key, mods)) {
        return { state: setMode(state, "prefix"), effect: "prefix-armed", action: "prefix" };
      }
      return { state: forwardKey(state, key, mods), effect: "forwarded", action: "forwarded" };
  }
}

function routeKey(state: HerdrState, event: KeyEvent): Routed {
  if (!state.attached || event.key.length === 0 || event.phase === "release") {
    return { state, effect: "none", action: null };
  }
  const { key, modifiers: mods } = event;
  if (event.phase === "repeat") {
    const previous = state.journal.at(-1);
    // Repeat an edit only if the preceding Backspace reached the pane.
    if (
      !state.overlay &&
      state.mode === "terminal" &&
      key === "backspace" &&
      mods.length === 0 &&
      previous?.effect === "forwarded" &&
      previous.event.kind === "key" &&
      previous.event.key === key &&
      previous.event.origin === event.origin &&
      previous.event.modifiers.length === 0
    ) {
      return routeModeKey(state, key, mods);
    }
    return { state, effect: "none", action: null };
  }
  if (state.overlay) return routeOverlayKey(state, key, mods);
  return routeModeKey(state, key, mods);
}

function routePrefixFollowUp(state: HerdrState, key: string, mods: readonly Modifier[]): Routed {
  const back = returnMode(state);
  if (isPrefixKey(key, mods)) {
    return {
      state: forwardKey(setMode(state, back), key, mods),
      effect: "prefix-forwarded",
      action: "prefix-forwarded",
    };
  }
  if (key === "escape") {
    return { state: setMode(state, back), effect: "prefix-cancelled", action: "prefix-cancelled" };
  }
  const binding = resolvePrefixBinding(key, mods);
  if (binding) {
    return {
      state: applyAction(setMode(state, back), binding.action, binding.index),
      effect: "prefix-resolved",
      action: actionName(binding.action),
    };
  }
  return { state: setMode(state, back), effect: "prefix-consumed", action: "invalid-consumed" };
}

function isNavigateCancel(key: string, mods: readonly Modifier[]): boolean {
  return key === "escape" || (key === "[" && mods.includes("ctrl")) || isPrefixKey(key, mods);
}

function routeNavigateKey(state: HerdrState, key: string, mods: readonly Modifier[]): Routed {
  if (isNavigateCancel(key, mods)) {
    return {
      state: setMode(state, returnMode(state)),
      effect: "mode-changed",
      action: "navigate-cancel",
    };
  }
  if (key === "up" || key === "down") {
    const delta = key === "up" ? -1 : 1;
    const count = state.workspaces.length;
    const next = (state.navigateSelection + delta + count) % count;
    return {
      state: { ...state, navigateSelection: next },
      effect: "action",
      action: "workspace-nav",
    };
  }
  if (key === "enter") {
    const target = state.workspaces[state.navigateSelection];
    if (!target) return { state, effect: "none", action: null };
    return {
      state: setMode({ ...state, activeWorkspaceId: target.id }, returnMode(state)),
      effect: "action",
      action: "workspace-open",
    };
  }
  return { state, effect: "none", action: null };
}

function routeResizeKey(state: HerdrState, key: string): Routed {
  if (key === "escape" || key === "enter") {
    return {
      state: setMode(state, returnMode(state)),
      effect: "mode-changed",
      action: "resize-exit",
    };
  }
  return { state, effect: "none", action: null };
}

function routeCopySearchPromptKey(
  state: HerdrState,
  copy: CopyState,
  key: string,
  mods: readonly Modifier[],
): Routed {
  const prompt = copy.searchPrompt;
  if (!prompt) return { state, effect: "none", action: null };
  if (key === "escape") {
    return {
      state: { ...state, copy: { ...copy, searchPrompt: null } },
      effect: "mode-changed",
      action: "copy-search-cancel",
    };
  }
  if (key === "enter") {
    return {
      state: {
        ...state,
        copy: {
          ...copy,
          searchPrompt: null,
          searchQuery: prompt.query,
          searchMatches: prompt.query ? 1 : 0,
          searchCurrent: prompt.query ? 0 : null,
        },
      },
      effect: "action",
      action: "copy-search",
    };
  }
  if (key === "backspace") {
    return {
      state: {
        ...state,
        copy: {
          ...copy,
          searchPrompt: { ...prompt, query: prompt.query.slice(0, -1) },
        },
      },
      effect: "action",
      action: "copy-search-edit",
    };
  }
  if (PRINTABLE.test(key) && mods.length === 0) {
    return {
      state: {
        ...state,
        copy: {
          ...copy,
          searchPrompt: { ...prompt, query: prompt.query + key },
        },
      },
      effect: "action",
      action: "copy-search-edit",
    };
  }
  return { state, effect: "none", action: null };
}

function exitCopyMode(state: HerdrState): Routed {
  return {
    state: { ...setMode(state, "terminal"), copy: null },
    effect: "mode-changed",
    action: "copy-exit",
  };
}

function routeCopySearchRepeat(state: HerdrState, copy: CopyState, key: string): Routed {
  if (copy.searchMatches === 0) return { state, effect: "none", action: null };
  const delta = key === "n" ? 1 : -1;
  const current = copy.searchCurrent ?? 0;
  const next = (current + delta + copy.searchMatches) % copy.searchMatches;
  return {
    state: { ...state, copy: { ...copy, searchCurrent: next } },
    effect: "action",
    action: "copy-search-repeat",
  };
}

function routeCopyMove(state: HerdrState, copy: CopyState, key: string): Routed {
  const cursor = { ...copy.cursor };
  if (key === "h") cursor.col = Math.max(0, cursor.col - 1);
  if (key === "l") cursor.col += 1;
  if (key === "k") cursor.row = Math.max(0, cursor.row - 1);
  if (key === "j") cursor.row += 1;
  return {
    state: { ...state, copy: { ...copy, cursor } },
    effect: "action",
    action: "copy-move",
  };
}

function routeCopyEscape(state: HerdrState, copy: CopyState): Routed {
  if (copy.selection || copy.searchQuery || copy.searchMatches > 0) {
    return {
      state: {
        ...state,
        copy: {
          ...copy,
          selection: false,
          searchQuery: "",
          searchMatches: 0,
          searchCurrent: null,
        },
      },
      effect: "action",
      action: "copy-clear",
    };
  }
  return exitCopyMode(state);
}

function routeCopyYank(state: HerdrState): Routed {
  return {
    state: { ...setMode(state, "terminal"), copy: null },
    effect: "action",
    action: "copy-yank",
  };
}

function routeCopySearchOpen(state: HerdrState, copy: CopyState, key: string): Routed {
  return {
    state: {
      ...state,
      copy: {
        ...copy,
        searchPrompt: { direction: key === "/" ? "forward" : "backward", query: "" },
      },
    },
    effect: "action",
    action: "copy-search-open",
  };
}

const COPY_MOVE_KEYS = new Set(["h", "j", "k", "l"]);
const COPY_REPEAT_KEYS = new Set(["n", "N"]);
const COPY_SEARCH_OPEN_KEYS = new Set(["/", "?"]);
const COPY_SELECT_KEYS = new Set(["v", " "]);
const COPY_YANK_KEYS = new Set(["y", "enter"]);

function routeCopyCommand(state: HerdrState, copy: CopyState, key: string): Routed {
  if (key === "q") return exitCopyMode(state);
  if (COPY_YANK_KEYS.has(key)) return routeCopyYank(state);
  if (COPY_SELECT_KEYS.has(key)) {
    return {
      state: { ...state, copy: { ...copy, selection: true } },
      effect: "action",
      action: "copy-select",
    };
  }
  if (COPY_SEARCH_OPEN_KEYS.has(key)) return routeCopySearchOpen(state, copy, key);
  if (COPY_REPEAT_KEYS.has(key)) return routeCopySearchRepeat(state, copy, key);
  if (COPY_MOVE_KEYS.has(key)) return routeCopyMove(state, copy, key);
  return { state, effect: "none", action: null };
}

function routeCopyKey(state: HerdrState, key: string, mods: readonly Modifier[]): Routed {
  const copy = state.copy;
  if (!copy) {
    return { state: setMode(state, "terminal"), effect: "mode-changed", action: "copy-exit" };
  }
  if (copy.searchPrompt) return routeCopySearchPromptKey(state, copy, key, mods);
  if (isPrefixKey(key, mods)) {
    return { state: setMode(state, "prefix"), effect: "prefix-armed", action: "prefix" };
  }
  if (key === "escape") return routeCopyEscape(state, copy);
  return routeCopyCommand(state, copy, key);
}

function routeHelpSearchKey(
  state: HerdrState,
  overlay: Extract<Overlay, { kind: "help" }>,
  key: string,
  mods: readonly Modifier[],
): Routed {
  if (key === "escape") {
    return {
      state: { ...state, overlay: { ...overlay, searchFocused: false, query: "", scroll: 0 } },
      effect: "mode-changed",
      action: "help-filter-cancel",
    };
  }
  if (key === "enter") {
    return { state: { ...state, overlay: null }, effect: "mode-changed", action: "help-close" };
  }
  if (key === "backspace") {
    return {
      state: { ...state, overlay: { ...overlay, query: overlay.query.slice(0, -1) } },
      effect: "action",
      action: "help-filter-edit",
    };
  }
  if (key === "u" && mods.includes("ctrl")) {
    return {
      state: { ...state, overlay: { ...overlay, query: "" } },
      effect: "action",
      action: "help-filter-clear",
    };
  }
  if (PRINTABLE.test(key) && mods.length === 0) {
    return {
      state: { ...state, overlay: { ...overlay, query: overlay.query + key } },
      effect: "action",
      action: "help-filter-edit",
    };
  }
  return { state, effect: "none", action: null };
}

const HELP_CLOSE_KEYS = new Set(["escape", "enter", "?"]);
const HELP_SCROLL_KEYS = new Set(["up", "k", "down", "j"]);

function routeHelpOverlayKey(
  state: HerdrState,
  overlay: Extract<Overlay, { kind: "help" }>,
  key: string,
  mods: readonly Modifier[],
): Routed {
  if (overlay.searchFocused) {
    return routeHelpSearchKey(state, overlay, key, mods);
  }
  if (HELP_CLOSE_KEYS.has(key)) {
    return { state: { ...state, overlay: null }, effect: "mode-changed", action: "help-close" };
  }
  if (key === "/") {
    return {
      state: { ...state, overlay: { ...overlay, searchFocused: true, scroll: 0 } },
      effect: "action",
      action: "help-filter-open",
    };
  }
  if (HELP_SCROLL_KEYS.has(key)) {
    const delta = key === "up" || key === "k" ? -1 : 1;
    const rows = helpRowCount();
    const scroll = Math.min(rows, Math.max(0, overlay.scroll + delta));
    return {
      state: { ...state, overlay: { ...overlay, scroll } },
      effect: "action",
      action: "help-scroll",
    };
  }
  return { state, effect: "none", action: null };
}

function commitNewTabOverlay(
  state: HerdrState,
  overlay: Extract<Overlay, { kind: "rename"; target: "new-tab" }>,
): Routed {
  const trimmed = overlay.text.trim();
  const label = trimmed.length > 0 && trimmed !== overlay.defaultName ? trimmed : null;
  const ws = state.workspaces.find((w) => w.id === overlay.workspaceId);
  if (!ws) {
    return { state: { ...state, overlay: null }, effect: "none", action: "rename-cancel" };
  }
  return {
    state: createNewTabState({ ...state, overlay: null }, label),
    effect: "action",
    action: "rename-commit",
  };
}

function commitNewWorkspaceOverlay(
  state: HerdrState,
  overlay: Extract<Overlay, { kind: "rename"; target: "new-workspace" }>,
): Routed {
  const name = overlay.text.trim();
  if (name.length === 0) {
    return { state: { ...state, overlay: null }, effect: "none", action: "rename-empty" };
  }
  return {
    state: createNewWorkspaceState({ ...state, overlay: null }, name),
    effect: "action",
    action: "workspace-create",
  };
}
function commitRenameOverlay(
  state: HerdrState,
  overlay: Extract<Overlay, { kind: "rename"; target: "tab" | "workspace" }>,
): Routed {
  const trimmed = overlay.text.trim();
  if (trimmed.length === 0) {
    return { state: { ...state, overlay: null }, effect: "none", action: "rename-empty" };
  }
  if (overlay.target === "tab") {
    const tab = activeTab(state);
    return {
      state: withTab({ ...state, overlay: null }, { ...tab, name: trimmed }),
      effect: "action",
      action: "rename-commit",
    };
  }
  const ws = activeWorkspace(state);
  return {
    state: withWorkspace({ ...state, overlay: null }, { ...ws, name: trimmed }),
    effect: "action",
    action: "rename-commit",
  };
}

function routeRenameOverlayKey(
  state: HerdrState,
  overlay: Extract<Overlay, { kind: "rename" }>,
  key: string,
  mods: readonly Modifier[],
): Routed {
  if (key === "escape") {
    return {
      state: { ...state, overlay: null },
      effect: "mode-changed",
      action: "rename-cancel",
    };
  }
  if (key === "enter") {
    if (overlay.target === "new-tab") return commitNewTabOverlay(state, overlay);
    if (overlay.target === "new-workspace") return commitNewWorkspaceOverlay(state, overlay);
    return commitRenameOverlay(state, overlay);
  }
  if (key === "backspace") {
    return {
      state: { ...state, overlay: { ...overlay, text: overlay.text.slice(0, -1) } },
      effect: "action",
      action: "rename-edit",
    };
  }
  if (key === "u" && mods.includes("ctrl")) {
    return {
      state: { ...state, overlay: { ...overlay, text: "" } },
      effect: "action",
      action: "rename-clear",
    };
  }
  if (PRINTABLE.test(key) && mods.length === 0) {
    const replaceDefault =
      (overlay.target === "new-tab" || overlay.target === "new-workspace") &&
      overlay.text === overlay.defaultName;
    return {
      state: {
        ...state,
        overlay: { ...overlay, text: replaceDefault ? key : overlay.text + key },
      },
      effect: "action",
      action: "rename-edit",
    };
  }
  return { state, effect: "none", action: null };
}

function routeOverlayKey(state: HerdrState, key: string, mods: readonly Modifier[]): Routed {
  const overlay = state.overlay;
  if (!overlay) return { state, effect: "none", action: null };

  if (overlay.kind === "help") {
    return routeHelpOverlayKey(state, overlay, key, mods);
  }
  if (overlay.kind === "rename") {
    return routeRenameOverlayKey(state, overlay, key, mods);
  }
  if (key === "escape") {
    return {
      state: { ...setMode(state, "navigate"), overlay: null },
      effect: "mode-changed",
      action: "confirm-cancel",
    };
  }
  return { state, effect: "none", action: null };
}

// --- host events ------------------------------------------------------------

function routeHost(state: HerdrState, event: Extract<InputEvent, { kind: "host" }>): Routed {
  if (event.host === "blur") {
    if (state.mode === "prefix") {
      return {
        state: setMode(state, returnMode(state)),
        effect: "prefix-voided",
        action: "prefix-voided",
      };
    }
    return { state, effect: "none", action: null };
  }
  if (event.host === "reattach") {
    const attached = { ...state, attached: true };
    return { state: composeSurface(attached), effect: "mode-changed", action: "reattach" };
  }
  return { state, effect: "none", action: null };
}

// --- process events ---------------------------------------------------------

function routeProcess(state: HerdrState, event: Extract<InputEvent, { kind: "process" }>): Routed {
  const payload = event.process;
  const tab = activeTab(state);
  const pane = tab.panes.find((p) => p.id === payload.paneId);
  if (!pane) return { state, effect: "none", action: null };
  if (payload.kind === "consumeInput") {
    return {
      state: withTab(
        state,
        updatePane(tab, pane.id, (p) => ({ ...p, input: [] })),
      ),
      effect: "action",
      action: "process-input-consumed",
    };
  }
  if (payload.kind === "output") {
    return {
      state: withTab(
        state,
        updatePane(tab, pane.id, (p) => ({ ...p, output: [...p.output, payload.line] })),
      ),
      effect: "action",
      action: "process-output",
    };
  }
  const seq = pane.agent.seq + 1;
  const completed =
    payload.state === "idle" && (pane.agent.raw === "working" || pane.agent.raw === "blocked");
  const agent: AgentState = {
    raw: payload.state,
    seq,
    acknowledgedSeq: pane.agent.acknowledgedSeq,
    completedSeq: completed ? seq : pane.agent.completedSeq,
  };
  return {
    state: withTab(
      state,
      updatePane(tab, pane.id, (p) => ({ ...p, agent })),
    ),
    effect: "action",
    action: "process-agent-state",
  };
}

// --- provenance guard -------------------------------------------------------

const KEY_ORIGINS = new Set(["player", "script", "fixture", "host"]);
const PROCESS_ORIGINS = new Set(["process", "script", "fixture"]);
const CHROME_ORIGINS = new Set(["player", "script", "fixture"]);

function assertProvenance(event: InputEvent): void {
  if (event.kind === "key" && !KEY_ORIGINS.has(event.origin)) {
    throw new RangeError(`key event cannot originate from "${event.origin}"`);
  }
  if (event.kind === "process" && !PROCESS_ORIGINS.has(event.origin)) {
    throw new RangeError(`process event cannot originate from "${event.origin}"`);
  }
  if (event.kind === "chrome" && !CHROME_ORIGINS.has(event.origin)) {
    throw new RangeError(`chrome event cannot originate from "${event.origin}"`);
  }
  if (event.kind === "host" && event.origin !== "host") {
    throw new RangeError(`host event cannot originate from "${event.origin}"`);
  }
}

/**
 * Only host-delivered player key presses are player actions. An empty key is
 * not a key (input.rs:637-639 drops modifier reports), so it is never evidence.
 */
function isPlayerAction(event: InputEvent): boolean {
  return (
    event.kind === "key" &&
    event.origin === "player" &&
    event.phase === "press" &&
    event.key.length > 0
  );
}

/** Copy the caller's event at the boundary so later mutation cannot alias (M6). */
function copyEvent(event: InputEvent): InputEvent {
  if (event.kind === "key") {
    return { ...event, modifiers: [...event.modifiers] };
  }
  if (event.kind === "host") {
    return event.modifiers ? { ...event, modifiers: [...event.modifiers] } : { ...event };
  }
  if (event.kind === "chrome") {
    return { ...event };
  }
  return { ...event, process: { ...event.process } };
}

// --- store ------------------------------------------------------------------

export interface HerdrStore {
  dispatch(event: InputEvent): JournalEntry;
  /** Deeply-frozen immutable view model (useSyncExternalStore getSnapshot). */
  snapshot(): HerdrSnapshot;
  /** Frozen, append-only action journal (assessment reads intents here). */
  journal(): readonly JournalEntry[];
  subscribe(listener: () => void): () => void;
  getState(): HerdrState;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}

function toSnapshot(state: HerdrState): HerdrSnapshot {
  const workspaces: WorkspaceView[] = state.workspaces.map((ws) => ({
    id: ws.id,
    name: ws.name,
    activeTabId: ws.activeTabId,
    tabs: ws.tabs.map((tab): TabView => {
      const panes = collectPanes(tab.root, state.terminalArea);
      return {
        id: tab.id,
        name: tab.name,
        focusedPaneId: tab.focusedPaneId,
        zoomedPaneId: tab.zoomedPaneId,
        zoomPill: tab.zoomedPaneId !== null,
        panes: tab.panes.map((pane): PaneView => {
          const info = panes.find((p) => p.id === pane.id);
          return {
            id: pane.id,
            app: pane.app,
            title: pane.title,
            output: pane.output,
            input: pane.input,
            agent: { raw: pane.agent.raw, projected: projectedAgent(pane.agent) },
            rect: info?.rect ?? { x: 0, y: 0, width: 0, height: 0 },
          };
        }),
      };
    }),
  }));
  return {
    sessionId: state.sessionId,
    attached: state.attached,
    mode: state.mode,
    overlay: state.overlay,
    activeWorkspaceId: state.activeWorkspaceId,
    workspaces,
    chrome: { tabBarPosition: "top", sidebarVisible: state.sidebarVisible, sidebarWidth: 26 },
    // render_mode_bar returns None in Terminal mode (render.rs:31-44) and the
    // bar is suppressed while an overlay is active (composition.rs:318-334).
    modeBar: {
      placement: "pane-surface-bottom",
      visible: state.attached && state.mode !== "terminal" && state.overlay === null,
      mode: state.mode,
    },
  };
}

interface DispatchResult {
  readonly nextState: HerdrState;
  readonly entry: JournalEntry;
  readonly changed: boolean;
}

function stepStore(state: HerdrState, event: InputEvent): DispatchResult {
  assertProvenance(event);
  const copy = copyEvent(event);
  // Frame boundary: composed panes acknowledge their done badges. A
  // detached client renders no surface, so nothing is composed.
  const composed = state.attached ? composeSurface(state) : state;
  const routed =
    copy.kind === "key"
      ? routeKey(composed, copy)
      : copy.kind === "process"
        ? routeProcess(composed, copy)
        : copy.kind === "chrome"
          ? routeChrome(composed, copy)
          : routeHost(composed, copy);
  // Frame boundary: reconcile copy state against the committed hierarchy so
  // every pane/tab/workspace/focus change is covered by one rule
  // (state.rs:1478-1503).
  const reconciled = reconcileCopy(routed.state);
  // Deep-freeze the new entry: the copied event, its modifiers array and
  // its process payload are all reachable through journal()/the return
  // value. The caller's own event object is never frozen.
  const entry: JournalEntry = deepFreeze({
    seq: state.journal.length,
    event: copy,
    playerAction: state.attached && isPlayerAction(copy),
    effect: routed.effect,
    action: routed.action,
  });
  // Shallow-freeze the new array; entries are already deep-frozen.
  const journal = Object.freeze([...state.journal, entry]);
  // Freeze the new state graph incrementally: already-frozen sub-objects
  // short-circuit, so this only walks what this dispatch created.
  const nextState = deepFreeze({ ...reconciled, journal });
  // Compare against the pre-dispatch state so a composition-only change
  // (a cleared done badge) still rebuilds the view model.
  const changed = reconciled !== state;
  return { nextState, entry, changed };
}

export function createStore(initial: HerdrState): HerdrStore {
  // Boundary ownership (M5): copy the caller's initial state so neither side
  // can mutate the other's data, then freeze the copy. Transitions never
  // mutate in place, so a frozen state graph is safe to spread from.
  let state = deepFreeze(structuredClone(initial));
  let cached = deepFreeze(toSnapshot(state));
  const listeners = new Set<() => void>();

  return {
    dispatch(event: InputEvent): JournalEntry {
      const { nextState, entry, changed } = stepStore(state, event);
      state = nextState;
      // Rebuild the view model only when observable state changed (M7). The
      // journal is a separate accessor, so inert events keep snapshot identity.
      if (changed) {
        cached = deepFreeze(toSnapshot(state));
        for (const listener of listeners) listener();
      }
      return entry;
    },
    snapshot(): HerdrSnapshot {
      return cached;
    },
    journal(): readonly JournalEntry[] {
      return state.journal;
    },
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getState(): HerdrState {
      // Frozen: callers cannot mutate internal state and desync the snapshot.
      return state;
    },
  };
}

/** Pure replay: same events produce the same state. */
export function replay(initial: HerdrState, events: readonly InputEvent[]): HerdrState {
  const store = createStore(initial);
  for (const event of events) store.dispatch(event);
  return store.getState();
}

export function initialState(): HerdrState {
  return createScenario(1);
}
