package com.tahsin.backend.dto;

import java.time.LocalDateTime;

public class AppointmentResponseDTO {
    private Long appointmentId;
    private String status;
    private String locationName;
    private String businessName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;  // Typically useful with startTime
    private String serviceName;     // Often needed
    private String customerName; 
    private boolean isReviewGiven;   // Useful for business views

    public boolean isReviewGiven() {
        return isReviewGiven;
    }

    public void setReviewGiven(boolean isReviewGiven) {
        this.isReviewGiven = isReviewGiven;
    }

    // Constructors
    public AppointmentResponseDTO() {
    }

    public AppointmentResponseDTO(Long appointmentId, String status, String locationName, 
                                String businessName, LocalDateTime startTime) {
        this.appointmentId = appointmentId;
        this.status = status;
        this.locationName = locationName;
        this.businessName = businessName;
        this.startTime = startTime;
    }

    // Getters and Setters
    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }
}