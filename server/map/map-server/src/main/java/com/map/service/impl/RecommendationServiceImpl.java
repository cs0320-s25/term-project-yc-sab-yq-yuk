package com.map.service.impl;

import static com.map.constant.RecommendationConstant.RECOMMENDATION_LIMIT;

import com.map.dto.EventQueryDTO;
import com.map.dto.EventCategoryDTO;
import com.map.entity.Event;
import com.map.service.EventService;
import com.map.service.UserService;
import com.map.service.RecommendationService;
import com.map.utils.RecommendationUtils;
import com.map.vo.UserProfileVO;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet; // Add this import
import java.util.List;
import java.util.Map;
import java.util.Set;     // Add this import
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDateTime;
import com.map.dto.UserLikeDTO;
import java.util.HashMap;

@Service
public class RecommendationServiceImpl implements RecommendationService {

    private static final Logger logger = LoggerFactory.getLogger(RecommendationServiceImpl.class);

    @Autowired
    private EventService eventService;
    @Autowired
    private UserService userService;

    /**
     * Get the list of recommendations (up to limit) 
    * only events now onward will be recommended!!!
    * @param userId
    * @param queryDTO optional filter
    * @return
    * @throws Exception
    */
    @Override
public List<Event> fetchRecommendations(String userId, EventQueryDTO queryDTO) throws Exception {
    // Fetch events and the target user profile
    List<Event> events = new ArrayList<>(eventService.fetchEvents(queryDTO).stream()
        .filter(e -> e.getStartTime().isAfter(LocalDateTime.now()))
        .collect(Collectors.toList()));

    logger.debug("Fetched {} events for recommendation filtering", events.size());
    UserProfileVO user = userService.getUserProfile(userId);

    // Edge case, user doesn't exist! technically this shouldn't happen in real interaction
    if (user == null) {
        logger.warn("No user found for userId: {}", userId);
        return Collections.emptyList(); // return empty list for now
    }

    // Fetch user like entries (event id + timestamp) to be used in personal score calc
    List<UserLikeDTO> userLikeEntries = userService.getUserLikeEntries(userId);

    // Cold Start Handling (for new users with no likes)
    if (userLikeEntries == null || userLikeEntries.isEmpty()) {
        logger.info("Cold start: no like history for userId {}", userId);
        return RecommendationUtils.getColdStartRecommendations(events);
    }

    // Get all event IDs we need categories for (current events + liked events)
    List<Integer> currentEventIds = new ArrayList<>(events.stream()
        .map(Event::getEventId)
        .collect(Collectors.toList()));
    
    List<Integer> likedEventIds = new ArrayList<>(userLikeEntries.stream()
        .map(UserLikeDTO::getEventId)
        .collect(Collectors.toList()));
    
    // Combine the lists to get all needed event IDs
    Set<Integer> allNeededEventIds = new HashSet<>();
    allNeededEventIds.addAll(currentEventIds);
    allNeededEventIds.addAll(likedEventIds);
    
    // Fetch categories for ALL needed events
    List<EventCategoryDTO> pairs = eventService.getCategoriesForEvents(
        new ArrayList<>(allNeededEventIds)
    );

    // Build the map of event IDs to their categories
    Map<Integer, List<String>> eventCategoryMap = new HashMap<>();
    for (EventCategoryDTO pair : pairs) {
        eventCategoryMap.computeIfAbsent(pair.getEventId(), k -> new ArrayList<>())
            .add(pair.getCategoryName());
    }

    logger.info("Generating personalized recommendations for userId {}", userId);
    
    // Compute personal match scores
    Map<Integer, Double> personalMatchScores =
        RecommendationUtils.computePersonalMatchScores(userLikeEntries, events, eventCategoryMap);

    return RecommendationUtils.scoreAndSortEvents(events, personalMatchScores, 0.7, 0.2, 0.1);
}
    // /**
    //  * For new user with no like history, give cold start recommendations (trending + random)
    // *
    // * @param events
    // * @return
    // */
    // public static List<Event> getColdStartRecommendations(List<Event> events) {
    //     return scoreAndSortEvents(events, null, 0.0, 0.9, 0.1);
    // }

    // /**
    //  * Score, sort, and return recommended events
    // *
    // * @param events
    // * @param personalMatchScores
    // * @param personalWeight
    // * @param trendingWeight
    // * @param randomWeight
    // * @return top 50 recommended events
    // */
    // private static List<Event> scoreAndSortEvents(
    // List<Event> events,
    // Map<String, Double> personalMatchScores,
    // double personalWeight,
    // double trendingWeight,
    // double randomWeight) {

    //     // Max popularity (liked count + viewed count) for trending score normalization
    //     double maxPopularity =
    //     RecommendationUtils.computeMaxPopularity(
    //         events); // TODO: remove this once precalculation of trending score is added

    //     // Compute final score for each event based on the 70/20/10 formula
    //     List<ScoredEvent> scoredEvents = new ArrayList<>();
    //     for (Event event : events) {
    //         double personalScore =
    //             (personalMatchScores != null)
    //                 ? personalMatchScores.getOrDefault(event.getEventId(), 0.0)
    //                 : 0.0;
    //         // TODO: pre-calculate trending scores periodically (e.g., hourly/daily) instead of on the fly
    //         // here
    //         // so replace this with double trendingScore = event.getTrendingScore();
    //         double trendingScore = (event.getLikedCount() + event.getViewedCount()) / maxPopularity;
    //         double randomScore =
    //             RecommendationUtils
    //                 .computeRandomScores(); // random injection: 30% events get a random score boost of
    //         // 0.2

    //         double finalScore =
    //             personalWeight * personalScore
    //                 + trendingWeight * trendingScore
    //                 + randomWeight * randomScore;
    //         scoredEvents.add(new ScoredEvent(event, finalScore));
    //     }

    //     // Sort events list by final scores
    //     scoredEvents.sort((a, b) -> Double.compare(b.score, a.score));

    //     // Return top 50 recommended events
    //     return scoredEvents.stream()
    //         .limit(RECOMMENDATION_LIMIT)
    //         .map(se -> se.event)
    //         .collect(Collectors.toList());
    // }
}
