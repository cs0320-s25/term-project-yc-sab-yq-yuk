package com.map.controller;

import com.map.dto.EventQueryDTO;
import com.map.entity.Event;
import com.map.service.EventService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.map.result.Result;

// TODO: exception handlers !!!!
@RestController
@RequestMapping("/events")
public class EventController {
    @Autowired
    private EventService eventService;

    @GetMapping
    public Result<List<Event>> fetchEvents(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String time,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String near) {
        
        EventQueryDTO queryDTO = EventQueryDTO.builder()
                .category(category)
                .time(time)
                .search(search)
                .near(near)
                .build();
        
        return Result.success(eventService.fetchEvents(queryDTO));
    }

    @GetMapping("/{eventId}")
    public Result<Event> getEventById(@PathVariable Integer eventId){
        return Result.success(eventService.getEventById(eventId));
    }

    @PutMapping("/views/{eventId}")
    public Result updateViewCount(@PathVariable Integer eventId){
        eventService.updateViewCount(eventId);
        return Result.success();
    }

    @GetMapping("/locations")
    public Result<List<String>> getAllEventLocations(){
        return Result.success(eventService.getAllLocations());
    }
}
