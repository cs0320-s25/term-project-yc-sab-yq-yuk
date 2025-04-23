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

// // test proper clerk login functionality
// test('clerk_test', async ({ page }) => {
//   await page.getByRole('button', { name: 'Sign in' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).fill('ky@brown.edu');
//   await page.getByRole('button', { name: 'Continue', exact: true }).click();
//   await page.getByRole('textbox', { name: 'Password' }).fill('ky123123ky');
//   await page.getByRole('button', { name: 'Continue' }).click();
//   await page.getByRole('button', { name: 'Section 2: Mapbox Demo' }).click();
// });

// // test bad login (incorrect username)
// test('bad_clerk_user', async ({ page }) => {
//   await page.getByRole('button', { name: 'Sign in' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).fill('k@brown.edu');
//   await page.getByRole('button', { name: 'Continue', exact: true }).click();
//   await page.getByText('No account found with this').click();
// });

// // test bad login (incorrect password)
// test('bad_clerk_password', async ({ page }) => {
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
//   await page.getByRole('button', { name: 'Clear My Pins' }).click();
//   const screenshot = await page.screenshot({ fullPage: true });
//   expect(screenshot).toMatchSnapshot('map_screenshot.png');
// });

// // test user story 3 (adding a pin)
// test('creating a pin', async ({ page }) => {
//   await page.goto('http://localhost:8000/');
//   await page.getByRole('button', { name: 'Sign in' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).fill('ky@brown.edu');
//   await page.getByRole('button', { name: 'Continue', exact: true }).click();
//   await page.getByRole('textbox', { name: 'Password' }).fill('ky123123ky');
//   await page.getByRole('button', { name: 'Continue' }).click();
//   await page.waitForTimeout(3000); 
//   await page.getByRole('button', { name: 'Section 2: Mapbox Demo' }).click();
//   await page.getByRole('button', { name: 'Clear My Pins' }).click();
//   await page.getByRole('region', { name: 'Map' }).click({
//     position: {
//       x: 635,
//       y: 321
//     }
//   });
//   await page.locator('circle').click();
//   await page.getByRole('heading', { name: 'Pin Details' }).click();
//   await page.getByText('Created by: You').click();
//   await page.getByText('Location:Latitude: 41.').click();
// });

// // test user story 3 (adding multiple pins)
// test('creating multiple pins', async ({ page }) => {
//   await page.getByRole('button', { name: 'Sign in' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).fill('ky@brown.edu');
//   await page.getByRole('button', { name: 'Continue', exact: true }).click();
//   await page.getByRole('textbox', { name: 'Password' }).fill('ky123123ky');
//   await page.getByRole('button', { name: 'Continue' }).click();
//   await page.getByRole('button', { name: 'Section 2: Mapbox Demo' }).click();
//   await page.getByRole('button', { name: 'Clear My Pins' }).click();
//   await page.getByRole('region', { name: 'Map' }).click({
//     position: {
//       x: 538,
//       y: 293
//     }
//   });
//   await page.locator('circle').click();
//   await page.getByRole('heading', { name: 'Pin Details' }).click();
//   await page.getByText('Created by: You').click();
//   await page.getByText('Location:Latitude: 41.').click();
//   await page.getByRole('region', { name: 'Map' }).click({
//     position: {
//       x: 856,
//       y: 222
//     }
//   });
//   await page.locator('circle').nth(1).click();
//   await page.getByText('Created by: You').click();
//   await page.getByText('Location:Latitude: 41.').click();
// });

// // test user story 3 (pins persist on reload)

