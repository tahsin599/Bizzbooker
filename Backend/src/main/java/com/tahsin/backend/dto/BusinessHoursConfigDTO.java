package com.tahsin.backend.dto;

import java.util.List;

public class BusinessHoursConfigDTO {
    private Long businessId;
    private List<BusinessHoursDTO> regularHours;
    private SlotConfigDTO slotConfig;
    
    // Getters and Setters
    public Long getBusinessId() {
        return businessId;
    }
    public void setBusinessId(Long businessId) {
        this.businessId = businessId;
    }
    public List<BusinessHoursDTO> getRegularHours() {
        return regularHours;
    }
    public void setRegularHours(List<BusinessHoursDTO> regularHours) {
        this.regularHours = regularHours;
    }
    public SlotConfigDTO getSlotConfig() {
        return slotConfig;
    }
    public void setSlotConfig(SlotConfigDTO slotConfig) {
        this.slotConfig = slotConfig;
    }
}