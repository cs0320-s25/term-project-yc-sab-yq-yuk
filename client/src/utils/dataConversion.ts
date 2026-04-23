// src/utils/dataConversion.ts
import { Event, LegacyEvent } from '../types';

// Convert between legacy event format and standardized event format
export const standardizeEvent = (event: LegacyEvent): Event => {
  // Get the event ID - handle both formats and fallback to 0
  const eventId = event.eventId !== undefined ? event.eventId :
                  (typeof event.event_id === 'string' ? parseInt(event.event_id, 10) : 
                  (typeof event.event_id === 'number' ? event.event_id : 0));
  
  // Ensure categories is an array
  const categories = Array.isArray(event.categories) ? event.categories : [];
  
  return {
    eventId,
    name: event.name || '',
    categories,
    startTime: event.startTime || event.time || '',
    location: event.location || '',
    description: event.description || '',
    link: event.link,  // Optional - no need for default
    likedCount: event.likedCount !== undefined ? event.likedCount : 
               (event.liked_count !== undefined ? event.liked_count : 0),
    viewedCount: event.viewedCount !== undefined ? event.viewedCount :
                (event.viewed_count !== undefined ? event.viewed_count : 0),
    trendingScore: event.trendingScore !== undefined ? event.trendingScore :
                  (event.trending_score !== undefined ? event.trending_score : 0),
    latitude: event.latitude || 0,
    longitude: event.longitude || 0
  };
};

// Convert a list of legacy events to standardized events
export const standardizeEvents = (events: LegacyEvent[]): Event[] => {
  return events.map(standardizeEvent);
};

// Convert string IDs to number IDs
export const convertToNumberIds = (stringIds: string[]): number[] => {
  return stringIds.map(id => {
    const parsed = parseInt(id, 10);
    return isNaN(parsed) ? 0 : parsed;
  });
};

// Convert number IDs to string IDs
export const convertToStringIds = (numberIds: number[]): string[] => {
  return numberIds.map(id => id.toString());
};