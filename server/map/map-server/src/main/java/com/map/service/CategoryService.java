package com.map.service;

import java.util.List;

public interface CategoryService {

  /**
   * Fecth all categories.
   * @return
   */
  List<String> fetchCategories();
}