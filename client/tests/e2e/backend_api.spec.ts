import { test, expect } from '@playwright/test';

// Appropriate integration tests for the new backend API features
test.describe('Backend API - Pin Management', () => {
  // Base URL where the backend is running.
  const baseUrl = 'http://localhost:3232';
  // Declare a variable to store a unique test user ID.
  let testUid: string;

  // Before each test, generate a unique user id and clear its pins.
  test.beforeEach(async ({ request }) => {
    // Generate a unique user ID using the current time and a random string.
    testUid = `testuser-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    console.log(`Using test user: ${testUid}`);
    // Clear pins for this unique test user.
    const clearRes = await request.get(`${baseUrl}/clear-user?uid=${testUid}`);
    expect(clearRes.ok()).toBeTruthy();
    const clearData = await clearRes.json();
    expect(clearData.response_type).toBe('success');
    console.log('beforeEach - clear pins response:', clearData);
  });

  test('List user pins should return an empty array after clearing', async ({ request }) => {
    // Query for pins for the newly generated test user.
    const listRes = await request.get(`${baseUrl}/listpins?uid=${testUid}`);
    expect(listRes.ok()).toBeTruthy();
    const listData = await listRes.json();
    console.log('List pins after clear:', listData);
    expect(listData.response_type).toBe('success');
    // Expect that there are no pins for the new test user.
    expect(listData.pins).toHaveLength(0);
  });

  test('Add a pin for test user and verify it appears in the user pin list', async ({ request }) => {
    // Coordinates for the new pin.
    const lat = 41.8230;
    const lon = -71.4210;
    // Add a new pin for the test user.
    const addRes = await request.get(`${baseUrl}/add-pin?uid=${testUid}&lat=${lat}&lon=${lon}`);
    expect(addRes.ok()).toBeTruthy();
    const addData = await addRes.json();
    console.log('Add pin response:', addData);
    expect(addData.response_type).toBe('success');
    expect(addData.pin).toBeDefined();

    // Wait a short time for Firestore to update (eventual consistency can cause a delay)
    await new Promise(res => setTimeout(res, 500));

    // List pins for the test user; since we cleared before, we expect exactly one pin.
    const listRes = await request.get(`${baseUrl}/listpins?uid=${testUid}`);
    expect(listRes.ok()).toBeTruthy();
    const listData = await listRes.json();
    console.log('List pins after adding:', listData);
    expect(listData.response_type).toBe('success');
    expect(listData.pins).toHaveLength(1);
  });

  test('Listing all pins should include the test user pin', async ({ request }) => {
    // Add a pin for the test user.
    const lat = 41.8230;
    const lon = -71.4210;
    const addRes = await request.get(`${baseUrl}/add-pin?uid=${testUid}&lat=${lat}&lon=${lon}`);
    expect(addRes.ok()).toBeTruthy();
    await addRes.json();
    const lat2 = 4.80;
    const lon2 = -7.40;
    const addRes2 = await request.get(`${baseUrl}/add-pin?uid=${testUid}&lat=${lat2}&lon=${lon2}`);
    expect(addRes2.ok()).toBeTruthy();
    await addRes2.json();

    // Wait a short time for Firestore to update (eventual consistency can cause a delay)
    await new Promise(res => setTimeout(res, 500));

    // Now list all pins from all users.
    const listRes = await request.get(`${baseUrl}/listpins?uid=all`);
    expect(listRes.ok()).toBeTruthy();
    const listData = await listRes.json();
    console.log('List all pins response:', listData);
    expect(listData.response_type).toBe('success');

    // Verify that at least one pin in the "all pins" list belongs to the test user.
    const testUserPins = listData.pins.filter((pin: any) => 
      pin.uid === testUid || pin.userId === testUid
    );
    expect(testUserPins.length).toBeGreaterThan(0);
  });
});