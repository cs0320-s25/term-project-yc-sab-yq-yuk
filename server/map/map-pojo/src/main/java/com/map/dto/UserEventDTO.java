package com.map.dto;

import lombok.Data;

import java.io.Serializable;

/**
 * User event DTO.
 */
@Data
public class UserEventDTO implements Serializable{
  private String userId;
  private String eventId;
}

