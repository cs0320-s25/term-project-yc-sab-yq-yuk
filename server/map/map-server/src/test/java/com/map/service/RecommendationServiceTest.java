package com.map.service;

import com.map.dto.EventCategoryDTO;
import com.map.dto.EventQueryDTO;
import com.map.dto.UserLikeDTO;
import com.map.entity.Event;
import com.map.service.impl.RecommendationServiceImpl;
import com.map.vo.UserProfileVO;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertIterableEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {

    @Mock
    private EventService eventService;

    @Mock
    private UserService userService;

    @InjectMocks
    private RecommendationServiceImpl recommendationService;

    @Captor
    private ArgumentCaptor<List<Integer>> eventIdsCaptor;

    @Test
    void scoringMath_prefersEventsWithStrongerPersonalMatch() throws Exception {
        EventQueryDTO queryDTO = EventQueryDTO.builder().category("Music").build();
        LocalDateTime now = LocalDateTime.now();

        Event musicMatch = event(101, "Music Match", now.plusDays(10), 20, 30);
        Event sportsEvent = event(102, "Sports Event", now.plusDays(10), 20, 30);

        when(eventService.fetchEvents(queryDTO)).thenReturn(List.of(musicMatch, sportsEvent));
        when(userService.getUserProfile("user-1")).thenReturn(UserProfileVO.builder()
            .likes(List.of(201))
            .bookmarks(List.of())
            .build());
        when(userService.getUserLikeEntries("user-1")).thenReturn(List.of(
            new UserLikeDTO(201, now.minusDays(2))
        ));
        when(eventService.getCategoriesForEvents(any())).thenReturn(List.of(
            category(101, "Music"),
            category(102, "Sports"),
            category(201, "Music")
        ));

        List<Event> recommendations = recommendationService.fetchRecommendations("user-1", queryDTO);

        assertEquals(2, recommendations.size());
        assertIterableEquals(List.of(101, 102), recommendations.stream().map(Event::getEventId).toList());

        verify(eventService).getCategoriesForEvents(eventIdsCaptor.capture());
        assertEquals(Set.of(101, 102, 201), Set.copyOf(eventIdsCaptor.getValue()));
    }

    @Test
    void timeDecay_prefersCategoriesFromRecentLikes() throws Exception {
        EventQueryDTO queryDTO = EventQueryDTO.builder().build();
        LocalDateTime now = LocalDateTime.now();

        Event recentCategoryEvent = event(101, "Recent Preference", now.plusDays(5), 15, 15);
        Event oldCategoryEvent = event(102, "Old Preference", now.plusDays(5), 15, 15);

        when(eventService.fetchEvents(queryDTO)).thenReturn(List.of(recentCategoryEvent, oldCategoryEvent));
        when(userService.getUserProfile("user-2")).thenReturn(UserProfileVO.builder()
            .likes(List.of(201, 202))
            .bookmarks(List.of())
            .build());
        when(userService.getUserLikeEntries("user-2")).thenReturn(List.of(
            new UserLikeDTO(201, now.minusDays(1)),
            new UserLikeDTO(202, now.minusDays(45))
        ));
        when(eventService.getCategoriesForEvents(any())).thenReturn(List.of(
            category(101, "Music"),
            category(102, "Talk"),
            category(201, "Music"),
            category(202, "Talk")
        ));

        List<Event> recommendations = recommendationService.fetchRecommendations("user-2", queryDTO);

        assertEquals(2, recommendations.size());
        assertIterableEquals(List.of(101, 102), recommendations.stream().map(Event::getEventId).toList());
    }

    @Test
    void coldStart_returnsPopularityDrivenRecommendationsWithoutCategoryLookup() throws Exception {
        EventQueryDTO queryDTO = EventQueryDTO.builder().build();
        LocalDateTime now = LocalDateTime.now();

        Event mostPopular = event(101, "Most Popular", now.plusDays(7), 60, 40);
        Event mediumPopular = event(102, "Medium Popular", now.plusDays(7), 25, 25);
        Event leastPopular = event(103, "Least Popular", now.plusDays(7), 3, 2);

        when(eventService.fetchEvents(queryDTO)).thenReturn(List.of(mostPopular, mediumPopular, leastPopular));
        when(userService.getUserProfile("cold-start-user")).thenReturn(UserProfileVO.builder()
            .likes(List.of())
            .bookmarks(List.of())
            .build());
        when(userService.getUserLikeEntries("cold-start-user")).thenReturn(List.of());

        List<Event> recommendations =
            recommendationService.fetchRecommendations("cold-start-user", queryDTO);

        assertEquals(3, recommendations.size());
        assertIterableEquals(
            List.of(101, 102, 103),
            recommendations.stream().map(Event::getEventId).toList()
        );
        verify(eventService, never()).getCategoriesForEvents(any());
    }

    private Event event(
        int eventId,
        String name,
        LocalDateTime startTime,
        int likedCount,
        int viewedCount
    ) {
        return Event.builder()
            .eventId(eventId)
            .name(name)
            .startTime(startTime)
            .endTime(startTime.plusHours(2))
            .location("Campus")
            .description(name + " description")
            .likedCount(likedCount)
            .viewedCount(viewedCount)
            .trendingScore(0.0)
            .build();
    }

    private EventCategoryDTO category(int eventId, String categoryName) {
        EventCategoryDTO dto = new EventCategoryDTO();
        dto.setEventId(eventId);
        dto.setCategoryName(categoryName);
        return dto;
    }
}
