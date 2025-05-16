package com.map.service;

import com.map.dto.EventQueryDTO;
import com.map.entity.Event;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class TrendingServiceTest {

    @Autowired
    private TrendingService trendingService;

    @Test
    public void testRecalculateTrendingScores_andFetchTrendingEvents() {
        // Call the service method that recalculates trending scores
        trendingService.recalculateTrendingScores();

        // Query for trending events with no filter
        EventQueryDTO query = EventQueryDTO.builder().build();
        List<Event> trendingEvents = trendingService.fetchTrendingEvents(query);

        // Basic checks
        assertNotNull(trendingEvents);
        assertFalse(trendingEvents.isEmpty(), "Expected non-empty trending list");

        // Trending scores should be non-negative
        for (Event event : trendingEvents) {
            assertNotNull(event.getTrendingScore(), "Trending score should not be null");
            assertTrue(event.getTrendingScore() >= 0.0, "Trending score should be non-negative");
        }

        // Should be in descending order by trending score
        for (int i = 1; i < trendingEvents.size(); i++) {
            assertTrue(trendingEvents.get(i - 1).getTrendingScore() >= trendingEvents.get(i).getTrendingScore(),
                "Events should be sorted by descending trending score");
        }
    }
}
