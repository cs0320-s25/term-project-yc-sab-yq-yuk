// import { expect, test } from "@playwright/test";
// import { clearUser } from "../../src/utils/api";

// /**
//   The general shapes of tests in Playwright Test are:
//     1. Navigate to a URL
//     2. Interact with the page
//     3. Assert something about the page against your expectations
//   Look for this pattern in the tests below!
//  */

// const SPOOF_UID = "mock-user-id";

// test.beforeEach(
//   "add spoof uid cookie to browser",
//   async ({ context, page }) => {
//     // - Add "uid" cookie to the browser context
//     await context.addCookies([
//       {
//         name: "uid",
//         value: SPOOF_UID,
//         url: "http://localhost:8000",
//       },
//     ]);

//     // wipe everything for this spoofed UID in the database.
//     await clearUser(SPOOF_UID);
//   }
// );

// /**
//  * Don't worry about the "async" yet. We'll cover it in more detail
//  * for the next sprint. For now, just think about "await" as something
//  * you put before parts of your test that might take time to run,
//  * like any interaction with the page.
//  */
// // test("on page load, I see the gearup screen and skip auth.", async ({
// //   page,
// // }) => {
// //   // Notice: http, not https! Our front-end is not set up for HTTPs.
// //   await page.goto("http://localhost:8000/");
// //   await expect(page.getByLabel("Gearup Title")).toBeVisible();
// //   // <i> with aria-label favorite-words-header should include the SPOOF_UID
// //   await expect(page.getByLabel("user-header")).toContainText(SPOOF_UID);
// // });

// // test("I can add a word to my favorites list", async ({ page }) => {
// //   await page.goto("http://localhost:8000/");
// //   // - get the <p> elements inside the <ul> with aria-label="favorite-words"
// //   const favoriteWords = await page.getByLabel("favorite-words");
// //   await expect(favoriteWords).not.toContainText("hello");

// //   await page.getByLabel("word-input").fill("hello");
// //   await page.getByLabel("add-word-button").click();

// //   const favoriteWordsAfter = await page.getByLabel("favorite-words");
// //   await expect(favoriteWordsAfter).toContainText("hello");

// //   // .. and this works on refresh
// //   await page.reload();
// //   const favoriteWordsAfterReload = await page.getByLabel("favorite-words");
// //   await expect(favoriteWordsAfterReload).toContainText("hello");
// // });

// // test proper clerk login functionality
// test('clerk_test', async ({ page }) => {
//   await page.goto('http://localhost:8000/');
//   await page.getByRole('button', { name: 'Sign in' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).fill('ky@brown.edu');
//   await page.getByRole('button', { name: 'Continue', exact: true }).click();
//   await page.getByRole('textbox', { name: 'Password' }).fill('ky123123ky');
//   await page.getByRole('button', { name: 'Continue' }).click();
//   await page.getByRole('button', { name: 'Section 2: Mapbox Demo' }).click();
//   await page.waitForTimeout(3000);
//   expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('map_screenshot.png');
// });

// // test bad login (incorrect username)
// test('bad_clerk_user', async ({ page }) => {
//   await page.goto('http://localhost:8000/');
//   await page.getByRole('button', { name: 'Sign in' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).fill('k@brown.edu');
//   await page.getByRole('button', { name: 'Continue', exact: true }).click();
//   await page.getByText('No account found with this').click();
// });

// // test bad login (incorrect password)
// test('bad_clerk_password', async ({ page }) => {
//   await page.goto('http://localhost:8000/');
//   await page.getByRole('button', { name: 'Sign in' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).fill('ky@brown.edu');
//   await page.getByRole('button', { name: 'Continue', exact: true }).click();
//   await page.getByRole('textbox', { name: 'Password' }).fill('ky123');
//   await page.getByRole('button', { name: 'Continue' }).click();
//   await page.getByText('The password you entered is').click();
// });

// // test user story 1 and 2 (proper load of the map at correct zoom level, with overlays)
// test('test', async ({ page }) => {
//   await page.goto('http://localhost:8000/');
//   await page.getByRole('button', { name: 'Sign in' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).fill('ky@brown.edu');
//   await page.getByRole('button', { name: 'Continue', exact: true }).click();
//   await page.getByRole('textbox', { name: 'Password' }).fill('ky123123ky');
//   await page.getByRole('button', { name: 'Continue' }).click();
//   await page.getByRole('button', { name: 'Section 2: Mapbox Demo' }).click();
//   await page.waitForTimeout(3000); 
//   await page.screenshot({ path: 'map_screenshot.png', fullPage: true });
// });

// // test user story 1 and 2 (dragging the map)

// // test user story 3 (adding a pin)
// test('test3', async ({ page }) => {
//   await page.goto('http://localhost:8000/');
//   await page.getByRole('button', { name: 'Sign in' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).fill('ky@brown.edu');
//   await page.getByRole('button', { name: 'Continue', exact: true }).click();
//   await page.getByRole('textbox', { name: 'Password' }).fill('ky123123ky');
//   await page.getByRole('button', { name: 'Continue' }).click();
//   await page.getByRole('button', { name: 'Section 2: Mapbox Demo' }).click();
//   await page.getByRole('region', { name: 'Map' }).click({
//     position: {
//       x: 616,
//       y: 215
//     }
//   });
// });

// // test user story 3 (adding multiple pins)

// // test user story 3 (pins persist on reload)

// // test user story 3 (clearing pins)





