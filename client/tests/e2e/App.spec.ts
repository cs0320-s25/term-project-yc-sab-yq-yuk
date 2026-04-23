import { expect, test } from "@playwright/test";
import { setupClerkTestingToken, clerk } from "@clerk/testing/playwright";

const SPOOF_UID = "mock-user-id";

test.beforeEach(
  "add spoof uid cookie to browser and set up test",
  async ({ context, page }) => {
    // Clerk setup
    setupClerkTestingToken({ page });
    await page.goto("http://localhost:8000/");
    // enableTestMode();
    await clerk.loaded({ page });
    const loginButton = page.getByRole("button", { name: "Sign in" });
    await expect(loginButton).toBeVisible();

    await clerk.signIn({
      page,
      signInParams: {
        strategy: "password",
        password: process.env.E2E_CLERK_USER_PASSWORD!,
        identifier: process.env.E2E_CLERK_USER_USERNAME!,
      },
    });

    const logoutButton = page.getByRole("button", { name: "Sign out" });
    await expect(logoutButton).toBeVisible();
  }
);

test.afterEach("", async ({ page }) => {
  // disableTestMode();
});

test("loads recommended events and trending events, likes and bookmarks", async ({
  page,
}) => {
  // Wait for recommendation events to load
  await expect(page.locator("h2")).toContainText("Recommended For You");

  // Like the first event card
  const likeButton = page.getByRole("button", { name: /👍|❤️/ }).first();
  await likeButton.click();
  await expect(likeButton).toHaveText(/❤️|👍/);

  // Bookmark the first event card
  const bookmarkButton = page
    .getByRole("button", { name: /🏷️ Bookmark|Bookmarked/ })
    .first();
  await bookmarkButton.click();
  await expect(bookmarkButton).toHaveText(/Bookmarked/);

  // Switch to trending
  await page.getByRole("button", { name: "Trending" }).click();
  await expect(page.locator("h2")).toContainText("Trending Events");

  // Cleanup: unlike and unbookmark the same event
  await likeButton.click();
  await expect(likeButton).toHaveText(/👍/); // back to unliked

  await bookmarkButton.click();
  await expect(bookmarkButton).toHaveText(/🏷️/); // back to unbookmarked
});

test("Recommended and Trending event lists differ", async ({ page }) => {
  // Wait for recommendations to load
  await expect(page.locator("h2")).toContainText("Recommended For You");

  // Grab last event card title from recommendations
  const recEventTitles = page.locator(".event-card h3");
  const recCount = await recEventTitles.count();
  const lastRecTitle = await recEventTitles.nth(recCount - 1).textContent();

  // Switch to Trending view
  await page.getByRole("button", { name: "Trending" }).click();
  await expect(page.locator("h2")).toContainText("Trending Events");

  // Grab last event card title from trending
  const trendEventTitles = page.locator(".event-card h3");
  const trendCount = await trendEventTitles.count();
  const lastTrendTitle = await trendEventTitles
    .nth(trendCount - 1)
    .textContent();

  // Validate they are not the same
  expect(lastTrendTitle?.trim()).not.toBe(lastRecTitle?.trim());
});
