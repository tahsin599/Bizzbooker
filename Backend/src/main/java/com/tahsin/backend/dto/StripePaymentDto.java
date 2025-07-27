package com.tahsin.backend.dto;

public record StripePaymentDto(
    Long appointmentId,
    String stripeToken
) {}
