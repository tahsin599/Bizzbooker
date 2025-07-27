package com.tahsin.backend.dto;

import java.time.LocalTime;

import com.tahsin.backend.Model.SlotInterval;

public class SlotIntervalResponseDTO {
    private Long configId;
    public Long getConfigId() {
        return configId;
    }

    public void setConfigId(Long configId) {
        this.configId = configId;
    }

    private LocalTime startTime;
    private LocalTime endTime;
    private int maxSlots;
    private int usedSlots;
    private int availableSlots;
    // Default constructor
    public SlotIntervalResponseDTO() {
    }

    // Getters and setters
    // Constructor that takes SlotInterval entity
    public SlotIntervalResponseDTO(SlotInterval interval) {
        this.startTime = interval.getStartTime();
        this.endTime = interval.getEndTime();
        this.maxSlots = interval.getMaxSlots();
        this.usedSlots = interval.getUsedSlots();
        this.availableSlots = interval.getMaxSlots() - interval.getUsedSlots();
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

    public int getMaxSlots() {
        return maxSlots;
    }

    public void setMaxSlots(int maxSlots) {
        this.maxSlots = maxSlots;
    }

    public int getUsedSlots() {
        return usedSlots;
    }

    public void setUsedSlots(int usedSlots) {
        this.usedSlots = usedSlots;
    }

    public int getAvailableSlots() {
        return availableSlots;
    }

    public void setAvailableSlots(int availableSlots) {
        this.availableSlots = availableSlots;
    }
}