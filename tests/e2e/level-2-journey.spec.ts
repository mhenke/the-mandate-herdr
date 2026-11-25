import { expect, test, type Page } from "@playwright/test";

async function enterL1(page: Page, accessible = false): Promise<void> {
  await page.goto("/workspace");
  const terminal = page.getByRole("region", { name: /Terminal\. Type herdr/ });
  await expect(terminal).toBeVisible();
  if (accessible) {
    await page.getByRole("checkbox", { name: "Accessible navigation" }).check();
  }

  await terminal.focus();
  await page.keyboard.type("herdr");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: /Simulated Herdr surface/ })).toBeVisible();

  await page.keyboard.type("claude");
  await page.keyboard.press("Enter");
  await page.keyboard.type(
    "Please locate the source-handling memo CPA-01A and show me the document.",
  );
  await page.keyboard.press("Enter");
  await expect(
    page.getByText("SOURCE-HANDLING MEMORANDUM // CPA-01A", { exact: true }),
  ).toBeVisible();
  await page.keyboard.type("Accept the assignment");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Filed" })).toBeVisible();
}

async function openL2(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Continue the investigation" }).click();
  await expect(page.getByRole("heading", { name: "Incoming assignment" })).toBeVisible();
  await page.getByRole("button", { name: "Open the workspace" }).click();
  await expect(page.getByRole("tab", { name: "1" })).toBeVisible();
  await expect(
    page.getByText("SOURCE-HANDLING MEMORANDUM // CPA-01A", { exact: true }),
  ).toBeVisible();
}

test("L1–L3 keep the same session across a tab comparison and a split interview", async ({
  page,
}) => {
  await enterL1(page);
  await openL2(page);
  await expect(page.getByText(/Why: The shared report has no origin header/)).toBeVisible();
  await expect(page.getByText("Press Ctrl+B, then C. Name it report.")).toBeVisible();

  await page.keyboard.press("Control+b");
  await page.keyboard.press("c");
  await expect(page.getByRole("dialog", { name: "new tab" })).toBeVisible();
  await page.keyboard.type("report");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("tab")).toHaveCount(2);
  await expect(page.getByRole("tab", { name: "report" })).toBeVisible();
  await expect(page.getByText("Switch with Ctrl+B P, then Ctrl+B N.")).toBeVisible();

  await page.keyboard.type("claude");
  await page.keyboard.press("Enter");
  await page.keyboard.type("Please retrieve SOC Memo UM-1109-88 and show the shared copy.");
  await page.keyboard.press("Enter");
  await expect(page.getByText(/MCP CALL documents\.search/)).toBeVisible();
  await expect(page.getByText(/MCP CALL documents\.read/)).toBeVisible();
  await expect(page.getByText("ORIGIN-EVENT-ID: [BLANK ON SHARED COPY].")).toBeVisible();

  await page.keyboard.press("Control+b");
  await page.keyboard.press("p");
  await expect(page.getByRole("tab", { name: "1" })).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByText("SOURCE-HANDLING MEMORANDUM // CPA-01A", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Control+b");
  await page.keyboard.press("n");

  await expect(page.getByRole("heading", { name: "Filed" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "report" })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".mission-step.is-complete s")).toHaveCount(4);

  await page.getByRole("button", { name: "Continue the investigation" }).click();
  await page.getByRole("button", { name: "Open the workspace" }).click();
  await expect(page.getByRole("heading", { name: /Level 3/ })).toBeVisible();
  await page.keyboard.press("Control+b");
  await page.keyboard.press("v");
  await page.keyboard.press("Control+b");
  await page.keyboard.press("h");
  await page.keyboard.press("Control+b");
  await page.keyboard.press("l");
  await page.keyboard.type("claude");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Control+b");
  await page.keyboard.press("Shift+t");
  await page.keyboard.press("Control+u");
  await page.keyboard.type("park-interview");
  await page.keyboard.press("Enter");
  await page.keyboard.type("Find the transcript of Theo Park's interview.");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Filed" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "park-interview" })).toBeVisible();
  await expect(page.getByText("ORIGIN-EVENT-ID: [BLANK ON SHARED COPY].")).toBeVisible();
  await expect(page.getByText(/^PARK: 'Load-test script LT-47B misfired/)).toBeVisible();
  await expect(page.getByText("2 of 2 Herdr skills shown")).toBeVisible();
});

test("L2 accessible navigation advances the story without Herdr mastery credit", async ({
  page,
}) => {
  await enterL1(page, true);
  await openL2(page);
  await expect(page.getByText("0 of 2 Herdr skills shown")).toBeVisible();

  await page.getByRole("button", { name: "New tab" }).click();
  await expect(page.getByRole("dialog", { name: "new tab" })).toBeVisible();
  await page.keyboard.type("report");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("tab", { name: "report" })).toBeVisible();
  await page.getByRole("tab", { name: "1" }).click();
  await page.getByRole("tab", { name: "report" }).click();

  await page.keyboard.type("claude");
  await page.keyboard.press("Enter");
  await page.keyboard.type("Please find UM-1109-88 and show the shared copy.");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Filed" })).toBeVisible();
  await expect(page.getByText("0 of 2 Herdr skills shown")).toBeVisible();
});
