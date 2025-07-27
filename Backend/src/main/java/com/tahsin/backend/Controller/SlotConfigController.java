package com.tahsin.backend.Controller;

import com.tahsin.backend.dto.*;
import com.tahsin.backend.Model.*;
import com.tahsin.backend.Service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/slot-config")
public class SlotConfigController {

    @Autowired
    private SlotConfigService slotConfigService;
    
    @Autowired
    private SlotIntervalService slotIntervalService;

    @PostMapping
    public ResponseEntity<SlotConfigResponseDTO> saveSlotConfig(@RequestBody SlotConfigDTO configDTO) {
        SlotConfiguration savedConfig = slotConfigService.saveOrUpdateSlotConfig(configDTO);
        return ResponseEntity.ok(convertToResponseDTO(savedConfig));
    }

    @GetMapping("/location/{locationId}/{dayOfWeek}")
    public ResponseEntity<SlotConfigResponseDTO> getSlotConfig(@PathVariable Long locationId,@PathVariable int dayOfWeek) {
        SlotConfiguration config = slotConfigService.getByLocationIdAndDayOfWeek(locationId,dayOfWeek);
        SlotConfigResponseDTO response = convertToResponseDTO(config);
        
        // Add interval information
        List<SlotInterval> intervals = slotIntervalService.getIntervalsByConfigId(config.getId());
        response.setIntervals(convertToIntervalDTOs(intervals));
        
        return ResponseEntity.ok(response);
    }

      @GetMapping("/location/{locationId}")
    public ResponseEntity<SlotConfigResponseDTO> getSlotConfigs(@PathVariable Long locationId) {
        SlotConfiguration config = slotConfigService.getByLocationId(locationId);
        SlotConfigResponseDTO response = convertToResponseDTO(config);
        
        // Add interval information
        List<SlotInterval> intervals = slotIntervalService.getIntervalsByConfigId(config.getId());
        response.setIntervals(convertToIntervalDTOs(intervals));
        
        return ResponseEntity.ok(response);
    }


    // @PostMapping("/reset/{locationId}")
    // public ResponseEntity<Void> resetSlots(@PathVariable Long locationId) {
    //     slotConfigService.resetUsedSlots(locationId);
    //     return ResponseEntity.ok().build();
    // }

    private SlotConfigResponseDTO convertToResponseDTO(SlotConfiguration config) {
        SlotConfigResponseDTO dto = new SlotConfigResponseDTO();
        dto.setStartTime(config.getStartTime());
        dto.setEndTime(config.getEndTime());
        dto.setSlotDuration(config.getSlotDuration());
        dto.setMaxSlotsPerInterval(config.getMaxSlotsPerInterval());
        dto.setUsedSlots(config.getUsedSlots());
        dto.setSlotPrice(config.getSlotPrice());
        return dto;
    }

    private List<SlotIntervalResponseDTO> convertToIntervalDTOs(List<SlotInterval> intervals) {
        return intervals.stream()
            .map(interval -> {
                SlotIntervalResponseDTO dto = new SlotIntervalResponseDTO();
                dto.setConfigId(interval.getConfiguration().getId());
                dto.setStartTime(interval.getStartTime());
                dto.setEndTime(interval.getEndTime());
                dto.setMaxSlots(interval.getMaxSlots());
                dto.setUsedSlots(interval.getUsedSlots());
                dto.setAvailableSlots(interval.getMaxSlots() - interval.getUsedSlots());
                dto.setPrice(interval.getPrice());
                return dto;
            })
            .collect(Collectors.toList());
    }
}