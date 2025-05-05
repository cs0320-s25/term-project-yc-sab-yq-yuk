package com.brunomap.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

public class UserProfile {

  @JsonProperty("user_id")
  private String userId;

  private String email;

  @JsonProperty("user_name")
  private String userName;

  private List<LikeEntry> likes; // list of liked event ids with timestamps
  private List<String> bookmarked; // list of bookmarked event ids

  @JsonProperty("derived_categories")
  private Map<String, Integer> derivedCategories; // category frequencies!

  // Like entry to be stored in likes
  public static class LikeEntry {
    @JsonProperty("event_id")
    private String eventId;

    private String timestamp; // ISO 8601 format: "2024-04-10T14:32:00"

    public String getEventId() {
      return eventId;
    }

    public void setEventId(String eventId) {
      this.eventId = eventId;
    }

    public String getTimestamp() {
      return timestamp;
    }

    public void setTimestamp(String timestamp) {
      this.timestamp = timestamp;
    }
  }

  // Getters and Setters
  public String getUserId() {
    return userId;
  }

  public void setUserId(String userId) {
    this.userId = userId;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getUserName() {
    return userName;
  }

  public void setUserName(String userName) {
    this.userName = userName;
  }

  public List<LikeEntry> getLikes() {
    return likes;
  }

  public void setLikes(List<LikeEntry> likes) {
    this.likes = likes;
  }

  public List<String> getBookmarked() {
    return bookmarked;
  }

  public void setBookmarked(List<String> bookmarked) {
    this.bookmarked = bookmarked;
  }

  public Map<String, Integer> getDerivedCategories() {
    return derivedCategories;
  }

  public void setDerivedCategories(Map<String, Integer> derivedCategories) {
    this.derivedCategories = derivedCategories;
  }
}
