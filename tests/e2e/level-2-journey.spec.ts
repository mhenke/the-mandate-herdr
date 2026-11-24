// Full L2 journey in Chromium: real keyboard through the runtime — complete L1,
// enter L2 briefing, open L2 workspace, tab creation prefix+c, rename prefix+shift+t,
// tab switching prefix+n/p, invalid prefix follow-up consumed, grounded story
// examine-artifact, earned response, and advance to L3 briefing.
// Synthetic CDP input per LEVEL.md.

import { expect, test } from "@playwright/test";

async function completeL1AndEnterL2Workspace(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "New investigation" }).click();
  await page.getByRole("button", { name: "Skip to the workspace" }).click();

  const surface = page.getByRole("region", { name: /Simulated Herdr surface/ });
  await surface.focus();

  // Satisfy L1: mark memo read, focus assignment, type x, accept assignment
  await page.getByRole("button", { name: "Mark the memo read" }).click();
  await surface.focus();
  await page.keyboard.press("Control+b");
  await page.keyboard.press("h");
  await page.keyboard.press("x");
  await page.getByRole("button", { name: "Accept the assignment" }).click();

  // Satisfy L1 help skill
  await page.keyboard.press("Control+b");
  await page.keyboard.press("?");
  await expect(page.getByRole("dialog", { name: "Key bindings" })).toBeVisible();
  await page.keyboard.press("/");
  await page.keyboard.press("a");
  await page.keyboard.press("Control+u");
  await surface.focus();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Key bindings" })).toBeHidden();

  // Satisfy L1 invalid consumed skill
  await page.keyboard.press("Control+b");
  await page.keyboard.press("y");

  // Advance from L1 response to L2 briefing
  await expect(page.getByRole("heading", { name: "Filed" })).toBeVisible();
  await page.getByRole("button", { name: "Continue the investigation" }).click();
  await expect(page.getByRole("heading", { name: "Incoming assignment" })).toBeVisible();
  await expect(page.getByText(/headers stripped/)).toBeVisible();

  // Advance from L2 briefing to L2 workspace
  await page.getByRole("button", { name: "Open the workspace" }).click();
  await expect(surface).toBeVisible();
  return surface;
}

test("L2 journey: tab creation, rename, switching, invalid prefix consumed, earned response", async ({
  page,
}) => {
  const surface = await completeL1AndEnterL2Workspace(page);
  await surface.focus();

  // Verify L2 initial workspace: reading tab, canonical intake text, objectives unfulfilled
  await expect(page.getByRole("tab", { name: "reading" })).toBeVisible();
  await expect(page.getByText("COOPERATIVE INTAKE — READING QUEUE")).toBeVisible();
  await expect(page.getByText("No objectives met yet.")).toBeVisible();

  // O1 part a: prefix+c opens new tab prompt, Escape cancels without creating tab
  await page.keyboard.press("Control+b");
  await page.keyboard.press("c");
  await expect(page.getByRole("dialog", { name: "new tab" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "new tab" })).toBeHidden();
  await expect(page.getByRole("tab")).toHaveCount(1);

  // Create second tab: prefix+c then Enter commits default ("2")
  await page.keyboard.press("Control+b");
  await page.keyboard.press("c");
  await expect(page.getByRole("dialog", { name: "new tab" })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "new tab" })).toBeHidden();
  await expect(page.getByRole("tab")).toHaveCount(2);

  // New tab is active and shows canonical artifact output
  await expect(page.getByText("ATTACHMENT: UM-1109-88 / BANNER CAPTURE")).toBeVisible();

  // O1 part b: rename tab via prefix+shift+t (S04)
  await page.keyboard.press("Control+b");
  await page.keyboard.press("Shift+T");
  await expect(page.getByRole("dialog", { name: "rename tab" })).toBeVisible();
  await page.keyboard.press("Control+u");
  for (const char of "artifact") {
    await page.keyboard.press(char);
  }
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "rename tab" })).toBeHidden();
  await expect(page.getByRole("tab", { name: "artifact" })).toBeVisible();

  // O1 part c: switch tabs away (prefix+p) and back (prefix+n)
  await page.keyboard.press("Control+b");
  await page.keyboard.press("p");
  await expect(page.getByRole("tab", { name: "reading" })).toHaveClass(/herdr-tab-active/);

  await page.keyboard.press("Control+b");
  await page.keyboard.press("n");
  await expect(page.getByRole("tab", { name: "artifact" })).toHaveClass(/herdr-tab-active/);

  // L2-O1 objective is met
  await expect(page.getByText("Objectives met: L2-O1")).toBeVisible();

  // O2: invalid prefix follow-up consumed inside artifact tab
  await page.keyboard.press("Control+b");
  await page.keyboard.press("y");
  await expect(page.getByText(/Objectives met: L2-O1, L2-O2/)).toBeVisible();

  // Story action: Examine the artifact button is available inside the artifact pane
  await page.getByRole("button", { name: "Examine the artifact" }).click();

  // Settle into earned response
  await expect(page.getByRole("heading", { name: "Filed" })).toBeVisible();
  await expect(page.getByText(/Artifact examined: the banner checks out/)).toBeVisible();

  // Advance from L2 response to L3 briefing
  await page.getByRole("button", { name: "Continue the investigation" }).click();
  await expect(page.getByRole("heading", { name: "Incoming assignment" })).toBeVisible();
  await expect(page.getByText(/Theo Park has agreed to a consent interview/)).toBeVisible();
});

test("L2 accessible mode: complete L2 with pointer chrome without keyboard credit", async ({
  page,
}) => {
  const surface = await completeL1AndEnterL2Workspace(page);

  // Enable Accessible mode
  const toggle = page.getByRole("checkbox", { name: "Accessible navigation" });
  await toggle.check();
  await expect(toggle).toBeChecked();

  // Click New Tab button in chrome
  await page.getByRole("button", { name: "New tab" }).click();
  await expect(page.getByRole("dialog", { name: "new tab" })).toBeVisible();
  await surface.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "new tab" })).toBeHidden();
  await expect(page.getByRole("tab")).toHaveCount(2);

  // Story action: examine artifact
  await page.getByRole("button", { name: "Examine the artifact" }).click();

  // Settle into response phase
  await expect(page.getByRole("heading", { name: "Filed" })).toBeVisible();
  await expect(page.getByText(/Artifact examined: the banner checks out/)).toBeVisible();
  await expect(page.getByText("No objectives met yet.")).toBeVisible();
});
