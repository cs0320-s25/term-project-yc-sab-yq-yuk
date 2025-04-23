package edu.brown.cs.student.main.server.handlers;

import com.squareup.moshi.JsonAdapter;
import com.squareup.moshi.Moshi;
import edu.brown.cs.student.main.server.example.parserNestedClasses.GeoJsonObject;
import edu.brown.cs.student.main.server.example.parserNestedClasses.JSONParser2;
import java.util.ArrayList;
import java.util.List;
import spark.Request;
import spark.Response;
import spark.Route;

public class SearchMapHandler implements Route {

  private GeoJsonObject data;

  public SearchMapHandler() {
    JSONParser2 parser = new JSONParser2();
    parser.createGeoJson();
    this.data = parser.parsedJSON;
  }

  @Override
  public Object handle(Request request, Response response) {

    String query = request.queryParams("query");

    if (query == null) {
      return new SearchFailureResponse("error_bad_request", "Missing query parameter").serialize();
    }

    try {
      if (this.data == null || this.data.features == null) {
        return new SearchFailureResponse("error_datasource", "No loaded GeoJSON data to search")
            .serialize();
      }

      List<GeoJsonObject.Feature> filteredFeatures = new ArrayList<>();

      for (GeoJsonObject.Feature feature : this.data.features) {
        if (feature.properties == null) continue;

        boolean includeFeature = false;

        // Assuming area_description_data is a field in the 'properties' class
        Object descriptionData = feature.properties.area_description_data;

        if (descriptionData != null
            && descriptionData.toString().toLowerCase().contains(query.toLowerCase())) {
          includeFeature = true;
        }

        if (includeFeature) {
          filteredFeatures.add(feature);
        }
      }

      GeoJsonObject responseGeoJson = new GeoJsonObject();
      responseGeoJson.type = "FeatureCollection";
      responseGeoJson.features = filteredFeatures;

      Moshi moshi = new Moshi.Builder().build();
      JsonAdapter<GeoJsonObject> adapter = moshi.adapter(GeoJsonObject.class);
      return adapter.toJson(responseGeoJson);

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
