package com.tahsin.backend.Model;

import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "business_hours")
public class BusinessHours {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(nullable = false)
    private Integer dayOfWeek; // 0-6 (Sunday-Saturday)

    @Column(nullable = false)
    private LocalTime openTime;

    @Column(nullable = false)
    private LocalTime closeTime;

    @Column(nullable = false)
    private Boolean isClosed = false;

    private LocalTime tempCloseTime;
    private Boolean isTempOn = false;
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public Business getBusiness() {
        return business;
    }
    public void setBusiness(Business business) {
        this.business = business;
    }
    public Integer getDayOfWeek() {
        return dayOfWeek;
    }
    public void setDayOfWeek(Integer dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
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
    public LocalTime getTempCloseTime() {
        return tempCloseTime;
    }
    public void setTempCloseTime(LocalTime tempCloseTime) {
        this.tempCloseTime = tempCloseTime;
    }
    public Boolean getIsTempOn() {
        return isTempOn;
    }
    public void setIsTempOn(Boolean isTempOn) {
        this.isTempOn = isTempOn;
    }
    public BusinessHours() {
    }
    @Override
    public String toString() {
        return "BusinessHours [id=" + id + ", business=" + business + ", dayOfWeek=" + dayOfWeek + ", openTime="
                + openTime + ", closeTime=" + closeTime + ", isClosed=" + isClosed + ", tempCloseTime=" + tempCloseTime
                + ", isTempOn=" + isTempOn + "]";
    }
    public BusinessHours(Long businessId, Integer dayOfWeek, LocalTime openTime, 
                    LocalTime closeTime, Boolean isClosed) {
    this.business = new Business(businessId);
    this.dayOfWeek = dayOfWeek;
    this.openTime = openTime;
    this.closeTime = closeTime;
    this.isClosed = isClosed;
}

    
}
