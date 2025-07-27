package com.tahsin.backend.dto;

import java.time.LocalDateTime;

public record AiChatResponse(
    String response,
    Long conversationId,
    LocalDateTime timestamp
) {}
