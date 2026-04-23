package com.map.service;

import com.map.dto.EventQueryDTO;
import com.map.entity.Event;
import com.map.service.impl.TrendingServiceImpl;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TrendingServiceTest {

    @Mock
    private EventService eventService;

    @InjectMocks
    private TrendingServiceImpl trendingService;

    @Captor
    private ArgumentCaptor<Integer> eventIdCaptor;

    @Captor
    private ArgumentCaptor<Double> scoreCaptor;

    @Test
    void recalculateTrendingScores_updatesNormalizedScoresForEachEvent() {
        when(eventService.fetchEvents(any(EventQueryDTO.class))).thenReturn(List.of(
            event(101, 10, 5),
            event(102, 2, 3),
            event(103, 0, 0)
        ));

        trendingService.recalculateTrendingScores();

        verify(eventService, times(3)).updateTrendingScore(eventIdCaptor.capture(), scoreCaptor.capture());
        Map<Integer, Double> updatedScores = toScoreMap(eventIdCaptor.getAllValues(), scoreCaptor.getAllValues());

        assertEquals(1.0, updatedScores.get(101), 1e-9);
        assertEquals(5.0 / 15.0, updatedScores.get(102), 1e-9);
        assertEquals(0.0, updatedScores.get(103), 1e-9);
    }

    @Test
    void recalculateTrendingScores_handlesZeroPopularityWithoutDivisionByZero() {
        when(eventService.fetchEvents(any(EventQueryDTO.class))).thenReturn(List.of(
            event(201, 0, 0),
            event(202, 0, 0)
        ));

        trendingService.recalculateTrendingScores();

        verify(eventService, times(2)).updateTrendingScore(eventIdCaptor.capture(), scoreCaptor.capture());
        for (Double updatedScore : scoreCaptor.getAllValues()) {
            assertEquals(0.0, updatedScore, 1e-9);
        }
    }

    @Test
    void recalculateTrendingScores_doesNothingWhenNoEventsExist() {
        when(eventService.fetchEvents(any(EventQueryDTO.class))).thenReturn(List.of());

        trendingService.recalculateTrendingScores();

        verify(eventService, times(0)).updateTrendingScore(any(), any());
    }

    private Map<Integer, Double> toScoreMap(List<Integer> eventIds, List<Double> scores) {
        Map<Integer, Double> scoreMap = new HashMap<>();
        for (int i = 0; i < eventIds.size(); i++) {
            scoreMap.put(eventIds.get(i), scores.get(i));
        }
        return scoreMap;
    }

    private Event event(int eventId, int likedCount, int viewedCount) {
        LocalDateTime startTime = LocalDateTime.now().plusDays(1);
        return Event.builder()
            .eventId(eventId)
            .name("Event " + eventId)
            .startTime(startTime)
            .endTime(startTime.plusHours(1))
            .likedCount(likedCount)
            .viewedCount(viewedCount)
            .trendingScore(0.0)
            .build();
    }
}
