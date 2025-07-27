package com.tahsin.backend.Model;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "slot_intervals")
public class SlotInterval {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "config_id", nullable = false)
    private SlotConfiguration configuration;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    private Integer maxSlots;

    @Column(nullable = false)
    private Integer usedSlots = 0;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SlotConfiguration getConfiguration() {
        return configuration;
    }

    public void setConfiguration(SlotConfiguration configuration) {
        this.configuration = configuration;
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

    public Integer getMaxSlots() {
        return maxSlots;
    }

    public void setMaxSlots(Integer maxSlots) {
        this.maxSlots = maxSlots;
    }

    public Integer getUsedSlots() {
        return usedSlots;
    }

    public void setUsedSlots(Integer usedSlots) {
        this.usedSlots = usedSlots;
    }

    // Getters and setters

    // Add price field and getter
    @Column(nullable = false)
    private Double price = 0.0;

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }
}