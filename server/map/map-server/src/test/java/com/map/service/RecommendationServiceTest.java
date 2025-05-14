package com.map.service;

import com.map.dto.EventQueryDTO;
import com.map.entity.Event;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test") // will load application-test.yml
@Transactional
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class RecommendationServiceTest {

    @Autowired
    private RecommendationService recommendationService;

    @Test
    public void testValidUser_getsRecommendations() throws Exception {
        EventQueryDTO dto = EventQueryDTO.builder().build();
        List<Event> recs = recommendationService.fetchRecommendations("test_user1", dto);
        assertNotNull(recs);
        assertFalse(recs.isEmpty());
        for (Event e : recs) { // events recommended from now onward
            assertTrue(e.getStartTime().isAfter(LocalDateTime.now()));
        }
    }

    @Test
    public void testInvalidUser_getsEmptyList() throws Exception {
        EventQueryDTO dto = EventQueryDTO.builder().build();
        List<Event> recs = recommendationService.fetchRecommendations("invalid_user", dto);
        assertNotNull(recs);
        assertTrue(recs.isEmpty());
    }

    @Test
    public void testColdStartUser() throws Exception {
        EventQueryDTO dto = EventQueryDTO.builder().build();
        List<Event> recs = recommendationService.fetchRecommendations("test_user3", dto); // user3 has no likes
        assertNotNull(recs);
        assertTrue(recs.size() <= 50);  // Assuming ColdStartRecommendation caps at 50
    }
}

