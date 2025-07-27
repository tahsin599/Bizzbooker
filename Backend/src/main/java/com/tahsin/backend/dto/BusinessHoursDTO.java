package com.tahsin.backend.dto;



public class BusinessHoursDTO {
    private Integer dayOfWeek;
    private String openTime;
    private String closeTime;
    private Boolean isClosed;
    
    // Getters and Setters
    public Integer getDayOfWeek() {
        return dayOfWeek;
    }
    public void setDayOfWeek(Integer dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }
    public String getOpenTime() {
        return openTime;
    }
    public void setOpenTime(String openTime) {
        this.openTime = openTime;
    }
    public String getCloseTime() {
        return closeTime;
    }
    public void setCloseTime(String closeTime) {
        this.closeTime = closeTime;
    }
    public Boolean getIsClosed() {
        return isClosed;
    }
    public void setIsClosed(Boolean isClosed) {
        this.isClosed = isClosed;
    }
}