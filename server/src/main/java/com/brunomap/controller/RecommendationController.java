package com.brunomap.controller;

import com.brunomap.model.Event;
import com.brunomap.service.RecommendationService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/** Controller responsible for handling recommendation logic :) */
@RestController
@RequestMapping("/api")
public class RecommendationController {

  @Autowired private RecommendationService recommendationService;

  /** GET /api/recommendations?user_id=xyz */
  @GetMapping("/recommendations") // Spark parallel: Spark.get("/recommendations", handler)
  public List<Event> getRecommendations(@RequestParam("userId") String userId) throws Exception {
    return recommendationService.getRecommendations(userId);
  }

  @GetMapping("/")
  public String home() {
    return "Welcome to BrunoMap API!";
  }
}
