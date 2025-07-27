package com.tahsin.backend.Service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import com.tahsin.backend.Model.Notification;
import com.tahsin.backend.Model.User;
import com.tahsin.backend.Repository.NotificationRepository;
import com.tahsin.backend.Repository.UserRepository;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.crossstore.ChangeSetPersister.NotFoundException;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationService notificationService;

    private User testUser;
    private Notification testNotification;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");

        testNotification = new Notification();
        testNotification.setId(1L);
        testNotification.setUser(testUser);
        testNotification.setMessage("Test message");
        testNotification.setIsRead(false);
    }

    @Test
    void addNotification_ShouldCreateNotification_WhenUserExists() {
        // Arrange
        String message = "Test message";
        Long userId = 1L;
        String notificationType = "TYPE";
        String businessName = "Business";
        
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // Act
        notificationService.addNotification(message, userId, notificationType, businessName);

        // Assert
        verify(userRepository).findById(userId);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void addNotification_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        Long userId = 99L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            notificationService.addNotification("message", userId, "type", "business");
        });
    }

    @Test
    void getNotifications_ShouldReturnNotifications_WhenUserExists() {
        // Arrange
        Long userId = 1L;
        List<Notification> expectedNotifications = Arrays.asList(testNotification);
        
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(notificationRepository.findByUser(testUser)).thenReturn(expectedNotifications);

        // Act
        List<Notification> result = notificationService.getNotifications(userId);

        // Assert
        assertEquals(1, result.size());
        assertEquals(testNotification, result.get(0));
        verify(userRepository).findById(userId);
        verify(notificationRepository).findByUser(testUser);
    }

    @Test
    void getNotifications_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        Long userId = 99L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            notificationService.getNotifications(userId);
        });
    }

    @Test
    @Transactional
    void markAllAsRead_ShouldCallRepositoryMethod() {
        // Arrange
        Long userId = 1L;
        doNothing().when(notificationRepository).markAllAsRead(userId);

        // Act
        notificationService.markAllAsRead(userId);

        // Assert
        verify(notificationRepository).markAllAsRead(userId);
    }

    @Test
    @Transactional
    void deleteNotification_ShouldDelete_WhenNotificationExists() throws NotFoundException {
        // Arrange
        Long notificationId = 1L;
        when(notificationRepository.findById(notificationId)).thenReturn(Optional.of(testNotification));
        doNothing().when(notificationRepository).delete(testNotification);

        // Act
        notificationService.deleteNotification(notificationId);

        // Assert
        verify(notificationRepository).findById(notificationId);
        verify(notificationRepository).delete(testNotification);
    }

    @Test
    @Transactional
    void deleteNotification_ShouldThrowNotFoundException_WhenNotificationDoesNotExist() {
        // Arrange
        Long notificationId = 99L;
        when(notificationRepository.findById(notificationId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NotFoundException.class, () -> {
            notificationService.deleteNotification(notificationId);
        });
    }
}