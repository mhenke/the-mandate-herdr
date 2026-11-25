import { expect, test, type Page } from "@playwright/test";

async function launchHerdr(page: Page): Promise<void> {
  await page.goto("/workspace");
  const terminal = page.getByRole("region", { name: /Terminal\. Type herdr/ });
  await expect(terminal).toBeVisible();
  await terminal.focus();
  await page.keyboard.type("herdr");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: /Simulated Herdr surface/ })).toBeVisible();
}

test("the direct workspace route opens an idle terminal", async ({ page }) => {
  await page.goto("/workspace");
  await expect(page.getByRole("region", { name: /Terminal\. Type herdr/ })).toBeVisible();
  await expect(page.locator(".cinema-stage")).toHaveCount(0);
  await expect(page.getByText(/Herdr v0\.9\.5/)).toHaveCount(0);
});

test("the optional cold open can be skipped to the idle terminal", async ({ page }) => {
  await page.goto("/title");
  await page.getByRole("button", { name: "New investigation" }).click();
  await expect(page.locator(".cinema-stage")).toBeVisible();
  await page.getByRole("button", { name: "Skip to the workspace" }).click();
  await expect(page.getByRole("region", { name: /Terminal\. Type herdr/ })).toBeVisible();
});

test("hint request records assistance without breaking the journey", async ({ page }) => {
  await launchHerdr(page);

  await page.getByText(/Hints/).first().click();
  await page.getByRole("button", { name: "Request a hint" }).click();
  await expect(
    page.getByText("The terminal is ready. Type herdr and press Enter.", { exact: true }),
  ).toBeVisible();
});

test("Tab leaves the surface so the release control stays reachable", async ({ page }) => {
  await launchHerdr(page);
  const surface = page.getByRole("region", { name: /Simulated Herdr surface/ });
  await expect(surface).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(surface).not.toBeFocused();
});

test("blocked cinematic falls back to still and keeps Skip available", async ({ page }) => {
  await page.route("**/cinematics/episode-one/cold-open.mp4", (route) => route.abort());
  await page.goto("/title");
  await page.getByRole("button", { name: "New investigation" }).click();
  await expect(page.locator('img.scene-poster[data-fallback="still"]')).toBeVisible();
  const skip = page.getByRole("button", { name: "Skip to the workspace" });
  await expect(skip).toBeVisible();
  await skip.click();
  await expect(page.getByRole("region", { name: /Terminal\. Type herdr/ })).toBeVisible();
});

test("reduced motion shows the still and keeps Skip available", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/title");
  await page.getByRole("button", { name: "New investigation" }).click();
  await expect(page.locator("video.scene-video")).toHaveCount(0);
  await expect(page.locator('img.scene-poster[data-fallback="still"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "Skip to the workspace" })).toBeVisible();
});
