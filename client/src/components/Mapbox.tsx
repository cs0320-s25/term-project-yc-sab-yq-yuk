import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useState, useRef } from "react";
import Map, {
  Layer,
  MapLayerMouseEvent,
  Source,
  ViewStateChangeEvent,
  Popup,
  Marker,
} from "react-map-gl";
import { geoLayer, overlayData, highlightData } from "../utils/overlay"; // Import overlay functions
import { FeatureCollection } from "geojson";
import { useAuth } from "@clerk/clerk-react";
import { Pin, pinStore } from "./PinStore";

// Mapbox API key
const MAPBOX_API_KEY = process.env.MAPBOX_TOKEN;
if (!MAPBOX_API_KEY) {
  console.error("Mapbox API key not found. Please add it to your .env file.");
}

export interface LatLong {
  lat: number;
  long: number;
}

const ProvidenceLatLong: LatLong = {
  lat: 41.8246,
  long: -71.4128,
};
const initialZoom = 10;

export default function Mapbox() {
  const { userId } = useAuth(); // Ensure userId is properly destructured from useAuth
  const mapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [viewState, setViewState] = useState({
    longitude: ProvidenceLatLong.long,
    latitude: ProvidenceLatLong.lat,
    zoom: initialZoom,
  });

  // State for overlay data (GeoJSON)
  const [overlay, setOverlay] = useState<GeoJSON.FeatureCollection | undefined>(undefined);
  const [highlight, setHighlight] = useState<GeoJSON.FeatureCollection | undefined>(undefined);

  // State for the search query
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch and display the highlighted data
  const submitHighlight = async (query: string) => {
    if (userId) {
      const geojson = await highlightData(query, userId);  // Use highlightData with the query and userId
      setHighlight(geojson);  // Update the highlight data
      console.log(highlight)
    }
  };

  // Handle search submission
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      submitHighlight(searchQuery);
    }
  };

  // State for pins displayed on the map
  const [pins, setPins] = useState<Pin[]>([]);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [loading, setLoading] = useState(false);

  // Keep track of users we've loaded pins for
  const [loadedUserIds, setLoadedUserIds] = useState<Set<string>>(new Set());

  // State for user input bounding box
  const [boundbox_minlat, setMinLat] = useState<number>(0);
  const [boundbox_maxlat, setMaxLat] = useState<number>(0);
  const [boundbox_minlong, setMinLong] = useState<number>(0);
  const [boundbox_maxlong, setMaxLong] = useState<number>(0);

  // State for handling form submission
  const [isMapLoading, setIsMapLoading] = useState(false);

  // Reset overlays button functionality
  const resetOverlays = () => {
    if (mapRef.current && mapLoaded) {
      // Get the bounding box of the map
      const bounds = mapRef.current.getBounds();

      // Extract the coordinates of the southwest and northeast corners
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();

      // Update the states with the coordinates of the map's bounding box
      setMinLat(sw.lat); // South-West latitude
      setMaxLat(ne.lat); // North-East latitude
      setMinLong(sw.lng); // South-West longitude
      setMaxLong(ne.lng); // North-East longitude
    }
  };

  // Load redlining overlay data when component mounts or when bounding box changes
  useEffect(() => {
    const fetchOverlayData = async () => {
      if (userId) {
        setLoading(true);
        const overlayDataResult = await overlayData(
          boundbox_minlat,
          boundbox_maxlat,
          boundbox_minlong,
          boundbox_maxlong,
          userId
        );
        setOverlay(overlayDataResult);
        setLoading(false);
        // console.log(overlay)
      }
    };

    fetchOverlayData();
  }, [boundbox_minlat, boundbox_maxlat, boundbox_minlong, boundbox_maxlong, userId]);

  // When the userId is available (i.e., user is logged in), load that user's pins.
  useEffect(() => {
    if (userId && !loadedUserIds.has(userId)) {
      loadUserPins(userId);
      // Add this user to our loaded users list
      setLoadedUserIds((prev) => new Set(prev).add(userId));
    }
  }, [userId, loadedUserIds]);

  const onMapClick = async (e: MapLayerMouseEvent) => {
    if (!userId) {
      alert("Please sign in to add pins");
      return;
    }

    try {
      setIsMapLoading(true);
      await addPin(e.lngLat.lat, e.lngLat.lng);
      // After adding a pin, refresh pins from all users.
      await loadAllCachedPins();
    } catch (error) {
      console.error("Error adding pin:", error);
      alert("Failed to add pin. Please try again.");
    } finally {
      setIsMapLoading(false);
    }
  };

  const addPin = async (latitude: number, longitude: number) => {
    if (!userId) throw new Error("User not authenticated");
    try {
      return await pinStore.addPin(userId, latitude, longitude);
    } catch (error) {
      console.error("Error adding pin:", error);
      throw error;
    }
  };

  const loadAllCachedPins = async () => {
    try {
      console.log("Loading all cached pins");
      setIsMapLoading(true);
      const allPins = await pinStore.refreshAllPins();
      console.log(`Loaded ${allPins.length} pins from cache`);
      setPins(allPins);
    } catch (error) {
      console.error("Error loading cached pins:", error);
    } finally {
      setIsMapLoading(false);
    }
  };

  const loadUserPins = async (uid: string) => {
    try {
      console.log(`Loading pins for user: ${uid}`);
      setIsMapLoading(true);
      const allPins = await pinStore.getUserPins(uid);
      console.log(`Loaded pins for user ${uid}, total pins in cache: ${allPins.length}`);
      setPins(allPins);
    } catch (error) {
      console.error("Error loading user pins:", error);
    } finally {
      setIsMapLoading(false);
    }
  };

  const clearMyPins = async () => {
    if (!userId) return;
    try {
      setIsMapLoading(true);
      await pinStore.clearUserPins(userId);
      // After clearing, refresh all pins and filter out those belonging to the current user.
      const allPins = await pinStore.refreshAllPins();
      const filteredPins = allPins.filter((pin) => pin.userId !== userId);
      setPins(filteredPins);
    } catch (error) {
      console.error("Error clearing pins:", error);
      alert("Failed to clear pins. Please try again.");
    } finally {
      setIsMapLoading(false);
    }
  };

  const isMyPin = (pin: Pin): boolean => {
    return userId !== null && pin.userId === userId;
  };
  
  // Handle form submission to fetch new bounding box data
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Trigger the data fetch based on user input
    overlayData(boundbox_minlat, boundbox_maxlat, boundbox_minlong, boundbox_maxlong, userId!)
      .then((data) => {
        setOverlay(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching overlay data:", error);
        setLoading(false);
      });

  };

  return (
    <div className="map">
      <div>
        {userId && (
          <button
            onClick={clearMyPins}
            disabled={isMapLoading}
            style={{
              padding: "8px 12px",
              backgroundColor: "#4a90e2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isMapLoading ? "not-allowed" : "pointer",
              opacity: isMapLoading ? 0.5 : 1,
            }}
          >
            {isMapLoading ? "Processing..." : "Clear My Pins"}
          </button>
        )}
      </div>
      <div className="search-container" style={{ position: 'absolute', top: 10, left: 10, zIndex: 1, background: 'white', padding: '10px', borderRadius: '8px' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter search query"
          style={{ padding: '5px', marginRight: '5px' }}
        />
        <button onClick={handleSearchSubmit} style={{ padding: '5px' }}>
          Submit
        </button>
      </div>
      {/* Button to reset overlays */}
      <div>
        <button
          onClick={resetOverlays}
          disabled={loading || !mapLoaded} // Disable until map is loaded
        >
          Reset Overlays
        </button>
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
          style={{ width: window.innerWidth, height: window.innerHeight }}
          mapStyle={"mapbox://styles/mapbox/streets-v12"}
          onMove={(ev: ViewStateChangeEvent) => setViewState(ev.viewState)}
          onClick={(ev: MapLayerMouseEvent) => onMapClick(ev)}
          onLoad={() => {
            setMapLoaded(true);
            loadAllCachedPins();
          }}
          ref={mapRef}
        >
          {overlay && (
            <Source id="geo_data" type="geojson" data={overlay}>
              <Layer id={geoLayer.id} type={geoLayer.type} paint={geoLayer.paint} />
            </Source>
          )}

          {overlay && (
            <Source id="highlighted_feature" type="geojson" data={highlight}>
              <Layer
                id="highlight-layer"
                type="fill"
                paint={{
                  "fill-color": "#ff0000", // Red color
                  "fill-opacity": 1,       // Fully opaque
                  "fill-outline-color": "#000000" //
                }}
              />
            </Source>
          )}

          {pins.map((pin) => (
            <Marker
              key={pin.id}
              longitude={pin.lng}
              latitude={pin.lat}
              color={isMyPin(pin) ? "#3498db" : "#e74c3c"} // Blue for own pins, red for others
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedPin(pin);
              }}
            />
          ))}
          {selectedPin && (
            <Popup
              longitude={selectedPin.lng}
              latitude={selectedPin.lat}
              anchor="bottom"
              onClose={() => setSelectedPin(null)}
            >
              <div style={{ padding: "5px" }}>
                <h4
                  style={{
                    margin: "0 0 8px 0",
                    borderBottom: "1px solid #ddd",
                    paddingBottom: "4px",
                  }}
                >
                  Pin Details
                </h4>
                <p style={{ margin: "4px 0" }}>
                  <strong>Created by:</strong>{" "}
                  {isMyPin(selectedPin) ? "You" : "Another user"}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>User ID:</strong> {selectedPin.userId.substring(0, 10)}
                  ...
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Location:</strong>
                  <br />
                  Latitude: {selectedPin.lat.toFixed(6)}
                  <br />
                  Longitude: {selectedPin.lng.toFixed(6)}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Created:</strong>
                  <br />
                  {new Date(selectedPin.timestamp).toLocaleString()}
                </p>
              </div>
            </Popup>
          )}
        </Map>
  
        {/* Redlining Data Section */}
        <div style={{ marginTop: '30px' }}>
          <h2>Overlay GeoJSON</h2>
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontSize: '14px', backgroundColor: '#f4f4f4', padding: '10px', borderRadius: '5px' }}>
            {JSON.stringify(overlay, null, 2)}
          </pre>
        </div>
      </div>
    </div> // Make sure this closing div corresponds with the opening div className="map"
  );
  
}
  