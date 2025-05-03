package com.map.service;

import com.map.dto.EventQueryDTO;
import com.map.entity.Event;
import java.util.List;

public interface EventService {

  /**
   * Fetch events by specifications.
   * @param queryDTO
   * @return
   */
  List<Event> fetchEvents(EventQueryDTO queryDTO);

  /**
   * Search for a particular event by id.
   * @param eventId
   * @return
   */
  Event getEventById(Integer eventId);

  /**
   * Update the view count for the selected event by eventId.
   * @param eventId
   */
  void updateViewCount(Integer eventId);

  /**
   * Return all event locations.
   * @return
   */
  List<String> getAllLocations();
}
