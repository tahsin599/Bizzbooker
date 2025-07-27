package com.tahsin.backend.dto;

import java.time.LocalDateTime;

public record ReportResponseDto(
    Long id,
    String reporterName,
    String reportedEntityType,
    String reason,
    String status,
    LocalDateTime reportedAt
) {}