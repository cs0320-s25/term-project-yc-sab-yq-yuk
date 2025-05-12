package com.map.service;

import com.map.vo.UserProfileVO;
import com.map.dto.UserLikeDTO;
import java.util.List;

public interface UserService {
  /**
     * Creates a user if they don't exist yet
     * @param userId the user ID from your auth system (e.g., Clerk)
     * @return true if user was created, false if user already existed
     */
    boolean createUserIfNotExists(String userId);

    boolean userExists(String userId);

  /**
   * Fetch the user profile by id.
   * @param userId
   * @return
   */
  UserProfileVO getUserProfile(String userId);

  /**
   * Fetch the user like entries --- event ids and timestamps.
   * @param userId
   * @return user like entries or empty list if user has not liked any
   */
  List<UserLikeDTO> getUserLikeEntries(String userId);

  /**
   * Like an event if it hasn't been liked; else do nothing.
   * @param userId
   * @param eventId
   */
  void likeEvent(String userId, Integer eventId);

  /**
   * Remove like for an event if it has been liked; else do nothing.
   * @param userId
   * @param eventId
   */
  void delikeEvent(String userId, Integer eventId);

  /**
   * Bookmark an event if it hasn't been bookmarked; else do nothing.
   * @param userId
   * @param eventId
   */
  void bookmarkEvent(String userId, Integer eventId);

  /**
   * Remove bookmark for an event if it has been bookmarked; else do nothing.
   * @param userId
   * @param eventId
   */
  void debookmarkEvent(String userId, Integer eventId);
}
