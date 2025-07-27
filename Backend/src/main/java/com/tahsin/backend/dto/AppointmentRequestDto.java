package com.tahsin.backend.dto;

import java.time.LocalDateTime;

public record AppointmentRequestDto(
    Long businessId,
    Long serviceId,
    Long locationId,
    LocalDateTime startTime,
    String notes
) {}