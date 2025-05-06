package com.brunomap.server;

import com.brunomap.model.Event;
import com.brunomap.service.RecommendationService;
import com.brunomap.utils.MockDataLoader;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class RecommendationServiceTest {

    private RecommendationService recommendationService;

    @BeforeEach
    public void setUp() {
        recommendationService = new RecommendationService();
    }

    @Test
    public void testGetRecommendations_validUser_returnsList() throws Exception {
        List<Event> recommendations = recommendationService.getRecommendations("user1");
        assertNotNull(recommendations);
        assertFalse(recommendations.isEmpty());
    }

    @Test
    public void testGetRecommendations_unknownUser_returnsEmpty() throws Exception {
        List<Event> recommendations = recommendationService.getRecommendations("nonexistent");
        assertNotNull(recommendations);
        assertEquals(0, recommendations.size());
    }

    @Test
    public void testColdStartRecommendations_returnsLimitedList() throws Exception {
        List<Event> events = MockDataLoader.loadMockEvents();
        List<Event> result = RecommendationService.getColdStartRecommendations(events);
        assertNotNull(result);
        assertTrue(result.size() <= 50);
    }
}

