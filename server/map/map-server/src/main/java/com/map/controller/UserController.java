 package com.map.controller;

import com.map.service.UserService;
import com.map.vo.UserProfileVO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {
    
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    
    private final UserService userService;
    
    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    @GetMapping("/{userId}/profile")
    public ResponseEntity<?> getUserProfile(@PathVariable String userId) {
        logger.info("Fetching profile for user: {}", userId);
        
        try {
            // First ensure the user exists
            if (!userService.userExists(userId)) {
                logger.info("User doesn't exist yet, creating: {}", userId);
                userService.createUserIfNotExists(userId);
            }
            
            UserProfileVO profile = userService.getUserProfile(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("code", 1);
            response.put("msg", null);
            response.put("data", profile);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error retrieving user profile: ", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("msg", "Error: " + e.getMessage());
            response.put("data", null);
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    @GetMapping("/{userId}/likes")
    public ResponseEntity<?> getUserLikes(@PathVariable String userId) {
        try {
            List<Integer> likes = userService.getUserProfile(userId).getLikes();
            
            Map<String, Object> response = new HashMap<>();
            response.put("code", 1);
            response.put("msg", null);
            response.put("data", likes);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error retrieving user likes: ", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("msg", "Error: " + e.getMessage());
            response.put("data", null);
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    @PostMapping("/{userId}/likes")
    public ResponseEntity<?> likeEvent(@PathVariable String userId, @RequestBody Map<String, Integer> payload) {
        try {
            Integer eventId = payload.get("event_id");
            if (eventId == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "code", 0,
                    "msg", "event_id is required",
                    "data", null
                ));
            }
            
            logger.info("Liking event {} for user {}", eventId, userId);
            userService.likeEvent(userId, eventId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("code", 1);
            response.put("msg", null);
            response.put("data", null);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error liking event: ", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("msg", "Error: " + e.getMessage());
            response.put("data", null);
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    @DeleteMapping("/{userId}/likes")
    public ResponseEntity<?> delikeEvent(@PathVariable String userId, @RequestBody Map<String, Integer> payload) {
        try {
            Integer eventId = payload.get("event_id");
            if (eventId == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "code", 0,
                    "msg", "event_id is required",
                    "data", null
                ));
            }
            
            userService.delikeEvent(userId, eventId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("code", 1);
            response.put("msg", null);
            response.put("data", null);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error unliking event: ", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("msg", "Error: " + e.getMessage());
            response.put("data", null);
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    @PostMapping("/{userId}/bookmarks")
    public ResponseEntity<?> bookmarkEvent(@PathVariable String userId, @RequestBody Map<String, Integer> payload) {
        try {
            Integer eventId = payload.get("event_id");
            if (eventId == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "code", 0,
                    "msg", "event_id is required",
                    "data", null
                ));
            }
            
            userService.bookmarkEvent(userId, eventId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("code", 1);
            response.put("msg", null);
            response.put("data", null);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error bookmarking event: ", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("msg", "Error: " + e.getMessage());
            response.put("data", null);
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    @DeleteMapping("/{userId}/bookmarks")
    public ResponseEntity<?> debookmarkEvent(@PathVariable String userId, @RequestBody Map<String, Integer> payload) {
        try {
            Integer eventId = payload.get("event_id");
            if (eventId == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "code", 0,
                    "msg", "event_id is required",
                    "data", null
                ));
            }
            
            userService.debookmarkEvent(userId, eventId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("code", 1);
            response.put("msg", null);
            response.put("data", null);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error unbookmarking event: ", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("msg", "Error: " + e.getMessage());
            response.put("data", null);
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        return ResponseEntity.ok(Map.of("status", "success", "message", "API is working"));
    }
}