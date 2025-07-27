package com.tahsin.backend.Controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tahsin.backend.Model.Business;
import com.tahsin.backend.Model.ServiceCategory;
import com.tahsin.backend.Service.BusinessService;
import com.tahsin.backend.dto.BusinessDTO;
import com.tahsin.backend.dto.ServiceCategoryDTO;

@RestController
@RequestMapping("/api/customer/businesses")
public class BusinessCustomerController {

    @Autowired
    private BusinessService businessService;

    @GetMapping
    public ResponseEntity<Page<BusinessDTO>> getBusinesses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String area) {
        
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Business> businesses = businessService.findBusinessesForCustomers(categoryId, area, pageable);
        
        Page<BusinessDTO> dtos = businesses.map(this::convertToDTO);
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/random")
    public ResponseEntity<List<BusinessDTO>> getRandomBusinesses(
            @RequestParam(defaultValue = "6") int count) {
        
        List<Business> businesses = businessService.findRandomBusinesses(count);
        List<BusinessDTO> dtos = businesses.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<ServiceCategoryDTO>> getAllCategories() {
        List<ServiceCategory> categories = businessService.getAllCategories();
        List<ServiceCategoryDTO> dtos = categories.stream()
                .map(this::convertCategoryToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }

    public BusinessDTO convertToDTO(Business business) {
        BusinessDTO dto = new BusinessDTO();
        dto.setId(business.getId());
        dto.setBusinessName(business.getBusinessName());
        dto.setDescription(business.getDescription());
        dto.setImageName(business.getImageName());
        dto.setImageType(business.getImageType());
        dto.setImageData(business.getImageData());
        dto.setApprovalStatus(business.getApprovalStatus());
        dto.setIsApproved(business.getIsApproved());
        dto.setCreatedAt(business.getCreatedAt());
        
        if (business.getServiceCategory() != null) {
            dto.setCategoryName(business.getServiceCategory().getName());
        }
        
        if (business.getLocations() != null) {
            List<BusinessDTO.LocationDTO> locationDTOs = business.getLocations().stream()
                    .map(location -> new BusinessDTO.LocationDTO(
                            location.getId(),
                            location.getAddress(),
                            location.getArea(),
                            location.getCity(),
                            location.getPostalCode(),
                            location.getContactPhone(),
                            location.getContactEmail(),
                            location.getIsPrimary()
                    ))
                    .collect(Collectors.toList());
            dto.setLocations(locationDTOs);
        }
        
        return dto;
    }

    public ServiceCategoryDTO convertCategoryToDTO(ServiceCategory category) {
        ServiceCategoryDTO dto = new ServiceCategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        return dto;
    }
}