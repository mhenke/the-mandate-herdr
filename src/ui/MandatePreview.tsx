// Committed-state projection of the simulated Herdr workspace.
// Renders view models only: layout truth follows the user's running Herdr
// reference (full-height narrow sidebar left, tabs top-right of the main
// area, edge-to-edge terminal body, compact chrome) without inventing
// entities. No simulation mutation, no narrative or assessment authority,
// no adapter imports (see eslint boundaries).

import { useEffect, useRef, type JSX } from "react";
import type { HerdrSnapshot, Overlay, TabView } from "../core/herdr/index";
import { helpBindingRows } from "../core/herdr/index";

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

export interface MandatePreviewProps {
  readonly snapshot: HerdrSnapshot;
  readonly captured: boolean;
  /** Show the brief Standard-mode keyboard reminder while true. */
  readonly reminder: boolean;
  readonly focusedApp: string | null;
  readonly assignmentAccepted: boolean;
  readonly memoRead: boolean;
  readonly artifactExamined: boolean;
  readonly onPreviewKey: (input: PreviewKeyInput) => void;
  readonly onReleaseRequest: () => void;
  readonly onReadMemo: () => void;
  readonly onAcknowledgeAssignment: () => void;
  readonly onExamineArtifact: () => void;
  readonly onSelectWorkspace: (workspaceId: string) => void;
  readonly onSelectTab: (tabId: string) => void;
  readonly onNewTab: () => void;
  readonly onFocusPane: (paneId: string) => void;
}

function renderHeaderLine(line: string, key: string): JSX.Element | null {
  if (line === "Assignment terminal" || line === "Interview terminal") {
    return (
      <div key={key} className="term-head">
        {line}
      </div>
    );
  }
  if (
    line === "Reference material stays in this pane." ||
    line === "Source: baseline demonstration"
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

function StoryControlButton({
  focusedApp,
  memoRead,
  assignmentAccepted,
  artifactExamined,
  onReadMemo,
  onAcknowledgeAssignment,
  onExamineArtifact,
}: {
  readonly focusedApp: string | null;
  readonly memoRead: boolean;
  readonly assignmentAccepted: boolean;
  readonly artifactExamined: boolean;
  readonly onReadMemo: () => void;
  readonly onAcknowledgeAssignment: () => void;
  readonly onExamineArtifact: () => void;
}): JSX.Element | null {
  if (focusedApp === "memo" && !memoRead) {
    return (
      <button type="button" className="tui-story" onClick={onReadMemo}>
        <span className="key-badge" aria-hidden="true">
          M
        </span>{" "}
        Mark the memo read
      </button>
    );
  }
  if (focusedApp === "assignment" && memoRead && !assignmentAccepted) {
    return (
      <button type="button" className="tui-story" onClick={onAcknowledgeAssignment}>
        <span className="key-badge" aria-hidden="true">
          A
        </span>{" "}
        Accept the assignment
      </button>
    );
  }
  if (focusedApp === "artifact" && !artifactExamined) {
    return (
      <button type="button" className="tui-story" onClick={onExamineArtifact}>
        <span className="key-badge" aria-hidden="true">
          E
        </span>{" "}
        Examine the artifact
      </button>
    );
  }
  return null;
}

function ActiveTabView({
  tab,
  focusedApp,
  assignmentAccepted,
  memoRead,
  artifactExamined,
  onReadMemo,
  onAcknowledgeAssignment,
  onExamineArtifact,
  onFocusPane,
}: {
  readonly tab: TabView;
  readonly focusedApp: string | null;
  readonly assignmentAccepted: boolean;
  readonly memoRead: boolean;
  readonly artifactExamined: boolean;
  readonly onReadMemo: () => void;
  readonly onAcknowledgeAssignment: () => void;
  readonly onExamineArtifact: () => void;
  readonly onFocusPane: (paneId: string) => void;
}): JSX.Element {
  const panes =
    tab.zoomedPaneId !== null
      ? tab.panes.filter((pane) => pane.id === tab.zoomedPaneId)
      : tab.panes;
  const storyControl = (
    <StoryControlButton
      focusedApp={focusedApp}
      memoRead={memoRead}
      assignmentAccepted={assignmentAccepted}
      artifactExamined={artifactExamined}
      onReadMemo={onReadMemo}
      onAcknowledgeAssignment={onAcknowledgeAssignment}
      onExamineArtifact={onExamineArtifact}
    />
  );
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
            // Pointer focus is view-only: route through the chrome callback
            // (no story ack here, no focus theft from the story buttons).
            if (event.target instanceof HTMLElement && event.target.closest("button")) return;
            if (pane.id !== tab.focusedPaneId) onFocusPane(pane.id);
          }}
        >
          <div className="tui-pane-body">
            {pane.output.map((line, index) => renderLine(line, index, pane.id))}
            {pane.input.length > 0 ? (
              <p className="tui-forwarded" aria-label="Keys forwarded to this pane">
                <span className="term-dim" aria-hidden="true">
                  ❯{" "}
                </span>
                {pane.input.join("")}
                <span className="term-cursor" aria-hidden="true">
                  ▊
                </span>
              </p>
            ) : null}
            {pane.output.length === 0 && pane.input.length === 0 ? (
              <p className="tui-empty">No output yet.</p>
            ) : null}
            {pane.id === tab.focusedPaneId ? storyControl : null}
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
  onSelect,
}: {
  readonly workspace: WorkspaceItemView;
  readonly isActive: boolean;
  readonly onSelect: () => void;
}): JSX.Element {
  const activeTab = workspace.tabs.find((t) => t.id === workspace.activeTabId);
  const tabName = workspace.name === "the-mandate" ? "main" : (activeTab?.name ?? "—");
  return (
    <button
      type="button"
      className={isActive ? "herdr-ws herdr-ws-active" : "herdr-ws"}
      aria-current={isActive ? "true" : undefined}
      onClick={() => {
        if (!isActive) onSelect();
      }}
    >
      <span className="herdr-ws-name">
        <span className="herdr-ws-dot" aria-hidden="true">
          ●
        </span>
        {workspace.name}
      </span>
      <span className="herdr-ws-tab">{tabName}</span>
    </button>
  );
}

