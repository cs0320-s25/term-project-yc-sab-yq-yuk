package com.map.controller;

import com.map.result.Result;
import com.map.service.UserService;
import com.map.vo.UserProfileVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller handling user logic.
 */
@RestController
@RequestMapping("/users")
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
      return Result.error(e.getMessage());
    }
  }

  /**
   * Like an event if it hasn't been liked; else do nothing.
   * @param userId
   * @param eventId
   */
  @PostMapping("/{userId}/likes")
  public Result likeEvent(@PathVariable String userId, @RequestBody Integer eventId){
    try{
      userService.likeEvent(userId, eventId);
      return Result.success();
    } catch (Exception e) {
      return Result.error(e.getMessage());
    }
  }

  /**
   * Remove like for an event if it has been liked; else do nothing.
   * @param userId
   * @param eventId
   */
  @DeleteMapping("/{userId}/likes")
  public Result delikeEvent(@PathVariable String userId, @RequestBody Integer eventId){
    try{
      userService.delikeEvent(userId, eventId);
      return Result.success();
    } catch (Exception e) {
      return Result.error(e.getMessage());
    }
  }

  /**
   * Bookmark an event if it hasn't been bookmarked; else do nothing.
   * @param userId
   * @param eventId
   */
  @PostMapping("/{userId}/bookmarks")
  public Result bookmarkEvent(@PathVariable String userId, @RequestBody Integer eventId){
    try {
      userService.bookmarkEvent(userId, eventId);
      return Result.success();
    } catch (Exception e) {
      return Result.error(e.getMessage());
    }
  }

  /**
   * Remove bookmark for an event if it has been bookmarked; else do nothing.
   * @param userId
   * @param eventId
   */
  @DeleteMapping("/{userId}/bookmarks")
  public Result debookmarkEvent(@PathVariable String userId, @RequestBody Integer eventId){
    try {
      userService.debookmarkEvent(userId, eventId);
      return Result.success();
    } catch (Exception e) {
      return Result.error(e.getMessage());
    }
  }
}
