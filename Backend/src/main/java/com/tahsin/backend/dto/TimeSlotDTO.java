package com.tahsin.backend.dto;

public class TimeSlotDTO {
    private String time;
    private boolean available;
    private int remainingSlots;
    
    // Getters and Setters
    public String getTime() {
        return time;
    }
    public void setTime(String time) {
        this.time = time;
    }
    public boolean isAvailable() {
        return available;
    }
    public void setAvailable(boolean available) {
        this.available = available;
    }
    public int getRemainingSlots() {
        return remainingSlots;
    }
    public void setRemainingSlots(int remainingSlots) {
        this.remainingSlots = remainingSlots;
    }
}