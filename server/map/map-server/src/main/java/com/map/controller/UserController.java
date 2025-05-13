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

// TODO: handle exceptions!!!!
@RestController
@RequestMapping("/user")
public class UserController {
  @Autowired
  private UserService userService;

  @GetMapping("/{userId}/profile")
  public Result<UserProfileVO> getUserProfile(@PathVariable String userId){
    return Result.success(userService.getUserProfile(userId));
  }

  @PutMapping("/{userId}/like/{eventId}")
  public Result likeEvent(@PathVariable String userId, @PathVariable Integer eventId){
    userService.likeEvent(userId, eventId);
    return Result.success();
  }

  @DeleteMapping("/{userId}/like/{eventId}")
  public Result delikeEvent(@PathVariable String userId, @PathVariable Integer eventId){
    userService.delikeEvent(userId, eventId);
    return Result.success();
  }

  @PutMapping("/{userId}/bookmark/{eventId}")
  public Result bookmarkEvent(@PathVariable String userId, @PathVariable Integer eventId){
    userService.bookmarkEvent(userId, eventId);
    return Result.success();
  }

  @DeleteMapping("/{userId}/bookmark/{eventId}")
  public Result debookmarkEvent(@PathVariable String userId, @PathVariable Integer eventId){
    userService.debookmarkEvent(userId, eventId);
    return Result.success();
  }
}
