package com.map.service.impl;

import com.map.mapper.UserMapper;
import com.map.mapper.EventMapper;
import com.map.service.UserService;
import com.map.vo.UserProfileVO;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class UserServiceImpl implements UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private EventMapper eventMapper;

    @Override
    public UserProfileVO getUserProfile(Integer userId) {
        if (userId == null) {
            logger.warn("Attempted to get profile for null user ID");
            return null;
        }

        try {
            // Get user's liked events
            List<Integer> likes = userMapper.getUserLikes(userId);
            
            // Get user's bookmarked events
            List<Integer> bookmarks = userMapper.getUserBookmarks(userId);
            
            // Get user's derived categories
//            List<String> derivedCategories = userMapper.getDerivedCategory(userId);

            // Build and return the UserProfileVO
            return UserProfileVO.builder()
                    .likes(likes)
                    .bookmarks(bookmarks)
//                    .derivedCategories(derivedCategories)
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
    public List<UserLikeDTO> getUserLikeEntries(Integer userId) {
      return userMapper.getUserLikesWithTimestamps(userId);
    }

    /**
     * Like an event if it hasn't been liked; else do nothing.
     * @param userId
     * @param eventId
     */
    public void likeEvent(Integer userId, Integer eventId){
      userMapper.likeEvent(userId, eventId);
      eventMapper.incrementLikedCount(eventId);
    }

    /**
     * Remove like for an event if it has been liked; else do nothing.
     * @param userId
     * @param eventId
     */
    public void delikeEvent(Integer userId, Integer eventId){
      userMapper.delikeEvent(userId, eventId);
      eventMapper.decrementLikedCount(eventId);
    }

    /**
     * Bookmark an event if it hasn't been bookmarked; else do nothing.
     * @param userId
     * @param eventId
     */
    public void bookmarkEvent(Integer userId, Integer eventId){
      userMapper.bookmarkEvent(userId, eventId);
    }

    /**
     * Remove bookmark for an event if it has been bookmarked; else do nothing.
     * @param userId
     * @param eventId
     */
    public void debookmarkEvent(Integer userId, Integer eventId){
      userMapper.debookmarkEvent(userId, eventId);
    }
}
