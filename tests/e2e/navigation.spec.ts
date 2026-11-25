import { expect, test } from "@playwright/test";

test.describe("browser history and scene navigation", () => {
  test("the landing page starts play and keeps browser history", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "The Mandate: Herdr" })).toBeVisible();

    await page.getByRole("button", { name: "New investigation" }).click();
    await expect(page).toHaveURL(/\/cold-open$/);
    await expect(page).toHaveTitle(/Cold Open/);
    await expect(page.locator(".cinema-stage")).toBeVisible();

    await page.getByRole("button", { name: "Skip to the workspace" }).click();
    await expect(page).toHaveURL(/\/workspace$/);
    await expect(page).toHaveTitle(/Workspace/);
    await expect(page.getByRole("region", { name: /Terminal\. Type herdr/ })).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/cold-open$/);
    await expect(page.locator(".cinema-stage")).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "The Mandate: Herdr" })).toBeVisible();
    await page.goForward();
    await expect(page).toHaveURL(/\/cold-open$/);
    await page.goForward();
    await expect(page).toHaveURL(/\/workspace$/);
    await expect(page.getByRole("region", { name: /Terminal\. Type herdr/ })).toBeVisible();
  });

  test("direct URL navigation to the optional cold open loads that scene", async ({ page }) => {
    await page.goto("/cold-open");
    await expect(page).toHaveURL(/\/cold-open$/);
    await expect(page.locator(".cinema-stage")).toBeVisible();
  });

  test("unrecognized routes show 404 and R returns to the optional title", async ({ page }) => {
    await page.goto("/unrecognized-docket");
    await expect(page).toHaveURL(/\/404$/);
    await expect(page).toHaveTitle(/404 Record Not Found/);
    await expect(page.getByRole("heading", { name: "No record on file" })).toBeVisible();
    await expect(page.getByText(/THE COOPERATIVE · DISPATCH 404/)).toBeVisible();

    await page.keyboard.press("r");
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "The Mandate: Herdr" })).toBeVisible();
  });
});
