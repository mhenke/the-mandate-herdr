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
  type SplitNode,
} from "./layout";
import { helpBindingRows, isPrefixKey, resolvePrefixBinding, type PrefixAction } from "./keymap";
import type {
  AgentState,
  Effect,
  HerdrSnapshot,
  HerdrState,
  InputEvent,
  JournalEntry,
  KeyEvent,
  Mode,
  Modifier,
  PaneApp,
  PaneState,
  PaneView,
  ProjectedAgentState,
  TabState,
  TabView,
  WorkspaceState,
  WorkspaceView,
  ChromeEvent,
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
}

function seedPane(id: string, seed: PaneSeed): PaneState {
  return {
    id,
    app: seed.app,
    title: seed.title,
    output: seed.output ?? [],
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
 * L1-L3 starting states (docs/LEVEL.md). Fictional content is minimal and
 * sourced from the level contracts: L1 assignment + memo panes, L2 reading tab,
 * L3 one pane split into assignment beside a transcript draft.
 */
export function createScenario(level: 1 | 2 | 3): HerdrState {
  if (level === 1) {
    return buildState([
      {
        name: "cooperative",
        newTabApp: "shell",
        tabs: [
          {
            name: "assignment",
            splitApp: "memo",
            panes: [
              { app: "assignment", title: "Assignment", output: ["SOC tip: supplied goods"] },
              { app: "memo", title: "Memo", output: ["source-handling rules"] },
            ],
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
        tabs: [
          {
            name: "reading",
            splitApp: "artifact",
            panes: [{ app: "reading", title: "Reading", output: ["UM-1109-88 (shared PDF)"] }],
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
          name: "interview",
          splitApp: "transcript",
          panes: [{ app: "assignment", title: "Assignment", output: ["Park consent interview"] }],
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
    panes: [seedPane(paneId, { app: ws.newTabApp, title: name })],
  };
  return {
    ...withWorkspace(state, { ...ws, tabs: [...ws.tabs, tab], activeTabId: id }),
    nextTabId: state.nextTabId + 1,
    nextPaneId: state.nextPaneId + 1,
  };
}

function applyAction(state: HerdrState, action: PrefixAction, index?: number): HerdrState {
  switch (action) {
    // Tabs row (FIDELITY): upstream default prompt_new_tab_name=true
    // (config/model.rs:1214) routes NewTab through a "new tab" rename overlay
    // (actions.rs:135-139, overlay_input.rs:386-408) instead of creating
    // immediately; the tab is created on Enter and not created on Escape.
    case "newTab": {
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
    case "nextTab":
    case "previousTab": {
      const ws = activeWorkspace(state);
      const current = ws.tabs.findIndex((t) => t.id === ws.activeTabId);
      const delta = action === "previousTab" ? -1 : 1;
      const next = (current + delta + ws.tabs.length) % ws.tabs.length;
      const target = ws.tabs[next];
      if (!target) return state;
      return withWorkspace(state, { ...ws, activeTabId: target.id });
    }
    case "switchTab": {
      const ws = activeWorkspace(state);
      const target = index === undefined ? undefined : ws.tabs[index];
      if (!target) return state;
      return withWorkspace(state, { ...ws, activeTabId: target.id });
    }
    case "renameTab": {
      const tab = activeTab(state);
      return {
        ...state,
        overlay: { kind: "rename", target: "tab", id: tab.id, text: tab.name },
      };
    }
    case "closeTab": {
      // workspace.rs:575-589: a last tab is refused; otherwise the active index
      // moves to the previous tab, or to the new last tab when the closed one
      // was last. ASSUMPTION (FIDELITY Unresolved #4): the client-side reflow
      // after a close is not traced; this mirrors the server rule.
      const ws = activeWorkspace(state);
      if (ws.tabs.length <= 1) return state;
      const idx = ws.tabs.findIndex((t) => t.id === ws.activeTabId);
      const tabs = ws.tabs.filter((t) => t.id !== ws.activeTabId);
      let active = idx;
      if (active >= tabs.length) active = tabs.length - 1;
      else if (idx <= active && active > 0) active -= 1;
      const target = tabs[active];
      if (!target) return state;
      return withWorkspace(state, { ...ws, tabs, activeTabId: target.id });
    }
    // Core five split row: split tree updates, focus lands in the new pane.
    case "splitRight":
    case "splitDown": {
      const tab = activeTab(state);
      const direction = action === "splitRight" ? "horizontal" : "vertical";
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
    // Core five focus row: directional overlap, no wrap, no focus loss.
    case "focusLeft":
    case "focusDown":
    case "focusUp":
    case "focusRight": {
      const tab = activeTab(state);
      const direction: NavDirection =
        action === "focusLeft"
          ? "left"
          : action === "focusRight"
            ? "right"
            : action === "focusUp"
              ? "up"
              : "down";
      const panes = collectPanes(tab.root, state.terminalArea);
      const source = panes.find((p) => p.id === tab.focusedPaneId);
      if (!source) return state;
      const target = findInDirection(source, direction, panes);
      if (!target) return state;
      return focusPane(state, target);
    }
    case "swapLeft":
    case "swapDown":
    case "swapUp":
    case "swapRight": {
      const tab = activeTab(state);
      const direction: NavDirection =
        action === "swapLeft"
          ? "left"
          : action === "swapRight"
            ? "right"
            : action === "swapUp"
              ? "up"
              : "down";
      const panes = collectPanes(tab.root, state.terminalArea);
      const source = panes.find((p) => p.id === tab.focusedPaneId);
      if (!source) return state;
      const target = findInDirection(source, direction, panes);
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
    // Close-pane row: removes the pane and stops that terminal's runtime
    // synchronously (shell/actions.rs:115-123 -> api/panes.rs:1967-2032 ->
    // actions.rs:628-645 -> runtime.rs:30-41). Model: pane removal + agent
    // status cleared with it; never "keeps running".
    case "closePane": {
      const ws = activeWorkspace(state);
      const tab = activeTab(state);
      const otherPaneInTab = paneCount(tab.root) > 1;
      const otherTabInWorkspace = ws.tabs.length > 1;
      // Confirmation gate (overlay_input.rs:1030-1061): confirm_close && no
      // other pane in this tab && no other tab in the workspace.
      if (!otherPaneInTab && !otherTabInWorkspace) {
        return {
          ...state,
          overlay: { kind: "confirmClose", tabId: tab.id, paneId: tab.focusedPaneId },
        };
      }
      // Only pane in a tab that has siblings: the tab closes
      // (workspace.rs:1118-1130).
      if (!otherPaneInTab) {
        const idx = ws.tabs.findIndex((t) => t.id === tab.id);
        const tabs = ws.tabs.filter((t) => t.id !== tab.id);
        let active = idx;
        if (active >= tabs.length) active = tabs.length - 1;
        else if (idx <= active && active > 0) active -= 1;
        const target = tabs[active];
        if (!target) return state;
        return withWorkspace(state, { ...ws, tabs, activeTabId: target.id });
      }
      const ids = paneIds(tab.root);
      const pos = ids.indexOf(tab.focusedPaneId);
      const ordered = pos + 1 < ids.length ? ids[pos + 1] : ids[pos - 1];
      // ASSUMPTION (FIDELITY Unresolved #4): focus reflow after a close is not
      // traced; this mirrors layout.rs:224-252 (prev focus, else neighbour).
      const newFocus =
        tab.prevFocusId && tab.prevFocusId !== tab.focusedPaneId && ids.includes(tab.prevFocusId)
          ? tab.prevFocusId
          : ordered;
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
      // Copy teardown is not patched here: reconcileCopy runs at the frame
      // boundary for every pane/tab/workspace/focus change (state.rs:1478-1503).
      return withTab(state, acknowledge(next, newFocus));
    }
    // Zoom row: toggles focused pane zoom; pill state matches.
    case "zoom": {
      const tab = activeTab(state);
      return withTab(state, {
        ...tab,
        zoomedPaneId: tab.zoomedPaneId === tab.focusedPaneId ? null : tab.focusedPaneId,
      });
    }
    case "resizeMode":
      return setMode(state, "resize");
    // Sidebar row: toggles client-local chrome only.
    case "toggleSidebar":
      return { ...state, sidebarVisible: !state.sidebarVisible };
    case "help":
      return {
        ...state,
        overlay: { kind: "help", query: "", searchFocused: false, scroll: 0 },
      };
    // Workspace navigation row: navigate mode opens.
    case "workspacePicker": {
      const index = state.workspaces.findIndex((w) => w.id === state.activeWorkspaceId);
      return { ...setMode(state, "navigate"), navigateSelection: Math.max(0, index) };
    }
    // Detach row: client Detach flag only; session state preserved.
    case "detach":
      return { ...state, attached: false };
    // Copy-mode row: prefix+[ enters copy mode for the focused pane.
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
    // Real defaults outside the L1-L3 slice: resolved and consumed, no
    // modelled transition (they must never read as an invalid follow-up).
    case "settings":
    case "editScrollback":
    case "openNotificationTarget":
    case "renamePane":
    case "reloadConfig":
    case "newWorktree":
    case "cyclePaneNext":
    case "cyclePanePrevious":
    case "goto":
    case "newWorkspace":
    case "renameWorkspace":
    case "closeWorkspace":
      return state;
  }
}

// --- key routing ------------------------------------------------------------

interface Routed {
  readonly state: HerdrState;
  readonly effect: Effect;
  readonly action: string | null;
}

/**
 * Chrome controls (src/client/shell/mouse.rs, endpoint_navigation.rs):
 * workspace and tab selection commit, new-tab runs the shared NewTab action,
 * and pane focus uses PaneFocus. Any modeled overlay is outside the chrome
 * surface: a first chrome click dismisses it and does nothing else.
 * Drag, reorder, grouping, scroll, and context menus are out of scope.
 */
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
    case "select-workspace": {
      if (!state.workspaces.some((workspace) => workspace.id === event.workspaceId)) {
        return { state, effect: "none", action: event.action };
      }
      return {
        state: { ...state, activeWorkspaceId: event.workspaceId },
        effect: "action",
        action: event.action,
      };
    }
    case "select-tab": {
      const ws = activeWorkspace(state);
      if (!ws.tabs.some((tab) => tab.id === event.tabId)) {
        return { state, effect: "none", action: event.action };
      }
      return {
        state: withWorkspace(state, { ...ws, activeTabId: event.tabId }),
        effect: "action",
        action: event.action,
      };
    }
    case "new-tab": {
      const next = applyAction(state, "newTab");
      return next === state
        ? { state, effect: "none", action: event.action }
        : { state: next, effect: "action", action: event.action };
    }
    case "focus-pane": {
      const tab = activeTab(state);
      if (!tab.panes.some((pane) => pane.id === event.paneId)) {
        return { state, effect: "none", action: event.action };
      }
      const next = focusPane(state, event.paneId);
      return next === state
        ? { state, effect: "none", action: event.action }
        : { state: next, effect: "action", action: event.action };
    }
  }
}

function routeKey(state: HerdrState, event: KeyEvent): Routed {
  // Detached client: no key reaches the session and nothing mutates (M1).
  if (!state.attached) return { state, effect: "none", action: null };
  // Input trust boundary: an empty key is not a key. Upstream drops modifier
  // reports before routing (input.rs:637-639); an empty normalized key has no
  // binding and must never be forwarded or recorded as player evidence.
  if (event.key.length === 0) return { state, effect: "none", action: null };
  if (event.phase !== "press") {
    // Repeat classification while still in Prefix mode is unresolved
    // (FIDELITY Unresolved #2, lease.rs:130 vs :152); repeats are inert so a
    // held key can never double-fire.
    return { state, effect: "none", action: null };
  }
  const key = event.key;
  const mods = event.modifiers;

  if (state.overlay) return routeOverlayKey(state, key, mods);
  if (state.mode === "prefix") return routePrefixFollowUp(state, key, mods);
  if (state.mode === "navigate") return routeNavigateKey(state, key, mods);
  if (state.mode === "resize") return routeResizeKey(state, key);
  if (state.mode === "copy") return routeCopyKey(state, key, mods);

  // Terminal mode (input.rs:667-680): direct bindings first (none in the
  // default keymap), then the prefix arms one action key.
  if (isPrefixKey(key, mods)) {
    return { state: setMode(state, "prefix"), effect: "prefix-armed", action: "prefix" };
  }
  // Everything else is forwarded to the focused pane, including Esc and Ctrl+[.
  return { state: forwardKey(state, key, mods), effect: "forwarded", action: "forwarded" };
}

function routePrefixFollowUp(state: HerdrState, key: string, mods: readonly Modifier[]): Routed {
  const back = returnMode(state);
  // Second prefix (input.rs:689-693): exits prefix mode and forwards the prefix
  // key to the focused pane unchanged, modifiers included.
  if (isPrefixKey(key, mods)) {
    return {
      state: forwardKey(setMode(state, back), key, mods),
      effect: "prefix-forwarded",
      action: "prefix-forwarded",
    };
  }
  // Escape (input.rs:694-697): exits prefix mode, no action.
  if (key === "escape") {
    return { state: setMode(state, back), effect: "prefix-cancelled", action: "prefix-cancelled" };
  }
  // Valid action (input.rs:699-705).
  const binding = resolvePrefixBinding(key, mods);
  if (binding) {
    return {
      state: applyAction(setMode(state, back), binding.action, binding.index),
      effect: "prefix-resolved",
      action: actionName(binding.action),
    };
  }
  // Invalid follow-up (input.rs:707-709): consumed, no action, nothing forwarded.
  return { state: setMode(state, back), effect: "prefix-consumed", action: "invalid-consumed" };
}

function routeNavigateKey(state: HerdrState, key: string, mods: readonly Modifier[]): Routed {
  // Esc / Ctrl+[ exit (input.rs:754, :925).
  if (key === "escape" || (key === "[" && mods.includes("ctrl"))) {
    return {
      state: setMode(state, returnMode(state)),
      effect: "mode-changed",
      action: "navigate-cancel",
    };
  }
  // Prefix inside navigate mode cancels navigate (input.rs:754 -> cancel_navigate
  // -> copy_or_terminal_mode, :930-934). It does NOT arm prefix mode.
  if (isPrefixKey(key, mods)) {
    return {
      state: setMode(state, returnMode(state)),
      effect: "mode-changed",
      action: "navigate-cancel",
    };
  }
  if (key === "up" || key === "down") {
    // Desktop workspace list wraps (workspace_navigation.rs:143-158, rem_euclid).
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
  // Resize mode entry/exit is verified (input.rs:1043-1050); resize geometry is
  // not modelled in the L1-L3 slice.
  if (key === "escape" || key === "enter") {
    return {
      state: setMode(state, returnMode(state)),
      effect: "mode-changed",
      action: "resize-exit",
    };
  }
  return { state, effect: "none", action: null };
}

function routeCopyKey(state: HerdrState, key: string, mods: readonly Modifier[]): Routed {
  const copy = state.copy;
  if (!copy)
    return { state: setMode(state, "terminal"), effect: "mode-changed", action: "copy-exit" };

  // Search prompt (copy_mode.rs:268-310).
  if (copy.searchPrompt) {
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
            searchQuery: copy.searchPrompt.query,
            searchMatches: copy.searchPrompt.query ? 1 : 0,
            searchCurrent: copy.searchPrompt.query ? 0 : null,
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
            searchPrompt: { ...copy.searchPrompt, query: copy.searchPrompt.query.slice(0, -1) },
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
            searchPrompt: { ...copy.searchPrompt, query: copy.searchPrompt.query + key },
          },
        },
        effect: "action",
        action: "copy-search-edit",
      };
    }
    return { state, effect: "none", action: null };
  }

  // Prefix keeps its meaning in copy mode (input.rs:721-730).
  if (isPrefixKey(key, mods)) {
    return { state: setMode(state, "prefix"), effect: "prefix-armed", action: "prefix" };
  }

  // Esc clears an active selection/search first, else exits (copy_mode.rs:104-140).
  if (key === "escape") {
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
    return {
      state: { ...setMode(state, "terminal"), copy: null },
      effect: "mode-changed",
      action: "copy-exit",
    };
  }
  // Copy/exit (copy_mode.rs:200-215).
  if (key === "q") {
    return {
      state: { ...setMode(state, "terminal"), copy: null },
      effect: "mode-changed",
      action: "copy-exit",
    };
  }
  if (key === "y" || key === "enter") {
    return {
      state: { ...setMode(state, "terminal"), copy: null },
      effect: "action",
      action: "copy-yank",
    };
  }
  if (key === "v" || key === " ") {
    return {
      state: { ...state, copy: { ...copy, selection: true } },
      effect: "action",
      action: "copy-select",
    };
  }
  if (key === "/" || key === "?") {
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
  if (key === "n" || key === "N") {
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
  if (key === "h" || key === "j" || key === "k" || key === "l") {
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
  return { state, effect: "none", action: null };
}

function routeOverlayKey(state: HerdrState, key: string, mods: readonly Modifier[]): Routed {
  const overlay = state.overlay;
  if (!overlay) return { state, effect: "none", action: null };

  if (overlay.kind === "help") {
    // Help row: `/` filters, Backspace edits, ctrl+u clears, Esc/Enter/? close.
    if (overlay.searchFocused) {
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
    if (key === "escape" || key === "enter" || key === "?") {
      return { state: { ...state, overlay: null }, effect: "mode-changed", action: "help-close" };
    }
    if (key === "/") {
      return {
        state: { ...state, overlay: { ...overlay, searchFocused: true, scroll: 0 } },
        effect: "action",
        action: "help-filter-open",
      };
    }
    if (key === "up" || key === "k" || key === "down" || key === "j") {
      const delta = key === "up" || key === "k" ? -1 : 1;
      const rows = helpBindingRows().reduce((total, group) => total + group.rows.length, 0);
      const scroll = Math.min(rows, Math.max(0, overlay.scroll + delta));
      return {
        state: { ...state, overlay: { ...overlay, scroll } },
        effect: "action",
        action: "help-scroll",
      };
    }
    return { state, effect: "none", action: null };
  }

  if (overlay.kind === "rename") {
    // Field editing (FIDELITY Field editing row): printable text, Backspace, Enter/Esc.
    if (key === "escape") {
      return {
        state: { ...state, overlay: null },
        effect: "mode-changed",
        action: "rename-cancel",
      };
    }
    if (key === "enter") {
      if (overlay.target === "new-tab") {
        // overlay_input.rs:967-979: label is kept only when non-empty and
        // different from the pre-filled default; otherwise the tab is created
        // with its auto name (empty input still creates, unlike rename).
        const trimmed = overlay.text.trim();
        const label = trimmed.length > 0 && trimmed !== overlay.defaultName ? trimmed : null;
        const ws = state.workspaces.find((w) => w.id === overlay.workspaceId);
        if (!ws) {
          return {
            state: { ...state, overlay: null },
            effect: "none",
            action: "rename-cancel",
          };
        }
        return {
          state: createNewTabState({ ...state, overlay: null }, label),
          effect: "action",
          action: "rename-commit",
        };
      }
      // overlay_input.rs:939-996: the field is trimmed, the overlay always
      // closes, and an empty-after-trim name emits no rename (the old name
      // stands). This is not the L2 "field stays open" recovery: upstream
      // closes the overlay either way.
      const trimmed = overlay.text.trim();
      if (trimmed.length === 0) {
        return {
          state: { ...state, overlay: null },
          effect: "none",
          action: "rename-empty",
        };
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
    if (key === "backspace") {
      return {
        state: { ...state, overlay: { ...overlay, text: overlay.text.slice(0, -1) } },
        effect: "action",
        action: "rename-edit",
      };
    }
    // Field editing row: Ctrl+U clears to the start of the field.
    if (key === "u" && mods.includes("ctrl")) {
      return {
        state: { ...state, overlay: { ...overlay, text: "" } },
        effect: "action",
        action: "rename-clear",
      };
    }
    if (PRINTABLE.test(key) && mods.length === 0) {
      return {
        state: { ...state, overlay: { ...overlay, text: overlay.text + key } },
        effect: "action",
        action: "rename-edit",
      };
    }
    return { state, effect: "none", action: null };
  }

  // confirmClose: Esc cancels (overlay_input.rs:1060-1070). The accept path is
  // unresolved (FIDELITY Unresolved #5) and is deliberately not implemented.
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
    // Decided hold policy (FIDELITY Unresolved #2 RESOLVED): blur voids a
    // pending prefix. The attempt is voided, never failed, and re-triable.
    // Blur does not dismiss overlays (input.rs:328-336 only releases leases).
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
    // Detach row: reattach restores layout and running state. Regaining focus
    // acknowledges the visible surface (input.rs:320-326, OuterFocusGained ->
    // acknowledge_active_surface_agents).
    const attached = { ...state, attached: true };
    return { state: composeSurface(attached), effect: "mode-changed", action: "reattach" };
  }
  // "focus" and "intercepted": the host consumed the key, so nothing arrives.
  return { state, effect: "none", action: null };
}

// --- process events ---------------------------------------------------------

function routeProcess(state: HerdrState, event: Extract<InputEvent, { kind: "process" }>): Routed {
  const payload = event.process;
  const tab = activeTab(state);
  const pane = tab.panes.find((p) => p.id === payload.paneId);
  if (!pane) return { state, effect: "none", action: null };
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

function assertProvenance(event: InputEvent): void {
  if (event.kind === "key" && !KEY_ORIGINS.has(event.origin)) {
    throw new RangeError(`key event cannot originate from "${event.origin}"`);
  }
  if (event.kind === "process" && !PROCESS_ORIGINS.has(event.origin)) {
    throw new RangeError(`process event cannot originate from "${event.origin}"`);
  }
  if (event.kind === "host" && event.origin !== "host") {
    throw new RangeError(`host event cannot originate from "${event.origin}"`);
  }
  if (
    event.kind === "chrome" &&
    event.origin !== "player" &&
    event.origin !== "script" &&
    event.origin !== "fixture"
  ) {
    throw new RangeError(`chrome event cannot originate from "${event.origin}"`);
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
  if (event.kind === "chrome") return { ...event };
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

export function createStore(initial: HerdrState): HerdrStore {
  // Boundary ownership (M5): copy the caller's initial state so neither side
  // can mutate the other's data, then freeze the copy. Transitions never
  // mutate in place, so a frozen state graph is safe to spread from.
  let state = deepFreeze(structuredClone(initial));
  let cached = deepFreeze(toSnapshot(state));
  const listeners = new Set<() => void>();

  return {
    dispatch(event: InputEvent): JournalEntry {
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
      const next = deepFreeze({ ...reconciled, journal });
      // Compare against the pre-dispatch state so a composition-only change
      // (a cleared done badge) still rebuilds the view model.
      const changed = reconciled !== state;
      state = next;
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

export { createScenario as scenario };
export type { RawAgentState, ProjectedAgentState, PaneApp, Overlay } from "./types";
