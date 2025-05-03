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
  // TODO: finish the logic!
  List<Event> selectEvents(EventQueryDTO queryDTO);

  /**
   * Select an event by its ID.
   * @param eventId
   * @return 
   */
  @Select("SELECT * FROM Event WHERE event_id = #{eventId}")
  Event selectEventById(@Param("eventId") Integer eventId);

  /**
   * Increment the view count for a specific event by 1.
   * @param eventId
   */
  @Update("UPDATE Event SET viewed_count = viewed_count + 1 WHERE event_id = #{eventId}")
  void updateViewCount(@Param("eventId") Integer eventId);

  /**
   * Return locations of all events.
   * @param
   */
  @Update("SELECT DISTINCT location FROM Event")
  List<String> getAllLocations();
}