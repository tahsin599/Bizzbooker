package com.tahsin.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponseDto(
    String transactionId,
    String status,
    BigDecimal amountPaid,
    LocalDateTime paymentDate
) {}
