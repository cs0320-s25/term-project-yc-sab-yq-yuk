package com.map.mapper;


import com.map.dto.UserLikeDTO;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Delete;

@Mapper
public interface UserMapper {

  @Insert("INSERT INTO users (user_id) VALUES (#{userId})")
  void createUser(@Param("userId") String userId);

  /**
   * Check if a user exists in the database.
   * @param userId
   * @return true if the user exists, false otherwise
   */
  @Select("SELECT COUNT(*) > 0 FROM users WHERE user_id = #{userId}")
  boolean checkUserExists(@Param("userId") String userId);


  /**
   * Check if a user has liked a specific event.
   * @param userId
   * @param eventId
   * @return true if the user has liked the event, false otherwise
   */
  @Select("SELECT COUNT(*) > 0 FROM user_likes WHERE user_id = #{userId} AND event_id = #{eventId}")
  boolean checkIfUserLiked(@Param("userId") String userId, @Param("eventId") Integer eventId);

  /**
   * Extract all events that the user has liked.
   * @param userId
   * @return
   */
  @Select("SELECT event_id FROM users JOIN user_likes ON "
      + "users.user_id = user_likes.user_id WHERE users.user_id = #{userId}")
  List<Integer> getUserLikes(@Param("userId") String userId);

  /**
   * Extract all events that the user has liked and their timestamps.
   * @param userId
   * @return
   */
  @Select("SELECT event_id, timestamp FROM user_likes WHERE user_id = #{userId}")
  List<UserLikeDTO> getUserLikesWithTimestamps(@Param("userId") String userId);

  /**
   * Extract all events that the user has bookmarked.
   * @param userId
   * @return
   */
  @Select("SELECT event_id FROM users JOIN user_bookmarks "
      + "ON users.user_id = user_bookmarks.user_id WHERE users.user_id = #{userId}")
  List<Integer> getUserBookmarks(@Param("userId") String userId);

  /**
   * Like an event if it hasn't been liked; else do nothing.
   * @param userId
   * @param eventId
   */
  @Insert("INSERT INTO user_likes (user_id, event_id, timestamp) " +
          "VALUES (#{userId}, #{eventId}, CURRENT_TIMESTAMP) " +
          "ON DUPLICATE KEY UPDATE timestamp = CURRENT_TIMESTAMP")
  void likeEvent(@Param("userId") String userId, @Param("eventId") Integer eventId);

  /**
   * Remove like for an event if it has been liked; else do nothing.
   * @param userId
   * @param eventId
   */
  @Delete("DELETE FROM user_likes WHERE user_id = #{userId} AND event_id = #{eventId}")
  void delikeEvent(@Param("userId") String userId, @Param("eventId") Integer eventId);

  /**
   * Bookmark an event if it hasn't been bookmarked; else do nothing.
   * @param userId
   * @param eventId
   */
  @Insert("INSERT INTO user_bookmarks (user_id, event_id) " +
          "VALUES (#{userId}, #{eventId}) " +
          "ON DUPLICATE KEY UPDATE user_id = user_id")
  void bookmarkEvent(@Param("userId") String userId, @Param("eventId") Integer eventId);

  /**
   * Remove bookmark for an event if it has been bookmarked; else do nothing.
   * @param userId
   * @param eventId
   */
  @Delete("DELETE FROM user_bookmarks WHERE user_id = #{userId} AND event_id = #{eventId}")
  void debookmarkEvent(@Param("userId") String userId, @Param("eventId") Integer eventId);
}
