package com.map.mapper;

import com.map.entity.Category;
import com.map.entity.Event;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

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
}
