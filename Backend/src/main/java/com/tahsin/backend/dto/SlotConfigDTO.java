package com.tahsin.backend.dto;

import java.time.LocalTime;

public class SlotConfigDTO {
    private Long locationId;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer slotDuration;
    private Integer maxSlotsPerInterval;
    

    // Getters and Setters
    public Long getLocationId() {
        return locationId;
    }
    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }
    public LocalTime getStartTime() {
        return startTime;
    }
    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }
    public LocalTime getEndTime() {
        return endTime;
    }
    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }
    public Integer getSlotDuration() {
        return slotDuration;
    }
    public void setSlotDuration(Integer slotDuration) {
        this.slotDuration = slotDuration;
    }
    public Integer getMaxSlotsPerInterval() {
        return maxSlotsPerInterval;
    }
    public void setMaxSlotsPerInterval(Integer maxSlotsPerInterval) {
        this.maxSlotsPerInterval = maxSlotsPerInterval;
    }
}