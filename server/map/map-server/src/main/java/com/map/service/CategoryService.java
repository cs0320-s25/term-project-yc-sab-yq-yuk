package com.map.service;

import java.util.List;

public interface CategoryService {

  /**
   * Fetch all categories.
   * @return
   */
  List<String> fetchCategories();
}