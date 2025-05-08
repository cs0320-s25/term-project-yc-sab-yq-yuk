package com.map.controller;

import com.map.entity.Event;
import com.map.result.Result;
import com.map.service.RecommendationService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

// TODO: handle exceptions!!!!!
/** Controller responsible for handling recommendation logic :) */
@RestController
@RequestMapping("/recommendations")
public class RecommendationController {

//  @Autowired
//  private RecommendationService recommendationService;

//  @GetMapping("/{userId}")
//  public Result<List<Event>> getRecommendations(@PathVariable Integer userId){
//    return Result.success(recommendationService.getRecommendations(userId));
//  }
}
