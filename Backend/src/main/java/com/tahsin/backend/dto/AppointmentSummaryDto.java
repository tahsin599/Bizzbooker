package com.tahsin.backend.dto;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public record AppointmentSummaryDto(
    Long id,
    String customerName,
    String businessName,
    String serviceName,
    LocalDateTime startTime,
    LocalDateTime endTime,
    String status,
    String locationAddress,
    // Additional formatted fields for UI
    String formattedTime,      // "10:00 AM"
    String formattedDayDate,   // "Mon, Jan 15"
    String formattedFullDate,  // "2024-01-15"
    String appointmentTitle    // "Doctor Appointment" (service name + business name)
) {
    
    // Constructor with automatic formatting
    public AppointmentSummaryDto(Long id, String customerName, String businessName, 
                               String serviceName, LocalDateTime startTime, LocalDateTime endTime, 
                               String status, String locationAddress) {
        this(id, customerName, businessName, serviceName, startTime, endTime, status, locationAddress,
             formatTime(startTime),
             formatDayDate(startTime),
             formatFullDate(startTime),
             formatAppointmentTitle(serviceName, businessName));
    }
    
    // Helper methods for formatting
    private static String formatTime(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        return dateTime.format(DateTimeFormatter.ofPattern("h:mm a"));
    }
    
    private static String formatDayDate(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        return dateTime.format(DateTimeFormatter.ofPattern("EEE, MMM d"));
    }
    
    private static String formatFullDate(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        return dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    }
    
    private static String formatAppointmentTitle(String serviceName, String businessName) {
        if (serviceName == null && businessName == null) return "Appointment";
        if (serviceName == null) return businessName + " Appointment";
        if (businessName == null) return serviceName;
        return serviceName + " at " + businessName;
    }
}
