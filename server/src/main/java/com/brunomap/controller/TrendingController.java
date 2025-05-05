package com.brunomap.controller;

import com.brunomap.model.Event;
import com.brunomap.service.TrendingService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/** Controller responsible for handling trending event logic */
@RestController
@RequestMapping("/api/trending")
public class TrendingController {

  @Autowired private TrendingService trendingService;

  /**
   * GET /api/trending 
   * Fetch a list of trending events, ranked by current trending scores
   *
   * @return list of trending events
   */
  @GetMapping
  public List<Event> getTrendingEvents() {
    // TODO
    return trendingService.getTrendingEvents();
  }

  /**
   * POST /api/trending/recalculate 
   * Recalculate trending scores for all events triggered by a cron job or internal call
   * 
   * curl -X POST http://localhost:8080/api/trending/recalculate
   *
   * @return success message after recalculation
   */
  @PostMapping("/recalculate")
  public String recalculateTrendingScores() {
    // TODO
    trendingService.recalculateTrendingScores();
    return "Trending scores recalculated successfully.";
  }
}
