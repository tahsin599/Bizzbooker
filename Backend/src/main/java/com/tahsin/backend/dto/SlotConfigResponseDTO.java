// package com.tahsin.backend.dto;

// import java.time.LocalTime;
// import java.util.List;

// public class SlotConfigResponseDTO {
//     private LocalTime startTime;
//     private LocalTime endTime;
//     private Integer slotDuration;
//     private Integer maxSlotsPerInterval;
//     private Integer usedSlots;
//     private List<SlotIntervalResponseDTO> intervals;

//     public List<SlotIntervalResponseDTO> getIntervals() {
//         return intervals;
//     }

//     public void setIntervals(List<SlotIntervalResponseDTO> intervals) {
//         this.intervals = intervals;
//     }

//     // Getters and Setters
//     public LocalTime getStartTime() {
//         return startTime;
//     }

//     public void setStartTime(LocalTime startTime) {
//         this.startTime = startTime;
//     }

//     public LocalTime getEndTime() {
//         return endTime;
//     }

//     public void setEndTime(LocalTime endTime) {
//         this.endTime = endTime;
//     }

//     public Integer getSlotDuration() {
//         return slotDuration;
//     }

//     public void setSlotDuration(Integer slotDuration) {
//         this.slotDuration = slotDuration;
//     }

//     public Integer getMaxSlotsPerInterval() {
//         return maxSlotsPerInterval;
//     }

//     public void setMaxSlotsPerInterval(Integer maxSlotsPerInterval) {
//         this.maxSlotsPerInterval = maxSlotsPerInterval;
//     }

//     public Integer getUsedSlots() {
//         return usedSlots;
//     }

//     public void setUsedSlots(Integer usedSlots) {
//         this.usedSlots = usedSlots;
//     }
// }

package com.tahsin.backend.dto;

import java.time.LocalTime;
import java.util.List;

public class SlotConfigResponseDTO {
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer slotDuration;
    private Integer maxSlotsPerInterval;
    private Integer usedSlots;
    private Double slotPrice;
    private List<SlotIntervalResponseDTO> intervals;

    public List<SlotIntervalResponseDTO> getIntervals() {
        return intervals;
    }

    public void setIntervals(List<SlotIntervalResponseDTO> intervals) {
        this.intervals = intervals;
    }

    // Getters and Setters
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

    public Integer getUsedSlots() {
        return usedSlots;
    }

    public void setUsedSlots(Integer usedSlots) {
        this.usedSlots = usedSlots;
    }

    public Double getSlotPrice() {
        return slotPrice;
    }

    public void setSlotPrice(Double slotPrice) {
        this.slotPrice = slotPrice;
    }
}