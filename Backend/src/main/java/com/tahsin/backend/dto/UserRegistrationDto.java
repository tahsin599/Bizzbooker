package com.tahsin.backend.dto;

import com.tahsin.backend.Model.Role;

public record UserRegistrationDto(
    String name,
    String email,
    String password,
    Role role
) {}
