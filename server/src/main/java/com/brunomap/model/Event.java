package com.brunomap.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;

public class Event {

  private String id;
  private String name;
  private List<String> categories;

  @JsonProperty("start_time")
  private LocalDateTime startTime;

  @JsonProperty("end_time")
  private LocalDateTime endTime;

  private String timezone; // EDT
  private String location;
  private String description;

  @JsonProperty("liked_count")
  private int likedCount;

  @JsonProperty("viewed_count")
  private int viewedCount;

  @JsonProperty("trending_score")
  private double trendingScore;

  private double latitude;
  private double longitude;
  private String group; // organizer info

  @JsonProperty("event_type")
  private String eventType; // attending mode: in person, online only, hybrid?

  private String link; // link to Events@Brown for redirect

  // Getters and Setters
  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public List<String> getCategories() {
    return categories;
  }

  public void setCategories(List<String> categories) {
    this.categories = categories;
  }

  public LocalDateTime getStartTime() {
    return startTime;
  }

  public void setStartTime(LocalDateTime startTime) {
    this.startTime = startTime;
  }

  public LocalDateTime getEndTime() {
    return endTime;
  }

  public void setEndTime(LocalDateTime endTime) {
    this.endTime = endTime;
  }

  public String getTimezone() {
    return timezone;
  }

  public void setTimezone(String timezone) {
    this.timezone = timezone;
  }

  public String getLocation() {
    return location;
  }

  public void setLocation(String location) {
    this.location = location;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public int getLikedCount() {
    return likedCount;
  }

  public void setLikedCount(int likedCount) {
    this.likedCount = likedCount;
  }

  public int getViewedCount() {
    return viewedCount;
  }

  public void setViewedCount(int viewedCount) {
    this.viewedCount = viewedCount;
  }

  public double getTrendingScore() {
    return trendingScore;
  }

  public void setTrendingScore(double trendingScore) {
    this.trendingScore = trendingScore;
  }

  public double getLatitude() {
    return latitude;
  }

  public void setLatitude(double latitude) {
    this.latitude = latitude;
  }

  public double getLongitude() {
    return longitude;
  }

  public void setLongitude(double longitude) {
    this.longitude = longitude;
  }

  public String getGroup() {
    return group;
  }

  public void setGroup(String group) {
    this.group = group;
  }

  public String getEventType() {
    return eventType;
  }

  public void setEventType(String eventType) {
    this.eventType = eventType;
  }

  public String getLink() {
    return link;
  }

  public void setLink(String link) {
    this.link = link;
  }
}
