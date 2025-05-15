package com.map.entity;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Represents a like relationship between a user and an event.
 * Maps to the user_likes table in the database.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLike implements Serializable {
  private String userId;
  private Integer eventId;
  private LocalDateTime timestamp;
}
