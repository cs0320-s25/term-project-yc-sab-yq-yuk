package com.map.entity;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a user's category frequency.
 * Maps to the user_category_frequencies table in the database.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCategoryFrequency implements Serializable {
  private String userId;
  private Integer categoryId;
  private Integer frequency;
}
