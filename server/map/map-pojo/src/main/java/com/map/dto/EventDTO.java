package com.map.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventDTO {
    private Integer eventId;
    private String name;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String timezone;
    private String location;
    private String description;
    private String link;
    private Integer likedCount;
    private Integer viewedCount;
    private Double trendingScore;
    private Double latitude;
    private Double longitude;
    private List<String> categories; // Added to include categories
}