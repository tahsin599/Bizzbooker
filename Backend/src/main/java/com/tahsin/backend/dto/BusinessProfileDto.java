package com.tahsin.backend.dto;

import java.util.List;

public record BusinessProfileDto(
    Long id,
    String businessName,
    String description,
    String approvalStatus,
    String categoryName,
    List<LocationDto> locations


    
) {}
