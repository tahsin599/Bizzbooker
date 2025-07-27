package com.tahsin.backend.Controller;


import com.tahsin.backend.Model.BusinessHours;
import com.tahsin.backend.Model.SlotConfiguration;
import com.tahsin.backend.Model.SlotInterval;
import com.tahsin.backend.Model.BusinessLocation;
import com.tahsin.backend.Model.Business;
import com.tahsin.backend.Service.BusinessHoursService;
import com.tahsin.backend.Service.SlotConfigService;
import com.tahsin.backend.Service.SlotIntervalService;
import com.tahsin.backend.Repository.BusinessLocationRepository;
import com.tahsin.backend.Repository.BusinessRepository;
import com.tahsin.backend.dto.BusinessHoursDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/business-hours")
public class BusinessHoursController {

    @Autowired
    private BusinessHoursService businessHoursService;

    @Autowired
    private SlotConfigService slotConfigService;

    @Autowired
    private SlotIntervalService slotIntervalService;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private BusinessLocationRepository businessLocationRepository;

    @PostMapping("/{businessId}/weekly")
    public ResponseEntity<List<BusinessHoursDTO>> saveWeeklyBusinessHours(
            @PathVariable Long businessId,
            @RequestBody List<BusinessHoursDTO> weeklyHoursDTO) {
        
        // Convert DTOs to entities for service layer
        List<BusinessHours> entities = weeklyHoursDTO.stream()
            .map(this::convertToEntity)
            .collect(Collectors.toList());
        
        // Service works with entities
        List<BusinessHours> savedEntities = businessHoursService.saveWeeklyBusinessHours(businessId, entities);
        
        // Convert back to DTOs for response
        List<BusinessHoursDTO> responseDTOs = savedEntities.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(responseDTOs);
    }

    @GetMapping("/{businessId}/weekly")
    public ResponseEntity<List<BusinessHoursDTO>> getWeeklyBusinessHours(
            @PathVariable Long businessId) {
        
        // Service returns entities
        List<BusinessHours> entities = businessHoursService.findWeeklyByBusinessId(businessId);
        
        // Convert to DTOs in controller
        List<BusinessHoursDTO> dtos = entities.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(dtos);
    }

    // @GetMapping("/generate-slots/{businessId}")
    // public ResponseEntity<List<Map<String, Object>>> generateSlots(
    //         @PathVariable Long businessId,
    //         @RequestParam String date) {
        
    //     try {
    //         List<Map<String, Object>> slots = new ArrayList<>();
            
    //         // Get all business locations for this business
    //         Business business = businessRepository.findById(businessId)
    //             .orElseThrow(() -> new RuntimeException("Business not found"));
    //         List<BusinessLocation> locations = businessLocationRepository.findByBusiness(business);
            
    //         if (locations.isEmpty()) {
    //             return ResponseEntity.ok(slots);
    //         }
            
    //         // For now, use the first location (you might want to support multiple locations later)
    //         BusinessLocation location = locations.get(0);
            
    //         try {
    //             // Get slot configuration for this location
    //             SlotConfiguration config = slotConfigService.getByLocationId(location.getId());
                
    //             // Get all slot intervals for this configuration
    //             List<SlotInterval> intervals = slotIntervalService.getIntervalsByConfigId(config.getId());
                
    //             // Convert intervals to frontend-friendly slot data
    //             for (SlotInterval interval : intervals) {
    //                 Map<String, Object> slot = new HashMap<>();
    //                 slot.put("time", interval.getStartTime().toString());
    //                 slot.put("endTime", interval.getEndTime().toString());
    //                 slot.put("price", interval.getPrice());
    //                 slot.put("configId", config.getId());
    //                 slot.put("available", interval.getUsedSlots() < interval.getMaxSlots());
    //                 slot.put("availableSlots", interval.getMaxSlots() - interval.getUsedSlots());
    //                 slot.put("maxSlots", interval.getMaxSlots());
    //                 slot.put("usedSlots", interval.getUsedSlots());
                    
    //                 slots.add(slot);
    //             }
                
    //         } catch (RuntimeException e) {
    //             // If no slot configuration found, return empty slots list
    //             System.out.println("No slot configuration found for location: " + location.getId());
    //         }
            
    //         return ResponseEntity.ok(slots);
            
    //     } catch (Exception e) {
    //         e.printStackTrace();
    //         return ResponseEntity.internalServerError().build();
    //     }
    // }

    private BusinessHours convertToEntity(BusinessHoursDTO dto) {
        BusinessHours entity = new BusinessHours();
        entity.setDayOfWeek(dto.getDayOfWeek());
        entity.setOpenTime(LocalTime.parse(dto.getOpenTime()));
        entity.setCloseTime(LocalTime.parse(dto.getCloseTime()));
        entity.setIsClosed(dto.getIsClosed());
        return entity;
    }

    private BusinessHoursDTO convertToDTO(BusinessHours entity) {
        BusinessHoursDTO dto = new BusinessHoursDTO();
        dto.setDayOfWeek(entity.getDayOfWeek());
        dto.setOpenTime(entity.getOpenTime().toString());
        dto.setCloseTime(entity.getCloseTime().toString());
        dto.setIsClosed(entity.getIsClosed());
        return dto;
    }
}