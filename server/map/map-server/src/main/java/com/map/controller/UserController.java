package com.map.controller;

import com.map.result.Result;
import com.map.service.UserService;
import com.map.vo.UserProfileVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller handling user logic.
 */
@RestController
@RequestMapping("/user")
public class UserController {
  @Autowired
  private UserService userService;

  /**
   * Fetch the user profile by id.
   * @param userId
   * @return user profile if found, else error message.
   */
  @GetMapping("/{userId}/profile")
  public Result<UserProfileVO> getUserProfile(@PathVariable String userId){
    try{
      return Result.success(userService.getUserProfile(userId));
    } catch (Exception e) {
      return Result.error(e.getMessage() + " for user ID: " + userId + " not found.");
    }
  }

  /**
   * Like an event if it hasn't been liked; else do nothing.
   * @param userId
   * @param eventId
   */
  @PutMapping("/{userId}/like/{eventId}")
  public Result likeEvent(@PathVariable String userId, @PathVariable Integer eventId){
    try{
      userService.likeEvent(userId, eventId);
      return Result.success();
    } catch (Exception e) {
      return Result.error("Failed to like event. " + eventId + " and/or " + userId + " not found.");
    }
  }

  /**
   * Remove like for an event if it has been liked; else do nothing.
   * @param userId
   * @param eventId
   */
  @DeleteMapping("/{userId}/like/{eventId}")
  public Result delikeEvent(@PathVariable String userId, @PathVariable Integer eventId){
    try{
      userService.delikeEvent(userId, eventId);
      return Result.success();
    } catch (Exception e) {
      return Result.error("Failed to remove like for event. " + eventId + " and/or " + userId + " not found.");
    }
  }

  /**
   * Bookmark an event if it hasn't been bookmarked; else do nothing.
   * @param userId
   * @param eventId
   */
  @PutMapping("/{userId}/bookmark/{eventId}")
  public Result bookmarkEvent(@PathVariable String userId, @PathVariable Integer eventId){
    try {
      userService.bookmarkEvent(userId, eventId);
      return Result.success();
    } catch (Exception e) {
      return Result.error("Failed to bookmark event. " + eventId + " and/or " + userId + " not found.");
    }

  }

  /**
   * Remove bookmark for an event if it has been bookmarked; else do nothing.
   * @param userId
   * @param eventId
   */
  @DeleteMapping("/{userId}/bookmark/{eventId}")
  public Result debookmarkEvent(@PathVariable String userId, @PathVariable Integer eventId){
    try {
      userService.debookmarkEvent(userId, eventId);
      return Result.success();
    } catch (Exception e) {
      return Result.error("Failed to remove bookmark for event. " + eventId + " and/or " + userId + " not found.");
    }
  }
}
