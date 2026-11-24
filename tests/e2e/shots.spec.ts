// Screenshots for the handoff review. Not a gameplay test: captures title,
// cold open (video element removed so the still carries the frame), and the
// workspace after the grounded read + focus + input step.

import { expect, test } from "@playwright/test";

test("shots: title, cold open poster, workspace", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  await page.goto("/");
  await page.getByRole("heading", { name: "The Mandate: Herdr" }).waitFor();
  await page.screenshot({ path: "/tmp/opencode/mandate-final/l1-title-1440.png" });
  await page.getByRole("button", { name: "New investigation" }).click();
  await page.locator(".cinema-stage").waitFor();
  await page.evaluate(() => document.querySelector("video.scene-video")?.remove());
  await page.screenshot({ path: "/tmp/opencode/mandate-final/l1-coldopen-1440.png" });
  await page.getByRole("button", { name: "Skip to the workspace" }).click();
  await page.getByRole("region", { name: /Simulated Herdr surface/ }).waitFor();
  await page.getByRole("button", { name: "Mark the memo read" }).click();
  await page.keyboard.press("Control+b");
  await page.keyboard.press("h");
  await page.keyboard.press("x");
  await page.getByLabel(/Keys forwarded to this pane/).waitFor();
  await page.screenshot({ path: "/tmp/opencode/mandate-final/l1-workspace-1440.png" });
  const favicon404 = errors.filter((e) => e.includes("favicon"));
  expect(favicon404, `favicon console errors: ${JSON.stringify(errors)}`).toEqual([]);
  expect(true).toBe(true);
});

test("no vertical scroll on the title at desktop sizes", async ({ page }) => {
  for (const size of [
    { width: 1577, height: 822 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(size);
    await page.goto("/");
    await page.getByRole("heading", { name: "The Mandate: Herdr" }).waitFor();
    const overflow = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
      cta: (() => {
        const el = document.querySelector(".scene-actions button");
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom };
      })(),
    }));
    expect(
      overflow.scrollHeight,
      `scrollHeight ${overflow.scrollHeight} > viewport ${overflow.innerHeight} at ${size.width}x${size.height}`,
    ).toBeLessThanOrEqual(overflow.innerHeight + 1);
    expect(overflow.cta, "primary CTA missing").not.toBeNull();
    expect(
      overflow.cta?.bottom,
      `CTA bottom ${overflow.cta?.bottom} below viewport ${overflow.innerHeight}`,
    ).toBeLessThanOrEqual(overflow.innerHeight + 1);
  }
});
