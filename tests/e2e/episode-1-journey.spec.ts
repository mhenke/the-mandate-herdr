import { expect, test } from "@playwright/test";

test("Episode I full journey (L1–L5): files VN-12, triages intake, and completes Episode I", async ({
  page,
}) => {
  await page.goto("/workspace");
  const terminal = page.getByRole("region", { name: /Terminal\. Type herdr/ });
  await expect(terminal).toBeVisible();

  // L1
  await terminal.focus();
  await page.keyboard.type("herdr");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: /Simulated Herdr surface/ })).toBeVisible();

  await page.keyboard.press("Control+b");
  await page.keyboard.press("Shift+n");
  await page.keyboard.type("investigation");
  await page.keyboard.press("Enter");

  await page.keyboard.press("Control+b");
  await page.keyboard.press("c");
  await page.keyboard.type("research");
  await page.keyboard.press("Enter");

  await page.keyboard.type("claude");
  await page.keyboard.press("Enter");
  await page.keyboard.type("Please locate CPA-01A memo.");
  await page.keyboard.press("Enter");
  await expect(
    page.getByText("SOURCE-HANDLING MEMORANDUM // CPA-01A", { exact: true }),
  ).toBeVisible();
  await page.keyboard.type("Accept the assignment");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Filed" })).toBeVisible();

  // Advance to L2
  await page.getByRole("button", { name: "Continue the investigation" }).click();
  await page.getByRole("button", { name: "Open the workspace" }).click();

  await page.keyboard.press("Control+b");
  await page.keyboard.press("c");
  await page.keyboard.type("report");
  await page.keyboard.press("Enter");

  await page.keyboard.type("claude");
  await page.keyboard.press("Enter");
  await page.keyboard.type("Retrieve SOC Memo UM-1109-88.");
  await page.keyboard.press("Enter");
  await expect(page.getByText("ORIGIN-EVENT-ID: [BLANK ON SHARED COPY].")).toBeVisible();

  await page.keyboard.press("Control+b");
  await page.keyboard.press("p");
  await page.keyboard.press("Control+b");
  await page.keyboard.press("n");
  await expect(page.getByRole("heading", { name: "Filed" })).toBeVisible();

  // Advance to L3
  await page.getByRole("button", { name: "Continue the investigation" }).click();
  await page.getByRole("button", { name: "Open the workspace" }).click();
  await expect(page.getByRole("heading", { name: /Level 3/ })).toBeVisible();

  await page.keyboard.press("Control+b");
  await page.keyboard.press("Shift+t");
  await page.keyboard.press("Control+u");
  await page.keyboard.type("park-interview");
  await page.keyboard.press("Enter");

  await page.keyboard.press("Control+b");
  await page.keyboard.press("v");
  await page.keyboard.press("Control+b");
  await page.keyboard.press("h");
  await page.keyboard.press("Control+b");
  await page.keyboard.press("l");
  await page.keyboard.type("claude");
  await page.keyboard.press("Enter");
  await page.keyboard.type("Find the transcript of Theo Park's interview.");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Filed" })).toBeVisible();

  // Advance to L4
  await page.getByRole("button", { name: "Continue the investigation" }).click();
  await expect(page.getByRole("heading", { name: "Incoming assignment" })).toBeVisible();
  await expect(page.getByText(/Drafting Verifier Note VN-12 requires strict separation/)).toBeVisible();
  await page.getByRole("button", { name: "Open the workspace" }).click();
  await expect(page.getByRole("heading", { name: /Level 4/ })).toBeVisible();

  // L4: Create filing workspace
  await page.keyboard.press("Control+b");
  await page.keyboard.press("Shift+n");
  await page.keyboard.type("filing");
  await page.keyboard.press("Enter");

  // L4: Split filing tab
  await page.keyboard.press("Control+b");
  await page.keyboard.press("v");
  await page.keyboard.press("Control+b");
  await page.keyboard.press("l");
  await page.keyboard.type("claude");
  await page.keyboard.press("Enter");

  // File VN-12 with paraphrase
  await page.keyboard.type("file vn-12 paraphrase");
  await page.keyboard.press("Enter");
  await expect(page.getByText("SUBMISSION ACKNOWLEDGEMENT // SUB-ACK-12")).toBeVisible();

  // Return to investigation workspace via navigator
  await page.keyboard.press("Control+b");
  await page.keyboard.press("w");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Enter");

  // L4 completes
  await expect(page.getByRole("heading", { name: "Filed" })).toBeVisible();
  await expect(page.getByText(/SUB-ACK-12 returned on the wire/)).toBeVisible();

  // Advance to L5 (Retention Checkpoint 1)
  await page.getByRole("button", { name: "Continue the investigation" }).click();
  await expect(page.getByRole("heading", { name: "Incoming assignment" })).toBeVisible();
  await expect(page.getByText(/Morning paperwork delivers INT-RECEIPT-12/)).toBeVisible();
  await page.getByRole("button", { name: "Open the workspace" }).click();
  await expect(page.getByRole("heading", { name: /Level 5/ })).toBeVisible();

  // L5: Create triage workspace
  await page.keyboard.press("Control+b");
  await page.keyboard.press("Shift+n");
  await page.keyboard.type("triage");
  await page.keyboard.press("Enter");

  // L5: Create and rename tab
  await page.keyboard.press("Control+b");
  await page.keyboard.press("c");
  await page.keyboard.type("intake");
  await page.keyboard.press("Enter");

  await page.keyboard.press("Control+b");
  await page.keyboard.press("Shift+t");
  await page.keyboard.press("Control+u");
  await page.keyboard.type("manifest");
  await page.keyboard.press("Enter");

  // L5: Comparison split & focus
  await page.keyboard.press("Control+b");
  await page.keyboard.press("v");
  await page.keyboard.press("Control+b");
  await page.keyboard.press("h");
  await page.keyboard.press("Control+b");
  await page.keyboard.press("l");
  await page.keyboard.type("claude");
  await page.keyboard.press("Enter");

  // Retrieve intake records and compile finding
  await page.keyboard.type("Retrieve INT-RECEIPT-12");
  await page.keyboard.press("Enter");
  await expect(
    page.getByText("INTAKE RECEIPT // INT-RECEIPT-12 (EIAB QUEUE ENTRY R-2)", { exact: true }),
  ).toBeVisible();

  await page.keyboard.type("submit finding");
  await page.keyboard.press("Enter");

  // L5 completes -> triggers Episode I Finale
  await expect(page.getByRole("heading", { name: "Filed" })).toBeVisible();
  await expect(page.getByText(/EPISODE I FINALE — THE THIRD COUNT/)).toBeVisible();

  // Advance to Finale complete screen
  await page.getByRole("button", { name: "Continue the investigation" }).click();
  await expect(page.getByRole("heading", { name: "The Third Count" })).toBeVisible();
  await expect(page.getByText(/Episode I Complete — The Leak/)).toBeVisible();
});
