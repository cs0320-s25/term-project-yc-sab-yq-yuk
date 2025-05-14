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
import com.map.dto.UserLikeDTO;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private EventMapper eventMapper;

    /**
     * Fetch the user profile by id.
     * @param userId
     * @return user profile if found, else error message.
     * @throws Exception for invalid user id or no user found.
     */
    @Override
    public UserProfileVO getUserProfile(String userId) throws Exception{
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }

        if (!userMapper.checkUserExists(userId)) {
          throw new Exception("User not found: " + userId);
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
     * Like an event if it hasn't been liked; else do nothing.
     * @param userId
     * @param eventId
     * @throws Exception for user/event not found.
     */
    @Transactional
    public void likeEvent(String userId, Integer eventId) throws Exception{
        if(!userMapper.checkUserExists(userId)){
            throw new IllegalArgumentException("User not found: " + userId);
        }

        if(!eventMapper.checkIfEventExists(eventId)){
            throw new IllegalArgumentException("Event not found: " + eventId);
        }

        // check if the user has already liked the event
        if(!userMapper.checkIfUserLiked(userId, eventId)){
            eventMapper.incrementLikedCount(eventId);
        }
        // if already liked, then update the timestamp
        userMapper.likeEvent(userId, eventId);
    }

    /**
     * Remove like for an event if it has been liked; else do nothing.
     * @param userId
     * @param eventId
     * @throws Exception for user/event not found.
     */
    @Transactional
    public void delikeEvent(String userId, Integer eventId){
        if(!userMapper.checkUserExists(userId)){
            throw new IllegalArgumentException("User not found: " + userId);
        }

        if(!eventMapper.checkIfEventExists(eventId)){
            throw new IllegalArgumentException("Event not found: " + eventId);
        }

        // check if the user has already liked the event
        if(userMapper.checkIfUserLiked(userId, eventId)){
            eventMapper.decrementLikedCount(eventId);
            userMapper.delikeEvent(userId, eventId);
        }
    }

    /**
     * Bookmark an event if it hasn't been bookmarked; else do nothing.
     * @param userId
     * @param eventId
     * @throws Exception for user/event not found.
     */
    public void bookmarkEvent(String userId, Integer eventId) throws Exception{
        if(!userMapper.checkUserExists(userId)){
            throw new IllegalArgumentException("User not found: " + userId);
        }
        if(!eventMapper.checkIfEventExists(eventId)){
            throw new IllegalArgumentException("Event not found: " + eventId);
        }

        userMapper.bookmarkEvent(userId, eventId);
    }

    /**
     * Remove bookmark for an event if it has been bookmarked; else do nothing.
     * @param userId
     * @param eventId
     * @throws Exception for user/event not found.
     */
    public void debookmarkEvent(String userId, Integer eventId) throws Exception{
        if(!userMapper.checkUserExists(userId)){
            throw new IllegalArgumentException("User not found: " + userId);
        }
        if(!eventMapper.checkIfEventExists(eventId)){
            throw new IllegalArgumentException("Event not found: " + eventId);
        }

        userMapper.debookmarkEvent(userId, eventId);
    }
}
