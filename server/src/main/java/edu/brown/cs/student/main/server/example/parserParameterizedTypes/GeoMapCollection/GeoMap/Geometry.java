package edu.brown.cs.student.main.server.example.parserParameterizedTypes.GeoMapCollection.GeoMap;

import java.util.List;

public class Geometry extends GeoMap {
  //  public String type;
  // NOTE: "type" does not work here because we used type already so I did not include a field
  public List<List<List<List<Double>>>> coordinates; // float doesnt exist in fromJava

  public List<List<List<List<Double>>>> getCoordinates() {
    return this.coordinates;
  }
}
