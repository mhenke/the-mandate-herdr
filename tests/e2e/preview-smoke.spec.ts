// Full L1 journey in Chromium: real keyboard through the runtime — title,
// cold open, episode, briefing, workspace skills + grounded story actions,
// earned response. Skips credit nothing: the response requires both the
// story condition and the skill predicates (runtime settle).
// Evidence-based: synthetic CDP input per LEVEL.md.

import { expect, test } from "@playwright/test";

test("L1 journey: scenes, real keys, earned response", async ({ page }) => {
  await page.goto("/");

  // Title: Episode I + date inside the presentation, New/Continue in memory.
  await expect(page.getByRole("heading", { name: "The Mandate: Herdr" })).toBeVisible();
  await expect(page.getByText("Episode I — THE LEAK · November 12, 2026")).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue investigation" })).toBeHidden();

  // Cold open: one Skip lands in the workspace, no credit.
  await page.getByRole("button", { name: "New investigation" }).click();
  await expect(page.getByText("Episode I — THE LEAK", { exact: false }).first()).toBeVisible();
  await page.getByRole("button", { name: "Skip to the workspace" }).click();
  await expect(page.getByRole("region", { name: /Simulated Herdr surface/ })).toBeVisible();

  // Release and re-engage from the page.
  await page.getByRole("button", { name: /Release capture/ }).click();
  await expect(page.getByText("Released: keys stay in the page.")).toBeVisible();
  await page.getByRole("button", { name: /Engage capture/ }).click();
  await expect(page.getByText(/Keys go to the simulated surface/)).toBeVisible();

  const surface = page.getByRole("region", { name: /Simulated Herdr surface/ });
  await surface.focus();
  await expect(surface).toBeFocused();

  // In-world order first: read the memo while it is focused (L1 seeds memo
  // focused), then move to the assignment. Typing x there completes O1 AND
  // satisfies the grounded accept precondition in one evidence step.
  await page.getByRole("button", { name: "Mark the memo read" }).click();
  await surface.focus();
  await page.keyboard.press("Control+b");
  await page.keyboard.press("h");
  await page.keyboard.press("x");
  await expect(page.getByLabel(/Keys forwarded to this pane/)).toContainText("x");
  await page.getByRole("button", { name: "Accept the assignment" }).click();
  await expect(page.getByText("Assignment accepted — verify origin.")).toBeVisible();

  // O2 skill: help open (? arrived via Shift+/), filter, Ctrl+U clear, Esc close.
  await page.keyboard.press("Control+b");
  await page.keyboard.press("?");
  await expect(page.getByRole("dialog", { name: "Key bindings" })).toBeVisible();
  await page.keyboard.press("/");
  await page.keyboard.press("a");
  await page.keyboard.press("Control+u");
  await surface.focus();
  await page.keyboard.press("Escape");
  // First Esc leaves the filter field (filter-cancel); second closes help.
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Key bindings" })).toBeHidden();

  // O3 skill: invalid follow-up consumed, terminal restored, pane unchanged.
  await page.keyboard.press("Control+b");
  await page.keyboard.press("y");
  await expect(page.getByRole("region", { name: /Simulated Herdr surface/ })).toBeVisible();

  // Earned response: both story condition and skill predicates held.
  await expect(page.getByRole("heading", { name: "Filed" })).toBeVisible();
  await expect(page.getByText(/Stringer rates/)).toBeVisible();

  // Response continues into the level's next briefing (L2 in this slice's
  // scope); the preview handoff stops at the L2 briefing, not a full L2.
  await page.getByRole("button", { name: "Continue the investigation" }).click();
  await expect(page.getByRole("heading", { name: "Incoming assignment" })).toBeVisible();
  await expect(page.getByText(/headers stripped/)).toBeVisible();
});

test("hint request records assistance without breaking the journey", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New investigation" }).click();
  await page.getByRole("button", { name: "Skip to the workspace" }).click();
  const surface = page.getByRole("region", { name: /Simulated Herdr surface/ });
  await expect(surface).toBeVisible();

  await page.getByText(/Hints/).first().click();
  await page.getByRole("button", { name: "Request a hint" }).click();
  await expect(page.getByText(/prefix arms exactly/).first()).toBeVisible();
});

test("Tab leaves the surface so the release control stays reachable", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New investigation" }).click();
  await page.getByRole("button", { name: "Skip to the workspace" }).click();
  const surface = page.getByRole("region", { name: /Simulated Herdr surface/ });
  await expect(surface).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(surface).not.toBeFocused();
});

test("blocked cinematic falls back to still + accessible Skip", async ({ page }) => {
  // Force the failure path: the shipped mp4 never loads, so the player
  // reports the still fallback and the Skip stays available from frame 0.
  await page.route("**/cinematics/episode-one/cold-open.mp4", (route) => route.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "New investigation" }).click();
  await expect(page.locator('img.scene-poster[data-fallback="still"]')).toBeVisible();
  const skip = page.getByRole("button", { name: "Skip to the workspace" });
  await expect(skip).toBeVisible();
  await skip.click();
  await expect(page.getByRole("region", { name: /Simulated Herdr surface/ })).toBeVisible();
});

test("reduced motion shows still + text + Skip, never autoplay", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "New investigation" }).click();
  await expect(page.locator("video.scene-video")).toHaveCount(0);
  await expect(page.locator('img.scene-poster[data-fallback="still"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "Skip to the workspace" })).toBeVisible();
});
