package com.map.mapper;

import com.map.dto.EventQueryDTO;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

import java.util.List;
import com.map.dataload.EventRecord;
import com.map.entity.Event;

@Mapper
public interface EventMapper{

  /**
   * Insert event record to the Event table.
   * @param event
   */
  void insertEventRecord(Event event);

  /**
   * Select all matching events by the query.
   * @param queryDTO
   * @return
   */
  List<Event> selectEvents(EventQueryDTO queryDTO);

  /**
   * Select an event by its ID.
   * @param eventId
   * @return 
   */
  @Select("SELECT * FROM Events WHERE event_id = #{eventId}")
  Event selectEventById(@Param("eventId") Integer eventId);

  /**
   * Search events by name or description containing the given value.
   * @param query the search term
   * @return list of matching events
   */
  @Select("SELECT * FROM Events "
      + "WHERE LOWER(name) LIKE CONCAT('%', LOWER(#{query}), '%') "
      + "OR LOWER(description) LIKE CONCAT('%', LOWER(#{query}), '%') ")
  List<Event> selectEventByValue(@Param("query") String query);

  /**
   * Increment the view count for a specific event by 1.
   * @param eventId
   */
  @Update("UPDATE Events SET viewed_count = viewed_count + 1 WHERE event_id = #{eventId}")
  void updateViewCount(@Param("eventId") Integer eventId);

  /**
   * Return locations of all events.
   * @param
   */
  @Select("SELECT DISTINCT location FROM Events")
  List<String> getAllLocations();
}