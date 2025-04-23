import { test, expect } from '@playwright/test';
import { setupClerkTestingToken, clerkSetup,clerk } from '@clerk/testing/playwright';

// A front‑end test using mocks. 

// Set up Clerk (adjust the URL to your actual Clerk Frontend API URL)
clerkSetup({
  frontendApiUrl: 'https://flying-vulture-97.clerk.accounts.devs', // Replace with your Clerk API URL
});

test.describe('Mapbox Frontend Mock Tests - Success', () => {
  // The front-end app URL. Ensure your app is running at this address.
  const appUrl = 'http://localhost:8000/';
  // We'll use an in-memory array to store pins added during the test.
  let mockPins: any[] = [];

  test.beforeEach(async ({ page }) => {
    // Set up Clerk testing token for authentication.
    setupClerkTestingToken({ page });

    // Reset our in-memory mock for pins before each test.
    mockPins = [];

    // --- Mocks for backend API endpoints ---

    // Intercept the /add-pin endpoint:
    // When the app calls add-pin, we'll push a new pin object into our mockPins array.
    await page.route('**/add-pin*', async route => {
      // Create a new pin object using the query parameters:
      const url = new URL(route.request().url());
      const uid = url.searchParams.get('uid') || 'mockUser';
      const lat = parseFloat(url.searchParams.get('lat') || '0');
      const lon = parseFloat(url.searchParams.get('lon') || '0');
      
      const newPin = {
        uid,
        lat,
        lon,
        timestamp: Date.now(),
      };
      // Push the new pin to our in-memory array.
      mockPins.push(newPin);
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response_type: 'success',
          pin: newPin,
        }),
      });
    });

    // Intercept the /listpins endpoint:
    // Return the current state of the mockPins array.
    await page.route('**/listpins*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response_type: 'success',
          pins: mockPins,
        }),
      });
    });
    
    
    // Navigate to the front-end application.
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
              password: process.env.E2E_CLERK_TESTUSER_PASSWORD!,
              identifier: process.env.E2E_CLERK_TESTUSER_USERNAME!,
            },
          });
    

       // Navigate to map section
    await page.getByText('Section 2: Mapbox Demo').click();
    
    // Wait for the Mapbox canvas to be visible (ensures the map loads).
    await expect(page.locator('.mapboxgl-canvas')).toBeVisible();
    
    const clearButton = page.getByRole('button', { name: 'Clear My Pins' });
    if (await clearButton.count() > 0) {
      await clearButton.click({ force: true });
      // Wait for UI update.
      await page.waitForTimeout(2000);
    }
    const initialMarkerCount = await page.locator('.mapboxgl-marker').count();
    console.log(`Initial marker count after clearing: ${initialMarkerCount}`);

  });

  test('should add a new pin successfully using mocked API responses', async ({ page }) => {
    // Ensure the map is visible.
    await expect(page.locator('.mapboxgl-canvas')).toBeVisible();

    // Wait for map initialization.
    await page.waitForTimeout(2000);

    // Count markers currently rendered.
    const initialMarkerCount = await page.locator('.mapboxgl-marker').count();
    console.log(`Initial marker count: ${initialMarkerCount}`);


    // Retrieve the map canvas bounding box.
    const mapCanvas = page.locator('.mapboxgl-canvas');
    const boundingBox = await mapCanvas.boundingBox();
    if (!boundingBox) {
      throw new Error('Map canvas not found');
    }
    
    // Click roughly near the center of the canvas.
    await page.mouse.click(
      boundingBox.x + boundingBox.width / 2,
      boundingBox.y + boundingBox.height / 2
    );

    // Wait for the new marker to appear (allow time for backend/UI update).
    await page.waitForTimeout(3000);

    // Count markers again.
    const newMarkerCount = await page.locator('.mapboxgl-marker').count();
    console.log(`New marker count: ${newMarkerCount}`);
    // Assert that at least one new marker was added.
    expect(newMarkerCount).toBeGreaterThan(initialMarkerCount);
  });
});
