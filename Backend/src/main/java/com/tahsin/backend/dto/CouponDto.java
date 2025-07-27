package com.tahsin.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CouponDto(
    String code,
    String discountType, // "PERCENT" or "FIXED"
    BigDecimal discountValue,
    LocalDateTime validFrom,
    LocalDateTime validUntil,
    Integer maxUses,
    BigDecimal minOrderValue
) {}