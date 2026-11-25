// Committed-state projection of the simulated Herdr workspace.
// Renders view models only: layout truth follows the user's running Herdr
// reference (full-height narrow sidebar left, tabs top-right of the main
// area, edge-to-edge terminal body, compact chrome) without inventing
// entities. No simulation mutation, no narrative or assessment authority,
// no adapter imports (see eslint boundaries).

import { useEffect, useRef, type JSX } from "react";
import type { HerdrSnapshot, Overlay, TabView } from "../core/herdr/index";
import { helpBindingRows } from "../core/herdr/index";
import { useMandateActions } from "./ActionsContext";

/** Plain key report passed up to the App-owned adapter binding. */
export interface PreviewKeyInput {
  readonly key: string;
  readonly code: string;
  readonly ctrlKey: boolean;
  readonly altKey: boolean;
  readonly shiftKey: boolean;
  readonly metaKey: boolean;
  readonly repeat: boolean;
}

export interface KeyboardToast {
  readonly chord: string;
  readonly altChord?: string;
  readonly action: string;
}

export interface MandatePreviewProps {
  readonly snapshot: HerdrSnapshot;
  readonly paneInputs: Readonly<Record<string, string>>;
  readonly captured: boolean;
  readonly reminder: KeyboardToast | null;
  readonly onPreviewKey: (input: PreviewKeyInput) => boolean;
}

function renderHeaderLine(line: string, key: string): JSX.Element | null {
  if (
    line === "Assignment terminal" ||
    line === "Interview terminal" ||
    line.startsWith("Claude Code") ||
    line.startsWith("CLAUDE CODE") ||
    line.startsWith("AUDIT REFERENCE") ||
    line.startsWith("WITNESS TRANSCRIPT")
  ) {
    return (
      <div key={key} className="term-head">
        {line}
      </div>
    );
  }
  if (
    line === "Reference material stays in this pane." ||
    line === "Source: baseline demonstration" ||
    line.startsWith("BOUNDED AUDIT:") ||
    line.startsWith("CORROBORATION:")
  ) {
    return (
      <div key={key} className="term-dim">
        {line}
      </div>
    );
  }
  return null;
}

function renderPromptLine(line: string, key: string): JSX.Element | null {
  if (line.startsWith("$ ")) {
    return (
      <p key={key} className="term-line">
        <span className="term-dim">$ </span>
        <span>{line.slice(2)}</span>
      </p>
    );
  }
  if (line.startsWith("FROM:")) {
    const parts = line.slice(5).split("//");
    return (
      <p key={key} className="term-line">
        <span className="term-dim">FROM: </span>
        <b>{parts[0]?.trim()}</b>
        {parts.length > 1 ? (
          <span className="term-dim"> // {parts.slice(1).join("//").trim()}</span>
        ) : null}
      </p>
    );
  }
  if (line.startsWith("RE:")) {
    return (
      <p key={key} className="term-line">
        <span className="term-dim">RE: </span>
        <span>{line.slice(3).trim()}</span>
      </p>
    );
  }
  if (line.startsWith("STATUS:") || line.includes("off-record")) {
    return (
      <p key={key} className="term-line">
        <span className="term-dim">STATUS: </span>
        <span className="term-amber">{line.replace(/^STATUS:\s*/, "")}</span>
      </p>
    );
  }
  return null;
}

function renderContentLine(line: string, key: string): JSX.Element {
  if (line.startsWith("01 //") || line.startsWith("02 //") || line.startsWith("03 //")) {
    return (
      <p key={key} className="term-line">
        <span className="term-amber">{line.slice(0, 5)}</span>
        <span>{line.slice(5)}</span>
      </p>
    );
  }
  const numMatch = line.match(/^(\d+)\.\s*(.*)$/);
  if (numMatch) {
    return (
      <p key={key} className="term-line">
        <span className="term-amber">0{numMatch[1]} // </span>
        <span>{numMatch[2]}</span>
      </p>
    );
  }
  if (line.includes("SOURCE-HANDLING")) {
    return (
      <p key={key} className="term-line">
        <b>{line}</b>
      </p>
    );
  }
  if (line.includes("YOUR DESK IS LIVE")) {
    return (
      <p key={key} className="term-line">
        <span className="term-green">{line}</span>
      </p>
    );
  }
  if (line.includes("Assignment accepted")) {
    return (
      <p key={key} className="term-line term-dim">
        {line}
      </p>
    );
  }
  return (
    <p key={key} className="term-line">
      {line}
    </p>
  );
}

