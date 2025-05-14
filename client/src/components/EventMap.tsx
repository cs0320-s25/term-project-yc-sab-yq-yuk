// src/components/EventMap.tsx
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useState, useRef } from "react";
import Map, { ViewStateChangeEvent, Popup, Marker } from "react-map-gl";
import { useAuth } from "@clerk/clerk-react";
import { Event, UserProfile } from "../types";
import { api } from "../services/api";
import {
  formatCategories,
  categoryColors,
  CATEGORIES,
  getCategoryColor,
  getShortCategoryName,
} from "../utils/categoryUtils";
import {
  formatEventTime,
  formatEventTimeCompact,
} from "../utils/dateFormatters";
import {
  processEvents,
  hasValidCoordinates,
  isOnlineEvent,
} from "../utils/eventHelpers";

// Configuration & Constants
// Mapbox API key
const MAPBOX_API_KEY = process.env.MAPBOX_TOKEN;
if (!MAPBOX_API_KEY) {
  console.error("Mapbox API key not found. Please add it to your .env file.");
}

export interface LatLong {
  lat: number;
  long: number;
}

// Default coordinates for Brown University campus (map center point)
const BrownUniversityLatLong: LatLong = {
  lat: 41.8268,
  long: -71.4025,
};
const initialZoom = 15;

