package edu.brown.cs.student.main.server.handlers;

import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

/**
 * ListPinsHandler handles requests to list all pins for a specific user or all users.
 *
 * <p>It expects a query parameter "uid" to specify the user ID. If "uid" is "all", it lists pins
 * for all users.
 */
public class ListPinsHandler implements Route {
  private StorageInterface storageHandler;

  /**
   * Constructor for ListPinsHandler.
   *
   * @param storageHandler The StorageInterface instance to interact with the database.
   */
  public ListPinsHandler(StorageInterface storageHandler) {
    this.storageHandler = storageHandler;
  }

  /**
   * Handles the HTTP request for listing pins.
   *
   * @param request The request object providing information about the HTTP request
   * @param response The response object providing functionality for modifying the response
   * @return The content to be set in the response
   */
  @Override
  public Object handle(Request request, Response response) {
    Map<String, Object> responseMap = new HashMap<>();
    try {
      String uid = request.queryParams("uid");
      List<Map<String, Object>> pins;

      if (uid != null && uid.equalsIgnoreCase("all")) {
        System.out.println("Listing pins for all users");
        pins = storageHandler.getAllPins("pins");
      } else {
        System.out.println("Listing pins for user: " + uid);
        pins = storageHandler.getCollection(uid, "pins");
      }

      responseMap.put("response_type", "success");
      responseMap.put("pins", pins);
    } catch (Exception e) {
      e.printStackTrace();
      responseMap.put("response_type", "failure");
      responseMap.put("error", e.getMessage());
    }
    return Utils.toMoshiJson(responseMap);
  }
}
