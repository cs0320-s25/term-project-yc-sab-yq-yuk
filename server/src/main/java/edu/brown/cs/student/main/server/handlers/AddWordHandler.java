package edu.brown.cs.student.main.server.handlers;

import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.util.HashMap;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

public class AddWordHandler implements Route {

  public StorageInterface storageHandler;

  public AddWordHandler(StorageInterface storageHandler) {
    this.storageHandler = storageHandler;
  }

  /**
   * Invoked when a request is made on this route's corresponding path e.g. '/hello'
   *
   * @param request The request object providing information about the HTTP request
   * @param response The response object providing functionality for modifying the response
   * @return The content to be set in the response
   */
  @Override
  public Object handle(Request request, Response response) {
    Map<String, Object> responseMap = new HashMap<>();
    try {
      // collect parameters from the request
      String uid = request.queryParams("uid");
      String word = request.queryParams("word");

      Map<String, Object> data = new HashMap<>();
      data.put("word", word);

      System.out.println("adding word: " + word + " for user: " + uid);

      // get the current word count to make a unique word_id by index.
      int wordCount = this.storageHandler.getCollection(uid, "words").size();
      String wordId = "word-" + wordCount;

      // use the storage handler to add the document to the database
      this.storageHandler.addDocument(uid, "words", wordId, data);

      responseMap.put("response_type", "success");
      responseMap.put("word", word);
    } catch (Exception e) {
      // error likely occurred in the storage handler
      e.printStackTrace();
      responseMap.put("response_type", "failure");
      responseMap.put("error", e.getMessage());
    }

    return Utils.toMoshiJson(responseMap);
  }
}
