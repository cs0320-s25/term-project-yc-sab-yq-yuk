package com.map.entity;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a bookmark relationship between a user and an event.
 * Maps to the user_bookmarks table in the database.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserBookmark implements Serializable {
  private String userId;
  private Integer eventId;
}
