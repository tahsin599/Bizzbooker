package com.tahsin.backend.dto;

public record PasswordUpdateDto(
    String currentPassword,
    String newPassword
) {}
