package com.tahsin.backend.dto;

public record ReportDto(
    Long reportedEntityId,
    String entityType, // "USER", "BUSINESS", etc.
    String reason
) {}
