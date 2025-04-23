package edu.brown.cs.student.main.server.handlers;

import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.util.HashMap;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

/**
 * AddPinHandler handles requests to add a new pin for a specific user.
 *
 * <p>It expects query parameters "uid", "lat", and "lon", and uses the StorageInterface to add a
 * new document (representing a pin) in the user's "pins" collection.
 */
public class AddPinHandler implements Route {
  private StorageInterface storageHandler;

  /**
   * Constructor for AddPinHandler.
   *
   * @param storageHandler The StorageInterface instance to interact with the database.
   */
  public AddPinHandler(StorageInterface storageHandler) {
    this.storageHandler = storageHandler;
  }

  /**
   * Handles the HTTP request for adding a new pin.
   *
   * @param request The request object providing information about the HTTP request
   * @param response The response object providing functionality for modifying the response
   * @return The content to be set in the response
   */
  @Override
  public Object handle(Request request, Response response) {
    Map<String, Object> responseMap = new HashMap<>();
    try {
      // Collect parameters from the request with proper null checking
      String uid = request.queryParams("uid");
      if (uid == null || uid.trim().isEmpty()) {
        throw new IllegalArgumentException("Missing required parameter: uid");
      }

      String latString = request.queryParams("lat");
      String lonString = request.queryParams("lon");

      if (latString == null || latString.trim().isEmpty()) {
        throw new IllegalArgumentException("Missing or empty required parameter: lat");
      }

      if (lonString == null || lonString.trim().isEmpty()) {
        throw new IllegalArgumentException("Missing or empty required parameter: lon");
      }

      // Now it's safe to parse
      double lat = Double.parseDouble(latString);
      double lon = Double.parseDouble(lonString);

      // Create a map for the pin data (lat, lon, and timestamp)
      Map<String, Object> data = new HashMap<>();
      data.put("lat", lat);
      data.put("lon", lon);
      data.put("timestamp", System.currentTimeMillis()); // Current time in milliseconds

      System.out.println("Adding pin for user: " + uid + " at location: " + lat + ", " + lon);

      // Get the current pin count to make a unique pin_id by index
      int pinCount = this.storageHandler.getCollection(uid, "pins").size();
      String pinId = "pin-" + pinCount;

      // Use the storage handler to add the document to the database
      this.storageHandler.addDocument(uid, "pins", pinId, data);

      responseMap.put("response_type", "success");
      responseMap.put("pin", data);
    } catch (IllegalArgumentException e) {
      // Parameter errors
      System.err.println("Parameter error: " + e.getMessage());
      responseMap.put("response_type", "failure");
      responseMap.put("error", e.getMessage());
    } catch (Exception e) {
      // Other errors
      e.printStackTrace();
      responseMap.put("response_type", "failure");
      responseMap.put("error", e.getMessage());
    }
    return Utils.toMoshiJson(responseMap);
  }
}
