import { describe, expect, it } from "vitest";

const loaders = import.meta.glob("../src/core/**/*.ts");
const sources = import.meta.glob("../src/core/**/*.ts", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const forbidden = /from\s+['"](react|react-dom)(\/[^'"]*)?['"]/;

describe("core purity", () => {
  it("loads every core module without browser globals", async () => {
    const paths = Object.keys(loaders);
    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) {
      const load = loaders[path];
      expect(load, path).toBeDefined();
      await expect(load?.()).resolves.toBeDefined();
    }
  });

  it("core sources do not import React", () => {
    const paths = Object.keys(sources);
    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) {
      expect(sources[path], path).not.toMatch(forbidden);
    }
  });
});
