package com.map.service;

import com.map.entity.Event;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import com.map.dto.EventQueryDTO;

public interface RecommendationService {

 /**
  * Get the list of recommendations (up to limit)
  * only events now onward will be recommended!!!
  * @param userId
  * @param queryDTO
  * @return
  * @throws Exception
  */
 List<Event> fetchRecommendations(Integer userId, EventQueryDTO queryDTO) throws Exception;

 /**
  * Get the cold start recommendation
  * @param events
  * @return
  */
 List<Event> getColdStartRecommendations(List<Event> events);

 /**
  * Score the events
  * @param events
  * @param personalMatchScores
  * @param personalWeight
  * @param trendingWeight
  * @param randomWeight
  * @return
  */
 List<Event> scoreAndSortEvents(
     List<Event> events,
     Map<String, Double> personalMatchScores,
     double personalWeight,
     double trendingWeight,
     double randomWeight);
}
