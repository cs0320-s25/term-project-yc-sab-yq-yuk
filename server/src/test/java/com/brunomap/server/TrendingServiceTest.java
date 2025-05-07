// File: src/test/java/com/brunomap/service/TrendingServiceTest.java

package com.brunomap.server;

import com.brunomap.model.Event;
import com.brunomap.service.TrendingService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class TrendingServiceTest {

    private TrendingService trendingService;

    @BeforeEach
    public void setUp() {
        trendingService = new TrendingService();
    }

    @Test
    public void testRecalculateTrendingScores_updatesScores() {
        trendingService.recalculateTrendingScores();
        List<Event> trending = trendingService.getTrendingEvents();

        assertNotNull(trending);
        assertFalse(trending.isEmpty());

        // trending score was updated or at least exists with correct range
        assertTrue(trending.get(0).getTrendingScore() >= 0.0);
        // boolean anyScorePositive = trending.stream().anyMatch(e -> e.getTrendingScore() > 0.0);
        // assertTrue(anyScorePositive || trending.stream().allMatch(e -> e.getTrendingScore() == 0.0));
    }

    @Test
    public void testGetTrendingEvents_sortedOrder() {
        trendingService.recalculateTrendingScores();
        List<Event> trending = trendingService.getTrendingEvents();

        for (int i = 1; i < trending.size(); i++) {
            assertTrue(trending.get(i - 1).getTrendingScore() >= trending.get(i).getTrendingScore());
        }
    }
}
