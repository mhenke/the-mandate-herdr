import { expect, test } from "@playwright/test";

test("chrome visual evidence: default, focused pane, new tab", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/");
  await page.getByRole("button", { name: "New investigation" }).click();
  await page.getByRole("button", { name: "Skip to the workspace" }).click();
  await expect(page.getByRole("region", { name: /Simulated Herdr surface/ })).toBeVisible();
  await page.screenshot({ path: "/tmp/opencode/mandate-final/final-workspace-default.png" });
  await expect(page.getByText(/attached · terminal/)).toHaveCount(0);

  const surface = page.getByRole("region", { name: /Simulated Herdr surface/ });
  await surface.focus();
  await page.keyboard.press("Control+b");
  await page.keyboard.press("w");
  await expect(page.locator(".herdr-modebar")).toHaveText("« NAVIGATE");
  await page.screenshot({ path: "/tmp/opencode/mandate-final/final-modebar-navigate.png" });
  await page.keyboard.press("Escape");
  await expect(page.locator(".herdr-modebar")).toHaveCount(0);

  // Pointer chrome is refused in Standard mode; this visual evidence uses the
  // Accessible alternative-navigation path.
  await page.getByRole("checkbox", { name: "Accessible navigation" }).check();
  await page
    .locator(".tui-pane")
    .first()
    .click({ position: { x: 24, y: 24 } });
  await expect(page.getByLabel(/Assignment \(focused\)/)).toBeVisible();
  await page.screenshot({ path: "/tmp/opencode/mandate-final/final-focused-pane.png" });

  const beforeTabCount = await page.getByRole("tab").count();
  await page.getByRole("button", { name: "New tab" }).click();
  // Core default opens the new-tab name prompt; Enter commits the actual tab.
  await expect(page.getByRole("dialog", { name: "new tab" })).toBeVisible();
  await page.screenshot({ path: "/tmp/opencode/mandate-final/final-new-tab-prompt.png" });
  await page.getByRole("region", { name: /Simulated Herdr surface/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("tab")).toHaveCount(beforeTabCount + 1);
  await page.screenshot({ path: "/tmp/opencode/mandate-final/final-new-tab.png" });
});
