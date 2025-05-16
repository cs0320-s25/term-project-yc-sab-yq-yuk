package com.map.service;

import com.map.dto.UserLikeDTO;
import com.map.vo.UserProfileVO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class UserServiceTest {

    @Autowired
    private UserService userService;

    @Test
    public void testGetUserProfile_NewUser() {
        // Test getting profile for a new user
        assertThrows(Exception.class, () -> {
            userService.getUserProfile("new_user");
        });
    }

    @Test
    public void testGetUserProfile_ExistingUser() throws Exception {
        // Test getting profile for an existing user
        UserProfileVO profile = userService.getUserProfile("mytest");
        assertNotNull(profile);
        assertNotNull(profile.getLikes());
        assertNotNull(profile.getBookmarks());
    }

    @Test
    public void testGetUserLikeEntries() {
        // Test getting like entries for a user
        List<UserLikeDTO> likes = userService.getUserLikeEntries("test_user1");
        assertNotNull(likes);
    }

    @Test
    public void testLikeEvent() throws Exception {
        // Test liking an event
        String userId = "mytest";
        Integer eventId = 1;
        
        // Like the event
        userService.likeEvent(userId, eventId);
        
        // Verify the like was recorded
        List<UserLikeDTO> likes = userService.getUserLikeEntries(userId);
        assertTrue(likes.stream().anyMatch(like -> like.getEventId().equals(eventId)));
    }

    @Test
    public void testDelikeEvent() throws Exception {
        // Test removing a like
        String userId = "mytest";
        Integer eventId = 1;
        
        // First like the event
        userService.likeEvent(userId, eventId);
        
        // Then remove the like
        userService.delikeEvent(userId, eventId);
        
        // Verify the like was removed
        List<UserLikeDTO> likes = userService.getUserLikeEntries(userId);
        assertFalse(likes.stream().anyMatch(like -> like.getEventId().equals(eventId)));
    }

    @Test
    public void testBookmarkEvent() throws Exception {
        // Test bookmarking an event
        String userId = "mytest";
        Integer eventId = 1;
        
        // Bookmark the event
        userService.bookmarkEvent(userId, eventId);
        
        // Verify the bookmark was recorded
        UserProfileVO profile = userService.getUserProfile(userId);
        assertTrue(profile.getBookmarks().contains(eventId));
    }

    @Test
    public void testDebookmarkEvent() throws Exception {
        // Test removing a bookmark
        String userId = "mytest";
        Integer eventId = 1;
        
        // First bookmark the event
        userService.bookmarkEvent(userId, eventId);
        
        // Then remove the bookmark
        userService.debookmarkEvent(userId, eventId);
        
        // Verify the bookmark was removed
        UserProfileVO profile = userService.getUserProfile(userId);
        assertFalse(profile.getBookmarks().contains(eventId));
    }
} 