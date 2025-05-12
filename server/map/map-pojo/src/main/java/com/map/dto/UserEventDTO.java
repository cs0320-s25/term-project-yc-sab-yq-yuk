package com.map.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class UserEventDTO implements Serializable{
  private String userId;
  private String eventId;
}
