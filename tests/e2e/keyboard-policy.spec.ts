// Input policy contract for the L1 slice: Standard mode is keyboard-only
// (pointer chrome dispatch is refused), Accessible mode allows alternative
// navigation without keyboard-transfer mastery credit. Evidence is the
// committed runtime state surfaced below the chrome, never a label alone.

import { expect, test } from "@playwright/test";

async function enterWorkspace(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "New investigation" }).click();
  await page.getByRole("button", { name: "Skip to the workspace" }).click();
  const surface = page.getByRole("region", { name: /Simulated Herdr surface/ });
  await expect(surface).toBeVisible();
  return surface;
}

test("Standard: pointer chrome is refused and shows a brief reminder", async ({ page }) => {
  const surface = await enterWorkspace(page);
  await expect(page.getByText("No objectives met yet.")).toBeVisible();
  // L1 seeds the memo focused; the assignment pane would be keyboard focus-left.
  await expect(page.getByLabel("Memo (focused)")).toBeVisible();

  await page.locator(".tui-pane").first().click({ position: { x: 24, y: 24 } });
  // Refused: no focus change, no objective, one reminder that fades.
  await expect(page.getByLabel("Assignment (focused)")).toHaveCount(0);
  await expect(page.getByLabel("Memo (focused)")).toBeVisible();
  await expect(page.getByRole("status")).toHaveText(/Keyboard-only console/);
  await expect(page.getByRole("status")).toBeHidden({ timeout: 3000 });

  const tabs = await page.getByRole("tab").count();
  await page.getByRole("button", { name: "New tab" }).click();
  await expect(page.getByRole("dialog", { name: "new tab" })).toHaveCount(0);
  await expect(page.getByRole("tab")).toHaveCount(tabs);
  await expect(page.getByText("No objectives met yet.")).toBeVisible();

  await surface.focus();
  await expect(surface).toBeFocused();
});

test("Standard: authentic keyboard operations earn every L1 objective", async ({ page }) => {
  const surface = await enterWorkspace(page);

  await page.getByRole("button", { name: "Mark the memo read" }).click();
  await surface.focus();
  await page.keyboard.press("Control+b");
  await page.keyboard.press("h");
  await page.keyboard.press("x");
  await expect(page.getByLabel(/Keys forwarded to this pane/)).toContainText("x");
  await page.getByRole("button", { name: "Accept the assignment" }).click();
  await expect(page.getByText("Assignment accepted — verify origin.")).toBeVisible();

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

  await page.keyboard.press("Control+b");
  await page.keyboard.press("y");

  await expect(page.getByRole("heading", { name: "Filed" })).toBeVisible();
  await expect(page.getByText("Objectives met: L1-O1, L1-O2, L1-O3")).toBeVisible();
});

test("Standard: typing in the wrong pane does not satisfy the focus objective", async ({
  page,
}) => {
  const surface = await enterWorkspace(page);
  await surface.focus();
  // No prefix focus move: input lands in the focused memo pane, not assignment.
  await page.keyboard.press("a");
  await page.keyboard.press("b");
  await page.keyboard.press("c");
  await expect(page.getByLabel(/Keys forwarded to this pane/)).toContainText("abc");
  await expect(page.getByText("No objectives met yet.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Filed" })).toBeHidden();
});

test("Standard: help overlay and hints still work", async ({ page }) => {
  const surface = await enterWorkspace(page);
  await surface.focus();
  await page.keyboard.press("Control+b");
  await page.keyboard.press("?");
  await expect(page.getByRole("dialog", { name: "Key bindings" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Key bindings" })).toBeHidden();

  await page.getByText(/Hints/).first().click();
  await page.getByRole("button", { name: "Request a hint" }).click();
  await expect(page.getByText(/prefix arms exactly/).first()).toBeVisible();
});

test("capture release and re-engage never steal Herdr Escape", async ({ page }) => {
  const surface = await enterWorkspace(page);
  await surface.focus();
  await page.keyboard.press("Control+b");
  await page.keyboard.press("?");
  const help = page.getByRole("dialog", { name: "Key bindings" });
  await expect(help).toBeVisible();

  await page.getByRole("button", { name: /Release capture/ }).click();
  await expect(page.getByText("Released: keys stay in the page.")).toBeVisible();
  // Released: Escape stays in the page, so the Herdr overlay is untouched.
  await page.keyboard.press("Escape");
  await expect(help).toBeVisible();

  await page.getByRole("button", { name: /Engage capture/ }).click();
  await expect(surface).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(help).toBeHidden();
});

test("Accessible: alternative navigation reaches the response without mastery credit", async ({
  page,
}) => {
  await enterWorkspace(page);
  const toggle = page.getByRole("checkbox", { name: "Accessible navigation" });
  await expect(toggle).not.toBeChecked();
  await toggle.check();
  await expect(toggle).toBeChecked();

  // Story read stays a page control; pointer chrome now focuses the assignment.
  await page.getByRole("button", { name: "Mark the memo read" }).click();
  await page.locator(".tui-pane").first().click({ position: { x: 24, y: 24 } });
  await expect(page.getByLabel("Assignment (focused)")).toBeVisible();
  await page.keyboard.press("x");
  await expect(page.getByLabel(/Keys forwarded to this pane/)).toContainText("x");
  await page.getByRole("button", { name: "Accept the assignment" }).click();
  await expect(page.getByText("Assignment accepted — verify origin.")).toBeVisible();

  // Story satisfied via alternative modality: response earned, no keyboard
  // mastery credit (objectives stay unmet in the record).
  await expect(page.getByRole("heading", { name: "Filed" })).toBeVisible();
  await expect(page.getByText("No objectives met yet.")).toBeVisible();
});
