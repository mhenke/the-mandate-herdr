import { expect, test, type Page } from "@playwright/test";

async function enterHerdr(page: Page): Promise<void> {
  await page.goto("/workspace");
  const terminal = page.getByRole("region", { name: /Terminal\. Type herdr/ });
  await expect(terminal).toBeVisible();
  await expect(page.locator(".mission-step")).toHaveCount(5);
  await expect(page.getByText("Type herdr, then press Enter.")).toBeVisible();
  await expect(page.getByRole("button", { name: /Ask Claude/ })).toHaveCount(0);
  await expect(page.getByText("SOURCE-HANDLING MEMORANDUM // CPA-01A")).toHaveCount(0);

  await terminal.focus();
  await page.keyboard.type("herdr");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: /Simulated Herdr surface/ })).toBeVisible();
  await expect(page.locator(".mission-step.is-complete s")).toHaveCount(1);
}

async function createWorkspace(page: Page, name: string): Promise<void> {
  const surface = page.getByRole("region", { name: /Simulated Herdr surface/ });
  await surface.focus();
  await page.keyboard.press("Control+b");
  await page.keyboard.press("Shift+n");
  await expect(page.getByRole("dialog", { name: "rename workspace" })).toBeVisible();
  await page.keyboard.type(name);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: new RegExp(name) })).toBeVisible();
}

async function createTab(page: Page, name: string): Promise<void> {
  await page.keyboard.press("Control+b");
  await page.keyboard.press("c");
  await expect(page.getByRole("dialog", { name: "new tab" })).toBeVisible();
  await page.keyboard.type(name);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("tab", { name })).toBeVisible();
}

async function retrieveMemo(page: Page): Promise<void> {
  await page.keyboard.type("claude");
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Claude Code v1\.0\.12/)).toBeVisible();

  await page.keyboard.type(
    "Please locate the source-handling memo CPA-01A and show me the document.",
  );
  await page.keyboard.press("Enter");
  await expect(page.getByText(/MCP CALL documents\.search/)).toBeVisible();
  await expect(page.getByText(/MCP CALL documents\.read/)).toBeVisible();
  await expect(
    page.getByText("SOURCE-HANDLING MEMORANDUM // CPA-01A", { exact: true }),
  ).toBeVisible();
}

test("first launch opens one shell pane with a single live prompt", async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 740 });
  await enterHerdr(page);
  const sidebar = page.getByRole("complementary", { name: "Workspaces and agents" });
  await expect(sidebar.getByRole("button", { name: /the-mandate.*main/ })).toBeVisible();
  await expect(sidebar.getByRole("button")).toHaveCount(1);
  await expect(page.getByRole("tab")).toHaveCount(1);
  await expect(page.getByRole("tab", { name: "1" })).toHaveAttribute("aria-selected", "true");
  const shell = page.getByRole("region", { name: "shell (focused)" });
  await expect(shell).toHaveText("$");
  await page.keyboard.press("h");
  await expect(shell).toHaveText("$ h");
  await page.keyboard.press("Backspace");
  await expect(shell).toHaveText("$");
});

test("L1 starts at a terminal and advances through player-driven Herdr work", async ({ page }) => {
  await enterHerdr(page);
  await createWorkspace(page, "investigation");
  await expect(page.locator(".mission-step.is-complete s")).toHaveCount(2);

  await createTab(page, "research");
  await expect(page.locator(".mission-step.is-complete s")).toHaveCount(3);
  await retrieveMemo(page);
  await expect(page.locator(".mission-step.is-complete s")).toHaveCount(4);

  await page.keyboard.type("Accept the assignment");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Filed" })).toBeVisible();
  await expect(page.locator(".mission-step.is-complete s")).toHaveCount(5);
});

test("captured prompts leave the browser reload chords uncanceled", async ({ page }) => {
  await page.goto("/workspace");
  const startup = page.getByRole("region", { name: /Terminal\. Type herdr/ });
  await expect(startup).toBeFocused();
  const checkReloadChord = async (chord: string) => {
    await page.evaluate(() => {
      window.addEventListener(
        "keydown",
        function observeReload(event) {
          if (event.ctrlKey && event.key.toLowerCase() === "r") {
            console.debug(`reload chord canceled: ${event.defaultPrevented}`);
            window.removeEventListener("keydown", observeReload);
          }
        },
        { passive: true },
      );
    });
    const [report] = await Promise.all([
      page.waitForEvent("console", (message) =>
        message.text().startsWith("reload chord canceled:"),
      ),
      page.keyboard.press(chord),
    ]);
    expect(report.text()).toBe("reload chord canceled: false");
  };

  await checkReloadChord("Control+r");
  await startup.focus();
  await page.keyboard.type("herdr");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: /Simulated Herdr surface/ })).toBeFocused();
  await checkReloadChord("Control+r");
  await checkReloadChord("Control+Shift+r");
});

