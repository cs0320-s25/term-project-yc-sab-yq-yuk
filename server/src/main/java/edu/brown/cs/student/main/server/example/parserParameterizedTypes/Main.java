package edu.brown.cs.student.main.server.example.parserParameterizedTypes;

import edu.brown.cs.student.main.server.example.parserParameterizedTypes.GeoMapCollection.GeoMapCollection;
import java.io.FileNotFoundException;

public class Main {

  public static void main(String[] args) throws FileNotFoundException {

    JSONParser myDataSource = new JSONParser("data/geojson/fullDownload.geojson");
    GeoMapCollection geomapCollection = myDataSource.getData();
    System.out.println("Geomap parsed");
  }
}
