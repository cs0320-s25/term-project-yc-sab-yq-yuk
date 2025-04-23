package edu.brown.cs.student.main.server.example.parserNestedClasses;

import com.squareup.moshi.JsonAdapter;
import com.squareup.moshi.Moshi;
import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;

public class JSONParser2 {
  public GeoJsonObject parsedJSON;

  /**
   * Parses JSON data from a JsonReader and converts it to the specified target type.
   *
   * @param source The JsonReader containing the JSON data.
   * @param targetType The Class representing the target data type to convert the JSON to.
   * @param <T> The generic type of the target data.
   * @return An instance of the target data type parsed from the JSON.
   * @throws IOException if there's an error reading or parsing the JSON data.
   */
  public static <T> T fromJsonGeneral(String source, Class<T> targetType) throws IOException {
    Moshi moshi = new Moshi.Builder().build();
    JsonAdapter<T> adapter = moshi.adapter(targetType);
    //    source.setLenient(true);

    return adapter.fromJson(source);
  }

  public void createGeoJson() {
    String filePath = "data/redliningdata.json";
    try {
      // ***************** READING THE FILE *****************
      System.out.println("1");
      FileReader jsonReader = new FileReader(filePath);
      System.out.println("2");
      BufferedReader br = new BufferedReader(jsonReader);
      String fileString = "";
      String line = br.readLine();
      while (line != null) {
        fileString = fileString + line;
        line = br.readLine();
      }
      System.out.println("3");
      jsonReader.close();

      // ****************** CREATING THE ADAPTER **********
      System.out.println("4");
      this.parsedJSON = fromJsonGeneral(fileString, GeoJsonObject.class);
      System.out.println("5");

    } catch (IOException e) {
      System.out.println("Error reading file: " + filePath);
      System.out.println(e.getMessage());
    }
  }

  public static void main(String[] args) throws FileNotFoundException {
    JSONParser2 myparser = new JSONParser2();
    myparser.createGeoJson();
    System.out.println("done");
  }
}
