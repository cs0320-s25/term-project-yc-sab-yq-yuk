package com.map.utils;

import com.map.constant.RecommendationConstant;
import static com.map.constant.RecommendationConstant.RECOMMENDATION_LIMIT;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import com.map.dto.UserLikeDTO;
import com.map.entity.Event;
import java.util.stream.Collectors;

public class RecommendationUtils {

 /**
  * Generate personal match scores for all events (from now onward) for the user. Score is based on the user's like
  * history, decayed over time (LAMDA), and category overlap between liked events and current
  * events.
  *
  * @param userLikes the like entries for the user whose preferences we're modeling
  * @param events the list of all events to score
  * @param eventCategoryMap event_id: a lits of categoriesn for all events to score
  * @return a map with event ID as key and personal match score as value
  */
 public static Map<Integer, Double> computePersonalMatchScores(
    List<UserLikeDTO> userLikes, List<Event> events, Map<Integer, List<String>> eventCategoryMap) {

   Map<String, Double> categoryWeights =
       new HashMap<>(); // {category: total decayed weight from user's likes}

   // For each like the user has
   for (UserLikeDTO like : userLikes) {

    List<String> categories = eventCategoryMap.get(like.getEventId());

     // Apply time decay based on how many days ago the like occurred
     long daysSinceLike = Duration.between(like.getTimestamp(), LocalDateTime.now()).toDays();
     double decayWeight = Math.exp(-RecommendationConstant.LAMBDA * daysSinceLike); // expo decay

     // Distribute decay weight equally among all categories of the liked event
     for (String category : categories) {
        categoryWeights.put(
            category,
            categoryWeights.getOrDefault(category, 0.0) + decayWeight / categories.size());
    }
   }

   // Now, compute a personal score for each event based on category overlap
   Map<Integer, Double> eventScores = new HashMap<>();
   for (Event event : events) {
     double scoreSum = 0.0;
     int matchedCategories = 0;

     List<String> categories = eventCategoryMap.get(event.getEventId());

     // For each category in the event, add the user's interest weight if it exists
     for (String category : categories) {
       if (categoryWeights.containsKey(category)) {
         scoreSum += categoryWeights.get(category);
         matchedCategories++;
       }
     }

     // Average the scores over the matched categories
     if (matchedCategories > 0) {
       eventScores.put(event.getEventId(), scoreSum / matchedCategories);
     }
   }

   return eventScores; // {eventId: personal match score}
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
    public static List<Event> scoreAndSortEvents(
    List<Event> events,
    Map<Integer, Double> personalMatchScores,
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
