package com.map.dataload;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EventRecord {
  private String id;
  private String name;
  @JsonProperty("start_time")
  private LocalDateTime startTime;
  @JsonProperty("end_time")
  private LocalDateTime endTime;
  private String timezone;
  private String description;
  private String location;
  private String eventType;
  private Double latitude;
  private Double longitude;
  private String group;
  private List<String> categories;
}
