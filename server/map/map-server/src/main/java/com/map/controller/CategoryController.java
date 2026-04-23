package com.map.controller;

import com.map.result.Result;
import com.map.service.CategoryService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller handling category logic.
 */
@RestController
@RequestMapping("/categories")
public class CategoryController {
  @Autowired
  private CategoryService categoryService;

  /**
   * Fetch all categories.
   * @return all categories in the database.
   */
  @GetMapping
  public Result<List<String>> fetchAllCategories(){
    try{
      return Result.success(categoryService.fetchCategories());
    }catch (Exception e){
      return Result.error("Failed to fetch categories.");
    }
  }

  /**
   * Fetch categories for an event.
   * @param eventId
   * @return categories for the event.
   */
  @GetMapping("/{eventId}")
  public Result<List<String>> fetchCategoriesForEvent(@PathVariable Integer eventId){
    try{
      return Result.success(categoryService.fetchCategoriesForEvent(eventId));
    }catch (Exception e){
      return Result.error("Failed to fetch categories for event: " + eventId);
    }
  }
}
