// types.ts - define the core data structures
export interface Event {
  eventId: string;
  name: string;
  categories: string[];
  startTime: string;
  endTime: string; 
  location: string;
  description: string;
  link?: string;
  likedCount: number;
  viewedCount: number;
  trendingScore: number;
  latitude: number;
  longitude: number;
}

export interface UserProfile {
  likes: string[];
  bookmarks: string[];
}
// API response format
export interface ApiResponse<T> {
  code: number;
  msg: string | null;
  data: T;
}