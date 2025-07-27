package com.tahsin.backend.dto;

public record BusinessRegistrationDto(
    String businessName,
    String description,
    Long categoryId,
    String address,
    String contactPhone
) {}
