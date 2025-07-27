package com.tahsin.backend.dto;

public record AiChatRequest(
    String message,
    Long conversationId // Null for new conversations
) {}
