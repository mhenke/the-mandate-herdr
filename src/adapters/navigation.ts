// URL path mapping and history synchronization for theatrical phases.
// Stack minimality: native browser History API, zero router dependencies.

import type { Phase } from "./investigation-session";

export const PHASE_PATHS: Record<Phase, string> = {
  title: "",
  "cold-open": "cold-open",
  episode: "episode",
  briefing: "briefing",
  workspace: "workspace",
  response: "response",
  complete: "complete",
};

export const PHASE_TITLES: Record<Phase, string> = {
  title: "The Mandate: Herdr",
  "cold-open": "Cold Open — The Mandate: Herdr",
  episode: "Episode I — The Mandate: Herdr",
  briefing: "Briefing — The Mandate: Herdr",
  workspace: "Workspace — The Mandate: Herdr",
  response: "Filed — The Mandate: Herdr",
  complete: "Complete — The Mandate: Herdr",
};

export function phaseToPath(phase: Phase, baseUrl = "/"): string {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const sub = PHASE_PATHS[phase];
  return sub ? `${normalizedBase}${sub}` : normalizedBase;
}

export function pathToPhase(pathname: string, hash = "", baseUrl = "/"): Phase | null {
  if (hash) {
    const cleanedHash = hash.replace(/^#\/?/, "").split("?")[0] ?? "";
    if (cleanedHash in PHASE_PATHS) {
      return cleanedHash as Phase;
    }
    if (cleanedHash === "" || cleanedHash === "title") {
      return "title";
    }
  }

  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  let relative = pathname;
  if (pathname.startsWith(normalizedBase)) {
    relative = pathname.slice(normalizedBase.length);
  } else if (pathname.startsWith("/")) {
    relative = pathname.slice(1);
  }
  relative = (relative.split("?")[0] ?? "").replace(/\/$/, "");

  if (!relative || relative === "title") {
    return "title";
  }
  if (relative in PHASE_PATHS) {
    return relative as Phase;
  }
  return null;
}
