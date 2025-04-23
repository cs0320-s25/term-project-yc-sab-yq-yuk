package edu.brown.cs.student.main.server.handlers;

import com.squareup.moshi.JsonAdapter;
import com.squareup.moshi.Moshi;
import edu.brown.cs.student.main.server.example.parserNestedClasses.GeoJsonObject;
import edu.brown.cs.student.main.server.example.parserNestedClasses.JSONParser2;
import spark.Request;
import spark.Response;
import spark.Route;

/**
 * BoundBoxHandler handles HTTP requests for filtering GeoJSON data based on a bounding box. It
 * delegates the filtering to a caching proxy.
 */
public class BoundBoxHandler implements Route {

  // Declare the caching proxy variable.
  private GeoJsonCacheProxy proxy;

  public BoundBoxHandler() {
    // Parse and load the GeoJSON data using JSONParser2.
    JSONParser2 parser = new JSONParser2();
    parser.createGeoJson();
    // Initialize the GeoJsonCacheProxy with the loaded data.
    this.proxy = new GeoJsonCacheProxy(parser.parsedJSON);
  }

  @Override
  public Object handle(Request request, Response response) {
    String minLongStr = request.queryParams("minLong");
    String maxLongStr = request.queryParams("maxLong");
    String minLatStr = request.queryParams("minLat");
    String maxLatStr = request.queryParams("maxLat");

    if (minLongStr == null || maxLongStr == null || minLatStr == null || maxLatStr == null) {
      return new SearchFailureResponse("error_bad_request", "Missing query parameter").serialize();
    }

    try {
      double minLong = Double.parseDouble(minLongStr);
      double maxLong = Double.parseDouble(maxLongStr);
      double minLat = Double.parseDouble(minLatStr);
      double maxLat = Double.parseDouble(maxLatStr);

      // Use the proxy to get filtered data
      GeoJsonObject result = proxy.query(minLong, maxLong, minLat, maxLat);

      Moshi moshi = new Moshi.Builder().build();
      JsonAdapter<GeoJsonObject> adapter = moshi.adapter(GeoJsonObject.class);
      return adapter.toJson(result);

    } catch (NumberFormatException e) {
      return new SearchFailureResponse(
              "error_bad_request", "Invalid numeric format: " + e.getMessage())
          .serialize();
    } catch (Exception e) {
      return new SearchFailureResponse("error_datasource", "Unexpected error: " + e.getMessage())
          .serialize();
    }
  }

  public record SearchFailureResponse(String response, String message) {
    public String serialize() {
      Moshi moshi = new Moshi.Builder().build();
      return moshi.adapter(SearchFailureResponse.class).toJson(this);
    }
  }
}
