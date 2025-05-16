package com.map.service;

import com.map.dto.EventQueryDTO;
import com.map.dto.EventCategoryDTO;
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
@ActiveProfiles("dev")
@Transactional
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class EventServiceTest {

    @Autowired
    private EventService eventService;
    @Autowired
    private CategoryService categoryService;

    @Test
    public void testFetchEvents_NoFilters() {
        // Test fetching all events with no filters
        EventQueryDTO queryDTO = EventQueryDTO.builder().build();
        List<Event> events = eventService.fetchEvents(queryDTO);
        assertNotNull(events);
        assertFalse(events.isEmpty());
    }

    @Test
    public void testFetchEvents_WithCategory() {
        // Test fetching events with the category filter
        EventQueryDTO queryDTO = EventQueryDTO.builder()
            .category("Music")
            .build();
        List<Event> events = eventService.fetchEvents(queryDTO);
        assertNotNull(events);
        for (Event event : events) {
            assertTrue(categoryService.fetchCategoriesForEvent(event.getEventId()).contains("Music"));
        }
    }

    @Test
    public void testGetEventById() {
        // Test getting a specific event by ID
        Integer eventId = 1;
        Event event = eventService.getEventById(eventId);
        assertNotNull(event);
        assertEquals(eventId, event.getEventId());
    }

    @Test
    public void testGetEventByMatching() {
        // Test searching events by name/description
        String query = "test";
        List<Event> events = eventService.getEventByMatching(query);
        assertNotNull(events);
        for (Event event : events) {
            assertTrue(
                event.getName().toLowerCase().contains(query.toLowerCase()) ||
                event.getDescription().toLowerCase().contains(query.toLowerCase())
            );
        }
    }

    @Test
    public void testUpdateViewCount() {
        // Test updating view count for an event
        Integer eventId = 1;
        Event eventBefore = eventService.getEventById(eventId);
        int viewsBefore = eventBefore.getViewedCount();
        
        eventService.updateViewCount(eventId);
        
        Event eventAfter = eventService.getEventById(eventId);
        assertEquals(viewsBefore + 1, eventAfter.getViewedCount());
    }

    @Test
    public void testUpdateTrendingScore() {
        // Test updating trending score for an event
        Integer eventId = 1;
        Double newScore = 0.8;
        
        eventService.updateTrendingScore(eventId, newScore);
        
        Event event = eventService.getEventById(eventId);
        assertEquals(newScore, event.getTrendingScore());
    }

    @Test
    public void testGetAllLocations() {
        // Test getting all event locations
        List<String> locations = eventService.getAllLocations();
        assertNotNull(locations);
        assertFalse(locations.isEmpty());
    }
} 