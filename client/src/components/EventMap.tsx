// src/components/EventMap.tsx
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useState, useRef } from "react";
import Map, { ViewStateChangeEvent, Popup, Marker } from "react-map-gl";
import { useAuth } from "@clerk/clerk-react";
import { Event, UserProfile } from "../types";

// Mapbox API key
const MAPBOX_API_KEY = process.env.MAPBOX_TOKEN;
if (!MAPBOX_API_KEY) {
  console.error("Mapbox API key not found. Please add it to your .env file.");
}

export interface LatLong {
  lat: number;
  long: number;
}

const BrownUniversityLatLong: LatLong = {
  lat: 41.8268,
  long: -71.4025,
};
const initialZoom = 15;

// Category color mapping (shorter names for display)
const categoryColors: Record<string, string> = {
  "Academic Calendar": "#8B2A2A", // Brown University's color
  Advising: "#007bff",
  Arts: "#e83e8c",
  Athletics: "#28a745",
  Biology: "#17a2b8",
  Careers: "#fd7e14",
  Education: "#6f42c1",
  Entrepreneurship: "#20c997",
  Faculty: "#6c757d",
  Faith: "#ffc107",
  Government: "#dc3545",
  "Graduate School": "#343a40",
  "Greek Houses": "#7952b3",
  History: "#ff6b6b",
  Housing: "#fd7e14",
  "Human Resources": "#6c757d",
  Humanities: "#4dabf7",
  Identity: "#cc5de8",
  International: "#339af0",
  Libraries: "#20c997",
  Mathematics: "#845ef7",
  Philosophy: "#adb5bd",
  "Physical Sciences": "#51cf66",
  Psychology: "#ff922b",
  Research: "#a5d8ff",
  Service: "#69db7c",
  "Social Sciences": "#fcc419",
  "Student Clubs": "#748ffc",
  "Student Publications": "#9775fa",
  Training: "#5c7cfa",
  "University Services": "#6c757d",
  default: "#495057",
};

// Helper function to get shorter category name for display
const getShortCategoryName = (fullName: string): string => {
  const parts = fullName.split(",");
  return parts[0].trim();
};

// Get color for category
const getCategoryColor = (categories: string[]): string => {
  if (!categories || categories.length === 0) {
    return categoryColors.default;
  }

  const shortName = getShortCategoryName(categories[0]);
  return categoryColors[shortName] || categoryColors.default;
};

// Main categories list
const CATEGORIES = [
  "Academic Calendar, University Dates & Events",
  "Advising, Mentorship",
  "Arts, Performance",
  "Athletics, Sports, Wellness",
  "Biology, Medicine, Public Health",
  "Careers, Recruiting, Internships",
  "Education, Teaching, Instruction",
  "Entrepreneurship",
  "Faculty Governance",
  "Faith, Spirituality, Worship",
  "Government, Public & International Affairs",
  "Graduate School, Postgraduate Education",
  "Greek & Program Houses",
  "History, Cultural Studies, Languages",
  "Housing, Dining",
  "Human Resources, Benefits",
  "Humanities",
  "Identity, Culture, Inclusion",
  "International, Global Engagement",
  "Libraries",
  "Mathematics, Technology, Engineering",
  "Philosophy, Religious Studies",
  "Physical & Earth Sciences",
  "Psychology & Cognitive Sciences",
  "Research",
  "Service, Engagement, Volunteering",
  "Social Sciences",
  "Student Clubs, Organizations & Activities",
  "Student Publications",
  "Training, Professional Development",
  "University Services & Operations",
];