test("resize mode leaves unused Space uncanceled and consumes Escape", async ({ page }) => {
  await enterHerdr(page);
  await page.keyboard.press("Control+b");
  await page.keyboard.press("r");
  const modeBar = page.locator(".herdr-modebar");
  await expect(modeBar).toContainText("RESIZE");

  await page.evaluate(() => {
    window.addEventListener(
      "keydown",
      (event) => {
        if (event.code === "Space" || event.key === "Escape") {
          console.debug(`${event.code} canceled: ${event.defaultPrevented}`);
        }
      },
      { passive: true },
    );
  });
  const [space] = await Promise.all([
    page.waitForEvent("console", (message) => message.text().startsWith("Space canceled:")),
    page.keyboard.press("Space"),
  ]);
  expect(space.text()).toBe("Space canceled: false");
  await expect(modeBar).toContainText("RESIZE");

  const [escape] = await Promise.all([
    page.waitForEvent("console", (message) => message.text().startsWith("Escape canceled:")),
    page.keyboard.press("Escape"),
  ]);
  expect(escape.text()).toBe("Escape canceled: true");
  await expect(modeBar).toBeHidden();
});

test("shell control keys edit the prompt without taking over Herdr shortcuts", async ({ page }) => {
  await page.goto("/workspace");
  await page.getByRole("region", { name: /Terminal\. Type herdr/ }).focus();
  await page.keyboard.type("wrong-command");
  await page.keyboard.press("Control+u");
  await page.keyboard.type("herdr");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: /Simulated Herdr surface/ })).toBeVisible();

  await createWorkspace(page, "investigation");
  await createTab(page, "research");
  await page.keyboard.type("abandon this");
  await page.keyboard.press("Control+c");
  await page.keyboard.type("claudex");
  await page.keyboard.press("Backspace");
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Claude Code v1\.0\.12/)).toBeVisible();
});

test("holding Backspace corrects the command at the startup prompt", async ({ page }) => {
  await page.goto("/workspace");
  const terminal = page.getByRole("region", { name: /Terminal\. Type herdr/ });
  await terminal.focus();
  await expect(terminal.getByText("~/Projects/the-mandate")).toBeVisible();
  await page.keyboard.type("herdrxyz");
  await page.keyboard.down("Backspace");
  await page.keyboard.down("Backspace");
  await page.keyboard.down("Backspace");
  await page.keyboard.up("Backspace");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: /Simulated Herdr surface/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /the-mandate/ })).toBeVisible();
});

test("the pane shows the edited command, not forwarded key names", async ({ page }) => {
  await enterHerdr(page);
  await page.keyboard.type("claudexyz");
  await page.keyboard.press("Control+b");
  await page.keyboard.down("Backspace");
  await page.keyboard.down("Backspace");
  await page.keyboard.up("Backspace");
  await expect(page.getByText(/^❯ claudexyz▊$/)).toBeVisible();

  await page.keyboard.press("Control+b");
  await page.keyboard.press("Control+b");
  await page.keyboard.down("Backspace");
  await page.keyboard.down("Backspace");
  await page.keyboard.down("Backspace");
  await page.keyboard.up("Backspace");

  await expect(page.getByText(/^❯ claude▊$/)).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Claude Code v1\.0\.12/)).toBeVisible();
});

test("Standard mode refuses pointer chrome without changing Herdr state", async ({ page }) => {
  await enterHerdr(page);
  await createWorkspace(page, "investigation");
  await createTab(page, "research");
  await expect(page.getByRole("tab")).toHaveCount(2);

  await page.getByRole("button", { name: "New tab" }).click();
  await expect(page.getByRole("tab")).toHaveCount(2);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".mission-step.is-complete s")).toHaveCount(3);
});

test("Escape closes Herdr help only while capture is engaged", async ({ page }) => {
  await enterHerdr(page);
  await page.keyboard.press("Control+b");
  await page.keyboard.press("?");
  await expect(page.getByRole("dialog", { name: /Key bindings/ })).toBeVisible();

  await page.getByRole("button", { name: "Release capture" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: /Key bindings/ })).toBeVisible();

  await page.getByRole("button", { name: "Engage capture" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: /Key bindings/ })).toHaveCount(0);
});

test("Accessible navigation reaches the story response without Herdr mastery credit", async ({
  page,
}) => {
  await page.goto("/workspace");
  const terminal = page.getByRole("region", { name: /Terminal\. Type herdr/ });
  const accessible = page.getByRole("checkbox", { name: "Accessible navigation" });
  await expect(terminal).toBeVisible();
  await accessible.check();

  await terminal.focus();
  await page.keyboard.type("herdr");
  await page.keyboard.press("Enter");
  await createWorkspace(page, "investigation");

  await page.getByRole("button", { name: "New tab" }).click();
  await expect(page.getByRole("dialog", { name: "new tab" })).toBeVisible();
  await page.keyboard.type("research");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("tab", { name: "research" })).toBeVisible();
  await retrieveMemo(page);

  await page.keyboard.type("Accept the assignment");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Filed" })).toBeVisible();
  await expect(page.getByText("1 of 3 Herdr skills shown")).toBeVisible();
});
