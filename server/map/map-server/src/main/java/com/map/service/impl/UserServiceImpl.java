package com.map.service.impl;

import com.map.mapper.UserMapper;
import com.map.mapper.EventMapper;
import com.map.service.UserService;
import com.map.vo.UserProfileVO;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.map.dto.UserLikeDTO;

@Service
public class UserServiceImpl implements UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private EventMapper eventMapper;
    
    @Override
    public UserProfileVO getUserProfile(String userId) {
        if (userId == null) {
            logger.warn("Attempted to get profile for null user ID");
            return null;
        }
        try {
            // Get user's liked events
            List<Integer> likes = userMapper.getUserLikes(userId);
            // Get user's bookmarked events
            List<Integer> bookmarks = userMapper.getUserBookmarks(userId);
            
            // Build and return the UserProfileVO
            return UserProfileVO.builder()
                .likes(likes)
                .bookmarks(bookmarks)
                .build();
        } catch (Exception e) {
            logger.error("Error retrieving profile for user ID: {}", userId, e);
            throw new RuntimeException("Failed to retrieve user profile", e);
        }
    }
    
    /**
     * Fetch the user like entries --- event ids and timestamps.
     * @param userId
     * @return
     */
    @Override
    public List<UserLikeDTO> getUserLikeEntries(String userId) {
        return userMapper.getUserLikesWithTimestamps(userId);
    }
    
    /**
     * Check if a user exists and create if not
     * @param userId
     * @return true if user was created, false if already existed
     */
    @Override
    @Transactional
    public boolean createUserIfNotExists(String userId) {
        try {
            // Check if user exists first
            if (userMapper.userExists(userId)) {
                logger.info("User already exists: {}", userId);
                return false;
            }
            
            // Create the user - Note: NO username parameter since it's not in your table
            String email = userId + "@example.com";
            String password = "auth_external";
            
            logger.info("Creating new user with ID: {}, email: {}", userId, email);
            userMapper.createUser(userId, email, password);
            
            logger.info("Created new user: {}", userId);
            return true;
        } catch (Exception e) {
            logger.error("Error creating user: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create user", e);
        }
    }
    
    /**
     * Check if a user exists
     * @param userId
     * @return
     */
    @Override
    public boolean userExists(String userId) {
        try {
            return userMapper.userExists(userId);
        } catch (Exception e) {
            logger.error("Error checking if user exists: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to check if user exists", e);
        }
    }
    
    /**
     * Like an event if it hasn't been liked; else do nothing.
     * @param userId
     * @param eventId
     */
    @Override
    @Transactional
    public void likeEvent(String userId, Integer eventId) {
        try {
            // Ensure user exists
            createUserIfNotExists(userId);
            
            // Like event
            logger.info("Liking event {} for user {}", eventId, userId);
            userMapper.likeEvent(userId, eventId);
            
            // Increment event like count
            eventMapper.incrementLikedCount(eventId);
            logger.info("Successfully liked event");
        } catch (Exception e) {
            logger.error("Error liking event: {} for user: {}", eventId, userId, e);
            throw new RuntimeException("Failed to like event", e);
        }
    }
    
    /**
     * Remove like for an event if it has been liked; else do nothing.
     * @param userId
     * @param eventId
     */
    @Override
    @Transactional
    public void delikeEvent(String userId, Integer eventId) {
        try {
            // Only attempt to unlike if the user exists
            if (userExists(userId)) {
                logger.info("Unlike event {} for user {}", eventId, userId);
                userMapper.delikeEvent(userId, eventId);
                eventMapper.decrementLikedCount(eventId);
                logger.info("Successfully unliked event");
            } else {
                logger.warn("Cannot unlike - user does not exist: {}", userId);
            }
        } catch (Exception e) {
            logger.error("Error unliking event: {} for user: {}", eventId, userId, e);
            throw new RuntimeException("Failed to unlike event", e);
        }
    }
    
    /**
     * Bookmark an event if it hasn't been bookmarked; else do nothing.
     * @param userId
     * @param eventId
     */
    @Override
    @Transactional
    public void bookmarkEvent(String userId, Integer eventId) {
        try {
            // Ensure user exists
            createUserIfNotExists(userId);
            
            // Bookmark event
            logger.info("Bookmarking event {} for user {}", eventId, userId);
            userMapper.bookmarkEvent(userId, eventId);
            logger.info("Successfully bookmarked event");
        } catch (Exception e) {
            logger.error("Error bookmarking event: {} for user: {}", eventId, userId, e);
            throw new RuntimeException("Failed to bookmark event", e);
        }
    }
    
    /**
     * Remove bookmark for an event if it has been bookmarked; else do nothing.
     * @param userId
     * @param eventId
     */
    @Override
    @Transactional
    public void debookmarkEvent(String userId, Integer eventId) {
        try {
            // Only attempt to unbookmark if the user exists
            if (userExists(userId)) {
                logger.info("Unbookmarking event {} for user {}", eventId, userId);
                userMapper.debookmarkEvent(userId, eventId);
                logger.info("Successfully unbookmarked event");
            } else {
                logger.warn("Cannot unbookmark - user does not exist: {}", userId);
            }
        } catch (Exception e) {
            logger.error("Error unbookmarking event: {} for user: {}", eventId, userId, e);
            throw new RuntimeException("Failed to unbookmark event", e);
        }
    }
}