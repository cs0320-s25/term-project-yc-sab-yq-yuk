// src/components/EventMap.tsx
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useState, useRef } from "react";
import Map, { ViewStateChangeEvent, Marker } from "react-map-gl";
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
import { formatEventTimeCompact } from "../utils/dateFormatters";
import {
  processEvents,
  hasValidCoordinates,
  isOnlineEvent,
  truncateToSentences,
} from "../utils/eventHelpers";
import EventDetailBody from "./EventDetailBody";

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
  const [drawerEvent, setDrawerEvent] = useState<Event | null>(null);
  const [activeView, setActiveView] = useState<"map" | "likes" | "bookmarks">(
    "map"
  );
  const [displayedEvents, setDisplayedEvents] = useState<Event[]>([]);
  const [eventCategories, setEventCategories] = useState<
    Record<string, string[]>
  >({});

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
        // Only apply filters in map view
        let filters = {};

        if (activeView === "map") {
          filters = {
            category: selectedCategory,
            time: timeFilter,
            near: locationFilter === "online" ? "" : locationFilter,
          };
        }

        let data: Event[] = [];

        // Different API calls based on view
        if (activeView === "map") {
          // Only in map view, check for trending/recommendations
          if (showTrending) {
            data = await api.getTrendingEvents(filters);
          } else if (userId && !searchQuery) {
            data = await api.getRecommendations(userId, filters);
          } else if (searchQuery) {
            data = await api.searchEvents(searchQuery);
          } else {
            data = await api.getEvents(filters);
          }
        } else {
          // For likes and bookmarks views, get all events without filters
          data = await api.getEvents({});
        }

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
    activeView, // Add this to trigger fetch when view changes
  ]);

  // Filter events client-side based on the locationFilter
  useEffect(() => {
    if (locationFilter === "online") {
      // Filter for online events using our comprehensive isOnlineEvent function
      setDisplayedEvents(events.filter((event) => isOnlineEvent(event)));
    } else {
      // Show all events or those matching other filters
      setDisplayedEvents(events);
    }
  }, [events, locationFilter]);

  const closeDrawer = () => {
    setDrawerEvent(null);
    setSelectedEvent(null);
  };

  // Close drawer on ESC
  useEffect(() => {
    if (!drawerEvent) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerEvent]);

  // Open the drawer for an event. Flies to the pin if coordinates exist, using
  // an offset so the pin lands in the visible map area (not under the drawer).
  const openDrawer = (event: Event) => {
    setDrawerEvent(event);
    if (hasValidCoordinates(event) && mapRef.current) {
      setSelectedEvent(event);
      mapRef.current.flyTo({
        center: [event.longitude, event.latitude],
        zoom: 17,
        offset: [-190, 0],
        duration: 1000,
      });
    }
  };

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

  // Key events by rounded coordinate (~1m precision) so pins at the same
  // address share a single marker and can be swapped inside the drawer.
  const coordKey = (e: Event) =>
    hasValidCoordinates(e)
      ? `${e.latitude!.toFixed(5)},${e.longitude!.toFixed(5)}`
      : null;
  const pinGroups = mapEvents.reduce<Record<string, Event[]>>((acc, e) => {
    const k = coordKey(e);
    (acc[k] ||= []).push(e);
    return acc;
  }, {});
  const drawerSiblings =
    drawerEvent && hasValidCoordinates(drawerEvent)
      ? mapEvents.filter(
        (e) =>
          hasValidCoordinates(e) &&
          coordKey(e) === coordKey(drawerEvent)
      )
      : drawerEvent
        ? [drawerEvent]
        : [];

  // Create a function to fetch categories for an event
  const fetchEventCategories = async (eventId: string) => {
    // Skip fetching if we already have categories for this event
    if (eventCategories[eventId]) return;

    try {
      // Use our API service to fetch categories
      const categories = await api.fetchCategoriesForEvent(eventId);

      // Update state with the fetched categories
      setEventCategories((prev) => ({
        ...prev,
        [eventId]: categories,
      }));
    } catch (error) {
      console.error(`Error fetching categories for event ${eventId}:`, error);
    }
  };

  // Event handlers
  // Handle viewing an event(flies to location), whether online or in-person
  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    // Fetch categories for the selected event
    // fetchEventCategories(event.eventId);
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

      // Keep drawer in sync
      if (drawerEvent?.eventId === eventId) {
        setDrawerEvent({
          ...drawerEvent,
          likedCount: isLiked
            ? Math.max(0, drawerEvent.likedCount - 1)
            : drawerEvent.likedCount + 1,
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

  // Effect to fetch categories for visible events
  // This runs whenever the event list changes
  useEffect(() => {
    // Only proceed if we have events and they're displayed
    if (displayedEvents.length > 0) {
      // Limit to the first 10 events to avoid too many API calls
      const visibleEvents = displayedEvents.slice(0, 10);

      // Fetch categories for each visible event
      visibleEvents.forEach((event) => {
        fetchEventCategories(event.eventId);
      });
    }
  }, [displayedEvents]);

  // Helper function to get categories for an event
  // This retrieves categories from our local state
  const getEventCategories = (eventId: string): string[] => {
    return eventCategories[eventId] || [];
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
            onClick={() => {
              setActiveView("likes");
              // Reset filters when switching to likes view
              setSelectedCategory("");
              setTimeFilter("");
              setLocationFilter("");
              setSearchQuery("");
              setShowTrending(false);
            }}
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
            onClick={() => {
              setActiveView("bookmarks");
              // Reset filters when switching to bookmarks view
              setSelectedCategory("");
              setTimeFilter("");
              setLocationFilter("");
              setSearchQuery("");
              setShowTrending(false);
            }}
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

          {/* Event list panel (column 2) - compact vertical list */}
          <div
            className="event-list-panel"
            style={{
              width: "340px",
              padding: "16px",
              overflowY: "auto",
              borderRight: "1px solid #dee2e6",
              backgroundColor: "white",
            }}
          >
            <h2 style={{ margin: "0 0 12px 0", fontSize: "18px" }}>
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

            {filteredEvents.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "24px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                }}
              >
                <h3 style={{ margin: "0 0 8px 0" }}>No events found</h3>
                <p style={{ margin: 0, fontSize: "14px", color: "#6c757d" }}>
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {filteredEvents.map((event) => {
                  const isActive = drawerEvent?.eventId === event.eventId;
                  return (
                    <div
                      key={event.eventId}
                      className="event-card"
                      style={{
                        border: isActive
                          ? "1px solid #8B2A2A"
                          : "1px solid #ddd",
                        borderLeft: `4px solid ${getCategoryColor(getEventCategories(event.eventId))}`,
                        borderRadius: "6px",
                        padding: "10px 12px",
                        cursor: "pointer",
                        backgroundColor: isActive ? "#fdf5f5" : "white",
                        transition: "background-color 0.15s",
                      }}
                      onClick={() => openDrawer(event)}
                    >
                      <h4
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "14px",
                          lineHeight: "1.3",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          minHeight: "36px",
                        }}
                      >
                        {event.name}
                        {isOnlineEvent(event) && (
                          <span
                            style={{
                              fontSize: "10px",
                              marginLeft: "6px",
                              padding: "1px 5px",
                              backgroundColor: "#17a2b8",
                              color: "white",
                              borderRadius: "3px",
                              verticalAlign: "middle",
                            }}
                          >
                            ONLINE
                          </span>
                        )}
                      </h4>
                      <p
                        style={{
                          margin: "0 0 6px 0",
                          fontSize: "12px",
                          color: "#6c757d",
                          lineHeight: "1.4",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          minHeight: "34px",
                        }}
                      >
                        {truncateToSentences(event.description, 2, 120)}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "11px",
                          color: "#6c757d",
                          marginBottom: "6px",
                        }}
                      >
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "60%",
                          }}
                        >
                          📍 {event.location || "—"}
                        </span>
                        <span>
                          {event.startTime
                            ? formatEventTimeCompact(event.startTime)
                            : "No date"}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "12px",
                        }}
                      >
                        <span style={{ color: "#6c757d" }}>
                          👁️ {event.viewedCount}
                        </span>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLikeEvent(event.eventId);
                            }}
                            style={{
                              padding: "3px 7px",
                              backgroundColor: userLikes.includes(event.eventId)
                                ? "#dc3545"
                                : "#f8f9fa",
                              color: userLikes.includes(event.eventId)
                                ? "white"
                                : "#212529",
                              border: "1px solid #ced4da",
                              borderRadius: "3px",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            {userLikes.includes(event.eventId) ? "❤️" : "👍"}{" "}
                            {event.likedCount}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookmarkEvent(event.eventId);
                            }}
                            style={{
                              padding: "3px 7px",
                              backgroundColor: userBookmarks.includes(
                                event.eventId
                              )
                                ? "#dc3545"
                                : "#f8f9fa",
                              color: userBookmarks.includes(event.eventId)
                                ? "white"
                                : "#212529",
                              border: "1px solid #ced4da",
                              borderRadius: "3px",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            🏷️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Map (column 3) - full remaining space */}
          <div
            className="map-container"
            style={{ flex: 1, position: "relative" }}
          >
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
              onMove={(ev: ViewStateChangeEvent) => setViewState(ev.viewState)}
              onLoad={() => {
                setMapLoaded(true);
                console.log("Map loaded");
              }}
              ref={mapRef}
            >
              {Object.entries(pinGroups).map(([key, group]) => {
                const first = group[0];
                const isSelected = !!selectedEvent && group.some(
                  (e) => e.eventId === selectedEvent.eventId
                );
                const pinColor = isSelected ? "#8B2A2A" : "#3FB1CE";
                const count = group.length;
                return (
                  <Marker
                    key={key}
                    longitude={first.longitude}
                    latitude={first.latitude}
                    anchor="bottom"
                    onClick={(e) => {
                      e.originalEvent.stopPropagation();
                      openDrawer(first);
                    }}
                  >
                    <svg
                      width="24"
                      height="34"
                      viewBox="0 0 24 34"
                      style={{
                        cursor: "pointer",
                        filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.3))",
                        overflow: "visible",
                      }}
                    >
                      <path
                        d="M12 0C5.373 0 0 5.373 0 12c0 7.5 12 22 12 22S24 19.5 24 12C24 5.373 18.627 0 12 0z"
                        fill={pinColor}
                        stroke="white"
                        strokeWidth="1.5"
                      />
                      <circle cx="12" cy="12" r="4.5" fill="white" opacity="0.9" />
                      {count > 1 && (
                        <>
                          <circle
                            cx="20"
                            cy="4"
                            r="7"
                            fill="#ffffff"
                            stroke="#212529"
                            strokeWidth="1"
                          />
                          <text
                            x="20"
                            y="4"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize="9"
                            fontWeight="700"
                            fill="#212529"
                          >
                            {count > 9 ? "9+" : count}
                          </text>
                        </>
                      )}
                    </svg>
                  </Marker>
                );
              })}
            </Map>

            {/* Right-side detail drawer */}
            {drawerEvent && (
              <aside
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "380px",
                  height: "100%",
                  backgroundColor: "white",
                  boxShadow: "-2px 0 12px rgba(0,0,0,0.15)",
                  padding: "20px 20px 24px",
                  overflowY: "auto",
                  zIndex: 5,
                }}
              >
                <button
                  onClick={closeDrawer}
                  aria-label="Close details"
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "12px",
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    lineHeight: 1,
                    cursor: "pointer",
                    color: "#6c757d",
                  }}
                >
                  ×
                </button>
                <div style={{ marginTop: "8px" }}>
                  <EventDetailBody
                    key={drawerEvent.eventId}
                    event={drawerEvent}
                    userLikes={userLikes}
                    userBookmarks={userBookmarks}
                    onLike={handleLikeEvent}
                    onBookmark={handleBookmarkEvent}
                    categories={getEventCategories(drawerEvent.eventId)}
                    siblings={drawerSiblings}
                    onSwitchEvent={(e) => openDrawer(e)}
                  />
                </div>
              </aside>
            )}
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
                      borderLeft: `4px solid ${getCategoryColor(getEventCategories(event.eventId))}`,
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
                      {/* <p>
                        <strong>Location:</strong> {event.location}
                      </p> */}
                      <p>
                        <strong>Time:</strong>{" "}
                        {event?.startTime
                          ? formatEventTimeCompact(event.startTime)
                          : "No date available"}
                      </p>
                      <p>
                        <strong>Categories:</strong>{" "}
                        {getEventCategories(event.eventId)
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
                            openDrawer(event);
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
                        {hasValidCoordinates(event) ? "View on Map" : "View Details"}
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
                      borderLeft: `4px solid ${getCategoryColor(getEventCategories(event.eventId))}`,
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
                      <p>
                        <strong>Categories:</strong>{" "}
                        {getEventCategories(event.eventId)
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
                            openDrawer(event);
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
                        {hasValidCoordinates(event) ? "View on Map" : "View Details"}
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
