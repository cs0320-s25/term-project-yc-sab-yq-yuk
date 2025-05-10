package com.map.service;

import com.map.dto.EventQueryDTO;
import com.map.dto.EventCategoryDTO;
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
   * Search for event(s) by roughly matching the value with the event name/event description.
   * @param query
   * @return
   */
  List<Event> getEventByMatching(String query);

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


  /**
   * Batch fetch categories for a list of event IDs.
   * @param eventIds list of event IDs
   * @return list of event-category pairs
   */
  List<EventCategoryDTO> getCategoriesForEvents(List<Integer> eventIds);

}
