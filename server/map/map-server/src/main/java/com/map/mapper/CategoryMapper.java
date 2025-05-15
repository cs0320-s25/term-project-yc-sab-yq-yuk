package com.map.mapper;

import com.map.entity.Category;
import com.map.entity.Event;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Param;

/**
 * Category mapper.
 */
@Mapper
public interface CategoryMapper {
  /**
   * Fetch all categories.
   * @return all categories
   */
  @Select("SELECT category_name FROM Categories")
  List<String> fetchAllCategories();

  /**
   * Fetch categories for a list of events.
   * @param eventId
   * @return list of categories for the event.
   */
  @Select("SELECT c.category_name FROM Categories c " +
          "JOIN Event_Categories ec ON c.category_id = ec.category_id " +
          "WHERE ec.event_id = #{eventId}")
  List<String> getCategoriesForEvent(@Param("eventId") Integer eventId);
}
