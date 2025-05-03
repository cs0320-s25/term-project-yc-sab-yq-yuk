package com.map.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventQueryDTO implements Serializable {
    private String category;
    private String time;
    private String search;

    // TODO: this needs double check
    private String near;
}
