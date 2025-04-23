import { FeatureCollection } from "geojson";
import { FillLayer } from "react-map-gl";
import * as d3 from 'd3';

const HOST = "http://localhost:3232"; 

// const propertyName = "grade";
const propertyName = "holc_grade";
export const geoLayer: FillLayer = {
  id: "geo_data",
  type: "fill",
  paint: {
    "fill-color": [
      "match",
      ["get", propertyName],
      "A",
      "#5bcc04",
      "B",
      "#04b8cc",
      "C",
      "#e9ed0e",
      "D",
      "#d11d1d",
      "#ccc",
    ],
    "fill-opacity": 0.2,
  },
};

// TODO: MAPS PART 4:
// - Download and import the geojson file
// - Implement the two functions below.

// Import the raw JSON file
// import rl_data from "../geodata/fullDownload.json";
// you may need to rename the downloaded .geojson to .json

function isFeatureCollection(json: any): json is FeatureCollection {
  // ...
  return json.type === "FeatureCollection";
}

// Fetch GeoJSON data from the backend API based on user input
async function fetchGeoJSON(minLat: number, maxLat: number, minLong: number, maxLong: number, uid: string): Promise<GeoJSON.FeatureCollection | undefined> {
  const response = await fetch(`http://localhost:3232/bound-box?uid=${uid}&minLong=${minLong}&maxLong=${maxLong}&minLat=${minLat}&maxLat=${maxLat}`);
  
  if (response.ok) {
    const data = await response.json();
    const result = isFeatureCollection(data) ? data : undefined;
    
    if (result === undefined) {
      console.log("Invalid GeoJSON data: Not a valid FeatureCollection");
    }
    return result;
  } else {
    console.error("Failed to fetch GeoJSON data:", response.statusText);
    return undefined;
  }
}

async function fetchGeoJSONSearch(query: string, uid: string): Promise<GeoJSON.FeatureCollection | undefined> {
  const response = await fetch(`http://localhost:3232/search-map?uid=${uid}&query=${query}`);
  
  if (response.ok) {
    console.log("I did it I searched!!!")
    const data = await response.json();
    const result = isFeatureCollection(data) ? data : undefined;
    
    if (result === undefined) {
      console.log("Invalid GeoJSON data: Not a valid FeatureCollection");
    }
    return result;
  } else {
    console.error("Failed to fetch GeoJSON data:", response.statusText);
    return undefined;
  }
}

// Main function to fetch and return overlay data based on user input
export async function overlayData(minLat: number, maxLat: number, minLong: number, maxLong: number, uid: string): Promise<GeoJSON.FeatureCollection | undefined> {
  const geojson = await fetchGeoJSON(minLat, maxLat, minLong, maxLong, uid);
  return geojson;
}

export async function highlightData(query: string, uid: string): Promise<GeoJSON.FeatureCollection | undefined> {
  const geojson = await fetchGeoJSONSearch(query, uid);
  return geojson;
}


