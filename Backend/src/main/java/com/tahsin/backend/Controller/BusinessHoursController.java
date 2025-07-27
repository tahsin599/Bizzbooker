package com.tahsin.backend.Controller;


import com.tahsin.backend.Model.BusinessHours;
import com.tahsin.backend.Service.BusinessHoursService;
import com.tahsin.backend.dto.BusinessHoursDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/business-hours")
public class BusinessHoursController {

    @Autowired
    private BusinessHoursService businessHoursService;

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