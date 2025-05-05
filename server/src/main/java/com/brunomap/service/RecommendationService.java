package com.brunomap.service;

import com.brunomap.model.Event;
import com.brunomap.model.UserProfile;
import com.brunomap.utils.MockDataLoader;
import com.brunomap.utils.RecommendationUtils;
import com.brunomap.utils.RecommendationUtils.ScoredEvent;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

/**
 * This is equivalent to logic inside a Spark handler In this case, recommendation logic here it is!
 */
@Service
public class RecommendationService {

  private static final int RECOMMENDATION_LIMIT = 50;

  /**
   * For user, recommend new events by scoring each event based on the 70/20/10 formula: 70%
   * personalization (with real-time decay) + 20% trending + 10% random, and return top 50. (TODO:
   * ideally add pagination here)
   *
   * @param userId
   * @return a list of top 50 recommended events sorted by final_score (rn)
   * @throws Exception
   */
  public List<Event> getRecommendations(String userId) throws Exception {

    /**
     * In the end, getting user will be replaced by /api/user/:user_id/profile and getting events
     * will be replaced by /api/events
     */
    // Fetch events and users from db
    List<Event> events = MockDataLoader.loadMockEvents(); // TODO to be replaced with real db
    List<UserProfile> users = MockDataLoader.loadMockUsers(); // TODO to be replaced with real db

    // Find user with userId
    UserProfile user =
        users.stream().filter(u -> u.getUserId().equals(userId)).findFirst().orElse(null);

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
   * @param limit RECOMMENDATION_LIMIT
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