// Main component definition
export default function EventMap() {
  // Authentication - get user ID from Clerk
  const { userId } = useAuth(); 
  console.log("Clerk userId:", userId);
  // Map related state
  const mapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [viewState, setViewState] = useState({
    longitude: BrownUniversityLatLong.long,
    latitude: BrownUniversityLatLong.lat,
    zoom: initialZoom,
  });

  // UI states
  // These states manage the core UI elements like events, selected events, and view modes
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTrending, setShowTrending] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeView, setActiveView] = useState<"map" | "likes" | "bookmarks">(
    "map"
  ); 
  const [displayedEvents, setDisplayedEvents] = useState<Event[]>([]);


  // Filter states
  // These control the different filtering options available to users
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [timeFilter, setTimeFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  // const [showOnlineEvents, setShowOnlineEvents] = useState<boolean>(true);
  // const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  // User state (tracking likes and bookmarks)
  const [userLikes, setUserLikes] = useState<string[]>([]);
  const [userBookmarks, setUserBookmarks] = useState<string[]>([]);

  // Effect for fetching locations from our API
  // This powers our location filter dropdown in the UI
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // Fetch the data - response.data is already an array of strings (string[])
        const response = await api.getLocations();
        console.log("API response:", response);

        // Since response.data is already the array of strings, we don't need to access response.data.data
        // Your API is returning the array directly
        let locationData = response;

        // Filter out null and empty values
        const filteredLocations = locationData.filter(
          (loc) => loc !== null && loc !== undefined && loc !== ""
        );

        // Set the locations state
        setLocations(filteredLocations);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setLocations([]);
      }
    };

    fetchLocations();
  }, []);

  // Effect for loading user profile - likes and bookmarks
  useEffect(() => {
    if (userId) {
      const fetchUserProfile = async () => {
        const profile = await api.getUserProfile(userId);
        if (profile) {
          setUserLikes(profile.likes || []);
          setUserBookmarks(profile.bookmarks || []);
        }
      };

      fetchUserProfile();
    }
  }, [userId]);

   // Main effect for fetching events based on filters
  // Fetch events based on filters
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const filters = {
          category: selectedCategory,
          time: timeFilter,
          near: locationFilter === 'online' || locationFilter === 'in-person' ? '' : locationFilter, // Don't send 'online' or 'in-person' to API
        };
        
        let data: Event[] = [];
        
        // Different API endpoints based on view mode and query params
        if (showTrending) {
          data = await api.getTrendingEvents(filters);
        } else if (userId && !searchQuery) {
          data = await api.getRecommendations(userId, filters);
        } else if (searchQuery) {
          data = await api.searchEvents(searchQuery);
        } else {
          data = await api.getEvents(filters);
        }
        
        // Process events to ensure all required fields exist
        const processedEvents = processEvents(data);
        setEvents(processedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [
    userId,
    showTrending,
    selectedCategory,
    timeFilter,
    locationFilter,
    searchQuery,
  ]);

  // Filter events client-side based on the locationFilter
  useEffect(() => {
    if (locationFilter === 'online') {
      // Filter for online events using our comprehensive isOnlineEvent function
      setDisplayedEvents(events.filter(event => isOnlineEvent(event)));
    }else {
      // Show all events or those matching other filters
      setDisplayedEvents(events);
    }
  }, [events, locationFilter]);


  // Effect to record views when a user selects an event
  useEffect(() => {
    if (selectedEvent) {
      const recordView = async () => {
        await api.recordView(selectedEvent.eventId);

        // Update local state to reflect the view
        setEvents((prev) =>
          prev.map((event) =>
            event.eventId === selectedEvent.eventId
              ? { ...event, viewedCount: event.viewedCount + 1 }
              : event
          )
        );
      };

      recordView();
    }
  }, [selectedEvent]);

  // Additional filtering（online or not） beyond what the API provides
  const filteredEvents = events.filter((event) => {
    // Online/location filter
    if (locationFilter === "online" && !isOnlineEvent(event)) {
      return false;
    }

    return true;
  });

  // Filter events to only show those with valid coordinates for map display
  const mapEvents = filteredEvents.filter((event) =>
    hasValidCoordinates(event)
  );

  // Event handlers
  // Handle viewing an event(flies to location), whether online or in-person
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

  // Handle like/unlike event - updates local state and calls API
  const handleLikeEvent = async (eventId: string) => {
    if (!userId) return;

    const isLiked = userLikes.includes(eventId);
    let success = false;

    if (isLiked) {
      success = await api.unlikeEvent(userId, eventId);
      if (success) {
        setUserLikes((prev) => prev.filter((id) => id !== eventId));
      }
    } else {
      success = await api.likeEvent(userId, eventId);
      if (success) {
        setUserLikes((prev) => [...prev, eventId]);
      }
    }

    if (success) {
      // Update events list with new like count
      setEvents((prev) =>
        prev.map((event) =>
          event.eventId === eventId
            ? {
                ...event,
                likedCount: isLiked
                  ? Math.max(0, event.likedCount - 1)
                  : event.likedCount + 1,
              }
            : event
        )
      );

      // Update selected event if it's being liked/unliked
      if (selectedEvent?.eventId === eventId) {
        setSelectedEvent({
          ...selectedEvent,
          likedCount: isLiked
            ? Math.max(0, selectedEvent.likedCount - 1)
            : selectedEvent.likedCount + 1,
        });
      }
    }
  };

  // Handle bookmark/unbookmark event - updates local state and calls API
  const handleBookmarkEvent = async (eventId: string) => {
    if (!userId) return;

    const isBookmarked = userBookmarks.includes(eventId);
    let success = false;

    if (isBookmarked) {
      success = await api.unbookmarkEvent(userId, eventId);
      if (success) {
        setUserBookmarks((prev) => prev.filter((id) => id !== eventId));
      }
    } else {
      success = await api.bookmarkEvent(userId, eventId);
      if (success) {
        setUserBookmarks((prev) => [...prev, eventId]);
      }
    }
  };

  // Handle search input
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The actual search occurs in the useEffect that watches searchQuery
  };

  // UI rendering
  return (
    <div className="event-map-container">
      {/* Header section with app title, search bar, and navigation buttons */}
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
        {/* We have three main views that we conditionally render */}
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

        {/* Navigation buttons for switching between views */}
        <div className="navigation" style={{ display: "flex", gap: "10px" }}>
          {/* Likes, Bookmarks, and Map View buttons */}
          {/* Each button toggles the activeView state to switch between interface modes */}
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
          
          {/* Only show "Map View" button when not already in map view */}
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
      
      
      {/* Main content area - conditionally rendered based on activeView */}
      {/* ------------------------------------------------------------ */}
      {/* MAP VIEW */}
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
                  // Reset all filters and show personalized recommendations
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
                  // Reset all filters and show trending events
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
            
            {/* Category filter dropdown */}
            {/* When changed, this triggers a new API call via useEffect */}
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

            {/* Time filter dropdown */}
            {/* This also triggers API calls via the dependency array in useEffect */}
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
                <option value="Today">Today</option>
                <option value="Tomorrow">Tomorrow</option>
                <option value="This Week">This Week</option>
                <option value="This Weekend">This Weekend</option>
                <option value="Next Week">Next Week</option>
              </select>
            </div>
            
            {/* Location filter dropdown */}
            {/* Combines hardcoded options (All/Online) with dynamic API-fetched locations */} 
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
            

                
              </select>
            </div>
            
            {/* Reset filters button */}
            {/* Allows users to quickly clear all filters and start fresh */}
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
              {/* Overlay for online events (they don't have map markers) */}
              {/* This provides detailed info for online events when selected */}
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
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "15px",
                    }}
                  >
                    <h2 style={{ margin: 0 }}>
                      {selectedEvent.name}
                      <span
                        style={{
                          fontSize: "14px",
                          marginLeft: "10px",
                          padding: "3px 8px",
                          backgroundColor: "#17a2b8",
                          color: "white",
                          borderRadius: "4px",
                        }}
                      >
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

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr",
                      gap: "10px",
                      marginBottom: "20px",
                    }}
                  >
                    {/* Online event details card with title, description, etc. */}
                    {/* Includes actions like like/bookmark and "Join Event" link */}
                    {/* ... (online event overlay details) ... */}
                    <strong>Time:</strong>
                    {selectedEvent?.startTime
                      ? formatEventTime(selectedEvent.startTime)
                      : "No date available"}

                    <strong>Categories:</strong>
                    {/* <span>
                      {selectedEvent.categories
                        .map((cat) => getShortCategoryName(cat))
                        .join(", ")}
                    </span> */}

             
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "15px",
                      borderTop: "1px solid #eee",
                      paddingTop: "15px",
                    }}
                  >
                    <div>
                      <span style={{ marginRight: "15px" }}>
                        👁️ {selectedEvent.viewedCount} views
                      </span>
                      <button
                        onClick={() => handleLikeEvent(selectedEvent.eventId)}
                        style={{
                          padding: "5px 10px",
                          backgroundColor: userLikes.includes(
                            selectedEvent.eventId
                          )
                            ? "#dc3545"
                            : "#f8f9fa",
                          color: userLikes.includes(selectedEvent.eventId)
                            ? "white"
                            : "#212529",
                          border: userLikes.includes(selectedEvent.eventId)
                            ? "none"
                            : "1px solid #ced4da",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        {userLikes.includes(selectedEvent.eventId)
                          ? "❤️"
                          : "👍"}{" "}
                        {selectedEvent.likedCount}
                      </button>
                    </div>

                    <button
                      onClick={() => handleBookmarkEvent(selectedEvent.eventId)}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: userBookmarks.includes(
                          selectedEvent.eventId
                        )
                          ? "#dc3545"
                          : "#f8f9fa",
                        color: userBookmarks.includes(selectedEvent.eventId)
                          ? "white"
                          : "#212529",
                        border: userBookmarks.includes(selectedEvent.eventId)
                          ? "none"
                          : "1px solid #ced4da",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      {userBookmarks.includes(selectedEvent.eventId)
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

            {/* Loading indicator */}
            {/* Shows when API requests are in progress */}
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
                {/* Event markers - for each event with valid coordinates */}
                {mapEvents.map((event) => (
                  <Marker
                    key={event.eventId}
                    longitude={event.longitude}
                    latitude={event.latitude}
                    onClick={(e) => {
                      e.originalEvent.stopPropagation();
                      setSelectedEvent(event);
                    }}
                  />
                ))}

                {/* Popup for selected event */}
              {/* Only shows when an event is selected and has valid coordinates */}
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
                        {selectedEvent?.startTime
                          ? formatEventTime(selectedEvent.startTime)
                          : "No date available"}
                      </p>
                      {/* Categories info in popup */}
                      {/* <p style={{ margin: "4px 0" }}>
                      <strong>Categories:</strong>{" "}
                      {selectedEvent.categories
                        .map((cat) => getShortCategoryName(cat))
                        .join(", ")}
                    </p> */}
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
                            👁️ {selectedEvent.viewedCount}
                          </span>
                          {/* Like button */}
                          <button
                            onClick={() =>
                              handleLikeEvent(selectedEvent.eventId)
                            }
                            style={{
                              padding: "5px 10px",
                              backgroundColor: userLikes.includes(
                                selectedEvent.eventId
                              )
                                ? "#dc3545"
                                : "#007bff",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            {userLikes.includes(selectedEvent.eventId)
                              ? "❤️"
                              : "👍"}{" "}
                            {selectedEvent.likedCount}
                          </button>
                        </div>
                        {/* Bookmark button */}
                        <button
                          onClick={() =>
                            handleBookmarkEvent(selectedEvent.eventId)
                          }
                          style={{
                            padding: "5px 10px",
                            backgroundColor: userBookmarks.includes(
                              selectedEvent.eventId
                            )
                              ? "#dc3545"
                              : "#28a745",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          {userBookmarks.includes(selectedEvent.eventId)
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
            {/* Shows cards for all filtered events */}
            <div
              className="event-list-container"
              style={{ height: "40%", padding: "20px", overflowY: "auto" }}
            >
              {/* Dynamic heading based on current view/filters */}
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
                  // Map through filtered events to create cards
                  filteredEvents.map((event) => (
                    <div
                      key={event.eventId}
                      className="event-card"
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "15px",
                        cursor: "pointer",
                        // borderLeft: `4px solid ${getCategoryColor(
                        //   event.categories
                        // )}`,
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
                          <span
                            style={{
                              fontSize: "12px",
                              marginLeft: "8px",
                              padding: "2px 6px",
                              backgroundColor: "#17a2b8",
                              color: "white",
                              borderRadius: "4px",
                              verticalAlign: "middle",
                            }}
                          >
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
                        {event?.startTime
                          ? formatEventTimeCompact(event.startTime)
                          : "No date available"}
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
                            👁️ {event.viewedCount}
                          </span>
                          {/* Like button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLikeEvent(event.eventId);
                            }}
                            style={{
                              padding: "5px 8px",
                              backgroundColor: userLikes.includes(event.eventId)
                                ? "#dc3545"
                                : "#f8f9fa",
                              color: userLikes.includes(event.eventId)
                                ? "white"
                                : "#212529",
                              border: userLikes.includes(event.eventId)
                                ? "none"
                                : "1px solid #ced4da",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "14px",
                            }}
                          >
                            {userLikes.includes(event.eventId) ? "❤️" : "👍"}{" "}
                            {event.likedCount}
                          </button>
                        </div>
                        {/* Bookmark button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookmarkEvent(event.eventId);
                          }}
                          style={{
                            padding: "5px 8px",
                            backgroundColor: userBookmarks.includes(
                              event.eventId
                            )
                              ? "#dc3545"
                              : "#f8f9fa",
                            color: userBookmarks.includes(event.eventId)
                              ? "white"
                              : "#212529",
                            border: userBookmarks.includes(event.eventId)
                              ? "none"
                              : "1px solid #ced4da",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "14px",
                          }}
                        >
                          {userBookmarks.includes(event.eventId)
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


      {/* LIKES VIEW */}
      {/* Shows events the user has liked */}
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
              {/* Filter events to show only liked ones */}
              {events
                .filter((event) => userLikes.includes(event.eventId))
                .map((event) => (
                  <div
                    key={event.eventId}
                    className="event-card"
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "20px",
                      // borderLeft: `4px solid ${getCategoryColor(
                      //   event.categories
                      // )}`,
                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    }}
                  >
                    <h3>
                      {event.name}
                      {isOnlineEvent(event) && (
                        <span
                          style={{
                            fontSize: "12px",
                            marginLeft: "8px",
                            padding: "2px 6px",
                            backgroundColor: "#17a2b8",
                            color: "white",
                            borderRadius: "4px",
                            verticalAlign: "middle",
                          }}
                        >
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
                        {event?.startTime
                          ? formatEventTimeCompact(event.startTime)
                          : "No date available"}
                      </p>
                      {/* <p>
                      <strong>Categories:</strong>{" "}
                      {event.categories
                        .map((cat) => getShortCategoryName(cat))
                        .join(", ")}
                    </p> */}
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
                        onClick={() => handleLikeEvent(event.eventId)}
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


      {/* BOOKMARKS VIEW */}
      {/* Shows events the user has bookmarked */}
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
              {/* Filter events to show only bookmarked ones */}
              {events
                .filter((event) => userBookmarks.includes(event.eventId))
                .map((event) => (
                  <div
                    key={event.eventId}
                    className="event-card"
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "20px",
                      // borderLeft: `4px solid ${getCategoryColor(
                      //   event.categories
                      // )}`,
                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    }}
                  >
                    <h3>
                      {event.name}
                      {isOnlineEvent(event) && (
                        <span
                          style={{
                            fontSize: "12px",
                            marginLeft: "8px",
                            padding: "2px 6px",
                            backgroundColor: "#17a2b8",
                            color: "white",
                            borderRadius: "4px",
                            verticalAlign: "middle",
                          }}
                        >
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
                        {event?.startTime
                          ? formatEventTimeCompact(event.startTime)
                          : "No date available"}
                      </p>
                      {/* <p>
                      <strong>Categories:</strong>{" "}
                      {event.categories
                        .map((cat) => getShortCategoryName(cat))
                        .join(", ")}
                    </p> */}
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
                        onClick={() => handleBookmarkEvent(event.eventId)}
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
