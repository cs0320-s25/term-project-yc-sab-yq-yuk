// eventHelpers.ts
import { Event } from '../types';

/**
 * Checks if an event is designated as online-only
 * @param event The event object to check
 * @returns True if the event is online-only
 */
export const isOnlineEvent = (event: Event): boolean => {
  if (!event.location) return false;
  const locationLower = event.location.toLowerCase();
  return locationLower.includes('online only') || 
         locationLower.includes('online-only') || 
         locationLower.includes('virtual') ||
         locationLower === 'online' ||
         event.latitude === 0 || 
         event.longitude === 0||
         event.latitude === null ||
         event.longitude === null ||
         event.latitude === undefined ||
         event.longitude === undefined;
};

/**
 * Checks if an event has valid coordinates for display on a map
 * @param event The event object to check
 * @returns True if the event has valid coordinates
 */
export const hasValidCoordinates = (event: Event): boolean => {
  const isValid = typeof event.latitude === 'number' && 
         typeof event.longitude === 'number' && 
         !isNaN(event.latitude) && 
         !isNaN(event.longitude) &&
         event.latitude !== 0 &&
         event.longitude !== 0;
  

  // console.log('Coordinates for event:', event.name, 'location:', event.location, 'lat:', event.latitude, 'long:', event.longitude);
  
  return isValid;
};

/**
 * Processes raw event data to ensure all required fields exist
 * @param events Array of raw event data
 * @returns Processed events with default values for missing fields
 */
export const processEvents = (events: any[]): Event[] => {
  return events.map(event => ({
    ...event,
    // Provide default values for fields that might be null
    name: event.name || 'Unnamed Event',
    description: event.description || '',
    location: event.location || '',
    link: event.link || '',
    likedCount: event.likedCount || 0,
    viewedCount: event.viewedCount || 0,
    trendingScore: event.trendingScore || 0,
    categories: event.categories || [],
  }));
};

/**
 * Filters events based on search criteria
 * @param events Array of events to filter
 * @param filters Object containing filter criteria
 * @returns Filtered array of events
 */
export const filterEvents = (events: Event[], filters: {
  category?: string,
  time?: string,
  location?: string,
  searchQuery?: string,
  showOnlineOnly?: boolean
}): Event[] => {
  return events.filter(event => {
    // Filter by online status
    if (filters.showOnlineOnly && !isOnlineEvent(event)) {
      return false;
    }
    
    // Filter by location
    if (filters.location === 'online' && !isOnlineEvent(event)) {
      return false;
    } else if (filters.location && 
              filters.location !== 'online' && 
              !event.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    
    // Filter by category
    if (filters.category && 
        (!event.categories || 
         !event.categories.some(cat => cat.includes(filters.category!)))) {
      return false;
    }
    
    // Filter by search query
    if (filters.searchQuery && 
        !event.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
        !event.description.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
      return false;
    }
    
    // More filters could be added here (time, etc.)
    
    return true;
  });
};

/**
 * Gets events that should be displayed on the map
 * @param events All events
 * @returns Events that have valid coordinates for map display
 */
export const getMapEvents = (events: Event[]): Event[] => {
  return events.filter(event => hasValidCoordinates(event));
};