function TabButton({
  tab,
  index,
  isActive,
  onSelect,
}: {
  readonly tab: TabView;
  readonly index: number;
  readonly isActive: boolean;
  readonly onSelect: () => void;
}): JSX.Element {
  const label = tab.name === "1" || tab.name === "assignment" ? `${index + 1}` : tab.name;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-label={tab.name}
      className={isActive ? "herdr-tab-active" : "herdr-tab"}
      onClick={() => {
        if (!isActive) onSelect();
      }}
    >
      {label}
      {tab.zoomPill ? <span className="herdr-zoom"> ZOOM</span> : null}
    </button>
  );
}

export function MandatePreview({
  snapshot,
  captured,
  reminder,
  focusedApp,
  assignmentAccepted,
  memoRead,
  artifactExamined,
  onPreviewKey,
  onReleaseRequest,
  onReadMemo,
  onAcknowledgeAssignment,
  onExamineArtifact,
  onSelectWorkspace,
  onSelectTab,
  onNewTab,
  onFocusPane,
}: MandatePreviewProps): JSX.Element {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const workspace = snapshot.workspaces.find((w) => w.id === snapshot.activeWorkspaceId);
  const tab = workspace?.tabs.find((t) => t.id === workspace.activeTabId) ?? null;

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
                  onSelect={() => onSelectWorkspace(w.id)}
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
              <div className="herdr-agent">
                <p className="herdr-agent-name">
                  <span className="herdr-agent-dot agent-working" aria-hidden="true">
                    ●
                  </span>
                  the-mandate
                </p>
                <p className="herdr-agent-meta">stringer</p>
              </div>
              <div className="herdr-agent">
                <p className="herdr-agent-name">
                  <span className="herdr-agent-dot agent-blocked" aria-hidden="true">
                    ●
                  </span>
                  the-mandate
                </p>
                <p className="herdr-agent-meta">codex</p>
              </div>
              <div className="herdr-collapse-toggle">«</div>
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
                  onSelect={() => onSelectTab(t.id)}
                />
              ))}
            </div>
            {/* Outside the tablist: a button is not a valid tablist child. */}
            <button
              type="button"
              className="herdr-newtab"
              aria-label="New tab"
              title="New tab"
              onClick={onNewTab}
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
              if (!captured) return;
              // Plain Tab always leaves the surface so the Release control
              // stays keyboard-reachable. This is a browser accessibility
              // constraint of this preview, not authentic upstream behavior
              // (Herdr binds prefix+Tab to cycle panes).
              if (event.key === "Tab" && !event.ctrlKey && !event.altKey && !event.metaKey) return;
              if (event.key.startsWith("F") && /^F\d+$/.test(event.key)) return;
              // Reserved browser chords (e.g. Ctrl+W) are never claimed:
              // handled=false leaves default behavior with the browser.
              if (
                event.ctrlKey &&
                (event.key === "w" || event.key === "W") &&
                !event.altKey &&
                !event.metaKey
              )
                return;
              onPreviewKey({
                key: event.key,
                code: event.code,
                ctrlKey: event.ctrlKey,
                altKey: event.altKey,
                shiftKey: event.shiftKey,
                metaKey: event.metaKey,
                repeat: event.repeat,
              });
              event.preventDefault();
            }}
          >
            {tab ? (
              <ActiveTabView
                tab={tab}
                focusedApp={focusedApp}
                assignmentAccepted={assignmentAccepted}
                memoRead={memoRead}
                artifactExamined={artifactExamined}
                onReadMemo={onReadMemo}
                onAcknowledgeAssignment={onAcknowledgeAssignment}
                onExamineArtifact={onExamineArtifact}
                onFocusPane={onFocusPane}
              />
            ) : (
              <p className="tui-empty">Detached.</p>
            )}
            {snapshot.overlay ? <OverlayView overlay={snapshot.overlay} /> : null}
            {captured ? null : (
              <div className="tui-paused">
                <p>Capture released — typing stays in the page.</p>
                <button type="button" onClick={onReleaseRequest}>
                  Re-engage capture
                </button>
              </div>
            )}
          </div>
          {snapshot.modeBar.visible ? (
            <p className="herdr-modebar" aria-live="polite">
              « {snapshot.modeBar.mode.toUpperCase()}
            </p>
          ) : null}
        </div>
      </div>
      {reminder ? (
        <p className="keyboard-reminder" role="status">
          Keyboard-only console — use Herdr&apos;s key bindings.
        </p>
      ) : null}
    </div>
  );
}
