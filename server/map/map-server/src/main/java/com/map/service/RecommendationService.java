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
}
