package com.brunomap.utils;

import com.brunomap.model.Event;
import com.brunomap.model.UserProfile;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

public class RecommendationUtils {
    private static final double LAMBDA = 0.05;

    // Compute personal match scores (with real-time decay) for all events
    // TODO: complete with real logic
    public static Map<String, Double> computePersonalMatchScores(UserProfile user, List<Event> events) {
        Map<String, Double> personalScores = new HashMap<>();

        // Mocking rn, assign random score
        for (Event event : events) {
            double mockScore = 0.3 + (Math.random() * 0.5); // random score in [0.3, 0.8]
            personalScores.put(event.getId(), mockScore);
        }
    
        return personalScores;
    }

    // Compute the max popularity for normalization
    public static double computeMaxPopularity(List<Event> events) {
        return events.stream()
                .mapToDouble(e -> e.getLikedCount() + e.getViewedCount())
                .max()
                .orElse(1.0); // avoid dividing by 0
    }

    // Compute random score
    public static double computeRandomScores() {
        return Math.random() < 0.3 ? 0.2 : 0.0;  // random injection: 30% events get a random score boost of 0.2
    }

    // Helper class for sorting
    public static class ScoredEvent {
        public Event event;
        public double score;

        public ScoredEvent(Event event, double score) {
            this.event = event;
            this.score = score;
        }
    }
}
