// Accessibility floor: axe on the optional title scene and the Herdr surface.
// Failures here block handoff. Other impacts stay scoped to their own review.

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("axe floor: optional title has no critical violations", async ({ page }) => {
  await page.goto("/title");
  await page.getByRole("heading", { name: "The Mandate: Herdr" }).waitFor();
  const results = await new AxeBuilder({ page }).analyze();
  const critical = results.violations.filter((v) => v.impact === "critical");
  expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
});

test("axe floor: Herdr surface has no critical violations", async ({ page }) => {
  await page.goto("/workspace");
  const terminal = page.getByRole("region", { name: /Terminal\. Type herdr/ });
  await expect(terminal).toBeVisible();
  await terminal.focus();
  await page.keyboard.type("herdr");
  await page.keyboard.press("Enter");
  await page.getByRole("region", { name: /Simulated Herdr surface/ }).waitFor();
  const results = await new AxeBuilder({ page }).analyze();
  const critical = results.violations.filter((v) => v.impact === "critical");
  expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
});
