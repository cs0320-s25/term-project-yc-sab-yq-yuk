package com.map.service.impl;

import com.map.mapper.CategoryMapper;
import com.map.service.CategoryService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CategorySerciceImpl implements CategoryService {
  @Autowired
  private CategoryMapper categoryMapper;

  /**
   * Fecth all categories.
   * @return
   */
  @Override
  public List<String> fetchCategories(){
    return categoryMapper.fetchAllCategories();
  }

  /**
   * Fetch categories for an event.
   * @param eventId
   * @return list of categories for the event.
   */
  @Override
  public List<String> fetchCategoriesForEvent(Integer eventId){
    return categoryMapper.getCategoriesForEvent(eventId);
  }
}
