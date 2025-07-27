package com.tahsin.backend.dto;

import java.math.BigDecimal;

public record PaymentRequestDto(
    Long appointmentId,
    BigDecimal amount,
    String paymentMethod
) {}
