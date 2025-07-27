package com.tahsin.backend.dto;

import java.util.List;

public record LocationDto(
    Long id,
    String address,
    String area,
    String city,
    String contactPhone,
    boolean isPrimary
    //List<BusinessHoursDto> hours
) {}
