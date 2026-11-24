// Accessibility floor: axe on the two shipping screens (title, workspace).
// Failures here are handoff blockers; rules outside the slice are scoped
// out explicitly rather than silently ignored.

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("axe floor: title has no critical violations", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("heading", { name: "The Mandate: Herdr" }).waitFor();
  const results = await new AxeBuilder({ page }).analyze();
  const critical = results.violations.filter((v) => v.impact === "critical");
  expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
});

test("axe floor: workspace has no critical violations", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New investigation" }).click();
  await page.getByRole("button", { name: "Skip to the workspace" }).click();
  await page.getByRole("region", { name: /Simulated Herdr surface/ }).waitFor();
  const results = await new AxeBuilder({ page }).analyze();
  const critical = results.violations.filter((v) => v.impact === "critical");
  expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
});
