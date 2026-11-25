// Screenshots for handoff review: the optional title, startup terminal, and L1 Herdr workspace.

import { expect, test } from "@playwright/test";

test("shots: optional title, startup terminal, Herdr, and investigation workspace", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));

  await page.goto("/title");
  await page.getByRole("heading", { name: "The Mandate: Herdr" }).waitFor();
  await page.screenshot({ path: "/tmp/opencode/mandate-final/l1-optional-title-1440.png" });

  await page.goto("/workspace");
  const terminal = page.getByRole("region", { name: /Terminal\. Type herdr/ });
  await terminal.waitFor();
  await page.screenshot({ path: "/tmp/opencode/mandate-final/l1-startup-terminal-1440.png" });
  await terminal.focus();
  await page.keyboard.type("herdr");
  await page.keyboard.press("Enter");

  const surface = page.getByRole("region", { name: /Simulated Herdr surface/ });
  await surface.waitFor();
  await page.screenshot({ path: "/tmp/opencode/mandate-final/l1-herdr-default-1440.png" });

  await surface.focus();
  await page.keyboard.press("Control+b");
  await page.keyboard.press("Shift+n");
  await page.keyboard.type("investigation");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Control+b");
  await page.keyboard.press("c");
  await page.keyboard.type("research");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("tab", { name: "research" })).toBeVisible();
  await page.screenshot({ path: "/tmp/opencode/mandate-final/l1-workspace-1440.png" });

  const favicon404 = errors.filter((error) => error.includes("favicon"));
  expect(favicon404, `favicon console errors: ${JSON.stringify(errors)}`).toEqual([]);
});

test("no vertical scroll on the startup terminal at desktop sizes", async ({ page }) => {
  for (const size of [
    { width: 1577, height: 822 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(size);
    await page.goto("/workspace");
    const terminal = page.getByRole("region", { name: /Terminal\. Type herdr/ });
    await terminal.waitFor();
    const bounds = await terminal.boundingBox();
    const overflow = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
    }));
    expect(
      overflow.scrollHeight,
      `scrollHeight ${overflow.scrollHeight} > viewport ${overflow.innerHeight} at ${size.width}x${size.height}`,
    ).toBeLessThanOrEqual(overflow.innerHeight + 1);
    expect(bounds, "startup terminal missing").not.toBeNull();
    const terminalBottom = bounds ? bounds.y + bounds.height : undefined;
    expect(
      terminalBottom,
      `terminal bottom ${terminalBottom} below viewport ${size.height}`,
    ).toBeLessThanOrEqual(size.height + 1);
  }
});
