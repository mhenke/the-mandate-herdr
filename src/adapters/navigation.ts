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
  "not-found": "404",
};

export const PHASE_TITLES: Record<Phase, string> = {
  title: "The Mandate: Herdr",
  "cold-open": "Cold Open — The Mandate: Herdr",
  episode: "Episode I — The Mandate: Herdr",
  briefing: "Briefing — The Mandate: Herdr",
  workspace: "Workspace — The Mandate: Herdr",
  response: "Filed — The Mandate: Herdr",
  complete: "Complete — The Mandate: Herdr",
  "not-found": "404 Record Not Found — The Mandate: Herdr",
};

export function phaseToPath(phase: Phase, baseUrl = "/"): string {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const sub = PHASE_PATHS[phase];
  return sub ? `${normalizedBase}${sub}` : normalizedBase;
}

export function pathToPhase(pathname: string, hash = "", baseUrl = "/"): Phase | null {
  if (hash) {
    const cleanedHash = hash.replace(/^#\/?/, "").split("?")[0] ?? "";
    if (Object.hasOwn(PHASE_PATHS, cleanedHash)) {
      return cleanedHash as Phase;
    }
    if (cleanedHash === "" || cleanedHash === "title") {
      return "title";
    }
    return "not-found";
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
  for (const [phaseKey, subPath] of Object.entries(PHASE_PATHS)) {
    if (subPath && relative === subPath) {
      return phaseKey as Phase;
    }
  }
  return "not-found";
}
