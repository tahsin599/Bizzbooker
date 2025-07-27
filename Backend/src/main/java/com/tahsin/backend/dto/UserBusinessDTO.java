package com.tahsin.backend.dto;

import java.util.Base64;

public class UserBusinessDTO {
    private Long id;
    private String businessName;
    private String category;
    private Long appointmentCount;
    private String imageUrl;

    public UserBusinessDTO(Long id, String businessName, String category, 
                         Long appointmentCount, byte[] imageData, String imageType) {
        this.id = id;
        this.businessName = businessName;
        this.category = category;
        this.appointmentCount = appointmentCount;
        this.imageUrl = imageData != null ? 
            "data:" + imageType + ";base64," + Base64.getEncoder().encodeToString(imageData) : 
            null;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Long getAppointmentCount() {
        return appointmentCount;
    }

    public void setAppointmentCount(Long appointmentCount) {
        this.appointmentCount = appointmentCount;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    // Getters
}