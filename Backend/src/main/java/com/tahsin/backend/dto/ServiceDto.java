package com.tahsin.backend.dto;

import java.math.BigDecimal;

public record ServiceDto(
    Long id,
    String name,
    String category,
    BigDecimal price,
    int durationMinutes
) {}