// Mock data for initial development
const mockEvents: Event[] = [
  {
    event_id: "1",
    name: "Litigating Fengshui: Law and Environmental Knowledge in Qing Dynasty China (1644-1912)",
    categories: [
      "Academic Calendar, University Dates & Events",
      "Mathematics, Technology, Engineering",
    ],
    time: "2025-04-26T12:00:00",
    location: "Stephen Robert '62 Hall",
    description:
      "Based on the author's recently published book, Laws of the Land: Fengshui and the State in Qing Dynasty China (Princeton, 2023), this talk explores fengshui's invocations in Chinese law during the Qing dynasty. Facing a growing population, dwindling natural resources, and an overburdened rural government, judicial administrators across China grappled with disputes and petitions about fengshui in their efforts to sustain forestry, farming, mining, and city planning. Laws of the Land offers a radically new interpretation of these legal arrangements: they worked. An intelligent, considered, and sustained engagement with fengshui on the ground helped the imperial state keep the peace and maintain its legitimacy, especially during the increasingly turbulent decades of the nineteenth century. As the century came to an end, contentious debates over industrialization swept across the bureaucracy, with fengshui invoked by officials and scholars opposed to the establishment of railways, telegraphs, and foreign-owned mines. Demonstrating that the only way to understand those debates and their profound stakes is to grasp fengshui's longstanding roles in Chinese public life, Laws of the Land rethinks key issues in the history of Chinese law, politics, science, religion, and economics. ",
    link: "https://events.brown.edu/event/308245-litigating-fengshui-law-and-environmental",
    liked_count: 24,
    viewed_count: 153,
    trending_score: 0.85,
    latitude: 41.826772,
    longitude: -71.400438,
  },
  {
    event_id: "2",
    name: "Protestant Sunday Service",
    categories: [
      "Faith, Spirituality, Worship",
      "OCRL"
    ],
    time: "2025-04-24T18:00:00",
    location: "Main Green",
    description:
      "Join us for worship every Sunday at 6:00 PM in Manning Chapel. Led by Rev. Del Demosthenes, Associate Chaplain of the University for the Protestant Community & featuring the music of Harmonizing Grace gospel choir, led by Sophia Stone.  ",
    link: "https://events.brown.edu/event/304175-protestant-sunday-service",
    liked_count: 87,
    viewed_count: 312,
    trending_score: 0.93,
    latitude: 41.826851,
    longitude: -71.402903,
  },
  {
    event_id: "3",
    name: "Bone Density Screening",
    categories: ["Wellness"],
    time: "2025-05-06T11:00:00",
    location: "Nelson Center for Entrepreneurship",
    description:
      "Hear from successful Brown alumni entrepreneurs about their journey from student to founder.",
    link: "https://events.brown.edu/event/310655-bone-density-screening-onsite-college-hill",
    liked_count: 42,
    viewed_count: 189,
    trending_score: 0.78,
    latitude: 41.824689,
    longitude: -71.400967,
  },
  {
    event_id: "4",
    name: "Bone Density Screening",
    categories: ["Wellness"],
    time: "2025-05-06T11:00:00",
    location: "online only",
    description:
      "",
    link: "https://events.brown.edu/event/287985-cobre-cbc-computational-biology-walk-in-off",
    liked_count: 12,
    viewed_count: 189,
    trending_score: 0.78,
    latitude: 0,
    longitude: 0,
  },
];


// Helper function to check if an event is online
const isOnlineEvent = (event: Event): boolean => {
  if (!event.location) return false;
  
  const locationLower = event.location.toLowerCase();
  return locationLower.includes('online only') || 
         locationLower.includes('online-only') || 
         locationLower.includes('virtual') ||
         locationLower === 'online' ||
         event.latitude === 0 || 
         event.longitude === 0;
};

// Helper function to check if an event has valid coordinates for map display
const hasValidCoordinates = (event: Event): boolean => {
  return typeof event.latitude === 'number' && 
         typeof event.longitude === 'number' && 
         !isNaN(event.latitude) && 
         !isNaN(event.longitude) &&
         event.latitude !== 0 &&
         event.longitude !== 0 ;
};

