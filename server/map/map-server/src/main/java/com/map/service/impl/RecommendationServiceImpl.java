package com.map.service.impl;

import com.map.dto.EventQueryDTO;
import com.map.entity.Event;
import com.map.service.EventService;
import com.map.service.UserService;
import com.map.vo.UserProfileVO;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RecommendationServiceImpl {
  @Autowired
  private EventService eventService;
  @Autowired
  private UserService userService;

  /**
   * Get the list of recommendations (up to limit)
   * @param userId
   * @return
   * @throws Exception
   */
  public List<Event> getRecommendations(Integer userId) throws Exception{
    /**
     * In the end, getting user will be replaced by /api/user/:user_id/profile and getting events
     * will be replaced by /api/events
     */

    // Fetch events and the target user profile
    List<Event> events = eventService.fetchEvents(EventQueryDTO.builder().build());
    UserProfileVO user = userService.getUserProfile(userId);

    if (user == null) {
      // TODO: for later, please (1) throw a custom UserNotFoundException
      // and (2) add a @ControllerAdvice class to catch that exception and return a 404 response
      System.out.println("No user found for userId: " + userId);
      return Collections.emptyList(); // return empty list for now
      // throw new Exception("No user found!");
    }

    // Cold Start Handling (for new users with no likes)
    if (user.getLikes().isEmpty()) {
      // trending 90% + random 10%, no personal match score since there's no history
      System.out.println(
          "Welcome to BrunoMap! Generating fresh recommendations to get you started...");
      return getColdStartRecommendations(events);
    }

    System.out.println("Welcome back! Generating new recommendations...");
    // Keep going!
    // Compute intermediate scores:
    // Personal match score for all events for the user
    Map<String, Double> personalMatchScores =
        RecommendationUtils.computePersonalMatchScores(user, events);

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
              ? personalMatchScores.getOrDefault(event.getId(), 0.0)
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
