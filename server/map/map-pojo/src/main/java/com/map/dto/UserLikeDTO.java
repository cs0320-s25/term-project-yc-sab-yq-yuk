package com.map.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserLikeDTO implements Serializable {
    private Integer eventId;
    private LocalDateTime timestamp;
}