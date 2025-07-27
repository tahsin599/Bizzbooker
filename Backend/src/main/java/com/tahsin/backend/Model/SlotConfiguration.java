package com.tahsin.backend.Model;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "slot_configuration")
public class SlotConfiguration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "location_id", nullable = false)
    private BusinessLocation location;

    @Column(nullable = false)
    private Integer maxSlotsPerInterval = 1;

    @Column(nullable = false)
    private Integer usedSlots = 0;

    @Column(nullable = false)
    private LocalTime startTime = LocalTime.of(9, 0);

    @Column(nullable = false)
    private LocalTime endTime = LocalTime.of(17, 0);

    private LocalDate lastResetDate;
    private Integer slotDuration = 30;
    @OneToMany(mappedBy = "configuration", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SlotInterval> intervals;

    public List<SlotInterval> getIntervals() {
        return intervals;
    }

    public void setIntervals(List<SlotInterval> intervals) {
        this.intervals = intervals;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BusinessLocation getLocation() {
        return location;
    }

    public void setLocation(BusinessLocation location) {
        this.location = location;
    }

    public Integer getMaxSlotsPerInterval() {
        return maxSlotsPerInterval;
    }

    public void setMaxSlotsPerInterval(Integer maxSlotsPerInterval) {
        this.maxSlotsPerInterval = maxSlotsPerInterval;
    }

    public Integer getUsedSlots() {
        return usedSlots;
    }

    public void setUsedSlots(Integer usedSlots) {
        this.usedSlots = usedSlots;
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

    public LocalDate getLastResetDate() {
        return lastResetDate;
    }

    public void setLastResetDate(LocalDate lastResetDate) {
        this.lastResetDate = lastResetDate;
    }

    @Override
    public String toString() {
        return "SlotConfiguration [id=" + id + ", location=" + location + ", maxSlotsPerInterval=" + maxSlotsPerInterval
                + ", usedSlots=" + usedSlots + ", startTime=" + startTime + ", endTime=" + endTime + ", lastResetDate="
                + lastResetDate + "]";
    }
      public Integer getSlotDuration() {
        return slotDuration;
    }

    public void setSlotDuration(Integer slotDuration) {
        this.slotDuration = slotDuration;
    }

    // Getters, setters, constructors
}