export default function EventMap() {
  const { userId } = useAuth(); // Get user ID from Clerk auth
  const mapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [viewState, setViewState] = useState({
    longitude: BrownUniversityLatLong.long,
    latitude: BrownUniversityLatLong.lat,
    zoom: initialZoom,
  });

  // UI states
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTrending, setShowTrending] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeView, setActiveView] = useState<"map" | "likes" | "bookmarks">(
    "map"
  ); // states for tracking navigation

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [timeFilter, setTimeFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showOnlineEvents, setShowOnlineEvents] = useState<boolean>(true);

  // User state (mock for now, will be replaced with real data)
  const [userLikes, setUserLikes] = useState<string[]>([]);
  const [userBookmarks, setUserBookmarks] = useState<string[]>([]);

  // Load initial events
  useEffect(() => {
    // Simulate loading from API
    setLoading(true);
    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 500);

    // Mock user data
    setUserLikes(["2"]);
    setUserBookmarks(["1", "3"]);
  }, []);

  // Record view when event is selected
  useEffect(() => {
    if (selectedEvent) {
      // Increase view count in UI
      setEvents((prev) =>
        prev.map((event) =>
          event.event_id === selectedEvent.event_id
            ? { ...event, viewed_count: event.viewed_count + 1 }
            : event
        )
      );
    }
  }, [selectedEvent]);

  // Filter events based on current filters
  const filteredEvents = events.filter((event) => {
    // Category filter
    if (selectedCategory && !event.categories.includes(selectedCategory)) {
      return false;
    }

    // Simple search implementation
    if (
      searchQuery &&
      !event.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !event.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Online/location filter
    if (locationFilter === 'online') {
      if (!isOnlineEvent(event)) {
        return false;
      }
    } else if (locationFilter === 'in_person') {
      if (isOnlineEvent(event)) {
        return false;
      }
    } else if (locationFilter) {
      // Create a mapping of filter values to potential location strings
      const locationMappings: Record<string, string[]> = {
        'main_green': ['main green', 'the green', 'brown green'],
        'cit': ['cit', 'center for information technology', 'computer science'],
        'watson': ['watson', 'watson center', 'watson institute'],
        'sayles': ['sayles', 'sayles hall'],
        'pembroke': ['pembroke', 'pembroke campus', 'pembroke hall']
      };
      
      // Get the list of location keywords to check
      const locationKeywords = locationMappings[locationFilter];
      if (locationKeywords) {
        // Check if any of the keywords match the event location
        const locationMatches = locationKeywords.some(keyword =>
          event.location.toLowerCase().includes(keyword)
        );
        if (!locationMatches) {
          return false;
        }
      } else {
        // Direct match if no mapping exists
        if (!event.location.toLowerCase().includes(locationFilter.toLowerCase())) {
          return false;
        }
      }
    }

    // Time filter
    if (timeFilter) {
      const now = new Date();
      const eventDate = new Date(event.time);
      
      // Reset hours to compare just the date
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      
      // Tomorrow
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(todayStart.getDate() + 1);
      
      // Day after tomorrow (for end of "tomorrow" range)
      const dayAfterTomorrow = new Date(todayStart);
      dayAfterTomorrow.setDate(todayStart.getDate() + 2);
      
      // Calculate the start of this week (Sunday)
      const thisWeekStart = new Date(todayStart);
      thisWeekStart.setDate(todayStart.getDate() - todayStart.getDay());
      
      // Calculate the end of this week (Saturday)
      const thisWeekEnd = new Date(thisWeekStart);
      thisWeekEnd.setDate(thisWeekStart.getDate() + 7);
      
      // Calculate start of weekend (Friday)
      const weekendStart = new Date(todayStart);
      weekendStart.setDate(todayStart.getDate() + (5 - todayStart.getDay()));
      if (weekendStart < todayStart) {
        // If today is already weekend, use today
        weekendStart.setTime(todayStart.getTime());
      }
      
      // Calculate end of weekend (Sunday)
      const weekendEnd = new Date(thisWeekStart);
      weekendEnd.setDate(thisWeekStart.getDate() + 7); // Next Sunday
      
      // Calculate start of next week (next Sunday)
      const nextWeekStart = new Date(thisWeekEnd);
      
      // Calculate end of next week (next Saturday)
      const nextWeekEnd = new Date(nextWeekStart);
      nextWeekEnd.setDate(nextWeekStart.getDate() + 7);
      
      switch (timeFilter) {
        case 'today':
          // Event is today
          if (eventDate < todayStart || eventDate >= tomorrowStart) {
            return false;
          }
          break;
        case 'tomorrow':
          // Event is tomorrow
          if (eventDate < tomorrowStart || eventDate >= dayAfterTomorrow) {
            return false;
          }
          break;
        case 'this_week':
          // Event is within this week (Sunday to Saturday)
          if (eventDate < todayStart || eventDate >= thisWeekEnd) {
            return false;
          }
          break;
        case 'weekend':
          // Event is this weekend (Friday to Sunday)
          if (eventDate < weekendStart || eventDate >= weekendEnd) {
            return false;
          }
          break;
        case 'next_week':
          // Event is next week (next Sunday to next Saturday)
          if (eventDate < nextWeekStart || eventDate >= nextWeekEnd) {
            return false;
          }
          break;
        default:
          // No time filter or unknown filter
          break;
      }
    }

    // Trending filter logic would be here

    return true;
  });

  // Filter events to only show those with valid coordinates for map display
  const mapEvents = filteredEvents.filter(event => hasValidCoordinates(event));

  // Handle viewing an event, whether online or in-person
  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    
    // If the event has valid coordinates, fly to its location on the map
    if (hasValidCoordinates(event) && mapRef.current) {
      mapRef.current.flyTo({
        center: [event.longitude, event.latitude],
        zoom: 17,
        duration: 1000,
      });
    }
  };

  // Handle like/unlike event
  const handleLikeEvent = (eventId: string) => {
    const isLiked = userLikes.includes(eventId);
    if (isLiked) {
      setUserLikes((prev) => prev.filter((id) => id !== eventId));
    } else {
      setUserLikes((prev) => [...prev, eventId]);
    }

    // Update events list to reflect new like status
    setEvents((prev) =>
      prev.map((event) =>
        event.event_id === eventId
          ? {
              ...event,
              liked_count: isLiked
                ? Math.max(0, event.liked_count - 1)
                : event.liked_count + 1,
            }
          : event
      )
    );

    // Update selected event if it's the one being liked
    if (selectedEvent?.event_id === eventId) {
      setSelectedEvent({
        ...selectedEvent,
        liked_count: isLiked
          ? Math.max(0, selectedEvent.liked_count - 1)
          : selectedEvent.liked_count + 1,
      });
    }
  };

  // Handle bookmark/unbookmark event
  const handleBookmarkEvent = (eventId: string) => {
    const isBookmarked = userBookmarks.includes(eventId);
    if (isBookmarked) {
      setUserBookmarks((prev) => prev.filter((id) => id !== eventId));
    } else {
      setUserBookmarks((prev) => [...prev, eventId]);
    }
  };

  // Handle search input
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would filter events
    console.log("Search for:", searchQuery);
  };

  return (
    <div className="event-map-container">
      {/* Header with search bar */}
      <div
        className="header"
        style={{
          backgroundColor: "#8B2A2A",
          color: "white",
          padding: "10px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="logo">
          <h1 style={{ margin: 0 }}>Brown Events</h1>
        </div>
        {/* Only show search in map view */}
        {activeView === "map" && (
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: "flex",
              flex: "1",
              maxWidth: "500px",
              margin: "0 20px",
            }}
          >
            <input
              type="text"
              value={searchQuery}
              // onChange handler updates searchQuery, automatically filtering events
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              style={{
                flex: "1",
                padding: "8px 12px",
                border: "none",
                borderRadius: "4px 0 0 4px",
                fontSize: "16px",
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "0 4px 4px 0",
                padding: "0 15px",
                cursor: "pointer",
              }}
            >
              Search
            </button>
          </form>
        )}
        <div className="navigation" style={{ display: "flex", gap: "10px" }}>
          {/* My Likes Button */}
          <button
            onClick={() => setActiveView("likes")}
            style={{
              backgroundColor:
                activeView === "likes" ? "#8B2A2A" : "transparent",
              color: "white",
              border: "2px solid white",
              borderRadius: "4px",
              padding: "8px 15px",
              cursor: "pointer",
            }}
          >
            My Likes
          </button>
          {/* My Bookmarks Button */}
          <button
            onClick={() => setActiveView("bookmarks")}
            style={{
              backgroundColor:
                activeView === "bookmarks" ? "#8B2A2A" : "transparent",
              color: "white",
              border: "2px solid white",
              borderRadius: "4px",
              padding: "8px 15px",
              cursor: "pointer",
            }}
          >
            My Bookmarks
          </button>
          {/* Show Map Button - only visible when in likes or bookmarks view */}
          {activeView !== "map" && (
            <button
              onClick={() => setActiveView("map")}
              style={{
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "8px 15px",
                cursor: "pointer",
              }}
            >
              Map View
            </button>
          )}
        </div>
      </div>
      {/* Conditional rendering based on active view */}
      {activeView === "map" && (
        <div
          className="content"
          style={{ display: "flex", height: "calc(100vh - 60px)" }}
        >
          {/* Left sidebar with filters */}
          <div
            className="sidebar"
            style={{
              width: "200px",
              backgroundColor: "#f8f9fa",
              padding: "20px",
              overflowY: "auto",
              borderRight: "1px solid #dee2e6",
            }}
          >
            <h3>Discover Events</h3>
            {/* Recommendation/Trending toggles */}
            <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
              <button
                onClick={() => {
                  setShowTrending(false);
                  setSelectedCategory("");
                  setTimeFilter("");
                  setLocationFilter("");
                  setSearchQuery("");
                }}
                style={{
                  flex: "1",
                  padding: "8px 10px",
                  backgroundColor:
                    !showTrending &&
                    !selectedCategory &&
                    !timeFilter &&
                    !locationFilter &&
                    !searchQuery
                      ? "#8B2A2A"
                      : "#f8f9fa",
                  color:
                    !showTrending &&
                    !selectedCategory &&
                    !timeFilter &&
                    !locationFilter &&
                    !searchQuery
                      ? "white"
                      : "black",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                For You
              </button>
              <button
                onClick={() => {
                  setShowTrending(true);
                  setSelectedCategory("");
                  setTimeFilter("");
                  setLocationFilter("");
                  setSearchQuery("");
                }}
                style={{
                  flex: "1",
                  padding: "8px 10px",
                  backgroundColor: showTrending ? "#8B2A2A" : "#f8f9fa",
                  color: showTrending ? "white" : "black",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Trending
              </button>
            </div>
            {/* Category filter */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                Category:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: "8px 10px",
                  width: "100%",
                  borderRadius: "4px",
                  border: "1px solid #ced4da",
                  fontSize: "14px",
                }}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            {/* Time filter */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                Time:
              </label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                style={{
                  padding: "8px 10px",
                  width: "100%",
                  borderRadius: "4px",
                  border: "1px solid #ced4da",
                  fontSize: "14px",
                }}
              >
                <option value="">Any Time</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="this_week">This Week</option>
                <option value="weekend">This Weekend</option>
                <option value="next_week">Next Week</option>
              </select>
            </div>
            {/* Location filter - Updated with online/in-person options */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                Location:
              </label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                style={{
                  padding: "8px 10px",
                  width: "100%",
                  borderRadius: "4px",
                  border: "1px solid #ced4da",
                  fontSize: "14px",
                }}
              >
                <option value="">All Locations</option>
                <option value="online">Online Only</option>
                <option value="in_person">In-Person Events</option>
                <option value="main_green">Main Green</option>
                <option value="cit">CIT Building</option>
                <option value="watson">Watson Center</option>
                <option value="sayles">Sayles Hall</option>
                <option value="pembroke">Pembroke Campus</option>
              </select>
            </div>
            {/* Reset filters button */}
            <button
              onClick={() => {
                setSelectedCategory("");
                setTimeFilter("");
                setLocationFilter("");
                setSearchQuery("");
                setShowTrending(false);
              }}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              Reset Filters
            </button>
          </div>
          {/* Main content area with map and event list */}
          <div
            className="main-content"
            style={{ flex: "1", display: "flex", flexDirection: "column" }}
          >
            {/* Map component */}
            <div
              className="map-container"
              style={{ height: "60%", position: "relative" }}
            >
              {/* Online event details overlay - show when online event is selected */}
              {selectedEvent && isOnlineEvent(selectedEvent) && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 3,
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                    maxWidth: "80%",
                    width: "500px",
                    maxHeight: "80%",
                    overflow: "auto",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <h2 style={{ margin: 0 }}>
                      {selectedEvent.name}
                      <span style={{ 
                        fontSize: "14px",
                        marginLeft: "10px",
                        padding: "3px 8px",
                        backgroundColor: "#17a2b8",
                        color: "white",
                        borderRadius: "4px",
                      }}>
                        ONLINE EVENT
                      </span>
                    </h2>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "20px",
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div style={{ marginBottom: "15px" }}>
                    <p>{selectedEvent.description}</p>
                  </div>
                  
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "auto 1fr", 
                    gap: "10px",
                    marginBottom: "20px",
                  }}>
                    <strong>Time:</strong>
                    <span>{new Date(selectedEvent.time).toLocaleString()}</span>
                    
                    <strong>Categories:</strong>
                    <span>
                      {selectedEvent.categories
                        .map((cat) => getShortCategoryName(cat))
                        .join(", ")}
                    </span>
                    
                    <strong>Location:</strong>
                    <span>{selectedEvent.location}</span>
                  </div>
                  
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    marginTop: "15px", 
                    borderTop: "1px solid #eee",
                    paddingTop: "15px",
                  }}>
                    <div>
                      <span style={{ marginRight: "15px" }}>
                        👁️ {selectedEvent.viewed_count} views
                      </span>
                      <button
                        onClick={() => handleLikeEvent(selectedEvent.event_id)}
                        style={{
                          padding: "5px 10px",
                          backgroundColor: userLikes.includes(selectedEvent.event_id)
                            ? "#dc3545"
                            :  "#f8f9fa",
                            color: userLikes.includes(selectedEvent.event_id)
                            ? "white"
                            : "#212529",
                          border: userLikes.includes(selectedEvent.event_id)
                            ? "none"
                            : "1px solid #ced4da",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        {userLikes.includes(selectedEvent.event_id) ? "❤️" : "👍"}{" "}
                        {selectedEvent.liked_count}
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleBookmarkEvent(selectedEvent.event_id)}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: userBookmarks.includes(selectedEvent.event_id)
                          ? "#dc3545"
                          :  "#f8f9fa",
                          color: userBookmarks.includes(selectedEvent.event_id)
                            ? "white"
                            : "#212529",
                          border: userBookmarks.includes(selectedEvent.event_id)
                            ? "none"
                            : "1px solid #ced4da",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      {userBookmarks.includes(selectedEvent.event_id)
                        ? "Bookmarked"
                        : "🏷️ Bookmark"}
                    </button>
                  </div>
                  
                  {selectedEvent.link && (
                    <a
                      href={selectedEvent.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "block",
                        textAlign: "center",
                        marginTop: "15px",
                        padding: "8px",
                        backgroundColor: "#007bff",
                        textDecoration: "none",
                        color: "white",
                        borderRadius: "4px",
                      }}
                    >
                      Join Event Online
                    </a>
                  )}
                </div>
              )}
              
              {loading && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    padding: "20px",
                    borderRadius: "5px",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  Loading...
                </div>
              )}
              <Map
                mapboxAccessToken={MAPBOX_API_KEY}
                {...viewState}
                style={{ width: "100%", height: "100%" }}
                mapStyle={"mapbox://styles/mapbox/streets-v12"}
                onMove={(ev: ViewStateChangeEvent) =>
                  setViewState(ev.viewState)
                }
                onLoad={() => {
                  setMapLoaded(true);
                  console.log("Map loaded");
                }}
                ref={mapRef}
              >
                {/* Only show markers for events with valid coordinates */}
                {mapEvents.map((event) => (
                  <Marker
                    key={event.event_id}
                    longitude={event.longitude}
                    latitude={event.latitude}
                    onClick={(e) => {
                      e.originalEvent.stopPropagation();
                      setSelectedEvent(event);
                    }}
                  />
                ))}
                {/* Selected event popup */}
                {selectedEvent && hasValidCoordinates(selectedEvent) && (
                  <Popup
                    longitude={selectedEvent.longitude}
                    latitude={selectedEvent.latitude}
                    anchor="bottom"
                    onClose={() => setSelectedEvent(null)}
                    closeButton={true}
                    closeOnClick={false}
                  >
                    <div style={{ padding: "5px", maxWidth: "300px" }}>
                      <h3
                        style={{
                          margin: "0 0 8px 0",
                          borderBottom: "1px solid #ddd",
                          paddingBottom: "4px",
                        }}
                      >
                        {selectedEvent.name}
                      </h3>
                      {/* Truncate Description Text with "Show More" Toggle */}
                      <p style={{ margin: "4px 0" }}>
                        {showFullDescription ||
                        selectedEvent.description.length <= 100
                          ? selectedEvent.description
                          : `${selectedEvent.description.substring(0, 100)}...`}
                        {selectedEvent.description.length > 100 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowFullDescription(!showFullDescription);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#007bff",
                              padding: "0 4px",
                              cursor: "pointer",
                              fontSize: "14px",
                            }}
                          >
                            {showFullDescription ? "Show Less" : "Show More"}
                          </button>
                        )}
                      </p>
                    {/* Location info in popup */}
                    <p style={{ margin: "4px 0" }}>
                      <strong>Location:</strong> {selectedEvent.location}
                    </p>
                    {/* Time info in popup */}
                    <p style={{ margin: "4px 0" }}>
                      <strong>Time:</strong>{" "}
                      {new Date(selectedEvent.time).toLocaleString()}
                    </p>
                    {/* Categories info in popup */}
                    <p style={{ margin: "4px 0" }}>
                      <strong>Categories:</strong>{" "}
                      {selectedEvent.categories
                        .map((cat) => getShortCategoryName(cat))
                        .join(", ")}
                    </p>
                    {/* View, Like button and bookmark button */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "10px",
                      }}
                    >
                      <div>
                        {/* Viewed count */}
                        <span style={{ marginRight: "10px" }}>
                          👁️ {selectedEvent.viewed_count}
                        </span>
                        {/* Like button */}
                        <button
                          onClick={() =>
                            handleLikeEvent(selectedEvent.event_id)
                          }
                          style={{
                            padding: "5px 10px",
                            backgroundColor: userLikes.includes(
                              selectedEvent.event_id
                            )
                              ? "#dc3545"
                              : "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          {userLikes.includes(selectedEvent.event_id)
                            ? "❤️"
                            : "👍"}{" "}
                          {selectedEvent.liked_count}
                        </button>
                      </div>
                      {/* Bookmark button */}
                      <button
                        onClick={() =>
                          handleBookmarkEvent(selectedEvent.event_id)
                        }
                        style={{
                          padding: "5px 10px",
                          backgroundColor: userBookmarks.includes(
                            selectedEvent.event_id
                          )
                            ? "#dc3545"
                            : "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        {userBookmarks.includes(selectedEvent.event_id)
                          ? "Bookmarked"
                          : "🏷️ Bookmark"}
                      </button>
                    </div>
                    {/* Link to event details */}
                    {selectedEvent.link && (
                      <a
                        href={selectedEvent.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "block",
                          textAlign: "center",
                          marginTop: "10px",
                          padding: "5px",
                          backgroundColor: "#f8f9fa",
                          textDecoration: "none",
                          color: "#007bff",
                          borderRadius: "4px",
                        }}
                      >
                        Event Details
                      </a>
                    )}
                  </div>
                </Popup>
              )}
            </Map>
          </div>

          {/* Event list */}
          <div
            className="event-list-container"
            style={{ height: "40%", padding: "20px", overflowY: "auto" }}
          >
            {/* Heading section */}
            <h2>
              {showTrending
                ? "Trending Events"
                : !selectedCategory &&
                  !timeFilter &&
                  !locationFilter &&
                  !searchQuery
                ? "Recommended For You"
                : searchQuery
                ? `Search Results for "${searchQuery}"`
                : "Upcoming Events"}
            </h2>
            <div
              className="event-list"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "15px",
              }}
            >
              {/* Check if filteredEvents is empty */}
              {filteredEvents.length === 0 ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    padding: "30px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                  }}
                >
                  <h3>No events found</h3>
                  <p>Try adjusting your filters or search terms</p>
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <div
                    key={event.event_id}
                    className="event-card"
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "15px",
                      cursor: "pointer",
                        borderLeft: `4px solid ${getCategoryColor(
                          event.categories
                        )}`,
                      transition: "transform 0.2s, box-shadow 0.2s",
                      backgroundColor: "white",
                    }}
                    // On click, handle the event view appropriately
                    onClick={() => handleViewEvent(event)}
                    // On mouse over, add hover effect, showing focus on the card.
                    onMouseOver={(e) => {
                      const target = e.currentTarget;
                      target.style.transform = "translateY(-5px)";
                      target.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
                    }}
                    onMouseOut={(e) => {
                      const target = e.currentTarget;
                      target.style.transform = "translateY(0)";
                      target.style.boxShadow = "none";
                    }}
                  >
                    {/* Event name in card*/}
                    <h3 style={{ margin: "0 0 10px 0" }}>
                      {event.name}
                      {isOnlineEvent(event) && (
                        <span style={{ 
                          fontSize: "12px",
                          marginLeft: "8px",
                          padding: "2px 6px",
                          backgroundColor: "#17a2b8",
                          color: "white",
                          borderRadius: "4px",
                          verticalAlign: "middle",
                        }}>
                          ONLINE
                        </span>
                      )}
                    </h3>
                    {/* Event description in card */}
                    <p
                      style={{
                        margin: "0 0 10px 0",
                        fontSize: "14px",
                        color: "#6c757d",
                      }}
                    >
                      {event.description.length > 100
                        ? `${event.description.substring(0, 100)}...`
                        : event.description}
                    </p>
                    {/* Event location and time in card */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "14px",
                        marginBottom: "10px",
                      }}
                    >
                      <span>{event.location}</span>
                      <span>
                        {new Date(event.time).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "10px",
                        borderTop: "1px solid #eee",
                        paddingTop: "10px",
                      }}
                    >
                      <div>
                        {/* Viewed count */}
                        <span
                          style={{ fontSize: "14px", marginRight: "10px" }}
                        >
                          👁️ {event.viewed_count}
                        </span>
                        {/* Like button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikeEvent(event.event_id);
                          }}
                          style={{
                            padding: "5px 8px",
                            backgroundColor: userLikes.includes(
                              event.event_id
                            )
                              ? "#dc3545"
                              : "#f8f9fa",
                            color: userLikes.includes(event.event_id)
                              ? "white"
                              : "#212529",
                            border: userLikes.includes(event.event_id)
                              ? "none"
                              : "1px solid #ced4da",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "14px",
                          }}
                        >
                          {userLikes.includes(event.event_id) ? "❤️" : "👍"}{" "}
                          {event.liked_count}
                        </button>
                      </div>
                      {/* Bookmark button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookmarkEvent(event.event_id);
                        }}
                        style={{
                          padding: "5px 8px",
                          backgroundColor: userBookmarks.includes(
                            event.event_id
                          )
                            ? "#dc3545"
                            : "#f8f9fa",
                          color: userBookmarks.includes(event.event_id)
                            ? "white"
                            : "#212529",
                          border: userBookmarks.includes(event.event_id)
                            ? "none"
                            : "1px solid #ced4da",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        {userBookmarks.includes(event.event_id)
                          ? "Bookmarked"
                          : "🏷️ Bookmark"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    )}
    {activeView === "likes" && (
      <div
        className="likes-view"
        style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}
      >
        <h2>My Liked Events</h2>

        {userLikes.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "50px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              marginTop: "20px",
            }}
          >
            <h3>You haven't liked any events yet</h3>
            <p>Like events that interest you to see them here!</p>
            <button
              onClick={() => setActiveView("map")}
              style={{
                padding: "10px 20px",
                backgroundColor: "#8B2A2A",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "20px",
              }}
            >
              Explore Events
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            {events
              .filter((event) => userLikes.includes(event.event_id))
              .map((event) => (
                <div
                  key={event.event_id}
                  className="event-card"
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "20px",
                    borderLeft: `4px solid ${getCategoryColor(
                      event.categories
                    )}`,
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  }}
                >
                  <h3>
                    {event.name}
                    {isOnlineEvent(event) && (
                      <span style={{ 
                        fontSize: "12px",
                        marginLeft: "8px",
                        padding: "2px 6px",
                        backgroundColor: "#17a2b8",
                        color: "white",
                        borderRadius: "4px",
                        verticalAlign: "middle",
                      }}>
                        ONLINE
                      </span>
                    )}
                  </h3>
                  <p style={{ margin: "10px 0" }}>
                    {event.description.length > 150
                      ? `${event.description.substring(0, 150)}...`
                      : event.description}
                  </p>
                  <div style={{ marginTop: "15px" }}>
                    <p>
                      <strong>Location:</strong> {event.location}
                    </p>
                    <p>
                      <strong>Time:</strong>{" "}
                      {new Date(event.time).toLocaleString()}
                    </p>
                    <p>
                      <strong>Categories:</strong>{" "}
                      {event.categories
                        .map((cat) => getShortCategoryName(cat))
                        .join(", ")}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "20px",
                      borderTop: "1px solid #eee",
                      paddingTop: "15px",
                    }}
                  >
                    <button
                      onClick={() => handleLikeEvent(event.event_id)}
                      style={{
                        padding: "8px 15px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Unlike
                    </button>
                    <button
                      onClick={() => {
                        setActiveView("map");
                        setTimeout(() => {
                          handleViewEvent(event);
                        }, 100);
                      }}
                      style={{
                        padding: "8px 15px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      View on Map
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    )}

    {activeView === "bookmarks" && (
      <div
        className="bookmarks-view"
        style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}
      >
        <h2>My Bookmarked Events</h2>

        {userBookmarks.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "50px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              marginTop: "20px",
            }}
          >
            <h3>You haven't bookmarked any events yet</h3>
            <p>Bookmark events you want to attend to see them here!</p>
            <button
              onClick={() => setActiveView("map")}
              style={{
                padding: "10px 20px",
                backgroundColor: "#8B2A2A",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "20px",
              }}
            >
              Explore Events
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            {events
              .filter((event) => userBookmarks.includes(event.event_id))
              .map((event) => (
                <div
                  key={event.event_id}
                  className="event-card"
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "20px",
                    borderLeft: `4px solid ${getCategoryColor(
                      event.categories
                    )}`,
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  }}
                >
                  <h3>
                    {event.name}
                    {isOnlineEvent(event) && (
                      <span style={{ 
                        fontSize: "12px",
                        marginLeft: "8px",
                        padding: "2px 6px",
                        backgroundColor: "#17a2b8",
                        color: "white",
                        borderRadius: "4px",
                        verticalAlign: "middle",
                      }}>
                        ONLINE
                      </span>
                    )}
                  </h3>
                  <p style={{ margin: "10px 0" }}>
                    {event.description.length > 150
                      ? `${event.description.substring(0, 150)}...`
                      : event.description}
                  </p>
                  <div style={{ marginTop: "15px" }}>
                    <p>
                      <strong>Location:</strong> {event.location}
                    </p>
                    <p>
                      <strong>Time:</strong>{" "}
                      {new Date(event.time).toLocaleString()}
                    </p>
                    <p>
                      <strong>Categories:</strong>{" "}
                      {event.categories
                        .map((cat) => getShortCategoryName(cat))
                        .join(", ")}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "20px",
                      borderTop: "1px solid #eee",
                      paddingTop: "15px",
                    }}
                  >
                    <button
                      onClick={() => handleBookmarkEvent(event.event_id)}
                      style={{
                        padding: "8px 15px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Remove Bookmark
                    </button>
                    <button
                      onClick={() => {
                        setActiveView("map");
                        setTimeout(() => {
                          handleViewEvent(event);
                        }, 100);
                      }}
                      style={{
                        padding: "8px 15px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      View on Map
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    )}
  </div>
);
} 