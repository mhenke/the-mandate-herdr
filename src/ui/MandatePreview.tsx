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
  /** False in Standard (keyboard-only); true when alternative navigation is enabled. */
  readonly accessible: boolean;
  /** Show the brief Standard-mode keyboard reminder while true. */
  readonly reminder: boolean;
  readonly focusedApp: string | null;
  readonly assignmentAccepted: boolean;
  readonly memoRead: boolean;
  readonly artifactExamined: boolean;
  readonly onPreviewKey: (input: PreviewKeyInput) => void;
  readonly onReleaseRequest: () => void;
  readonly onSetAccessible: (on: boolean) => void;
  readonly onReadMemo: () => void;
  readonly onAcknowledgeAssignment: () => void;
  readonly onExamineArtifact: () => void;
  readonly onSelectWorkspace: (workspaceId: string) => void;
  readonly onSelectTab: (tabId: string) => void;
  readonly onNewTab: () => void;
  readonly onFocusPane: (paneId: string) => void;
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
  // Fictional story actions are page-level controls inside the pane's own
  // context — never framed as Herdr commands, never objective credit.
  const storyControl =
    focusedApp === "memo" && !memoRead ? (
      <button type="button" className="tui-story" onClick={onReadMemo}>
        Mark the memo read
      </button>
    ) : focusedApp === "assignment" && memoRead && !assignmentAccepted ? (
      <button type="button" className="tui-story" onClick={onAcknowledgeAssignment}>
        Accept the assignment
      </button>
    ) : focusedApp === "artifact" && !artifactExamined ? (
      <button type="button" className="tui-story" onClick={onExamineArtifact}>
        Examine the artifact
      </button>
    ) : null;
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
            {pane.output.map((line, index) => (
              <p key={`${pane.id}-out-${index}`}>{line}</p>
            ))}
            {pane.input.length > 0 ? (
              <p className="tui-forwarded" aria-label="Keys forwarded to this pane">
                <span aria-hidden="true">❯ </span>
                {pane.input.join("")}▊
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

function OverlayView({ overlay }: { readonly overlay: Overlay }): JSX.Element {
  if (overlay.kind === "help") {
    const query = overlay.query.toLowerCase();
    const groups = helpBindingRows()
      .map((group) => ({
        ...group,
        rows: group.rows.filter(
          (row) =>
            query.length === 0 || `${row.binding} ${row.label}`.toLowerCase().includes(query),
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
  if (overlay.kind === "rename") {
    // Upstream titles the new-tab prompt "new tab", tab rename "rename tab",
    // workspace rename "rename workspace" (overlay_input.rs:386-408, captures 10/11/15b).
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
  // confirmClose: Esc exits the confirmation (core routeOverlayKey); the
  // accept path is unresolved upstream (FIDELITY Unresolved #5) so no
  // accept key is offered or taught here.
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

export function MandatePreview({
  snapshot,
  captured,
  accessible,
  reminder,
  focusedApp,
  assignmentAccepted,
  memoRead,
  artifactExamined,
  onPreviewKey,
  onReleaseRequest,
  onSetAccessible,
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
              {snapshot.workspaces.map((w) => {
                const active = w.id === snapshot.activeWorkspaceId;
                const activeTab = w.tabs.find((t) => t.id === w.activeTabId);
                return (
                  <button
                    key={w.id}
                    type="button"
                    className={active ? "herdr-ws herdr-ws-active" : "herdr-ws"}
                    aria-current={active ? "true" : undefined}
                    onClick={() => {
                      if (!active) onSelectWorkspace(w.id);
                    }}
                  >
                    <span className="herdr-ws-name">
                      <span className="herdr-ws-dot" aria-hidden="true">
                        ●
                      </span>
                      {w.name}
                    </span>
                    <span className="herdr-ws-tab">{activeTab?.name ?? "—"}</span>
                  </button>
                );
              })}
            </div>
            {/* Pinned bottom chrome: static upstream labels; agent rows come
                from committed pane projections only, never fabricated. */}
            <div className="herdr-side-footer">
              <div className="herdr-side-actions" aria-hidden="true">
                <span>new</span>
                <span>
                  <span className="herdr-menu-dot">●</span> menu
                </span>
              </div>
              <label className="herdr-access">
                <input
                  type="checkbox"
                  checked={accessible}
                  onChange={(event) => onSetAccessible(event.target.checked)}
                />
                Accessible navigation
              </label>
              <div className="herdr-side-rule" aria-hidden="true" />
              <p className="herdr-side-head herdr-side-agents-head">
                agents <span className="herdr-side-grouped">grouped</span>
              </p>
              {tab?.panes.map((pane) => (
                <div className="herdr-agent" key={pane.id}>
                  <p className="herdr-agent-name">
                    <span
                      className={`herdr-agent-dot agent-${pane.agent.projected}`}
                      aria-hidden="true"
                    >
                      ●
                    </span>
                    {workspace?.name ?? "workspace"}
                  </p>
                  <p className="herdr-agent-meta">
                    {pane.title} · {pane.agent.projected}
                  </p>
                </div>
              )) ?? <p className="herdr-agent-meta">No tab.</p>}
            </div>
          </aside>
        ) : null}

        <div className="herdr-main">
          {/* Tabstrip lives here: top of the main column, RIGHT of the sidebar. */}
          <div className="herdr-tabbar">
            <div className="herdr-tabs" role="tablist" aria-label="Tabs">
              {workspace?.tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={t.id === workspace.activeTabId}
                  className={t.id === workspace.activeTabId ? "herdr-tab-active" : "herdr-tab"}
                  onClick={() => {
                    if (t.id !== workspace.activeTabId) onSelectTab(t.id);
                  }}
                >
                  {t.name}
                  {t.zoomPill ? <span className="herdr-zoom"> ZOOM</span> : null}
                </button>
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
