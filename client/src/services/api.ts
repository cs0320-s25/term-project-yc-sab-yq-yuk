import { Event, UserProfile } from "../types";

// API base URL
const API_BASE_URL = "http://localhost:8080";

// Event-related API calls
// We export an 'api' object with all our API methods organized in one place
// This makes it easy to import and use throughout the application
export const api = {
  // Get all categories
  // This endpoint returns all available event categories for filter dropdowns
  getCategories: async (): Promise<string[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const data = await response.json();
      if (data.code === 1 && data.data) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },

  // Get distinct locations
  // This powers our location filter dropdown in the UI
  getLocations: async (): Promise<string[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/locations`);
      const data = await response.json();
      if (data.code === 1 && data.data) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching locations:", error);
      return [];
    }
  },

  // Get user profile
  // This fetches the user's profile including their event preferences
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('Fetching profile for userId:', userId);
      const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`);
      const data = await response.json();
      if (data.code === 1 && data.data) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  },

  // Get filtered events
  // This is our main endpoint for regular event browsing
  // It accepts optional filters for category, time, and location
  getEvents: async (
    filters: {
      category?: string;
      time?: string;
      near?: string;
    } = {}
  ): Promise<Event[]> => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.time) params.append("time", filters.time);
      if (filters.near) params.append("near", filters.near);

      const url = `${API_BASE_URL}/events/filter?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 1 && data.data) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    }
  },

  // Get events by search query
  // This powers our search bar functionality
  searchEvents: async (query: string): Promise<Event[]> => {
    try {
      const url = `${API_BASE_URL}/events?query=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 1 && data.data) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error("Error searching events:", error);
      return [];
    }
  },

  // Get trending events
  // This fetches events sorted by popularity metrics (Recalculate trending before fetching)
  getTrendingEvents: async (
    filters: {
      category?: string;
      time?: string;
      near?: string;
    } = {}
  ): Promise<Event[]> => {
    try {
      // First, trigger the recalculation of trending events
      try {
        const recalculateResponse = await fetch(`${API_BASE_URL}/trending/recalculate`, {
          method: 'POST', // or 'GET' depending on your API design
        });
        const recalculateData = await recalculateResponse.json();
        console.log("Trending recalculation:", recalculateData.code === 1 ? "successful" : "failed");
      } catch (recalcError) {
        // Log error but continue with fetching - don't block if recalculation fails
        console.error("Error recalculating trending events:", recalcError);
      }
      
      // Then proceed with fetching trending events 
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.time) params.append("time", filters.time);
      if (filters.near) params.append("near", filters.near);
  
      const url = `${API_BASE_URL}/trending?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.code === 1 && data.data) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching trending events:", error);
      return [];
    }
  },

  // Get personalized recommendations
  // This powers our "For You" section with personalized content
  getRecommendations: async (
    userId: string,
    filters: {
      category?: string;
      time?: string;
      near?: string;
    } = {}
  ): Promise<Event[]> => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.time) params.append("time", filters.time);
      if (filters.near) params.append("near", filters.near);

      const url = `${API_BASE_URL}/recommendations/${userId}?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 1 && data.data) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      return [];
    }
  },


  // Get a specific event by ID
  // This is used when we need full details for a single event
  getEvent: async (eventId: string): Promise<Event | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
      const data = await response.json();
      if (data.code === 1 && data.data) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching event ${eventId}:`, error);
      return null;
    }
  },

  // Record a view for an event
  // This increments the view count whenever a user views an event
  recordView: async (eventId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/views/${eventId}`, {
        method: 'PUT'
      });
      const data = await response.json();
      return data.code === 1;
    } catch (error) {
      console.error("Error recording view:", error);
      return false;
    }
  },

  // Like an event
  // This adds an event to a user's liked events list
  likeEvent: async (userId: string, eventId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_id: eventId }),
      });
      const data = await response.json();
      return data.code === 1;
    } catch (error) {
      console.error("Error liking event:", error);
      return false;
    }
  },

  // Unlike an event
  // This removes an event from a user's liked events list
  unlikeEvent: async (userId: string, eventId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/likes`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_id: eventId }),
      });
      const data = await response.json();
      return data.code === 1;
    } catch (error) {
      console.error("Error unliking event:", error);
      return false;
    }
  },

  // Bookmark an event
  // This adds an event to a user's bookmarked events list
  bookmarkEvent: async (userId: string, eventId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/bookmarks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_id: eventId }),
      });
      const data = await response.json();
      return data.code === 1;
    } catch (error) {
      console.error("Error bookmarking event:", error);
      return false;
    }
  },

  // Remove bookmark
  // This removes an event from a user's bookmarked events list
  unbookmarkEvent: async (userId: string, eventId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/bookmarks`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_id: eventId }),
      });
      const data = await response.json();
      return data.code === 1;
    } catch (error) {
      console.error("Error removing bookmark:", error);
      return false;
    }
  },
  // Fetch categories for a specific event
  fetchCategoriesForEvent: async (eventId: string): Promise<string[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${eventId}`);
      const data = await response.json();
      
      // Match your existing API response pattern
      if (data.code === 1 && data.data) {
        return data.data;
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching categories for event ${eventId}:`, error);
      return [];
    }
  }

};