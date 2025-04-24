// A service layer that can initially use mock data but can be easily 
// switched to real API calls later.

import { Event, UserProfile } from '../types';
import { mockEvents, mockUserProfile } from './mockData';


// Toggle between mock mode and real API mode
const USE_MOCK_DATA = true;
const API_BASE_URL = 'http://localhost:3232/api';

// ================================================================================
// ===========================Event-related API functions==========================
// ================================================================================
export const EventService = {
    // Get all events with optional filters
    getAllEvents: async (filters?: { time?: string, category?: string, location?: string }): Promise<Event[]> => {
      if (USE_MOCK_DATA) {
        // Return mock data with basic filtering
        let filteredEvents = [...mockEvents];
        
        if (filters?.category) {
          filteredEvents = filteredEvents.filter(event => 
            event.categories.includes(filters.category!)
          );
        }
        
        return new Promise(resolve => {
          // Simulate network delay
          setTimeout(() => resolve(filteredEvents), 300);
        });
      }

      // Real API call implementation for when backend is ready
    let url = `${API_BASE_URL}/events`;
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.time) params.append('time', filters.time);
      if (filters.category) params.append('category', filters.category);
      if (filters.location) params.append('location', filters.location);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    const response = await fetch(url);
    return await response.json();
  },
  
  // Get single event by ID
  getEvent: async (eventId: string): Promise<Event | null> => {
    if (USE_MOCK_DATA) {
      const event = mockEvents.find(e => e.event_id === eventId) || null;
      return new Promise(resolve => {
        setTimeout(() => resolve(event), 200);
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
    return await response.json();
  },
  
  // Record a view for an event
  viewEvent: async (eventId: string): Promise<void> => {
    if (USE_MOCK_DATA) {
      const event = mockEvents.find(e => e.event_id === eventId);
      if (event) {
        event.viewed_count += 1;
      }
      return Promise.resolve();
    }
    
    await fetch(`${API_BASE_URL}/events/${eventId}/views`, {
      method: 'POST'
    });
  },
  
  // Get trending events
  getTrendingEvents: async (): Promise<Event[]> => {
    if (USE_MOCK_DATA) {
      // Sort by trending_score
      const trendingEvents = [...mockEvents]
        .sort((a, b) => b.trending_score - a.trending_score)
        .slice(0, 5);
        
      return new Promise(resolve => {
        setTimeout(() => resolve(trendingEvents), 300);
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/trending`);
    return await response.json();
  }
};

// ================================================================================
// ===========================User-related API functions===========================
// ================================================================================
export const UserService = {
  // Get user profile
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    if (USE_MOCK_DATA) {
      return new Promise(resolve => {
        setTimeout(() => resolve({...mockUserProfile, user_id: userId}), 300);
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/user/${userId}/profile`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
    });
    return await response.json();
  },
  
  // Like an event
  likeEvent: async (userId: string, eventId: string): Promise<boolean> => {
    if (USE_MOCK_DATA) {
      // Add to mock user's likes if not already there
      if (!mockUserProfile.likes.includes(eventId)) {
        mockUserProfile.likes.push(eventId);
      }
      
      // Increment like count on event
      const event = mockEvents.find(e => e.event_id === eventId);
      if (event) {
        event.liked_count += 1;
      }
      
      return new Promise(resolve => {
        setTimeout(() => resolve(true), 200);
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/user/${userId}/likes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ event_id: eventId })
    });
    
    return response.ok;
  },
  
  // Unlike an event
  unlikeEvent: async (userId: string, eventId: string): Promise<boolean> => {
    if (USE_MOCK_DATA) {
      // Remove from mock user's likes
      mockUserProfile.likes = mockUserProfile.likes.filter(id => id !== eventId);
      
      // Decrement like count on event
      const event = mockEvents.find(e => e.event_id === eventId);
      if (event && event.liked_count > 0) {
        event.liked_count -= 1;
      }
      
      return new Promise(resolve => {
        setTimeout(() => resolve(true), 200);
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/user/${userId}/likes/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    return response.ok;
  },
  
  // Bookmark an event
  bookmarkEvent: async (userId: string, eventId: string): Promise<boolean> => {
    if (USE_MOCK_DATA) {
      // Add to mock user's bookmarks if not already there
      if (!mockUserProfile.bookmarks.includes(eventId)) {
        mockUserProfile.bookmarks.push(eventId);
      }
      
      return new Promise(resolve => {
        setTimeout(() => resolve(true), 200);
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/user/${userId}/bookmarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ event_id: eventId })
    });
    
    return response.ok;
  },
  
  // Remove bookmark
  removeBookmark: async (userId: string, eventId: string): Promise<boolean> => {
    if (USE_MOCK_DATA) {
      // Remove from mock user's bookmarks
      mockUserProfile.bookmarks = mockUserProfile.bookmarks.filter(id => id !== eventId);
      
      return new Promise(resolve => {
        setTimeout(() => resolve(true), 200);
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/user/${userId}/bookmarks/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    return response.ok;
  },
  
  // Get recommendations for a user
  getRecommendations: async (userId: string): Promise<Event[]> => {
    if (USE_MOCK_DATA) {
      // Simple mock recommendation algorithm: events not viewed or in user's categories
      const userProfile = mockUserProfile;
      const recommendedEvents = mockEvents
        .filter(event => 
          !userProfile.bookmarks.includes(event.event_id) && 
          event.categories.some(cat => userProfile.derived_categories.includes(cat))
        )
        .sort((a, b) => b.trending_score - a.trending_score)
        .slice(0, 5);
      
      return new Promise(resolve => {
        setTimeout(() => resolve(recommendedEvents), 400);
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/recommendations?user_id=${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    return await response.json();
  }
};