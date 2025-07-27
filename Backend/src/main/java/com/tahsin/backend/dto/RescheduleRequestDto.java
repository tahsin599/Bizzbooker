package com.tahsin.backend.dto;

import java.time.LocalDateTime;

public record RescheduleRequestDto(
    Long appointmentId,
    LocalDateTime newTime
) {}
