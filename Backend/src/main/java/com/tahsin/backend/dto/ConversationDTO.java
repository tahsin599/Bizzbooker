package com.tahsin.backend.dto;

import java.time.LocalDateTime;

import jakarta.persistence.Column;

public class ConversationDTO {
    private Long id;
    @Column(nullable = false, length = 5000)
    private String title;
    private LocalDateTime createdAt;
    private LocalDateTime lastActivity;
    private Long userId;
    private String userName;
    private int messageCount;

    // Constructors
    public ConversationDTO() {
    }

    public ConversationDTO(Long id, String title, LocalDateTime createdAt, 
                         LocalDateTime lastActivity, Long userId, 
                         String userName, int messageCount) {
        this.id = id;
        this.title = title;
        this.createdAt = createdAt;
        this.lastActivity = lastActivity;
        this.userId = userId;
        this.userName = userName;
        this.messageCount = messageCount;
    }

    // Getters and Setters
    public Long getId() {
        return id;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastActivity() {
        return lastActivity;
    }

    public void setLastActivity(LocalDateTime lastActivity) {
        this.lastActivity = lastActivity;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public int getMessageCount() {
        return messageCount;
    }

    public void setMessageCount(int messageCount) {
        this.messageCount = messageCount;
    }

    // Helper method to generate a default title from the first message
    public String generateTitleFromMessage(String firstMessage) {
        if (firstMessage == null || firstMessage.isEmpty()) {
            return "New Chat";
        }
        return firstMessage.length() > 30 
            ? firstMessage.substring(0, 30) + "..." 
            : firstMessage;
    }
}