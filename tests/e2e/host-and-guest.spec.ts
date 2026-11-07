import { expect, test } from "@playwright/test";

/**
 * The whole loop: a host signs up, designs an invite, adds a family,
 * the family RSVPs from its personal link (no account), and the host sees it.
 */
test("host creates an invite and sees a guest's RSVP", async ({ page, browser }, testInfo) => {
  const email = `host-${testInfo.project.name}-${Date.now()}@example.com`;

  // Sign up
  await page.goto("/sign-in");
  await page.getByRole("tab", { name: "Create account" }).click();
  await page.getByLabel("Your name").fill("Priya Rao");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("correct-horse-42");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Your celebrations" })).toBeVisible();

  // Create an event → lands in the editor
  await page.getByRole("button", { name: "Create an invite" }).click();
  await expect(page).toHaveURL(/\/events\/.+\/edit/);
  const isPhone = testInfo.project.name === "mobile";
  const preview = page.locator("article.inv");
  /** Phones show one pane at a time; switch to the preview, check it, switch back. */
  const checkPreview = async (title: string) => {
    if (isPhone) await page.getByRole("button", { name: "preview", exact: true }).click();
    await expect(preview.getByRole("heading", { name: title })).toBeVisible();
    if (isPhone) await page.getByRole("button", { name: "edit", exact: true }).click();
  };
  await checkPreview("Aarav turns One");

  // Edit the title; preview follows
  await page.getByRole("textbox", { name: "Title", exact: true }).fill("Meera turns Two");
  await checkPreview("Meera turns Two");

  // AI co-host works without a key (template fallback)
  await page.getByRole("button", { name: /Write it with/ }).click();
  await page.getByRole("button", { name: "Suggest 3 notes" }).click();
  const suggestion = page.locator("button.font-serif").first();
  await expect(suggestion).toBeVisible();
  await suggestion.click();

  // Invite a family
  await page.locator("summary", { hasText: "Guests & RSVP" }).click();
  await page.getByLabel("Add invited family").fill("The Sharma family");
  await page.getByRole("button", { name: "Add", exact: true }).last().click();
  await expect(page.getByText("Invited families · 1")).toBeVisible();
  await expect(page.getByText("All changes saved")).toBeVisible();

  // Grab The Sharmas' personal link from the share dialog
  await page.getByRole("button", { name: "Share", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("The Sharma family")).toBeVisible();
  const waHref = await dialog.getByRole("link", { name: "WhatsApp The Sharma family" }).getAttribute("href");
  const link = decodeURIComponent(waHref!.replace("https://wa.me/?text=", "")).match(/https?:\/\/\S+\/i\/\S+/)![0];
  await dialog.getByRole("button", { name: "Close" }).click();

  // Guest: fresh browser, no account
  const guestCtx = await browser.newContext();
  const guest = await guestCtx.newPage();
  await guest.goto(link);
  await expect(guest.getByRole("heading", { name: "Meera turns Two" })).toBeVisible();
  await expect(guest.getByRole("heading", { name: "Dear The Sharma family," })).toBeVisible();
  await guest.getByRole("button", { name: "More Kids" }).click();
  await guest.getByRole("button", { name: "Mango lassi" }).click();
  await guest.getByLabel("Allergies or dietary needs").fill("No peanuts");
  await guest.getByRole("button", { name: "Send my reply" }).click();
  await expect(guest.getByRole("heading", { name: "See you there!" })).toBeVisible();
  await guestCtx.close();

  // Host sees it
  await page.getByRole("link", { name: "Responses" }).click();
  await expect(page.getByRole("heading", { name: "Guest responses" })).toBeVisible();
  const row = page.getByRole("row", { name: /The Sharma family/ });
  await expect(row).toContainText("Attending");
  await expect(row).toContainText("No peanuts");
  await expect(page.getByText("Guests coming")).toBeVisible();
});
