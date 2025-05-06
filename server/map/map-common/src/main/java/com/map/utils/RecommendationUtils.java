package com.map.utils;

import com.map.constant.RecommendationConstant;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

public class RecommendationUtils {

  /**
   * Generate personal match scores for all events for the user. Score is based on the user's like
   * history, decayed over time (LAMDA), and category overlap between liked events and current
   * events.
   *
   * @param user the user whose preferences we're modeling
   * @param events the list of all events to score
   * @return a map with event ID as key and personal match score as value
   */
  public static Map<String, Double> computePersonalMatchScores(
      UserProfile user, List<Event> events) {

    Map<String, Double> categoryWeights =
        new HashMap<>(); // {category: total decayed weight from user's likes}

    // For each like the user has
    for (UserProfile.LikeEntry like : user.getLikes()) {

      // Find the liked event in the event list
      // LikeEntry: e.g. { "event_id": "e1", "timestamp": "2024-04-10T09:00:00" }
      // we need access to the full Event object, especially its categories
      Event likedEvent =
          events.stream().filter(e -> e.getId().equals(like.getEventId())).findFirst().orElse(null);
      if (likedEvent == null) continue; // Skip if the liked event is missing (edge case)

      // Apply time decay based on how many days ago the like occurred
      long daysSinceLike =
          Duration.between(LocalDateTime.parse(like.getTimestamp()), LocalDateTime.now()).toDays();
      double decayWeight = Math.exp(-RecommendationConstant.LAMBDA * daysSinceLike); // exponential decay

      // Distribute decay weight equally among all categories of the liked event
      for (String category : likedEvent.getCategories()) {
        categoryWeights.put(
            category,
            categoryWeights.getOrDefault(category, 0.0)
                + decayWeight / likedEvent.getCategories().size());
      }
    }

    // Now, compute a personal score for each event based on category overlap
    Map<String, Double> eventScores = new HashMap<>();
    for (Event event : events) {
      double scoreSum = 0.0;
      int matchedCategories = 0;

      // For each category in the event, add the user's interest weight if it exists
      for (String category : event.getCategories()) {
        if (categoryWeights.containsKey(category)) {
          scoreSum += categoryWeights.get(category);
          matchedCategories++;
        }
      }

      // Average the scores over the matched categories
      if (matchedCategories > 0) {
        eventScores.put(event.getId(), scoreSum / matchedCategories);
      }
    }

    return eventScores; // {eventId: personal match score}
  }

  /**
   * Computes the maximum popularity score among all events Popularity is defined as the sum of an
   * event's liked count and viewed count This value is used to normalize trending scores
   *
   * @param events list of all events
   * @return the maximum popularity score (at least 1.0 to avoid division by zero)
   */
  public static double computeMaxPopularity(List<Event> events) {
    return events.stream()
        .mapToDouble(e -> e.getLikedCount() + e.getViewedCount())
        .max()
        .orElse(1.0); // avoid dividing by 0
  }

  /**
   * Generates a random score to slightly boost a subset of events Adds diversity to recommendations
   *
   * @return a score of 0.2 for 30% of events, otherwise 0.0
   */
  public static double computeRandomScores() {
    return Math.random() < 0.3
        ? 0.2
        : 0.0; // random injection: 30% events get a random score boost of 0.2
  }

  /**
   * A wrapper class that pairs an Event with its computed recommendation score Used for sorting and
   * ranking purposes
   */
  public static class ScoredEvent {
    public Event event;
    public double score;

    public ScoredEvent(Event event, double score) {
      this.event = event;
      this.score = score;
    }
  }
}
