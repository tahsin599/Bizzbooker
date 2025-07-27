package com.tahsin.backend.dto;

public class TopBusinessDTO {
    private Long id;
    private String businessName;
    private String category;
    private Long appointmentCount;
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public TopBusinessDTO(Long id, String businessName, String category, Long appointmentCount) {
        this.id = id;
        this.businessName = businessName;
        this.category = category;
        this.appointmentCount = appointmentCount;
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
    
    // Constructors, getters, setters
}