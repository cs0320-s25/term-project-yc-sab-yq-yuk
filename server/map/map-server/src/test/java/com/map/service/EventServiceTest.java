package com.map.service;

import com.map.dto.EventCategoryDTO;
import com.map.dto.EventQueryDTO;
import com.map.entity.Event;
import com.map.mapper.EventMapper;
import com.map.service.impl.EventServiceImpl;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertIterableEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventMapper eventMapper;

    @InjectMocks
    private EventServiceImpl eventService;

    @Captor
    private ArgumentCaptor<EventQueryDTO> queryCaptor;

    @Test
    void fetchEvents_noFilters_returnsMapperResults() {
        EventQueryDTO queryDTO = EventQueryDTO.builder().build();
        List<Event> expectedEvents = List.of(event(1, "Campus Fair"), event(2, "Hack Night"));

        when(eventMapper.selectEvents(queryDTO)).thenReturn(expectedEvents);

        List<Event> events = eventService.fetchEvents(queryDTO);

        assertEquals(expectedEvents, events);
        verify(eventMapper).selectEvents(queryCaptor.capture());
        assertEquals(queryDTO, queryCaptor.getValue());
    }

    @Test
    void fetchEvents_withCategory_returnsMapperResults() {
        EventQueryDTO queryDTO = EventQueryDTO.builder().category("Music").build();
        List<Event> expectedEvents = List.of(event(3, "Jazz Night"));

        when(eventMapper.selectEvents(queryDTO)).thenReturn(expectedEvents);

        List<Event> events = eventService.fetchEvents(queryDTO);

        assertEquals(expectedEvents, events);
        verify(eventMapper).selectEvents(queryDTO);
    }

    @Test
    void getEventById_returnsMappedEvent() {
        Event expectedEvent = event(10, "Spring Concert");
        when(eventMapper.selectEventById(10)).thenReturn(expectedEvent);

        Event actualEvent = eventService.getEventById(10);

        assertNotNull(actualEvent);
        assertEquals(10, actualEvent.getEventId());
        assertEquals("Spring Concert", actualEvent.getName());
    }

    @Test
    void getEventByMatching_returnsSearchResults() {
        List<Event> expectedEvents = List.of(event(11, "Test Driven Meetup"));
        when(eventMapper.selectEventByValue("test")).thenReturn(expectedEvents);

        List<Event> events = eventService.getEventByMatching("test");

        assertEquals(expectedEvents, events);
        verify(eventMapper).selectEventByValue("test");
    }

    @Test
    void updateViewCount_delegatesToMapper() {
        eventService.updateViewCount(12);

        verify(eventMapper).updateViewCount(12);
    }

    @Test
    void updateTrendingScore_delegatesToMapper() {
        eventService.updateTrendingScore(13, 0.8);

        verify(eventMapper).updateTrendingScore(13, 0.8);
    }

    @Test
    void getAllLocations_returnsMapperResults() {
        when(eventMapper.getAllLocations()).thenReturn(List.of("Main Green", "Sayles Hall"));

        List<String> locations = eventService.getAllLocations();

        assertIterableEquals(List.of("Main Green", "Sayles Hall"), locations);
        verify(eventMapper).getAllLocations();
    }

    @Test
    void getCategoriesForEvents_returnsBatchCategoryMappings() {
        EventCategoryDTO music = category(1, "Music");
        EventCategoryDTO tech = category(2, "Tech");
        List<Integer> eventIds = List.of(1, 2);

        when(eventMapper.getCategoriesForEvents(eventIds)).thenReturn(List.of(music, tech));

        List<EventCategoryDTO> categories = eventService.getCategoriesForEvents(eventIds);

        assertEquals(2, categories.size());
        assertEquals("Music", categories.get(0).getCategoryName());
        assertEquals("Tech", categories.get(1).getCategoryName());
        verify(eventMapper).getCategoriesForEvents(eventIds);
    }

    private Event event(int eventId, String name) {
        LocalDateTime startTime = LocalDateTime.of(2026, 5, 1, 18, 0);
        return Event.builder()
            .eventId(eventId)
            .name(name)
            .startTime(startTime)
            .endTime(startTime.plusHours(2))
            .description(name + " description")
            .location("Campus")
            .likedCount(5)
            .viewedCount(10)
            .trendingScore(0.5)
            .build();
    }

    private EventCategoryDTO category(int eventId, String categoryName) {
        EventCategoryDTO dto = new EventCategoryDTO();
        dto.setEventId(eventId);
        dto.setCategoryName(categoryName);
        return dto;
    }
}