function renderLine(line: string, index: number, paneId: string): JSX.Element {
  const key = `${paneId}-ln-${index}`;
  return renderHeaderLine(line, key) ?? renderPromptLine(line, key) ?? renderContentLine(line, key);
}

function ActiveTabView({
  tab,
  paneInputs,
}: {
  readonly tab: TabView;
  readonly paneInputs: MandatePreviewProps["paneInputs"];
}): JSX.Element {
  const actions = useMandateActions();
  const panes =
    tab.zoomedPaneId !== null
      ? tab.panes.filter((pane) => pane.id === tab.zoomedPaneId)
      : tab.panes;
  return (
    <div className="tui-panes" role="group" aria-label={`Tab ${tab.name}`}>
      {panes.map((pane) => (
        <section
          key={pane.id}
          className={pane.id === tab.focusedPaneId ? "tui-pane tui-pane-focused" : "tui-pane"}
          style={{
            left: `${(pane.rect.x / 120) * 100}%`,
            top: `${(pane.rect.y / 40) * 100}%`,
            width: `${(pane.rect.width / 120) * 100}%`,
            height: `${(pane.rect.height / 40) * 100}%`,
          }}
          aria-label={`${pane.title}${pane.id === tab.focusedPaneId ? " (focused)" : ""}`}
          onMouseDown={(event) => {
            if (event.target instanceof HTMLElement && event.target.closest("button")) return;
            actions.focusPane(pane.id);
          }}
        >
          <div className="tui-pane-body">
            {pane.output.map((line, index) => renderLine(line, index, pane.id))}
            {pane.app === "shell" ? (
              <p className="tui-command-line">
                {"$ "}
                {paneInputs[pane.id]}
                {pane.id === tab.focusedPaneId ? (
                  <span className="term-cursor" aria-hidden="true" />
                ) : null}
              </p>
            ) : pane.output.length === 0 ? (
              <p className="tui-empty">No output yet.</p>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  );
}

function HelpOverlayView({
  overlay,
}: {
  readonly overlay: Extract<Overlay, { kind: "help" }>;
}): JSX.Element {
  const query = overlay.query.toLowerCase();
  const groups = helpBindingRows()
    .map((group) => ({
      ...group,
      rows: group.rows.filter(
        (row) => query.length === 0 || `${row.binding} ${row.label}`.toLowerCase().includes(query),
      ),
    }))
    .filter((group) => group.rows.length > 0);
  const shown = groups.flatMap((group) => group.rows).length;
  return (
    <div className="tui-overlay" role="dialog" aria-label="Key bindings">
      <p className="tui-overlay-title">Key bindings (exactly the pinned defaults)</p>
      <p className="tui-overlay-filter">
        {overlay.searchFocused ? `/${overlay.query}▊` : "/ to filter, Esc closes"}
        {query.length > 0 ? ` — ${shown} match${shown === 1 ? "" : "es"}` : ""}
      </p>
      <div className="tui-overlay-rows">
        {groups.map((group) => (
          <div key={group.group}>
            <p className="tui-overlay-group">{group.group}</p>
            {group.rows.map((row) => (
              <p key={`${group.group}-${row.binding}-${row.label}`}>
                <code>{row.binding}</code> {row.label}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function RenameOverlayView({
  overlay,
}: {
  readonly overlay: Extract<Overlay, { kind: "rename" }>;
}): JSX.Element {
  const title =
    overlay.target === "new-tab"
      ? "new tab"
      : overlay.target === "tab"
        ? "rename tab"
        : "rename workspace";
  return (
    <div className="tui-overlay" role="dialog" aria-label={title}>
      <p className="tui-overlay-title">{title}</p>
      <p className="tui-overlay-field">{overlay.text}▊</p>
      <p className="tui-overlay-hint">Enter commits, Esc cancels, Ctrl+U clears</p>
    </div>
  );
}

function ConfirmCloseOverlayView(): JSX.Element {
  return (
    <div className="tui-overlay" role="dialog" aria-label="Confirm close">
      <p className="tui-overlay-title">Close last pane?</p>
      <p className="tui-overlay-hint">
        Esc leaves navigate mode open on the same tab; any other key is held by the confirmation
        (accept path unresolved upstream).
      </p>
    </div>
  );
}

function OverlayView({ overlay }: { readonly overlay: Overlay }): JSX.Element {
  if (overlay.kind === "help") return <HelpOverlayView overlay={overlay} />;
  if (overlay.kind === "rename") return <RenameOverlayView overlay={overlay} />;
  return <ConfirmCloseOverlayView />;
}

type WorkspaceItemView = HerdrSnapshot["workspaces"][number];

function WorkspaceItem({
  workspace,
  isActive,
}: {
  readonly workspace: WorkspaceItemView;
  readonly isActive: boolean;
}): JSX.Element {
  const actions = useMandateActions();
  const activeTab = workspace.tabs.find((t) => t.id === workspace.activeTabId);
  const tabName = workspace.name === "the-mandate" ? "main" : (activeTab?.name ?? "—");
  return (
    <button
      type="button"
      className={isActive ? "herdr-ws herdr-ws-active" : "herdr-ws"}
      aria-current={isActive ? "true" : undefined}
      aria-label={`${workspace.name} ${tabName}`}
      onClick={() => {
        actions.selectWorkspace(workspace.id);
      }}
    >
      <span className="herdr-ws-name">
        <span className="herdr-ws-dot" aria-hidden="true">
          ·
        </span>
        <span className="herdr-ws-label">{workspace.name}</span>
      </span>
      <span className="herdr-ws-tab">{tabName}</span>
    </button>
  );
}

function TabButton({
  tab,
  index,
  isActive,
}: {
  readonly tab: TabView;
  readonly index: number;
  readonly isActive: boolean;
}): JSX.Element {
  const actions = useMandateActions();
  const label = tab.name === "1" || tab.name === "assignment" ? `${index + 1}` : tab.name;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-label={tab.name}
      className={isActive ? "herdr-tab-active" : "herdr-tab"}
      onClick={() => {
        actions.selectTab(tab.id);
      }}
    >
      {label}
      {tab.zoomPill ? <span className="herdr-zoom"> ZOOM</span> : null}
    </button>
  );
}

interface ModeHintItem {
  readonly key: string;
  readonly desc: string;
}

function ModeHints({ hints }: { readonly hints: readonly ModeHintItem[] }) {
  return (
    <>
      {hints.map((hint, idx) => (
        <span key={hint.key}>
          {idx > 0 && "\u00A0\u00A0"}
          <span className="herdr-mode-key">{hint.key}</span>{" "}
          <span className="herdr-mode-desc">{hint.desc}</span>
        </span>
      ))}
    </>
  );
}

function renderModeHints(mode: string, modeBarMode: string): JSX.Element | null {
  if (mode === "navigate" || modeBarMode === "navigate") {
    return (
      <ModeHints
        hints={[
          { key: "esc", desc: "back" },
          { key: "↑/↓", desc: "workspace" },
          { key: "tab", desc: "pane" },
          { key: "?", desc: "keybinds" },
        ]}
      />
    );
  }
  if (mode === "prefix") {
    return (
      <ModeHints
        hints={[
          { key: "esc", desc: "cancel" },
          { key: "ctrl+b", desc: "send prefix" },
          { key: "w", desc: "workspace nav" },
          { key: "?", desc: "keybinds" },
        ]}
      />
    );
  }
  if (mode === "copy" || modeBarMode === "copy") {
    return (
      <ModeHints
        hints={[
          { key: "esc", desc: "cancel" },
          { key: "/", desc: "search" },
          { key: "n/N", desc: "next" },
          { key: "y", desc: "yank" },
        ]}
      />
    );
  }
  if (modeBarMode === "resize") {
    return (
      <ModeHints
        hints={[
          { key: "esc", desc: "done" },
          { key: "←/↓/↑/→", desc: "resize" },
        ]}
      />
    );
  }
  return null;
}

export function MandatePreview({
  snapshot,
  paneInputs,
  captured,
  reminder,
  onPreviewKey,
}: MandatePreviewProps): JSX.Element {
  const actions = useMandateActions();
  const surfaceRef = useRef<HTMLDivElement>(null);
  const workspace = snapshot.workspaces.find((w) => w.id === snapshot.activeWorkspaceId);
  const tab = workspace?.tabs.find((t) => t.id === workspace.activeTabId) ?? null;
  const agents = snapshot.workspaces.flatMap((currentWorkspace) =>
    currentWorkspace.tabs.flatMap((currentTab) =>
      currentTab.panes
        .filter((pane) => pane.agent.projected !== "idle" && pane.agent.projected !== "unknown")
        .map((pane) => ({
          id: pane.id,
          label: `${currentWorkspace.name} · ${currentTab.name}`,
          status: pane.agent.projected,
        })),
    ),
  );

  useEffect(() => {
    if (captured) surfaceRef.current?.focus();
  }, [captured]);

  return (
    <div className="herdr">
      <div className="herdr-body">
        {/* Sidebar spans the full terminal height on the left. */}
        {snapshot.chrome.sidebarVisible ? (
          <aside className="herdr-sidebar" aria-label="Workspaces and agents">
            <div className="herdr-side-spaces">
              <p className="herdr-side-head">spaces</p>
              {snapshot.workspaces.map((w) => (
                <WorkspaceItem
                  key={w.id}
                  workspace={w}
                  isActive={w.id === snapshot.activeWorkspaceId}
                />
              ))}
            </div>
            {/* Pinned bottom chrome: static upstream labels; matches 08-focus-left and video */}
            <div className="herdr-side-footer">
              <div className="herdr-side-actions">
                <span>new</span>
                <span>
                  <span className="herdr-menu-dot">●</span> menu
                </span>
              </div>
              <div className="herdr-side-rule" />
              <p className="herdr-side-head herdr-side-agents-head">
                agents <span className="herdr-side-grouped">grouped</span>
              </p>
              {agents.map((agent) => (
                <div className="herdr-agent" key={agent.id}>
                  <p className="herdr-agent-name">
                    <span className={`herdr-agent-dot agent-${agent.status}`} aria-hidden="true">
                      ●
                    </span>
                    {agent.label}
                  </p>
                  <p className="herdr-agent-meta">{agent.status}</p>
                </div>
              ))}
            </div>
          </aside>
        ) : null}

        <div className="herdr-main">
          {/* Tabstrip lives here: top of the main column, RIGHT of the sidebar. */}
          <div className="herdr-tabbar">
            <div className="herdr-tabs" role="tablist" aria-label="Tabs">
              {workspace?.tabs.map((t, idx) => (
                <TabButton
                  key={t.id}
                  tab={t}
                  index={idx}
                  isActive={t.id === workspace.activeTabId}
                />
              ))}
            </div>
            {/* Outside the tablist: a button is not a valid tablist child. */}
            <button
              type="button"
              className="herdr-newtab"
              aria-label="New tab"
              title="New tab (Ctrl+B C)"
              onClick={() => actions.newTab()}
            >
              +
            </button>
          </div>
          <div
            ref={surfaceRef}
            data-surface="true"
            className={captured ? "herdr-surface" : "herdr-surface herdr-released"}
            tabIndex={0}
            role="region"
            aria-label={
              captured
                ? "Simulated Herdr surface. Keyboard capture engaged. Press Tab to leave, or use the Release capture control."
                : "Simulated Herdr surface. Keyboard capture released."
            }
            onKeyDown={(event) => {
              if (captured && onPreviewKey(event)) event.preventDefault();
            }}
          >
            {tab ? (
              <ActiveTabView tab={tab} paneInputs={paneInputs} />
            ) : (
              <p className="tui-empty">Detached.</p>
            )}
            {snapshot.overlay ? <OverlayView overlay={snapshot.overlay} /> : null}
          </div>
          {snapshot.modeBar.visible || snapshot.mode === "prefix" ? (
            <footer className="herdr-modebar" role="status" aria-live="polite">
              <span className="herdr-modebar-title">
                « {(snapshot.modeBar.visible ? snapshot.modeBar.mode : snapshot.mode).toUpperCase()}
              </span>
              <div className="herdr-modebar-hints">
                {renderModeHints(snapshot.mode, snapshot.modeBar.mode)}
              </div>
            </footer>
          ) : null}
        </div>
      </div>
      {reminder ? (
        <aside className="keyboard-reminder" role="status" aria-live="polite">
          <span className="toast-icon" aria-hidden="true">
            ⌨
          </span>
          <span className="toast-msg">
            Keyboard-only console — use <kbd className="toast-kbd">{reminder.chord}</kbd>
            {reminder.altChord ? (
              <>
                {" "}
                or <kbd className="toast-kbd">{reminder.altChord}</kbd>
              </>
            ) : null}{" "}
            {reminder.action}.
          </span>
        </aside>
      ) : null}
    </div>
  );
}
