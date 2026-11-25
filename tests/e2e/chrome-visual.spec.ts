import { expect, test } from "@playwright/test";

test("chrome visual evidence: startup, Herdr, workspace, and split panes", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/workspace");
  const terminal = page.getByRole("region", { name: /Terminal\. Type herdr/ });
  await expect(terminal).toBeVisible();
  await page.screenshot({ path: "/tmp/opencode/mandate-final/final-startup-terminal.png" });

  await terminal.focus();
  await page.keyboard.type("herdr");
  await page.keyboard.press("Enter");
  const surface = page.getByRole("region", { name: /Simulated Herdr surface/ });
  await expect(surface).toBeVisible();
  await page.screenshot({ path: "/tmp/opencode/mandate-final/final-herdr-default.png" });

  await surface.focus();
  await page.keyboard.press("Control+b");
  await page.keyboard.press("w");
  await expect(page.locator(".herdr-modebar")).toHaveText("« NAVIGATE");
  await page.screenshot({ path: "/tmp/opencode/mandate-final/final-modebar-navigate.png" });
  await page.keyboard.press("Escape");
  await expect(page.locator(".herdr-modebar")).toHaveCount(0);

  await page.keyboard.press("Control+b");
  await page.keyboard.press("Shift+n");
  await page.keyboard.type("investigation");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Control+b");
  await page.keyboard.press("c");
  await page.keyboard.type("research");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("tab", { name: "research" })).toBeVisible();
  await page.screenshot({ path: "/tmp/opencode/mandate-final/final-l1-workspace.png" });

  await page.keyboard.press("Control+b");
  await page.keyboard.press("v");
  await expect(page.locator(".tui-pane")).toHaveCount(2);
  await page.keyboard.press("Control+b");
  await page.keyboard.press("h");
  await page.keyboard.press("Control+b");
  await page.keyboard.press("l");
  await page.screenshot({ path: "/tmp/opencode/mandate-final/final-split-panes.png" });
});
