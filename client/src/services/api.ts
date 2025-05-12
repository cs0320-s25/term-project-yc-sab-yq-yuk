import { Event, UserProfile } from "../types";

// API base URL
const API_BASE_URL = "http://localhost:8080";

// Event-related API calls
export const api = {
  // Get all categories
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
  getTrendingEvents: async (
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
  }
};