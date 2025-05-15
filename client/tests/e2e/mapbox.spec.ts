// // test for sprint5.1
// import { test, expect } from '@playwright/test';
// import { setupClerkTestingToken, clerk } from '@clerk/testing/playwright';
// import { clerkSetup } from '@clerk/testing/playwright';
// // Set up Clerk first in the config
// clerkSetup({
//     // Your Clerk Frontend API URL (from your Clerk Dashboard)
//     frontendApiUrl: 'https://flying-vulture-97.clerk.accounts.dev',
//   });
// test.describe('Mapbox Component SVG Testing', () => {
//   test.beforeEach(async ({ page }) => {
//     // Set up Clerk testing token
//     setupClerkTestingToken({ page });
    
//     // Mock localStorage to pre-populate with some pins
//     await page.addInitScript(() => {
//       const mockPins = [
//         {
//           id: 'pin_1',
//           userId: 'user_2NRhvHRrWDQUYABj8SrKbjzCFvt',  // Example Clerk user ID format
//           lat: 41.8246,
//           long: -71.4128,
//           timestamp: Date.now() - 3600000 // 1 hour ago
//         },
//         {
//           id: 'pin_2',
//           userId: 'user_2OR5kLN98aajX94g7cF29fjdPc2',  // Different user
//           lat: 41.8300,
//           long: -71.4200,
//           timestamp: Date.now() - 7200000 // 2 hours ago
//         }
//       ];
//       localStorage.setItem('mapbox_pins', JSON.stringify(mockPins));
//     });
    
//     // Navigate to the application
//     await page.goto('http://localhost:8000/');
    
//     // Wait for Clerk to load
//     await clerk.loaded({ page });
    
//     // Verify we see the login button
//     const loginButton = page.getByText('Sign In');
//     await expect(loginButton).toBeVisible();
    
//     // Log in with test credentials
//     await clerk.signIn({
//       page,
//       signInParams: {
//         strategy: 'password',
//         password: process.env.E2E_CLERK_USER_PASSWORD!,
//         identifier: process.env.E2E_CLERK_USER_USERNAME!,
//       },
//     });
    
//   });
  
//   // Test section navigation
//   test('should navigate between sections correctly', async ({ page }) => {
//     await expect(page.getByText('Section 2: Mapbox Demo')).toBeVisible();
    
//     // Navigate to the map section
//     await page.getByText('Section 2: Mapbox Demo').click();
    
//     // Verify we're on the map section
//     await expect(page.locator('.mapboxgl-canvas')).toBeVisible();
    
//     // Navigate to Firestore section
//     await page.getByText('Section 1: Firestore Demo').click();
    
//     // Verify we're on the Firestore section (map not visible)
//     await expect(page.locator('.mapboxgl-canvas')).not.toBeVisible();
    
//     // Navigate back to map section
//     await page.getByText('Section 2: Mapbox Demo').click();
    
//     // Verify we're back on map section
//     await expect(page.locator('.mapboxgl-canvas')).toBeVisible();
//   });

//   // Testing SVG markers
//   test('should display markers as SVG elements', async ({ page }) => {
//     // Navigate to map section
//     await page.getByText('Section 2: Mapbox Demo').click();
    
//     // Wait for map to load
//     await expect(page.locator('.mapboxgl-canvas')).toBeVisible();
    
//     // Wait for markers to render
//     await page.waitForTimeout(1000);
    
//     // Check for Mapbox markers
//     const markers = page.locator('.mapboxgl-marker');
//     await expect(markers).toHaveCount(2);
    
//     // Check for 2 SVG elements within markers
//     await expect(page.locator('.mapboxgl-marker svg')).toHaveCount(2);
//   });

// // Testing interaction with SVG elements
// test('should add a new pin when clicking on the map', async ({ page }) => {
//     // Navigate to map section
//     await page.getByText('Section 2: Mapbox Demo').click();
    
//     // Wait for map to load completely
//     await expect(page.locator('.mapboxgl-canvas')).toBeVisible();
    
//     // Give the map additional time to fully initialize
//     await page.waitForTimeout(2000);
    
//     // Get the initial marker count from the DOM
//     const initialMarkerCount = await page.locator('.mapboxgl-marker').count();
//     console.log(`Initial DOM markers: ${initialMarkerCount}`);
    
