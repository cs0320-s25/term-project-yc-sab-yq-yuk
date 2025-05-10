package com.map.service;

import com.map.vo.UserProfileVO;

public interface UserService {

  /**
   * Fetch the user profile by id.
   * @param userId
   * @return
   */
  UserProfileVO getUserProfile(Integer userId);

  /**
   * Fetch the user like entries --- event ids and timestamps.
   * @param userId
   * @return user like entries or empty list if user has not liked any
   */
  List<UserLikeDTO> getUserLikeEntries(Integer userId);

  /**
   * Like an event if it hasn't been liked; else do nothing.
   * @param userId
   * @param eventId
   */
  void likeEvent(Integer userId, Integer eventId);

  /**
   * Remove like for an event if it has been liked; else do nothing.
   * @param userId
   * @param eventId
   */
  void delikeEvent(Integer userId, Integer eventId);

  /**
   * Bookmark an event if it hasn't been bookmarked; else do nothing.
   * @param userId
   * @param eventId
   */
  void bookmarkEvent(Integer userId, Integer eventId);

  /**
   * Remove bookmark for an event if it has been bookmarked; else do nothing.
   * @param userId
   * @param eventId
   */
  void debookmarkEvent(Integer userId, Integer eventId);
}
