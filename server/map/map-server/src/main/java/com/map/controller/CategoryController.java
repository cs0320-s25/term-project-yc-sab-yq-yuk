package com.map.controller;

import com.map.result.Result;
import com.map.service.CategoryService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// TODO: handle exceptions!!!!
@RestController
@RequestMapping("/categories")
public class CategoryController {
  @Autowired
  private CategoryService categoryService;

  @GetMapping
  public Result<List<String>> fetchAllCategories(){
    return Result.success(categoryService.fetchCategories());
  }
}
