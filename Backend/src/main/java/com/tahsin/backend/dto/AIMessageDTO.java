package com.tahsin.backend.dto;

import java.time.LocalDateTime;

public class AIMessageDTO {
    private Long id;
    private String userMessage;
    private String aiReply;
    private LocalDateTime createdAt;

    // Constructors
    public AIMessageDTO() {
    }

    public AIMessageDTO(Long id, String userMessage, String aiReply, LocalDateTime createdAt) {
        this.id = id;
        this.userMessage = userMessage;
        this.aiReply = aiReply;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserMessage() {
        return userMessage;
    }

    public void setUserMessage(String userMessage) {
        this.userMessage = userMessage;
    }

    public String getAiReply() {
        return aiReply;
    }

    public void setAiReply(String aiReply) {
        this.aiReply = aiReply;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}