// test('reload pins', async ({ page }) => {
//   await page.getByRole('button', { name: 'Sign in' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).fill('ky@brown.edu');
//   await page.getByRole('button', { name: 'Continue', exact: true }).click();
//   await page.getByRole('textbox', { name: 'Password' }).fill('ky123123ky');
//   await page.getByRole('button', { name: 'Continue' }).click();
//   await page.getByRole('button', { name: 'Section 2: Mapbox Demo' }).click();
//   await page.getByRole('button', { name: 'Clear My Pins' }).click();
//   await page.getByRole('region', { name: 'Map' }).click({
//     position: {
//       x: 672,
//       y: 320
//     }
//   });
//   await page.locator('circle').click();
//   await page.getByText('Created by: You').click();
//   await page.getByText('Location:Latitude: 41.').click();
//   await page.reload();
//   await page.getByRole('button', { name: 'Section 2: Mapbox Demo' }).click();
//   await page.locator('circle').click();
//   await page.getByText('Created by: You').click();
//   await page.getByText('Location:Latitude: 41.').click();
// });

// // test user story 3 (pins visible by other users)
// test('2 users', async ({ page }) => {
//   await page.getByRole('button', { name: 'Sign in' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).fill('ky@brown.edu');
//   await page.getByRole('button', { name: 'Continue', exact: true }).click();
//   await page.getByRole('textbox', { name: 'Password' }).fill('ky123123ky');
//   await page.getByRole('button', { name: 'Continue' }).click();
//   await page.getByRole('button', { name: 'Section 2: Mapbox Demo' }).click();
//   await page.getByRole('button', { name: 'Clear My Pins' }).click();
//   await page.getByRole('region', { name: 'Map' }).click({
//     position: {
//       x: 560,
//       y: 253
//     }
//   });
//   await page.getByRole('region', { name: 'Map' }).click({
//     position: {
//       x: 830,
//       y: 275
//     }
//   });
//   await page.getByRole('region', { name: 'Map' }).click({
//     position: {
//       x: 584,
//       y: 403
//     }
//   });
//   await page.getByRole('button', { name: 'Sign out' }).click();
//   await page.getByRole('button', { name: 'Sign in' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).fill('ky2@brown.edu');
//   await page.getByRole('button', { name: 'Continue', exact: true }).click();
//   await page.getByRole('textbox', { name: 'Password' }).fill('ky123123ky');
//   await page.getByRole('button', { name: 'Continue' }).click();
//   await page.getByRole('button', { name: 'Section 2: Mapbox Demo' }).click();
//   await page.locator('circle').first().click();
//   await page.getByRole('heading', { name: 'Pin Details' }).click();
//   await page.getByText('Created by: user_2vBOw').click();
//   await page.getByText('Location:Latitude: 41.').click();
//   await page.locator('circle').nth(1).click();
//   await page.getByRole('heading', { name: 'Pin Details' }).click();
//   await page.getByText('Created by: user_2vBOw').click();
//   await page.getByText('Location:Latitude: 41.').click();
//   await page.locator('circle').nth(2).click();
//   await page.getByRole('heading', { name: 'Pin Details' }).click();
//   await page.getByText('Created by: user_2vBOw').click();
//   await page.getByText('Location:Latitude: 41.').click();
// });

// // test user story 3 (my pins are different than other users' pins)
// test('different pins', async ({ page }) => {
//   await page.getByRole('button', { name: 'Sign in' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).fill('ky@brown.edu');
//   await page.getByRole('button', { name: 'Continue', exact: true }).click();
//   await page.getByRole('textbox', { name: 'Password' }).fill('ky123123ky');
//   await page.getByRole('button', { name: 'Continue' }).click();
//   await page.getByRole('button', { name: 'Section 2: Mapbox Demo' }).click();
//   await page.getByRole('button', { name: 'Clear My Pins' }).click();
//   await page.getByRole('region', { name: 'Map' }).click({
//     position: {
//       x: 560,
//       y: 235
//     }
//   });
//   await page.getByRole('button', { name: 'Sign out' }).click();
//   await page.getByRole('button', { name: 'Sign in' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).fill('ky2@brown.edu');
//   await page.getByRole('button', { name: 'Continue', exact: true }).click();
//   await page.getByRole('textbox', { name: 'Password' }).fill('ky123123ky');
//   await page.getByRole('button', { name: 'Continue' }).click();
//   await page.getByRole('button', { name: 'Section 2: Mapbox Demo' }).click();
//   await page.getByRole('region', { name: 'Map' }).click({
//     position: {
//       x: 775,
//       y: 198
//     }
//   });
//   await page.locator('circle').first().click();
//   await page.getByText('Created by: user_2vBOw').click();
//   await page.getByText('Location:Latitude: 41.').click();
//   await page.locator('circle').nth(1).click();
//   await page.getByText('Created by: You').click();
//   await page.getByText('Location:Latitude: 41.').click();
// });

