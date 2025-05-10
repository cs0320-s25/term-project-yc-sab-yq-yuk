package com.map.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.map.entity.Event;

/**
 * Service responsible for calculating and retrieving trending events based on liked/viewed counts.
 */
public interface TrendingService {

    /**
     * Recalculate trending scores for all events and persist updates in the database.
    * Logic: trendingScore = (likedCount + viewedCount) / maxPopularity
    *
    * Steps:
    * - Retrieve all events from the database
    * - Find max (likedCount + viewedCount)
    * - Normalize each event's popularity
    * - Save updated trendingScore back to the database
    *
    * TODO:
    * - Replace in-memory data with MySQL-backed EventRepository once DB is connected.
    * - Swap MockDataLoader.getEvents() with eventRepository.findAll().
    * - Persist updates with eventRepository.save(event).
    */
    void recalculateTrendingScores();

    /**
     * Return a list of events sorted by trending score in descending order.
    *
    * Steps:
    * - Query events from the database
    * - Sort by trendingScore DESC
    * - Return top N (optional)
    *
    * TODO:
    * - Replace mock data with eventRepository.findAll() when using a real database.
    * - Optionally add pagination or limit top N results.
    * @param queryDTO
    * @return List of top trending events
    */
    List<Event> fetchTrendingEvents(EventQueryDTO queryDTO);
}
