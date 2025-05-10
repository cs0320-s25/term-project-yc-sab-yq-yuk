package com.map.service.impl;

import static com.map.constant.RecommendationConstant.RECOMMENDATION_LIMIT;

import com.map.dto.EventQueryDTO;
import com.map.dto.EventCategoryDTO;
import com.map.entity.Event;
import com.map.service.EventService;
import com.map.service.UserService;
import com.map.service.RecommendationService;
import com.map.utils.RecommendationUtils;
//import com.map.utils.RecommendationUtils.ScoredEvent;
import com.map.vo.UserProfileVO;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
    public List<Event> fetchRecommendations(Integer userId, EventQueryDTO queryDTO) throws Exception{
        /**
        * In the end, getting user will be replaced by /api/user/:user_id/profile and getting events
        * will be replaced by /api/events
        */

        // Fetch events and the target user profile
        List<Event> events = eventService.fetchEvents(queryDTO).stream()
        .filter(e -> e.getStartTime().isAfter(LocalDateTime.now()))
        .toList(); // filtered events from now onward will be returned
        logger.debug("Fetched {} events for recommendation filtering", events.size());
        UserProfileVO user = userService.getUserProfile(userId);

        // Fetch user like entries (event id + timestamp) to be used in personal score calc
        List<UserLikeDTO> userLikeEntries = userService.getUserLikeEntries(userId);

        // Batch load event-category mappings to be used in personal score calc
        List<Integer> eventIds = events.stream().map(Event::getEventId).toList();
        List<EventCategoryDTO> pairs = eventService.getCategoriesForEvents(eventIds);

        Map<Integer, List<String>> eventCategoryMap = new HashMap<>();
        for (EventCategoryDTO pair : pairs) {
            eventCategoryMap.computeIfAbsent(pair.getEventId(), k -> new ArrayList<>()).add(pair.getCategoryName());
        }

        // Edge case, user doesn't exist! technically this shouldn't happen in real interaction
        if (user == null) {
        // TODO: for later, please (1) throw a custom UserNotFoundException
        // and (2) add a @ControllerAdvice class to catch that exception and return a 404 response
        // System.out.println("No user found for userId: " + userId);
            logger.warn("No user found for userId: {}", userId);
            return Collections.emptyList(); // return empty list for now
        // throw new Exception("No user found!");
        }

        // Cold Start Handling (for new users with no likes)
        if (userLikeEntries == null || userLikeEntries.isEmpty()) {
        // trending 90% + random 10%, no personal match score since there's no history
        // System.out.println(
        //     "Welcome to BrunoMap! Generating fresh recommendations to get you started...");
            logger.info("Cold start: no like history for userId {}", userId);
            return getColdStartRecommendations(events);
        }

        // System.out.println("Welcome back! Generating new recommendations...");
        logger.info("Generating personalized recommendations for userId {}", userId);
        // Keep going!
        // Compute intermediate scores:
        // Personal match score for all events for the user
        Map<String, Double> personalMatchScores =
        RecommendationUtils.computePersonalMatchScores(userLikeEntries, events, eventCategoryMap);

        return scoreAndSortEvents(events, personalMatchScores, 0.7, 0.2, 0.1);
    }

    /**
     * For new user with no like history, give cold start recommendations (trending + random)
    *
    * @param events
    * @return
    */
    public static List<Event> getColdStartRecommendations(List<Event> events) {
        return scoreAndSortEvents(events, null, 0.0, 0.9, 0.1);
    }

    /**
     * Score, sort, and return recommended events
    *
    * @param events
    * @param personalMatchScores
    * @param personalWeight
    * @param trendingWeight
    * @param randomWeight
    * @return top 50 recommended events
    */
    private static List<Event> scoreAndSortEvents(
    List<Event> events,
    Map<String, Double> personalMatchScores,
    double personalWeight,
    double trendingWeight,
    double randomWeight) {

        // Max popularity (liked count + viewed count) for trending score normalization
        double maxPopularity =
        RecommendationUtils.computeMaxPopularity(
            events); // TODO: remove this once precalculation of trending score is added

        // Compute final score for each event based on the 70/20/10 formula
        List<ScoredEvent> scoredEvents = new ArrayList<>();
        for (Event event : events) {
            double personalScore =
                (personalMatchScores != null)
                    ? personalMatchScores.getOrDefault(event.getEventId(), 0.0)
                    : 0.0;
            // TODO: pre-calculate trending scores periodically (e.g., hourly/daily) instead of on the fly
            // here
            // so replace this with double trendingScore = event.getTrendingScore();
            double trendingScore = (event.getLikedCount() + event.getViewedCount()) / maxPopularity;
            double randomScore =
                RecommendationUtils
                    .computeRandomScores(); // random injection: 30% events get a random score boost of
            // 0.2

            double finalScore =
                personalWeight * personalScore
                    + trendingWeight * trendingScore
                    + randomWeight * randomScore;
            scoredEvents.add(new ScoredEvent(event, finalScore));
        }

        // Sort events list by final scores
        scoredEvents.sort((a, b) -> Double.compare(b.score, a.score));

        // Return top 50 recommended events
        return scoredEvents.stream()
            .limit(RECOMMENDATION_LIMIT)
            .map(se -> se.event)
            .collect(Collectors.toList());
    }
}
