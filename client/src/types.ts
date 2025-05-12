// types.ts
export interface Event {
  eventId: string;
  name: string;
  categories: string[];
  time: string;
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