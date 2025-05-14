package com.map.service;

import com.map.vo.UserProfileVO;
import com.map.dto.UserLikeDTO;
import java.util.List;

public interface UserService {

  /**
   * Fetch the user profile by id.
   * @param userId
   * @return user profile if found, else error message.
   * @throws Exception for invalid user id or no user found.
   */
  UserProfileVO getUserProfile(String userId) throws Exception;

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
   * @throws Exception for user/event not found.
   */
  void likeEvent(String userId, Integer eventId) throws Exception;

  /**
   * Remove like for an event if it has been liked; else do nothing.
   * @param userId
   * @param eventId
   * @throws Exception for user/event not found.
   */
  void delikeEvent(String userId, Integer eventId) throws Exception;

  /**
   * Bookmark an event if it hasn't been bookmarked; else do nothing.
   * @param userId
   * @param eventId
   * @throws Exception for user/event not found.
   */
  void bookmarkEvent(String userId, Integer eventId) throws Exception;

  /**
   * Remove bookmark for an event if it has been bookmarked; else do nothing.
   * @param userId
   * @param eventId
   * @throws Exception for user/event not found.
   */
  void debookmarkEvent(String userId, Integer eventId) throws Exception;
}
