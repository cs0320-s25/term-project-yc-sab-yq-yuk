package com.map.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.io.Serializable;

/**
 * Represents an event with various attributes such as time, location, type, and metrics.
 * Maps to the events table in the database.
 */
@Data // getter/setter are automatically generated
@Builder // generate a builder api
@NoArgsConstructor // auto generate no parameter constructor
@AllArgsConstructor // auto generate a all parameter constructor
public class Event implements Serializable{
  private Integer eventId;
  private String name;
  private LocalDateTime startTime;
  private LocalDateTime endTime;
  private String timezone;
  private String location;
  private String description;
  private String eventType;
  private String link;
  private Double latitude;
  private Double longitude;
  private Integer likedCount;
  private Integer viewedCount;
  private Double trendingScore;
}
