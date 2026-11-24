// React binding for the committed investigation view model.
// useSyncExternalStore with the session's own stable subscribe/getSnapshot:
// snapshots are deeply frozen and keep Object.is identity until state changes.

import { useSyncExternalStore } from "react";

export interface InvestigationSubscribe {
  (listener: () => void): () => void;
}

export interface InvestigationSnapshotLike {
  readonly phase: string;
}

/**
 * Structural binding: the App owns the adapter import; the hook only needs
 * the session's stable subscribe/getSnapshot pair. Keeps src/ui free of
 * adapter imports (boundary rule) without weakening the subscription.
 */
export function useInvestigationSnapshot<T>(
  subscribe: InvestigationSubscribe,
  getSnapshot: () => T,
): T {
  return useSyncExternalStore(subscribe, getSnapshot);
}
