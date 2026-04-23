package com.map.service;

import com.map.dto.UserLikeDTO;
import com.map.mapper.EventMapper;
import com.map.mapper.UserMapper;
import com.map.service.impl.UserServiceImpl;
import com.map.vo.UserProfileVO;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertIterableEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserMapper userMapper;

    @Mock
    private EventMapper eventMapper;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void getUserProfile_newUser_createsUserAndThrows() {
        when(userMapper.checkUserExists("new_user")).thenReturn(false);

        Exception exception = assertThrows(Exception.class, () -> userService.getUserProfile("new_user"));

        assertEquals("User not found: new_user", exception.getMessage());
        verify(userMapper).createUser("new_user");
    }

    @Test
    void getUserProfile_existingUser_returnsLikesAndBookmarks() throws Exception {
        when(userMapper.checkUserExists("mytest")).thenReturn(true);
        when(userMapper.getUserLikes("mytest")).thenReturn(List.of(1, 2));
        when(userMapper.getUserBookmarks("mytest")).thenReturn(List.of(3));

        UserProfileVO profile = userService.getUserProfile("mytest");

        assertIterableEquals(List.of(1, 2), profile.getLikes());
        assertIterableEquals(List.of(3), profile.getBookmarks());
    }

    @Test
    void getUserLikeEntries_returnsMapperResults() {
        List<UserLikeDTO> likes = List.of(new UserLikeDTO(1, LocalDateTime.of(2026, 4, 20, 10, 0)));
        when(userMapper.getUserLikesWithTimestamps("test_user1")).thenReturn(likes);

        List<UserLikeDTO> actualLikes = userService.getUserLikeEntries("test_user1");

        assertEquals(likes, actualLikes);
        verify(userMapper).getUserLikesWithTimestamps("test_user1");
    }

    @Test
    void likeEvent_addsLikeAndIncrementsCountWhenEventWasNotPreviouslyLiked() throws Exception {
        when(userMapper.checkUserExists("mytest")).thenReturn(true);
        when(eventMapper.checkIfEventExists(1)).thenReturn(true);
        when(userMapper.checkIfUserLiked("mytest", 1)).thenReturn(false);

        userService.likeEvent("mytest", 1);

        verify(eventMapper).incrementLikedCount(1);
        verify(userMapper).likeEvent("mytest", 1);
    }

    @Test
    void likeEvent_updatesTimestampWithoutIncrementWhenAlreadyLiked() throws Exception {
        when(userMapper.checkUserExists("mytest")).thenReturn(true);
        when(eventMapper.checkIfEventExists(1)).thenReturn(true);
        when(userMapper.checkIfUserLiked("mytest", 1)).thenReturn(true);

        userService.likeEvent("mytest", 1);

        verify(eventMapper, never()).incrementLikedCount(1);
        verify(userMapper).likeEvent("mytest", 1);
    }

    @Test
    void delikeEvent_removesLikeAndDecrementsCountWhenPresent() {
        when(userMapper.checkUserExists("mytest")).thenReturn(true);
        when(eventMapper.checkIfEventExists(1)).thenReturn(true);
        when(userMapper.checkIfUserLiked("mytest", 1)).thenReturn(true);

        userService.delikeEvent("mytest", 1);

        verify(eventMapper).decrementLikedCount(1);
        verify(userMapper).delikeEvent("mytest", 1);
    }

    @Test
    void bookmarkEvent_persistsBookmarkForExistingUserAndEvent() throws Exception {
        when(userMapper.checkUserExists("mytest")).thenReturn(true);
        when(eventMapper.checkIfEventExists(1)).thenReturn(true);

        userService.bookmarkEvent("mytest", 1);

        verify(userMapper).bookmarkEvent("mytest", 1);
    }

    @Test
    void debookmarkEvent_removesBookmarkForExistingUserAndEvent() throws Exception {
        when(userMapper.checkUserExists("mytest")).thenReturn(true);
        when(eventMapper.checkIfEventExists(1)).thenReturn(true);

        userService.debookmarkEvent("mytest", 1);

        verify(userMapper).debookmarkEvent("mytest", 1);
    }
}
