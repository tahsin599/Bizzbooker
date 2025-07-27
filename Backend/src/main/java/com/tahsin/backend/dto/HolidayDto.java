package com.tahsin.backend.dto;

import java.time.LocalDate;

public record HolidayDto(
    String holidayName,
    LocalDate holidayDate,
    boolean isRecurring
) {}
