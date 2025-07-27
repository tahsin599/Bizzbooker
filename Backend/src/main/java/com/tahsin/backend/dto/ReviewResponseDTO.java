package com.tahsin.backend.dto;

import java.time.LocalDateTime;

import jakarta.persistence.Lob;

public class ReviewResponseDTO {
    private Long id;
    private Long appointmentId;
    private Integer rating;
    private String comment;
    private String businessReply;
    private LocalDateTime replyDate;
    private LocalDateTime createdAt;
    private String customerName;
    private String serviceName;
    private String imageName;
    private String imageType;
    @Lob 
    private byte[] imageData;
    private String businessName;
    private String businessImageName;
    private String businessImageType;
    @Lob 
    private byte[] businessImageData;
    
    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getBusinessImageName() {
        return businessImageName;
    }

    public void setBusinessImageName(String businessImageName) {
        this.businessImageName = businessImageName;
    }

    public String getBusinessImageType() {
        return businessImageType;
    }

    public void setBusinessImageType(String businessImageType) {
        this.businessImageType = businessImageType;
    }

    public byte[] getBusinessImageData() {
        return businessImageData;
    }

    public void setBusinessImageData(byte[] businessImageData) {
        this.businessImageData = businessImageData;
    }

    public String getImageName() {
        return imageName;
    }

    public void setImageName(String imageName) {
        this.imageName = imageName;
    }

    public String getImageType() {
        return imageType;
    }

    public void setImageType(String imageType) {
        this.imageType = imageType;
    }

    public byte[] getImageData() {
        return imageData;
    }

    public void setImageData(byte[] imageData) {
        this.imageData = imageData;
    }

    // Constructors, getters, and setters
    public ReviewResponseDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getBusinessReply() {
        return businessReply;
    }

    public void setBusinessReply(String businessReply) {
        this.businessReply = businessReply;
    }

    public LocalDateTime getReplyDate() {
        return replyDate;
    }

    public void setReplyDate(LocalDateTime replyDate) {
        this.replyDate = replyDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }
    
    // Add all getters and setters here
}