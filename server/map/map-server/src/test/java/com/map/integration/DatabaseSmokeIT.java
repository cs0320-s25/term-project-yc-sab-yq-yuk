package com.map.integration;

import com.map.dto.EventQueryDTO;
import com.map.service.EventService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@ActiveProfiles("dev")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@EnabledIfSystemProperty(named = "runDbITs", matches = "true")
class DatabaseSmokeIT {

    @Autowired
    private EventService eventService;

    @Test
    void fetchEvents_againstConfiguredDatabase_returnsNonNullList() {
        List<?> events = assertDoesNotThrow(() ->
            eventService.fetchEvents(EventQueryDTO.builder().build())
        );

        assertNotNull(events);
    }

    @Test
    void getAllLocations_againstConfiguredDatabase_returnsNonNullList() {
        List<String> locations = assertDoesNotThrow(() -> eventService.getAllLocations());

        assertNotNull(locations);
    }
}