//     // Get the initial pin count from localStorage
//     const initialPinCount = await page.evaluate(() => {
//       const pins = JSON.parse(localStorage.getItem('mapbox_pins') || '[]');
//       return pins.length;
//     });
//     console.log(`Initial localStorage pins: ${initialPinCount}`);
    
//     // Click on the map canvas
//     const mapCanvas = page.locator('.mapboxgl-canvas');
//     const boundingBox = await mapCanvas.boundingBox();
    
//     if (boundingBox) {
//       // Click near the center of the map
//       await page.mouse.click(
//         boundingBox.x + boundingBox.width / 4,
//         boundingBox.y + boundingBox.height / 4
//       );
      
//       // Wait longer for the new marker to be added and rendered
//       await page.waitForTimeout(3000);
      
//       // Check localStorage to confirm a pin was added
//       const newPinCount = await page.evaluate(() => {
//         const pins = JSON.parse(localStorage.getItem('mapbox_pins') || '[]');
//         return pins.length;
//       });
//       console.log(`New localStorage pins: ${newPinCount}`);
      
//       // Verify a new pin was added to localStorage
//       expect(newPinCount).toBe(initialPinCount + 1);
   
//   }
// });

// // Testing popup on SVG marker click
// test('should show popup when clicking on a pin', async ({ page }) => {
//     // Navigate to map section
//     await page.getByText('Section 2: Mapbox Demo').click();
    
//     // Wait for map to load completely
//     await expect(page.locator('.mapboxgl-canvas')).toBeVisible();
    
//     // Give the map additional time to fully initialize and render pins
//     await page.waitForTimeout(2000);
    
//     // Log the number of pins found
//     const pinCount = await page.locator('.mapboxgl-marker').count();
//     console.log(`Found ${pinCount} pins on the map`);
    
//     // Verify we have at least one pin to click
//     expect(pinCount).toBeGreaterThan(0);
    
//     // SOLUTION 1: Use force:true to bypass event interception
//     const pin = page.locator('.mapboxgl-marker').first();
//     console.log('Clicking on pin with force:true option');
//     await pin.click({ force: true });

    
   
    
//     // Wait for popup to appear
//     console.log('Waiting for popup to appear');
//     await page.waitForTimeout(1000);
    
//     // Verify popup is visible
//     const popup = page.locator('.mapboxgl-popup');
//     await expect(popup).toBeVisible();
//     console.log('Popup is visible');
    
//     // Check popup content
//     await expect(popup.locator('h4')).toContainText('Pin Details');

//     // Check for specific elements in the popup
//     await expect(popup.getByText('Created by:')).toBeVisible();
//     await expect(popup.getByText(/Latitude:/)).toBeVisible();
//     await expect(popup.getByText(/Longitude:/)).toBeVisible();
//   });

//   // Testing clear pins functionality
//   test('should clear user pins when clicking Clear My Pins button', async ({ page }) => {
//     // Navigate to map and wait for it to load
//     await page.getByText('Section 2: Mapbox Demo').click();
//     await expect(page.locator('.mapboxgl-canvas')).toBeVisible();
//     await page.waitForTimeout(1000); // Allow time for pins to load
    
//     // Get the actual user ID from Clerk (if possible)
//     const currentUserId = await page.evaluate(() => {
//       // Try to get user ID from Clerk if available
//       // Adjust this based on how your app stores the current user ID
//       return window.Clerk?.user?.id || 'user_2NRhvHRrWDQUYABj8SrKbjzCFvt';
//     });
    
//     // Click the clear button with force true
//     await page.getByText('Clear My Pins').click({ force: true });
    
//     // Wait for the clear operation to complete
//     await page.waitForTimeout(1000);
    
//     // Verify user pins are removed from localStorage
//     const remainingPins = await page.evaluate((userId) => {
//       const pins = JSON.parse(localStorage.getItem('mapbox_pins') || '[]');
//       console.log('All pins after clearing:', pins);
//       const userPins = pins.filter(pin => pin.userId === userId);
//       console.log('User pins after clearing:', userPins);
//       return userPins;
//     }, currentUserId);
    
//     // Check if any pins remain
//     expect(remainingPins.length).toBe(0);
//   });


// });
