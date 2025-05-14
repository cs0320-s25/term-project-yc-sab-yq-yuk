package com.map.controller;

import com.map.dto.EventQueryDTO;
import com.map.entity.Event;
import com.map.service.EventService;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.map.result.Result;

/**
 * Controller handling event logic.
 */
@RestController
@RequestMapping("/events")
public class EventController {
    @Autowired
    private EventService eventService;

    /**
     * Fetch an event by its ID.
     * @param eventId
     * @return event object if found, else error message.
     */
    @GetMapping("/{eventId}")
    public Result<Event> getEventById(@PathVariable Integer eventId){
        Event event = eventService.getEventById(eventId);
        if (event == null) {
            return Result.error("Event not found.");
        }
        return Result.success(event);
    }

    /**
     * Search for event(s) by roughly matching the value with the event name/event description.
     * @param query
     * @return a list of roughly matching events.
     */
    @GetMapping
    public Result<List<Event>> getEventByValue(@RequestParam String query){
        return Result.success(eventService.getEventByMatching(query));
    }

    /**
     * Fetch events by specifications.
     * @param category
     * @param time
     * @param near
     * @return a list of events matching the specifications.
     */
    @GetMapping("/filter")
    public Result<List<Event>> fetchEvents(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String time,
        @RequestParam(required = false) String near) {

        Set<String> allowedNames = Set.of("Today", "Tomorrow", "This Week", "This Weekend", "Next Week");

        if (time != null && allowedNames.contains(time)) {
            return Result.error("Invalid time filter.");
        }

        EventQueryDTO queryDTO = EventQueryDTO.builder()
            .category(category)
            .time(time)
            .near(near)
            .build();

        return Result.success(eventService.fetchEvents(queryDTO));
    }

    /**
     * Update the view count for the selected event by eventId.
     * @param eventId
     * @return success message if successful, else error message.
     */
    @PutMapping("/views/{eventId}")
    public Result updateViewCount(@PathVariable Integer eventId){
        try{
            eventService.updateViewCount(eventId);
            return Result.success();
        } catch (Exception e) {
            return Result.error("Failed to update view count for event: " + eventId);
        }

    }

    /**
     * Fetch all event locations.
     * @return a list of all event locations.
     */
    @GetMapping("/locations")
    public Result<List<String>> getAllEventLocations(){
        return Result.success(eventService.getAllLocations());
    }
}