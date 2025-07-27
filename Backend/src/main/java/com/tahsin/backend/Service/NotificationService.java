package com.tahsin.backend.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.crossstore.ChangeSetPersister.NotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.tahsin.backend.Model.Notification;
import com.tahsin.backend.Repository.NotificationRepository;
import com.tahsin.backend.Repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository; 
    @Autowired
    private UserRepository repository;

    public void addNotification(String message,Long userId,String notificationType,String businessName) {
        Notification notification=new Notification();
        notification.setMessage(message);
        notification.setUser(repository.findById(userId).orElseThrow(() -> new RuntimeException("User not found")));
        notification.setNotificationType(notificationType);
        notification.setRelatedEntityType(businessName);
        notification.setTitle("Notification");
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    public List<Notification> getNotifications(Long UserId) {
        return notificationRepository.findByUser(repository.findById(UserId).orElseThrow(() -> new RuntimeException("User not found")));
    }

   
    @Transactional 
    public void markAllAsRead(Long userId) {
        // TODO Auto-generated method stub
        notificationRepository.markAllAsRead(userId);
    }

    @Transactional
    public void deleteNotification(Long notificationId) throws NotFoundException {
    // First verify existence and ownership
    Notification notification = notificationRepository.findById(notificationId)
        .orElseThrow(() -> new NotFoundException());
    
   
    
    
       notificationRepository.delete(notification);
    }


    



}
