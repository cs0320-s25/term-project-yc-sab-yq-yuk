export interface Pin {
  id: string;
  userId: string;
  lat: number;
  lng: number; // Note: frontend uses lng, but backend uses lon
  timestamp: number;
}

/**
 * PinStore is responsible for managing pins in memory and interacting with the backend API.
 * It caches pin data using a Map.
 *  store the pin data persistently in a Firestore database and manage it from backend server
 */
class PinStore {
  // Use a Map for efficient lookups and updates
  private allPinsCache: Map<string, Pin> = new Map();

  // Ensure consistent formatting of userId to match direct URL access
  private normalizeUserId(userId: string): string {
    return decodeURIComponent(userId);
  }

  // Add pins to our global cache (for a specific user or all pins)
  private updateCache(pins: Pin[], userId?: string) {
    // If a user ID is provided, remove only that user’s pins
    if (userId) {
      this.removePinsForUser(userId);
    } else {
      // Otherwise, clear the entire cache (for an "all" refresh)
      this.allPinsCache.clear();
    }
    // Then add the new pins to the cache
    pins.forEach((pin) => {
      this.allPinsCache.set(pin.id, pin);
    });

    console.log(
      `Cache updated. Total pins in cache: ${this.allPinsCache.size}`
    );
  }

  // Remove pins for a specific user from the cache
  private removePinsForUser(userId: string) {
    const normalizedUserId = this.normalizeUserId(userId);
    const pinsToRemove: string[] = [];
    // Iterate through cache; collect keys of pins matching the userId.
    this.allPinsCache.forEach((pin, id) => {
      if (pin.userId === normalizedUserId) {
        pinsToRemove.push(id);
      }
    });
    // Remove all collected pins from the cache.
    pinsToRemove.forEach((id) => this.allPinsCache.delete(id));
    console.log(`Removed ${pinsToRemove.length} pins for user ${userId}`);
  }

  // Sends a request to add a new pin for the specified user.
  async addPin(userId: string, lat: number, lng: number): Promise<Pin> {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      const response = await fetch(
        `http://localhost:3232/add-pin?uid=${normalizedUserId}&lat=${lat}&lon=${lng}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        }
      );
      const text = await response.text();
      console.log("Add pin response:", text);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = JSON.parse(text);
      if (data.response_type !== "success") {
        throw new Error(data.error || "Failed to add pin");
      }

      // Create a pin object from the response
      const newPin: Pin = {
        id: `pin_${Date.now()}`, // Generate ID if not provided by backend
        userId: normalizedUserId,
        lat,
        lng,
        timestamp: data.pin.timestamp || Date.now(),
      };

      // Add new pin to the cache
      this.allPinsCache.set(newPin.id, newPin);

      // Since we've added a new pin, refresh the current user's pins.
      await this.getUserPins(userId);

      return newPin;
    } catch (error) {
      console.error("Error adding pin:", error);
      throw error;
    }
  }

  // Returns all pins in the cache as an array.
  async getAllPins(): Promise<Pin[]> {
    return Array.from(this.allPinsCache.values());
  }

  // Refresh pins for a specific user and update our cache
  async getUserPins(userId: string): Promise<Pin[]> {
    try {
      const normalizedUserId = this.normalizeUserId(userId);
      const response = await fetch(
        `http://localhost:3232/listpins?uid=${normalizedUserId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.response_type !== "success") {
        throw new Error(data.error || "Failed to get pins");
      }

      console.log(`Got ${data.pins.length} pins for user ${userId}`);

      const userPins: Pin[] = data.pins.map((pin: any) => ({
        id: pin.id || `pin_${Date.now()}_${Math.random()}`,
        userId: normalizedUserId,
        lat: pin.lat,
        lng: pin.lon,
        timestamp: pin.timestamp || Date.now(),
      }));

      // Update cache for this user only
      this.updateCache(userPins, normalizedUserId);

      return this.getAllPins();
    } catch (error) {
      console.error("Error refreshing user pins:", error);
      return this.getAllPins();
    }
  }

  async clearUserPins(userId: string): Promise<void> {
    try {
      const normalizedUserId = this.normalizeUserId(userId);

      const response = await fetch(
        `http://localhost:3232/clear-user?uid=${normalizedUserId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.response_type !== "success") {
        throw new Error(data.error || "Failed to clear pins");
      }

      // Remove all pins from the cache that belong to the user
      this.removePinsForUser(normalizedUserId);
    } catch (error) {
      console.error("Error clearing pins:", error);
      throw error;
    }
  }

  // Refresh pins for all users using uid=all.
  async refreshAllPins(): Promise<Pin[]> {
    try {
      const response = await fetch(`http://localhost:3232/listpins?uid=all`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.response_type !== "success") {
        throw new Error(data.error || "Failed to get all pins");
      }

      console.log(`Got ${data.pins.length} total pins from backend`);

      // Convert backend pins to frontend format.
      // Note: Backend should include the UID in each pin (for example as pin.uid).
      const allPins: Pin[] = data.pins.map((pin: any) => ({
        id: pin.id || `pin_${Date.now()}_${Math.random()}`,
        userId: pin.uid || pin.userId || "unknown",
        lat: pin.lat,
        lng: pin.lon,
        timestamp: pin.timestamp || Date.now(),
      }));

      // Clear the entire cache and update with these all pins.
      this.updateCache(allPins);

      return this.getAllPins();
    } catch (error) {
      console.error("Error refreshing all pins:", error);
      return this.getAllPins();
    }
  }
}

export const pinStore = new PinStore();
