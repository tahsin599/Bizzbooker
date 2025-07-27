package com.tahsin.backend.dto;

import java.math.BigDecimal;

public record ServiceCreationDto(
    String name,
    Long categoryId,
    BigDecimal price,
    int durationMinutes
) {}
