// Event interface
export interface Event {
    event_id: string;          // Unique event identifier
    name: string;              // Event name
    categories: string[];      // List of categories (e.g., ["Arts", "Music"])
    time: string;              // Event start time
    location: string;          // Venue name/address
    description: string;       // Event details
    link: string;              // Registration or event info link
    liked_count: number;       // Number of likes this event received
    viewed_count: number;      // Number of times this event was viewed
    trending_score: number;    // Pre-calculated normalized score (0-1)
    latitude: number;         // Event location (inferred via geocoding)
    longitude: number;         // Event location (inferred via geocoding)
  }
  
  export interface UserProfile {
    user_id: string;
    likes: string[]; // Array of event_ids the user has liked
    bookmarks: string[]; // Array of event_ids the user has bookmarked
    derived_categories: string[]; // User's interest categories based on behavior
  }