package com.map.service;

import java.util.List;

public interface CategoryService {

  /**
   * Fetch all categories.
   * @return list of all categories.
   */
  List<String> fetchCategories();

  /**
   * Fetch categories for an event.
   * @param eventId
   * @return list of categories for the event.
   */
  List<String> fetchCategoriesForEvent(Integer eventId);
}