package edu.brown.cs.student.main.server.handlers;

import edu.brown.cs.student.main.server.example.parserNestedClasses.GeoJsonObject;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * GeoJsonCacheProxy provides a caching layer for filtering queries. It avoids repeatedly filtering
 * the same GeoJSON data for identical bounding box parameters.
 */
public class GeoJsonCacheProxy {

  private final GeoJsonObject data;
  private final Map<String, GeoJsonObject> cache;

  public GeoJsonCacheProxy(GeoJsonObject data) {
    this.data = data;
    this.cache = new HashMap<>();
  }

// Main query method
// Maintains a HashMap as cache where:
// Keys are strings formed by concatenating the bounding box parameters
// Values are pre-filtered GeoJSON objects
  public GeoJsonObject query(double minLong, double maxLong, double minLat, double maxLat) {
    // Created a simple but effective key with bounding box parameters.
    String key = minLong + "_" + maxLong + "_" + minLat + "_" + maxLat;
    if (cache.containsKey(key)) {
      return cache.get(key);
    } else {
      GeoJsonObject filtered = filterData(data, minLong, maxLong, minLat, maxLat);
      cache.put(key, filtered);
      return filtered;
    }
  }


  // Filtering logic implementation
  private GeoJsonObject filterData(
      GeoJsonObject data, double minLong, double maxLong, double minLat, double maxLat) {
    GeoJsonObject result = new GeoJsonObject();
    result.type = "FeatureCollection";
    result.features = new ArrayList<>();

    for (GeoJsonObject.Feature feature : data.features) {
      if (feature.geometry == null) continue;
      List<List<List<List<Double>>>> coords = feature.geometry.coordinates;
      boolean includeFeature = false;
      for (List<List<List<Double>>> polygon : coords) {
        for (List<List<Double>> ring : polygon) {
          for (List<Double> point : ring) {
            double longitude = point.get(0);
            double latitude = point.get(1);
            if (longitude >= minLong
                && longitude <= maxLong
                && latitude >= minLat
                && latitude <= maxLat) {
              includeFeature = true;
              break;
            }
          }
          if (includeFeature) break;
        }
        if (includeFeature) break;
      }
      if (includeFeature) {
        result.features.add(feature);
      }
    }
    return result;
  }
}
