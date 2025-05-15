// src/services/mockData.ts
import { Event, UserProfile } from '../types';

// Mock events data
export const mockEvents: Event[] = [
  {
    event_id: '1',
    name: 'CS Department Open House',
    categories: ['Academic', 'Technology'],
    time: '2025-04-25T14:00:00',
    location: 'CIT Building',
    description: 'Learn about computer science courses and research opportunities at Brown. Meet faculty and current students.',
    link: 'https://cs.brown.edu/events/open-house',
    liked_count: 24,
    viewed_count: 153,
    trending_score: 0.85,
    latitude: 41.826772,
    longitude: -71.400438
  },
  {
    event_id: '2',
    name: 'Spring Concert Series',
    categories: ['Music', 'Entertainment'],
    time: '2025-04-27T19:00:00',
    location: 'The Main Green',
    description: 'Annual spring concert featuring student bands and special guest performances. Free admission for Brown students.',
    link: 'https://brown.edu/events/spring-concert',
    liked_count: 87,
    viewed_count: 312,
    trending_score: 0.93,
    latitude: 41.826851,
    longitude: -71.402903
  },
  {
    event_id: '3',
    name: 'Brown Entrepreneurs Panel',
    categories: ['Career', 'Academic'],
    time: '2025-04-30T16:00:00',
    location: 'Nelson Center for Entrepreneurship',
    description: 'Hear from successful Brown alumni entrepreneurs about their journey from student to founder.',
    link: 'https://brown.edu/entrepreneurship/panel',
    liked_count: 42,
    viewed_count: 189,
    trending_score: 0.78,
    latitude: 41.824689,
    longitude: -71.400967
  },
  {
    event_id: '4',
    name: 'Diversity in STEM Workshop',
    categories: ['Academic', 'Cultural'],
    time: '2025-05-02T13:00:00',
    location: 'Sciences Library',
    description: 'Interactive workshop exploring diversity challenges and solutions in STEM fields.',
    link: 'https://brown.edu/diversity/stem-workshop',
    liked_count: 53,
    viewed_count: 201,
    trending_score: 0.82,
    latitude: 41.827923,
    longitude: -71.399748
  },
  {
    event_id: '5',
    name: 'Brown vs. Harvard Soccer',
    categories: ['Sports'],
    time: '2025-05-04T15:00:00',
    location: 'Stevenson-Pincince Field',
    description: 'Come support the Bears as they take on Harvard in this exciting Ivy League matchup.',
    link: 'https://brownbears.com/events/soccer-vs-harvard',
    liked_count: 68,
    viewed_count: 245,
    trending_score: 0.89,
    latitude: 41.829826,
    longitude: -71.398021
  },
  {
    event_id: '6',
    name: 'International Food Festival',
    categories: ['Food', 'Cultural'],
    time: '2025-05-05T12:00:00',
    location: 'Wriston Quad',
    description: 'Sample cuisines from around the world prepared by Brown\'s international student community.',
    link: 'https://brown.edu/international/food-festival',
    liked_count: 93,
    viewed_count: 267,
    trending_score: 0.91,
    latitude: 41.825123,
    longitude: -71.401843
  },
  {
    event_id: '7',
    name: 'Alumni Networking Night',
    categories: ['Career'],
    time: '2025-05-08T18:00:00',
    location: 'CareerLAB',
    description: 'Connect with Brown alumni working in various industries. Professional attire recommended.',
    link: 'https://brown.edu/careerlab/networking',
    liked_count: 45,
    viewed_count: 198,
    trending_score: 0.79,
    latitude: 41.825743,
    longitude: -71.402232
  },
  {
    event_id: '8',
    name: 'Student Art Exhibition',
    categories: ['Arts', 'Cultural'],
    time: '2025-05-10T11:00:00',
    location: 'List Art Center',
    description: 'Showcasing works from Brown and RISD students across various mediums including painting, sculpture, and digital art.',
    link: 'https://brown.edu/arts/exhibition',
    liked_count: 61,
    viewed_count: 223,
    trending_score: 0.84,
    latitude: 41.825078,
    longitude: -71.404312
  }
];

// Mock user profile
export const mockUserProfile: UserProfile = {
  user_id: 'user123',
  likes: ['2', '5', '6'],
  bookmarks: ['2', '4', '7'],
  derived_categories: ['Music', 'Sports', 'Career', 'Technology']
};