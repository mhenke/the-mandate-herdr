import { createContext, useContext, type JSX, type ReactNode } from "react";

/**
 * High-level actions provided by the host application to the UI.
 * Pure UI interface with zero dependency on adapters or simulation stores.
 */
export interface MandateActions {
  readonly selectWorkspace: (workspaceId: string) => void;
  readonly selectTab: (tabId: string) => void;
  readonly newTab: () => void;
  readonly focusPane: (paneId: string) => void;
}

const ActionsContext = createContext<MandateActions | null>(null);

export interface ActionsProviderProps {
  readonly actions: MandateActions;
  readonly children?: ReactNode;
}

export function ActionsProvider({ actions, children }: ActionsProviderProps): JSX.Element {
  return <ActionsContext.Provider value={actions}>{children}</ActionsContext.Provider>;
}

export function useMandateActions(): MandateActions {
  const context = useContext(ActionsContext);
  if (!context) {
    throw new Error("useMandateActions must be used within an ActionsProvider");
  }
  return context;
}
