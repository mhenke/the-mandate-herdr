import fc from "fast-check";
import { describe, expect, it } from "vitest";
import type { Phase } from "../src/adapters/investigation-session";
import { PHASE_PATHS, PHASE_TITLES, pathToPhase, phaseToPath } from "../src/adapters/navigation";

const ALL_PHASES: Phase[] = [
  "title",
  "cold-open",
  "episode",
  "briefing",
  "workspace",
  "response",
  "complete",
  "not-found",
];

const arbitraryPhase: fc.Arbitrary<Phase> = fc.constantFrom(...ALL_PHASES);

const arbitraryBaseUrl: fc.Arbitrary<string> = fc.constantFrom(
  "/",
  "/the-mandate",
  "/the-mandate/",
  "/mandate/v1",
  "/nested/deep/base/",
);

describe("navigation property tests", () => {
  it("property: phaseToPath -> pathToPhase is a bijective roundtrip for all phases and base URLs", () => {
    fc.assert(
      fc.property(arbitraryPhase, arbitraryBaseUrl, (phase, baseUrl) => {
        const path = phaseToPath(phase, baseUrl);
        const recovered = pathToPhase(path, "", baseUrl);
        expect(recovered).toBe(phase);
      }),
    );
  });

  it("property: hash-based routing directly resolves every phase", () => {
    fc.assert(
      fc.property(arbitraryPhase, (phase) => {
        const hashTarget = PHASE_PATHS[phase];
        const hashWithPrefix = `#/${hashTarget}`;
        expect(pathToPhase("/", hashWithPrefix)).toBe(phase);

        const hashWithoutSlash = `#${hashTarget}`;
        expect(pathToPhase("/", hashWithoutSlash)).toBe(phase);
      }),
    );
  });

  it("property: pathToPhase never throws on arbitrary pathnames, hashes, and base URLs", () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), fc.string(), (pathname, hash, baseUrl) => {
        const result = pathToPhase(pathname, hash, baseUrl);
        // Must either resolve to a known Phase or safely return null
        if (result !== null) {
          expect(ALL_PHASES).toContain(result);
        }
      }),
    );
  });

  it("property: query parameters and trailing slashes do not break path resolution", () => {
    fc.assert(
      fc.property(
        arbitraryPhase,
        arbitraryBaseUrl,
        fc.array(
          fc.tuple(fc.string({ minLength: 1, maxLength: 8 }), fc.string({ maxLength: 10 })),
          {
            maxLength: 3,
          },
        ),
        fc.boolean(),
        (phase, baseUrl, queryParams, trailingSlash) => {
          let path = phaseToPath(phase, baseUrl);
          if (trailingSlash && !path.endsWith("/")) {
            path += "/";
          }
          if (queryParams.length > 0) {
            const qs = queryParams
              .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
              .join("&");
            path += `?${qs}`;
          }
          const recovered = pathToPhase(path, "", baseUrl);
          expect(recovered).toBe(phase);
        },
      ),
    );
  });

  it("property: every phase has a non-empty human-readable page title", () => {
    fc.assert(
      fc.property(arbitraryPhase, (phase) => {
        const title = PHASE_TITLES[phase];
        expect(typeof title).toBe("string");
        expect(title.length).toBeGreaterThan(0);
        expect(title).toContain("The Mandate: Herdr");
      }),
    );
  });
});
