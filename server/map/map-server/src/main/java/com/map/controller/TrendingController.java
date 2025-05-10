package com.map.controller;

import com.map.entity.Event;
import com.map.result.Result;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.map.service.TrendingService;

/** Controller responsible for handling trending event logic */
@RestController
@RequestMapping("/trending")
// TODO: reset this to be a automatic event rather than triggered by an api call
public class TrendingController {

 @Autowired
 private TrendingService trendingService;

    /**
     * Fetch a list of trending events, ranked by current trending scores
    *
    * @return list of trending events
    */
    @GetMapping
    public Result<List<Event>> fetchTrendingEvents(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String time,
        @RequestParam(required = false) String near
    ) {
        EventQueryDTO queryDTO = EventQueryDTO.builder()
            .category(category)
            .time(time)
            .near(near)
            .build();
        return Result.success(trendingService.fetchTrendingEvents(queryDTO));
    }

    /**
     * POST /api/trending/recalculate
    * Recalculate trending scores for all events triggered by a cron job or internal call
    *
    * curl -X POST http://localhost:8080/trending/recalculate
    *
    * @return success message after recalculation
    */
    @PostMapping("/recalculate")
    public Result<String> recalculateTrendingScores() {
        // TODO
        trendingService.recalculateTrendingScores();
        return Result.success("Trending scores recalculated successfully.");
    }
}
