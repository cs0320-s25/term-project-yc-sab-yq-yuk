package com.map.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data // getter/setter are automatically generated
@Builder // generate a builder api
@NoArgsConstructor // auto generate no parameter constructor
@AllArgsConstructor // auto generate a all parameter constructor
public class UserBookmark {
  private String userId;
  private String eventId;
}
