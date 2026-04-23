package com.map.service.impl;

import com.map.dto.EventQueryDTO;
import com.map.entity.Event;
import com.map.service.EventService;
import java.util.Comparator;
import java.util.List;
import java.util.OptionalDouble;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import com.map.service.TrendingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static com.map.constant.RecommendationConstant.RECOMMENDATION_LIMIT;

/**
 * Service responsible for calculating and retrieving trending events based on liked/viewed counts.
 */
@Service
public class TrendingServiceImpl implements TrendingService {
    private static final Logger logger = LoggerFactory.getLogger(TrendingServiceImpl.class);
    @Autowired
    private EventService eventService;
    // private List<Event> allEvents = eventService.fetchEvents(EventQueryDTO.builder().build());

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
    // Runs automatically every hour (cron: second=0, minute=0, every hour).
    // This means the POST /trending/recalculate endpoint still exists for manual admin
    // use, but the frontend should NEVER call it — users just call GET /trending.
    @Scheduled(cron = "0 0 * * * *")
    public void recalculateTrendingScores() {
        logger.info("Scheduled: recalculating trending scores");
        List<Event> allEvents = eventService.fetchEvents(EventQueryDTO.builder().build());

        OptionalDouble maxPopularityOpt = allEvents.stream()
            .mapToDouble(e -> e.getLikedCount() + e.getViewedCount())
            .max();

        if (maxPopularityOpt.isEmpty()) return;

        double maxPopularity = maxPopularityOpt.getAsDouble();
        double safeMax = maxPopularity > 0 ? maxPopularity : 1;
        for (Event event : allEvents) {
            double rawScore = (double) event.getLikedCount() + event.getViewedCount();
            double trendingScore = rawScore / safeMax;
            eventService.updateTrendingScore(event.getEventId(), trendingScore); // persist to DB
        }
    }

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
    *
    * @return List of top trending events
    */
    public List<Event> fetchTrendingEvents(EventQueryDTO queryDTO) {
        List<Event> allEvents = eventService.fetchEvents(queryDTO);
        return allEvents.stream()
            .sorted(Comparator.comparingDouble(Event::getTrendingScore).reversed())
            .limit(RECOMMENDATION_LIMIT)
            .toList();
    }
}
