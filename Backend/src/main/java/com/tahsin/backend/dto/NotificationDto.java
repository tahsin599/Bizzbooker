package com.tahsin.backend.dto;

import java.time.LocalDateTime;


public class NotificationDto {
    private Long id;
    private String title;
    private String message;
    private String type;
    private boolean isRead;
    private LocalDateTime createdAt;
    private String relatedEntityType;
    private String NotificationType;
    public NotificationDto(Long id, LocalDateTime createdAt, String message, boolean isRead, String string, String string2) {
        this.id = id;
        this.createdAt= createdAt;    
        this.message = message;
        this.isRead = isRead;
        this.relatedEntityType = string;
        this.NotificationType = string2;
    }
    public Long getId() {
        return id;
    }
    public NotificationDto(Long id, String title, String message, boolean isRead, LocalDateTime createdAt,
            String relatedEntityType, String notificationType) {
        this.id = id;
        this.title = title;
        this.message = message;
       
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.relatedEntityType = relatedEntityType;
        NotificationType = notificationType;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
    public String getType() {
        return type;
    }
    public void setType(String type) {
        this.type = type;
    }
    public boolean isRead() {
        return isRead;
    }
    public void setRead(boolean isRead) {
        this.isRead = isRead;
    }
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    public String getRelatedEntityType() {
        return relatedEntityType;
    }
    public void setRelatedEntityType(String relatedEntityType) {
        this.relatedEntityType = relatedEntityType;
    }
    public String getNotificationType() {
        return NotificationType;
    }
    public void setNotificationType(String notificationType) {
        NotificationType = notificationType;
    }

    // Add constructors, getters, and setters as needed
}
