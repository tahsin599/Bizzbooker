package com.tahsin.backend.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.crossstore.ChangeSetPersister.NotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tahsin.backend.Model.Notification;
import com.tahsin.backend.Service.NotificationService;

@RestController
public class NotificationController {
    @Autowired
    public NotificationService notificationService;

    @PostMapping("/api/notifications")
    
    public void markAsRead(Long notificationId) {
        // This method is used to mark a notification as read
        // You can implement the logic to mark the notification as read here
        notificationService.markAllAsRead(notificationId); 

    }


    @PostMapping("/api/notifications/mark-all-read")
    public void markAllAsRead(@RequestParam Long userId) {

        notificationService.markAllAsRead(userId);
    }


    @DeleteMapping("/api/notifications/{notificationId}")
    public ResponseEntity<?> deleteNotification(
        @PathVariable Long notificationId) throws NotFoundException {
    
      notificationService.deleteNotification(notificationId);
      return ResponseEntity.noContent().build();
    }

}
