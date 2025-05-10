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

    @Autowired
    private RecommendationService recommendationService;

//  @GetMapping("/{userId}")
//  public Result<List<Event>> getRecommendations(@PathVariable Integer userId){
//    return Result.success(recommendationService.getRecommendations(userId));
//  }
    /**
     * Fetch personalized recommendations for a user, optionally filtered by category, time, and location.
     * Example: GET /api/recommendations/123?category=Music&time=Today&near=Main%20Green
     * @param userId
     * @param category
     * @param time
     * @param near
     * @return
     */
    @GetMapping("/{userId}")
    public Result<List<Event>> fetchRecommendations(
        @PathVariable Integer userId,
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String time,
        @RequestParam(required = false) String near
    ) {
        EventQueryDTO queryDTO = EventQueryDTO.builder()
            .category(category)
            .time(time)
            .near(near)
            .build();
    
        return Result.success(recommendationService.getRecommendations(userId, queryDTO));
    }
}
