package com.map.dataload;

import com.map.entity.Event;
import java.util.List;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.map.mapper.EventMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.core.io.ClassPathResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Collections;

@Component
public class EventDataloader {
    private static final Logger logger = LoggerFactory.getLogger(EventDataloader.class);

    @Autowired
    private EventMapper eventMapper;

    @Transactional
    public void loadData() {
        try {
            // read from the json file
            List<EventRecord> records = loadJsonData();
            logger.info("Successfully loaded {} records from JSON", records.size());

            // insert records into database
            for (EventRecord record : records) {
                Event event = convertToEvent(record);
                eventMapper.insertEventRecord(event);
            }
            logger.info("Successfully inserted all records into database");
        } catch (Exception e) {
            logger.error("Error loading data: ", e);
            throw new RuntimeException("Failed to load data", e);
        }
    }

    private List<EventRecord> loadJsonData() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.setPropertyNamingStrategy(PropertyNamingStrategy.SNAKE_CASE);

        try {
            ClassPathResource resource = new ClassPathResource("data.json");
            return objectMapper.readValue(
                resource.getInputStream(),
                new TypeReference<List<EventRecord>>(){}
            );
        } catch (IOException e) {
            logger.error("Error reading JSON file: ", e);
            return Collections.emptyList();
        }
    }

    private Event convertToEvent(EventRecord record) {
        return Event.builder()
            .eventId(Integer.parseInt(record.getId()))
            .name(record.getName())
            .startTime(record.getStartTime())
            .location(record.getLocation())
            .description(record.getDescription())
            .link(record.getId())
            .likedCount(0)
            .viewedCount(0)
            .trendingScore(0.0)
            .latitude(record.getLatitude() != null ? record.getLatitude() : 0.0)
            .longitude(record.getLongitude() != null ? record.getLongitude() : 0.0)
            .build();
    }
}





// import com.map.entity.Event;
// import java.util.List;
// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.fasterxml.jackson.core.type.TypeReference;
// import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
// import com.fasterxml.jackson.databind.PropertyNamingStrategy;
// import com.map.mapper.EventMapper;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Component;
// import org.springframework.transaction.annotation.Transactional;
// import org.springframework.core.io.ClassPathResource;
// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;

// import java.io.IOException;
// import java.util.Collections;

// @Component
// public class EventDataloader {
//     private static final Logger logger = LoggerFactory.getLogger(EventDataloader.class);

//     @Autowired
//     private EventMapper eventMapper;

//     @Transactional
//     public void loadData() {
//         try {
//             // read from the json file
//             List<EventRecord> records = loadJsonData();
//             logger.info("Successfully loaded {} records from JSON", records.size());

//             // insert records into database
//             for (EventRecord record : records) {
//                 Event event = convertToEvent(record);
//                 eventMapper.insertEventRecord(event);
//             }
//             logger.info("Successfully inserted all records into database");
//         } catch (Exception e) {
//             logger.error("Error loading data: ", e);
//             throw new RuntimeException("Failed to load data", e);
//         }
//     }

//     private List<EventRecord> loadJsonData() {
//         ObjectMapper objectMapper = new ObjectMapper();
//         objectMapper.registerModule(new JavaTimeModule());
//         objectMapper.setPropertyNamingStrategy(PropertyNamingStrategy.SNAKE_CASE);

//         try {
//             ClassPathResource resource = new ClassPathResource("data.json");
//             return objectMapper.readValue(
//                 resource.getInputStream(),
//                 new TypeReference<List<EventRecord>>(){}
//             );
//         } catch (IOException e) {
//             logger.error("Error reading JSON file: ", e);
//             return Collections.emptyList();
//         }
//     }

//     private Event convertToEvent(EventRecord record) {
//         return Event.builder()
//             .eventId(record.getId())
//             .name(record.getName())
//             .startTime(record.getStartTime())
//             .endTime(record.getEndTime())
//             .timezone(record.getTimezone())
//             .location(record.getLocation())
//             .description(record.getDescription())
//             .link(record.getId())
//             .likedCount(0)
//             .viewedCount(0)
//             .trendingScore(0.0)
//             .latitude(record.getLatitude() != null ? record.getLatitude() : 0.0)
//             .longitude(record.getLongitude() != null ? record.getLongitude() : 0.0)
//             .build();
//     }
// }