// // test user story 3 (clearing pins - 1 user)

// test('clear pins', async ({ page }) => {
//   await page.getByRole('button', { name: 'Sign in' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).fill('ky@brown.edu');
//   await page.getByRole('button', { name: 'Continue', exact: true }).click();
//   await page.getByRole('textbox', { name: 'Password' }).fill('ky123123ky');
//   await page.getByRole('button', { name: 'Continue' }).click();
//   await page.getByRole('button', { name: 'Section 2: Mapbox Demo' }).click();
//   await page.getByRole('button', { name: 'Clear My Pins' }).click();
//   await page.getByRole('region', { name: 'Map' }).click({
//     position: {
//       x: 556,
//       y: 236
//     }
//   });
//   await page.getByRole('region', { name: 'Map' }).click({
//     position: {
//       x: 814,
//       y: 299
//     }
//   });
//   await page.getByRole('button', { name: 'Clear My Pins' }).click();
//   await page.waitForTimeout(3000); 
//   const screenshot = await page.screenshot({ fullPage: true });
//   expect(screenshot).toMatchSnapshot('map_screenshot.png');
// });

// // test user story 3 (clearing pins - multiple users)

// test('clearing pins multiple users', async ({ page }) => {
//   await page.getByRole('button', { name: 'Sign in' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).fill('ky@brown.edu');
//   await page.getByRole('button', { name: 'Continue', exact: true }).click();
//   await page.getByRole('textbox', { name: 'Password' }).fill('ky123123ky');
//   await page.getByRole('button', { name: 'Continue' }).click();
//   await page.getByRole('button', { name: 'Section 2: Mapbox Demo' }).click();
//   await page.getByRole('button', { name: 'Clear My Pins' }).click();
//   await page.getByRole('region', { name: 'Map' }).click({
//     position: {
//       x: 566,
//       y: 266
//     }
//   });
//   await page.getByRole('button', { name: 'Sign out' }).click();
//   await page.getByRole('button', { name: 'Sign in' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).fill('ky2@brown.edu');
//   await page.getByRole('button', { name: 'Continue', exact: true }).click();
//   await page.getByRole('textbox', { name: 'Password' }).fill('ky123123ky');
//   await page.getByRole('button', { name: 'Continue' }).click();
//   await page.getByRole('button', { name: 'Section 2: Mapbox Demo' }).click();
//   await page.getByRole('region', { name: 'Map' }).click({
//     position: {
//       x: 818,
//       y: 209
//     }
//   });
//   await page.getByRole('region', { name: 'Map' }).click({
//     position: {
//       x: 803,
//       y: 291
//     }
//   });
//   await page.getByRole('button', { name: 'Clear My Pins' }).click();
//   await page.getByRole('button', { name: 'Sign out' }).click();
//   await page.getByRole('button', { name: 'Sign in' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).fill('ky@brown.edu');
//   await page.getByRole('button', { name: 'Continue', exact: true }).click();
//   await page.getByRole('textbox', { name: 'Password' }).fill('ky123123ky');
//   await page.getByRole('button', { name: 'Continue' }).click();
//   await page.getByRole('button', { name: 'Section 2: Mapbox Demo' }).click();
//   await page.getByRole('button', { name: 'Clear My Pins' }).click();
//   await page.waitForTimeout(3000); 
//   const screenshot = await page.screenshot({ fullPage: true });
//   expect(screenshot).toMatchSnapshot('map_screenshot.png');  
// });





