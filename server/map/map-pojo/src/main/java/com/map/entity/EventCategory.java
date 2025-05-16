package com.map.entity;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a relationship between an event and a category.
 * Maps to the event_categories table in the database.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventCategory implements Serializable {
  private Integer eventId;
  private Integer categoryId;
}
