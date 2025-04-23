import static org.junit.jupiter.api.Assertions.*;

import com.squareup.moshi.JsonAdapter;
import com.squareup.moshi.Moshi;
import edu.brown.cs.student.main.server.example.parserNestedClasses.GeoJsonObject;
import edu.brown.cs.student.main.server.handlers.BoundBoxHandler;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import spark.Spark;

public class BoundBoxTest {

  @BeforeAll
  public static void setup_before_everything() {
    Spark.port(0);
    Logger.getLogger("").setLevel(Level.WARNING); // suppress log spam during tests
  }

  @BeforeEach
  public void setup() {
    Spark.get("bound-box", new BoundBoxHandler());
    Spark.init();
    Spark.awaitInitialization();
  }

  @AfterEach
  public void teardown() {
    Spark.unmap("bound-box");
    Spark.stop();
    Spark.awaitStop();
  }

  /** Helper to start a connection to a specific API endpoint/params */
  private static HttpURLConnection tryRequest(String apiCall) throws IOException {
    URL requestURL = new URL("http://localhost:" + Spark.port() + "/" + apiCall);
    HttpURLConnection clientConnection = (HttpURLConnection) requestURL.openConnection();
    clientConnection.setRequestMethod("GET");
    clientConnection.connect();
    return clientConnection;
  }

  /** Test bounding box query with uid=123 and a bounding box that filters for 0 features */
  @Test
  public void testBoundBoxNoFeatures() throws IOException {
    HttpURLConnection clientConnection =
        tryRequest("bound-box?uid=123&minLong=0&maxLong=1&minLat=0&maxLat=1");

    assertEquals(200, clientConnection.getResponseCode());

    BufferedReader in =
        new BufferedReader(new InputStreamReader(clientConnection.getInputStream()));
    StringBuilder response = new StringBuilder();
    String inputLine;
    while ((inputLine = in.readLine()) != null) {
      response.append(inputLine);
    }
    in.close();

    // Deserialize response as GeoJsonObject
    Moshi moshi = new Moshi.Builder().build();
    JsonAdapter<GeoJsonObject> adapter = moshi.adapter(GeoJsonObject.class);
    GeoJsonObject responseGeoJson = adapter.fromJson(response.toString());

    assertNotNull(responseGeoJson);
    System.out.println(responseGeoJson.features.toString());
    assertEquals("[]", responseGeoJson.features.toString());
    assertEquals("FeatureCollection", responseGeoJson.type);

    clientConnection.disconnect();
  }

  /** Test bounding box query with uid=123 and a bounding box that has a bad query */
  @Test
  public void testBoundBoxBad() throws IOException {
    HttpURLConnection clientConnection =
        tryRequest("bound-box?uid=123&minLong=A&maxLong=1&minLat=0&maxLat=1");

    assertEquals(200, clientConnection.getResponseCode());

    BufferedReader in =
        new BufferedReader(new InputStreamReader(clientConnection.getInputStream()));
    StringBuilder response = new StringBuilder();
    String inputLine;
    while ((inputLine = in.readLine()) != null) {
      response.append(inputLine);
    }
    in.close();

    // Deserialize response as a Map to check for error
    Moshi moshi = new Moshi.Builder().build();
    JsonAdapter<Map> adapter = moshi.adapter(Map.class);
    Map responseMap = adapter.fromJson(response.toString());

    // Check that we got an error response
    assertNotNull(responseMap);
    assertEquals("error_bad_request", responseMap.get("response"));
    assertEquals("Invalid numeric format: For input string: \"A\"", responseMap.get("message"));

    clientConnection.disconnect();
  }

  /**
   * Test bounding box query with uid=123 and a bounding box that results in a successful search
   * with features
   */
  @Test
  public void testBoundBoxGood() throws IOException {
    HttpURLConnection clientConnection =
        tryRequest(
            "bound-box?uid=123&minLong=-74.438258&maxLong=-74.338258&minLat=40.683769&maxLat=40.783769");

    assertEquals(200, clientConnection.getResponseCode());

    BufferedReader in =
        new BufferedReader(new InputStreamReader(clientConnection.getInputStream()));
    StringBuilder response = new StringBuilder();
    String inputLine;
    while ((inputLine = in.readLine()) != null) {
      response.append(inputLine);
    }
    in.close();

    // Deserialize response as GeoJsonObject
    Moshi moshi = new Moshi.Builder().build();
    JsonAdapter<GeoJsonObject> adapter = moshi.adapter(GeoJsonObject.class);
    GeoJsonObject responseGeoJson = adapter.fromJson(response.toString());

    assertNotNull(responseGeoJson);
    assertEquals(17, responseGeoJson.features.size());
    assertEquals("FeatureCollection", responseGeoJson.type);

    clientConnection.disconnect();
  }

  /** Test bounding box query with uid=123 and a search that is missing a query parameter */
  @Test
  public void testBoundBoxMissingParam() throws IOException {
    HttpURLConnection clientConnection =
        tryRequest("bound-box?uid=123&minLong=A&maxLong=1&minLat=0");

    assertEquals(200, clientConnection.getResponseCode());

    BufferedReader in =
        new BufferedReader(new InputStreamReader(clientConnection.getInputStream()));
    StringBuilder response = new StringBuilder();
    String inputLine;
    while ((inputLine = in.readLine()) != null) {
      response.append(inputLine);
    }
    in.close();

    // Deserialize response as a Map to check for error
    Moshi moshi = new Moshi.Builder().build();
    JsonAdapter<Map> adapter = moshi.adapter(Map.class);
    Map responseMap = adapter.fromJson(response.toString());

    // Check that we got an error response
    assertNotNull(responseMap);
    assertEquals("error_bad_request", responseMap.get("response"));
    assertEquals("Missing query parameter", responseMap.get("message"));

    clientConnection.disconnect();
  }
}
