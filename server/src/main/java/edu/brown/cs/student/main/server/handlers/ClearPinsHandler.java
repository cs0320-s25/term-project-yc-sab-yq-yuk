package edu.brown.cs.student.main.server.handlers;

import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

/** Handler for clearing pins from the database. */
public class ClearPinsHandler implements Route {
  private StorageInterface storageHandler;

  /**
   * Constructor for ClearPinsHandler.
   *
   * @param storageHandler storage interface for database operations
   */
  public ClearPinsHandler(StorageInterface storageHandler) {
    this.storageHandler = storageHandler;
  }

  /**
   * Handles requests to clear pins.
   *
   * @param request the request object providing information about the HTTP request
   * @param response the response object providing functionality for modifying the response
   * @return the content to be set in the response
   */
  @Override
  public Object handle(Request request, Response response) {
    Map<String, Object> responseMap = new HashMap<>();
    try {
      String uid = request.queryParams("uid");
      System.out.println("Clearing pins for user: " + uid);

      // Get all pins for the user first (to count them)
      List<Map<String, Object>> pinData = this.storageHandler.getCollection(uid, "pins");
      int pinCount = pinData.size();

      // Clear the pins by clearing the user (this will also clear words and other data)
      this.storageHandler.clearUser(uid);

      responseMap.put("response_type", "success");
      responseMap.put("cleared_pins_count", pinCount);
    } catch (Exception e) {
      // Error likely occurred in the storage handler
      e.printStackTrace();
      responseMap.put("response_type", "failure");
      responseMap.put("error", e.getMessage());
    }
    return Utils.toMoshiJson(responseMap);
  }
}
