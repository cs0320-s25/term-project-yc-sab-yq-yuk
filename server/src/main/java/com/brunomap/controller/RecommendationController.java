package com.brunomap.controller;

import com.brunomap.model.Event;
import com.brunomap.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @GetMapping("/recommendations") // Spark parallel: Spark.get("/recommendations", handler)
    public List<Event> getRecommendations(@RequestParam String userId) throws Exception {
        return recommendationService.getRecommendations(userId);
    }

    @GetMapping("/")
    public String home() {
        return "Welcome to BrunoMap API!";
    }
}
