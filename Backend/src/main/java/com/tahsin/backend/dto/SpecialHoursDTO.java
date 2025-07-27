package com.tahsin.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class SpecialHoursDTO {
    private LocalDate date;
    private LocalTime openTime;
    private LocalTime closeTime;
    private Boolean isClosed;
    public LocalDate getDate() {
        return date;
    }
    public void setDate(LocalDate date) {
        this.date = date;
    }
    public LocalTime getOpenTime() {
        return openTime;
    }
    public void setOpenTime(LocalTime openTime) {
        this.openTime = openTime;
    }
    public LocalTime getCloseTime() {
        return closeTime;
    }
    public void setCloseTime(LocalTime closeTime) {
        this.closeTime = closeTime;
    }
    public Boolean getIsClosed() {
        return isClosed;
    }
    public void setIsClosed(Boolean isClosed) {
        this.isClosed = isClosed;
    }
    
    // Getters and Setters...
}
