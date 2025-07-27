package com.tahsin.backend.Repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import com.tahsin.backend.Model.Notification;
import com.tahsin.backend.Model.User;

@Repository
@Component
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);
    
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.createdAt > :since")
    List<Notification> findRecentNotifications(
        @Param("userId") Long userId,
        @Param("since") LocalDateTime since);
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :notificationId")
    void markAsRead(@Param("notificationId") Long notificationId);

    List<Notification> findByUser(User user);
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId")
    void markAllAsRead(@Param("userId") Long userId);
   
}