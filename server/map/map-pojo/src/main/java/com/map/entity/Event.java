package com.map.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.io.Serializable;

@Data // getter/setter are automatically generated
@Builder // generate a builder api
@NoArgsConstructor // auto generate no parameter constructor
@AllArgsConstructor // auto generate a all parameter constructor
public class Event implements Serializable{
  private String eventId;
  private String name;
  // TODO: add startTime & endTime
  private LocalDateTime time;
  private String location;
  private String description;
  private String link;
  private Integer likedCount;
  private Integer viewedCount;
  private Double trendingScore;
  private Double latitude;
  private Double longitude;
}
