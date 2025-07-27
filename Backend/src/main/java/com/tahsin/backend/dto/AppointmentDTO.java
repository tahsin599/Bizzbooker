// package com.tahsin.backend.dto;

// import java.time.LocalDateTime;

// public class AppointmentDTO {
//     private Long customerId;
//     private Long businessId;
//     private Long locationId;
    
//     private LocalDateTime startTime;
//     private LocalDateTime endTime;
//     private String notes;
//     private Long configId;
//     private int userSelectedCount;

//     public int getUserSelectedCount() {
//         return userSelectedCount;
//     }

//     public void setUserSelectedCount(int userSelectedCount) {
//         this.userSelectedCount = userSelectedCount;
//     }

//     public Long getConfigId() {
//         return configId;
//     }

//     public void setConfigId(Long configId) {
//         this.configId = configId;
//     }

//     // Getters and Setters
//     public Long getCustomerId() {
//         return customerId;
//     }

//     public void setCustomerId(Long customerId) {
//         this.customerId = customerId;
//     }

//     public Long getBusinessId() {
//         return businessId;
//     }

//     public void setBusinessId(Long businessId) {
//         this.businessId = businessId;
//     }

//     public Long getLocationId() {
//         return locationId;
//     }

//     public void setLocationId(Long locationId) {
//         this.locationId = locationId;
//     }

    

//     public LocalDateTime getStartTime() {
//         return startTime;
//     }

//     public void setStartTime(LocalDateTime startTime) {
//         this.startTime = startTime;
//     }

//     public LocalDateTime getEndTime() {
//         return endTime;
//     }

//     public void setEndTime(LocalDateTime endTime) {
//         this.endTime = endTime;
//     }

//     public String getNotes() {
//         return notes;
//     }

//     public void setNotes(String notes) {
//         this.notes = notes;
//     }
// }

package com.tahsin.backend.dto;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

public class AppointmentDTO {
    private Long customerId;
    private Long businessId;
    private Long locationId;
    private String paymentReference;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startTime;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endTime;
    private String notes;
    private Long configId;
    private int userSelectedCount;
    private Double slotPrice;

    public String getPaymentReference() {
        return paymentReference;
    }

    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }

    public int getUserSelectedCount() {
        return userSelectedCount;
    }

    public void setUserSelectedCount(int userSelectedCount) {
        this.userSelectedCount = userSelectedCount;
    }

    public Long getConfigId() {
        return configId;
    }

    public void setConfigId(Long configId) {
        this.configId = configId;
    }

    // Getters and Setters
    public Long getCustomerId() {
        return customerId;
        
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getBusinessId() {
        return businessId;
    }

    public void setBusinessId(Long businessId) {
        this.businessId = businessId;
    }

    public Long getLocationId() {
        return locationId;
    }

    public void setLocationId(Long locationId) {
        this.locationId = locationId;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Double getSlotPrice() {
        return slotPrice;
    }

    public void setSlotPrice(Double slotPrice) {
        this.slotPrice = slotPrice;
    }
}