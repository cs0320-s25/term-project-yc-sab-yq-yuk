package com.map.service.impl;

import com.map.dto.EventQueryDTO;
import com.map.entity.Event;
import com.map.mapper.EventMapper;
import com.map.service.EventService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class EventServiceImpl implements EventService {
    private static final Logger logger = LoggerFactory.getLogger(EventServiceImpl.class);

    @Autowired
    private EventMapper eventMapper;

    /**
     * Fetch events by specifications.
     * @param queryDTO
     * @return
     */
    @Override
    public List<Event> fetchEvents(EventQueryDTO queryDTO) {
        return eventMapper.selectEvents(queryDTO);
    }

    /**
     * Search for a particular event by id.
     * @param eventId
     * @return
     */
    @Override
    public Event getEventById(Integer eventId){
        return eventMapper.selectEventById(eventId);
    }

    /**
     * Search for event(s) by roughly matching the value with the event name/event description.
     * @param query
     * @return
     */
    @Override
    public List<Event> getEventByMatching(String query){
        return eventMapper.selectEventByValue(query);
    }

    /**
     * Update the view count for the selected event by eventId.
     * @param eventId
     */
    public void updateViewCount(Integer eventId){
        eventMapper.updateViewCount(eventId);
    }

    /**
     * Return all event locations.
     * @return
     */
    public List<String> getAllLocations(){
        return eventMapper.getAllLocations();
    }
} 