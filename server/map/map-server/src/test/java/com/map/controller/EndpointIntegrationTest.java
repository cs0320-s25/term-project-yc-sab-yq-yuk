package com.map.controller;

import com.map.entity.Event;
import com.map.service.EventService;
import com.map.service.RecommendationService;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {EventController.class, RecommendationController.class})
class EndpointIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EventService eventService;

    @MockBean
    private RecommendationService recommendationService;

    @Test
    void eventsFilter_returnsMatchingEvents() throws Exception {
        when(eventService.fetchEvents(argThat(dto ->
            "Music".equals(dto.getCategory())
                && "Today".equals(dto.getTime())
                && "Main Green".equals(dto.getNear())
        ))).thenReturn(List.of(event(101, "Jazz Night", "Main Green")));

        mockMvc.perform(get("/events/filter")
                .param("category", "Music")
                .param("time", "Today")
                .param("near", "Main Green"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(1))
            .andExpect(jsonPath("$.data[0].eventId").value(101))
            .andExpect(jsonPath("$.data[0].name").value("Jazz Night"))
            .andExpect(jsonPath("$.data[0].location").value("Main Green"));

        verify(eventService).fetchEvents(argThat(dto ->
            "Music".equals(dto.getCategory())
                && "Today".equals(dto.getTime())
                && "Main Green".equals(dto.getNear())
        ));
    }

    @Test
    void recommendationsEndpoint_returnsRecommendationResults() throws Exception {
        when(recommendationService.fetchRecommendations(
            org.mockito.ArgumentMatchers.eq("user-123"),
            argThat(dto ->
                "Art".equals(dto.getCategory())
                    && "Tomorrow".equals(dto.getTime())
                    && "List Art Center".equals(dto.getNear())
            )
        )).thenReturn(List.of(event(201, "Gallery Visit", "List Art Center")));

        mockMvc.perform(get("/recommendations/user-123")
                .param("category", "Art")
                .param("time", "Tomorrow")
                .param("near", "List Art Center"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(1))
            .andExpect(jsonPath("$.data[0].eventId").value(201))
            .andExpect(jsonPath("$.data[0].name").value("Gallery Visit"));
    }

    @Test
    void eventsQuery_returnsSearchMatches() throws Exception {
        when(eventService.getEventByMatching("concert")).thenReturn(List.of(
            event(301, "Spring Concert", "Sayles Hall")
        ));

        mockMvc.perform(get("/events").param("query", "concert"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(1))
            .andExpect(jsonPath("$.data[0].eventId").value(301))
            .andExpect(jsonPath("$.data[0].name").value("Spring Concert"))
            .andExpect(jsonPath("$.data[0].location").value("Sayles Hall"));

        verify(eventService).getEventByMatching("concert");
    }

    private Event event(int eventId, String name, String location) {
        LocalDateTime startTime = LocalDateTime.of(2026, 5, 1, 19, 0);
        return Event.builder()
            .eventId(eventId)
            .name(name)
            .startTime(startTime)
            .endTime(startTime.plusHours(2))
            .location(location)
            .description(name + " description")
            .likedCount(5)
            .viewedCount(10)
            .trendingScore(0.75)
            .build();
    }
}
