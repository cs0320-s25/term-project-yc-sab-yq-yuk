import { test, expect } from '@playwright/test';
import { setupClerkTestingToken, clerkSetup,clerk  } from '@clerk/testing/playwright';

// 1. Tests that simulate user interactions with front-end application. 
// (e.g., a user can add a pin, see it's popup on the map, and clear their pins, and that the front-end correctly handles data from the backend).
// 2. Test to vetify the pins should exist on reload on the frontend

// Setup Clerk in the test configuration (adjust with your Clerk frontend API URL)
clerkSetup({
  frontendApiUrl: 'https://flying-vulture-97.clerk.accounts.dev', // replace with your Clerk Frontend API URL
});


test.describe('Mapbox Frontend Integration Tests', () => {
  // In these tests, we assume the front-end application is served at http://localhost:8000/
  const appUrl = 'http://localhost:8000/';

  test.beforeEach(async ({ page }) => {
    clerkSetup({
        frontendApiUrl: 'https://flying-vulture-97.clerk.accounts.dev', // replace with your Clerk Frontend API URL
      });
    // Set up Clerk testing token for authentication.
    setupClerkTestingToken({ page });
    
    // Navigate to the application.
    await page.goto(appUrl);

    // Wait for Clerk to finish loading (adjust based on how your app exposes Clerk state).
    await page.waitForFunction(() => Boolean(window.Clerk && window.Clerk.loaded));

    // Optionally, verify that a "Sign In" button is visible (if the user is not signed in yet).
    // This assumes your application shows a "Sign In" text.
    const loginButton = page.getByText('Sign In');
    await expect(loginButton).toBeVisible();

        // Log in with test credentials
    await clerk.signIn({
      page,
      signInParams: {
        strategy: 'password',
        password: process.env.E2E_CLERK_USER_PASSWORD!,
        identifier: process.env.E2E_CLERK_USER_USERNAME!,
      },
    });
    

       // Navigate to map section
    await page.getByText('Section 2: Mapbox Demo').click();
    

  });

  test('should add a new pin when clicking on the map', async ({ page }) => {
    // Ensure the map is visible.
    await expect(page.locator('.mapboxgl-canvas')).toBeVisible();

    // Give the map extra time to initialize its markers.
    await page.waitForTimeout(2000);
        // Click the Clear My Pins button.
    // Adjust the selector if your button uses different text or a role.
    const clearButton = page.getByRole('button', { name: 'Clear My Pins' });
    await expect(clearButton).toBeVisible();
    await clearButton.click({ force: true });

    await page.waitForTimeout(3000);
    // Count markers currently rendered (if any).
    const initialMarkerCount = await page.locator('.mapboxgl-marker').count();
    console.log(`Initial marker count: ${initialMarkerCount}`);

    // Retrieve the map canvas bounding box.
    const mapCanvas = page.locator('.mapboxgl-canvas');
    const boundingBox = await mapCanvas.boundingBox();
    if (boundingBox) {
      // Click roughly near the center of the canvas.
      await page.mouse.click(
        boundingBox.x + boundingBox.width / 4,
        boundingBox.y + boundingBox.height / 4
      );
    } else {
      throw new Error('Map canvas not found');
    }

    // Wait for the new marker to appear (allow time for the backend and UI to update).
    await page.waitForTimeout(3000);

    // Count markers again.
    const newMarkerCount = await page.locator('.mapboxgl-marker').count();
    console.log(`New marker count: ${newMarkerCount}`);
    // Assert that at least one new marker was added.
    expect(newMarkerCount).toBeGreaterThan(initialMarkerCount);
    await page.waitForTimeout(10000);
  });

  test('should display popup with pin details when clicking on a marker', async ({ page }) => {
    // Ensure the map and markers are loaded.
    await expect(page.locator('.mapboxgl-canvas')).toBeVisible();
    await page.waitForTimeout(2000);

    // Ensure at least one marker exists.
    const markerCount = await page.locator('.mapboxgl-marker').count();
    expect(markerCount).toBeGreaterThan(0);

    // Click the first marker. Use force:true if necessary (to bypass any overlay).
    await page.locator('.mapboxgl-marker').first().click({ force: true });

    // Wait shortly for the popup to appear.
    await page.waitForTimeout(1000);

    // Locate the popup element and assert that it's visible.
    const popup = page.locator('.mapboxgl-popup');
    await expect(popup).toBeVisible();

    // Optionally, check that the popup displays expected text (e.g., "Pin Details").
    await expect(popup.locator('h4')).toContainText('Pin Details');
  });

  test('should clear user pins when clicking the Clear My Pins button', async ({ page }) => {
    // Ensure the map is visible.
    await expect(page.locator('.mapboxgl-canvas')).toBeVisible();
    await page.waitForTimeout(2000);
    const initialCount = await page.locator('.mapboxgl-marker').count();
    console.log(`initialCount Marker count before clear: ${initialCount}`);


    // Add pin
    const mapCanvas = page.locator('.mapboxgl-canvas');
    const boundingBox = await mapCanvas.boundingBox();
    if (boundingBox) {
      // Click roughly near the center of the canvas.
      await page.mouse.click(
        boundingBox.x + boundingBox.width / 4,
        boundingBox.y + boundingBox.height / 4
      );
      await page.mouse.click(
        boundingBox.x + boundingBox.width / 4 + 10,
        boundingBox.y + boundingBox.height / 4+ 10
      );

    } else {
        throw new Error('Map canvas not found');
      }
      await page.waitForTimeout(10000);
    // Count current markers.
    const initialMarkerCount = await page.locator('.mapboxgl-marker').count();
    console.log(`Marker count before clear: ${initialMarkerCount}`);
    await page.waitForTimeout(2000);

    // Click the Clear My Pins button.
    // Adjust the selector if your button uses different text or a role.
    const clearButton = page.getByRole('button', { name: 'Clear My Pins' });
    await expect(clearButton).toBeVisible();
    await clearButton.click({ force: true });

    // Wait for the clear operation to complete and UI update.
    await page.waitForTimeout(10000);

    // Verify that markers from the current user are no longer displayed.
    // In this case, assume that clearing only removes user's markers while markers for other users (if any) might remain.
    // For the purpose of this test, we expect the marker count to have decreased.
    const afterClearCount = await page.locator('.mapboxgl-marker').count();
    console.log(`Marker count after clear: ${afterClearCount}`);
    expect(afterClearCount).toBeLessThan(initialMarkerCount);
  });
  test('pins persist on reload after adding a new pin by clicking on the map', async ({ page }) => {
    // Ensure the map is visible.
    await expect(page.locator('.mapboxgl-canvas')).toBeVisible();

    // Give the map extra time to initialize its markers.
    await page.waitForTimeout(2000);
        // Click the Clear My Pins button.
    // Adjust the selector if your button uses different text or a role.
    const clearButton = page.getByRole('button', { name: 'Clear My Pins' });
    await expect(clearButton).toBeVisible();
    await clearButton.click({ force: true });

    await page.waitForTimeout(3000);
    // Count markers currently rendered (if any).
    const initialMarkerCount = await page.locator('.mapboxgl-marker').count();
    console.log(`Initial marker count: ${initialMarkerCount}`);

    // Retrieve the map canvas bounding box.
    const mapCanvas = page.locator('.mapboxgl-canvas');
    const boundingBox = await mapCanvas.boundingBox();
    if (boundingBox) {
      // Click roughly near the center of the canvas.
      await page.mouse.click(
        boundingBox.x + boundingBox.width / 4,
        boundingBox.y + boundingBox.height / 4
      );
    } else {
      throw new Error('Map canvas not found');
    }

    // Wait for the new marker to appear (allow time for the backend and UI to update).
    await page.waitForTimeout(3000);

    // Count markers again.
    const newMarkerCount = await page.locator('.mapboxgl-marker').count();
    console.log(`New marker count: ${newMarkerCount}`);
    await page.waitForTimeout(3000);
    // Assert that at least one new marker was added.
    expect(newMarkerCount).toBeGreaterThan(initialMarkerCount);
    
    // Reload the page.
    await page.reload();


       // Navigate to map section
    await page.getByText('Section 2: Mapbox Demo').click();
    
    
    // After reload, wait for the map and markers to be visible.
    await expect(page.locator('.mapboxgl-canvas')).toBeVisible();
    await page.waitForTimeout(3000);
    
    // Count markers after reload.
    const markerCountAfterReload = await page.locator('.mapboxgl-marker').count();
    console.log(`Marker count after reload: ${markerCountAfterReload}`);
    
    // Verify that the marker count after reload is at least as many as after adding.
    // (It could be greater if other users' pins are also displayed.)
    await page.waitForTimeout(3000);
    expect(markerCountAfterReload).toBeGreaterThanOrEqual(newMarkerCount);
  });

});