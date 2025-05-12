package com.map.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data // getter/setter are automatically generated
@Builder // generate a builder api
@NoArgsConstructor // auto generate no parameter constructor
@AllArgsConstructor // auto generate a all parameter constructor
public class UserLike {
  private String userId;
  private String eventId;
  private LocalDateTime timestamp;
}
