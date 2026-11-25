import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ActionsProvider, useMandateActions, type MandateActions } from "../src/ui/ActionsContext";

describe("ActionsContext", () => {
  it("throws when useMandateActions is used outside ActionsProvider", () => {
    function Consumer() {
      useMandateActions();
      return null;
    }
    expect(() => renderToStaticMarkup(React.createElement(Consumer))).toThrow(
      "useMandateActions must be used within an ActionsProvider",
    );
  });

  it("provides actions to consumer within ActionsProvider", () => {
    let capturedActions: MandateActions | null = null;
    const actions: MandateActions = {
      selectWorkspace: vi.fn(),
      selectTab: vi.fn(),
      newTab: vi.fn(),
      focusPane: vi.fn(),
    };

    function Consumer() {
      capturedActions = useMandateActions();
      return null;
    }

    renderToStaticMarkup(
      React.createElement(ActionsProvider, { actions }, React.createElement(Consumer)),
    );

    expect(capturedActions).toBe(actions);
    actions.selectWorkspace("ws-1");
    expect(actions.selectWorkspace).toHaveBeenCalledWith("ws-1");
    actions.selectTab("tab-1");
    expect(actions.selectTab).toHaveBeenCalledWith("tab-1");
    actions.newTab();
    expect(actions.newTab).toHaveBeenCalledTimes(1);
    actions.focusPane("pane-1");
    expect(actions.focusPane).toHaveBeenCalledWith("pane-1");
  });
});
