package com.brunomap.utils;

import com.brunomap.model.Event;
import com.brunomap.model.UserProfile;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.io.InputStream;
import java.util.List;

public class MockDataLoader {

    public static List<Event> loadMockEvents() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        InputStream inputStream = MockDataLoader.class.getResourceAsStream("/data/mockEvents.json");
        return mapper.readValue(inputStream, new TypeReference<List<Event>>() {});
    }

    public static List<UserProfile> loadMockUsers() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        InputStream inputStream = MockDataLoader.class.getResourceAsStream("/data/mockUsers.json");
        return mapper.readValue(inputStream, new TypeReference<List<UserProfile>>() {});
    }
}
