import { expect, test } from "@playwright/test";

test.describe("browser history & navigation", () => {
  test("synchronizes URL and supports browser back and forward buttons across scenes", async ({
    page,
  }) => {
    // 1. Initial title screen
    await page.goto("/");
    await expect(page).toHaveTitle(/The Mandate: Herdr/);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "The Mandate: Herdr" })).toBeVisible();

    // 2. Advance to cold-open
    await page.getByRole("button", { name: "New investigation" }).click();
    await expect(page).toHaveURL(/\/cold-open$/);
    await expect(page).toHaveTitle(/Cold Open/);
    await expect(page.locator(".cinema-stage")).toBeVisible();

    // 3. Skip to workspace
    await page.getByRole("button", { name: "Skip to the workspace" }).click();
    await expect(page).toHaveURL(/\/workspace$/);
    await expect(page).toHaveTitle(/Workspace/);
    await expect(page.getByRole("region", { name: /Simulated Herdr surface/ })).toBeVisible();

    // 4. Browser Back -> returns to cold-open
    await page.goBack();
    await expect(page).toHaveURL(/\/cold-open$/);
    await expect(page).toHaveTitle(/Cold Open/);
    await expect(page.locator(".cinema-stage")).toBeVisible();

    // 5. Browser Back again -> returns to title
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(page).toHaveTitle("The Mandate: Herdr");
    await expect(page.getByRole("heading", { name: "The Mandate: Herdr" })).toBeVisible();

    // 6. Browser Forward -> advances to cold-open
    await page.goForward();
    await expect(page).toHaveURL(/\/cold-open$/);
    await expect(page).toHaveTitle(/Cold Open/);
    await expect(page.locator(".cinema-stage")).toBeVisible();

    // 7. Browser Forward again -> advances to workspace
    await page.goForward();
    await expect(page).toHaveURL(/\/workspace$/);
    await expect(page).toHaveTitle(/Workspace/);
    await expect(page.getByRole("region", { name: /Simulated Herdr surface/ })).toBeVisible();
  });

  test("direct URL navigation to /cold-open loads the cold open scene directly", async ({
    page,
  }) => {
    await page.goto("/cold-open");
    await expect(page).toHaveURL(/\/cold-open$/);
    await expect(page.locator(".cinema-stage")).toBeVisible();
  });

  test("direct URL navigation to unrecognized route loads 404 NotFoundScene with theme and controls", async ({
    page,
  }) => {
    await page.goto("/unrecognized-docket");
    await expect(page).toHaveURL(/\/404$/);
    await expect(page).toHaveTitle(/404 Record Not Found/);
    await expect(page.getByRole("heading", { name: "No record on file" })).toBeVisible();
    await expect(page.getByText(/THE COOPERATIVE · DISPATCH 404/)).toBeVisible();

    // Keyboard shortcut R returns to desk (title)
    await page.keyboard.press("r");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "The Mandate: Herdr" })).toBeVisible();
  });
});
