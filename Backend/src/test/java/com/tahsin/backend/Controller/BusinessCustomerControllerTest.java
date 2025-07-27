package com.tahsin.backend.Controller;

import com.tahsin.backend.Model.Business;
import com.tahsin.backend.Model.ServiceCategory;
import com.tahsin.backend.Service.BusinessService;
import com.tahsin.backend.dto.BusinessDTO;
import com.tahsin.backend.dto.ServiceCategoryDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BusinessCustomerControllerTest {

    @Mock
    private BusinessService businessService;

    @InjectMocks
    private BusinessCustomerController controller;

    private Business business1;
    private Business business2;
    private ServiceCategory category1;
    private ServiceCategory category2;

    @BeforeEach
    void setUp() {
        category1 = new ServiceCategory(1L, "Category 1");
        category2 = new ServiceCategory(2L, "Category 2");

        business1 = new Business();
        business1.setId(1L);
        business1.setBusinessName("Business 1");
        business1.setServiceCategory(category1);
        business1.setCreatedAt(LocalDateTime.now());

        business2 = new Business();
        business2.setId(2L);
        business2.setBusinessName("Business 2");
        business2.setServiceCategory(category2);
        business2.setCreatedAt(LocalDateTime.now().minusDays(1));
    }

    @Test
    void getBusinesses_ShouldReturnPaginatedResults() {
        // Arrange
        Page<Business> businessPage = new PageImpl<>(Arrays.asList(business1, business2));
        when(businessService.findBusinessesForCustomers(any(), any(), any(Pageable.class)))
    .thenReturn(businessPage);

        // Act
        ResponseEntity<Page<BusinessDTO>> response = controller.getBusinesses(0, 10, null, null);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(2, response.getBody().getContent().size());
        verify(businessService, times(1))
            .findBusinessesForCustomers(null, null, PageRequest.of(0, 10, Sort.by("createdAt").descending()));
    }

    @Test
    void getBusinesses_WithFilters_ShouldApplyFilters() {
        // Arrange
        Page<Business> businessPage = new PageImpl<>(List.of(business1));
        when(businessService.findBusinessesForCustomers(eq(1L), eq("Downtown"), any(Pageable.class)))
            .thenReturn(businessPage);

        // Act
        ResponseEntity<Page<BusinessDTO>> response = controller.getBusinesses(0, 5, 1L, "Downtown");

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().getContent().size());
        verify(businessService, times(1))
            .findBusinessesForCustomers(1L, "Downtown", PageRequest.of(0, 5, Sort.by("createdAt").descending()));
    }

    @Test
    void getRandomBusinesses_ShouldReturnRequestedCount() {
        // Arrange
        when(businessService.findRandomBusinesses(6))
            .thenReturn(Arrays.asList(business1, business2));

        // Act
        ResponseEntity<List<BusinessDTO>> response = controller.getRandomBusinesses(6);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(2, response.getBody().size());
        verify(businessService, times(1)).findRandomBusinesses(6);
    }

    @Test
    void getRandomBusinesses_WithCustomCount_ShouldReturnCorrectSize() {
        // Arrange
        when(businessService.findRandomBusinesses(3))
            .thenReturn(List.of(business1));

        // Act
        ResponseEntity<List<BusinessDTO>> response = controller.getRandomBusinesses(3);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
        verify(businessService, times(1)).findRandomBusinesses(3);
    }

    @Test
    void getAllCategories_ShouldReturnAllCategories() {
        // Arrange
        when(businessService.getAllCategories())
            .thenReturn(Arrays.asList(category1, category2));

        // Act
        ResponseEntity<List<ServiceCategoryDTO>> response = controller.getAllCategories();

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(2, response.getBody().size());
        verify(businessService, times(1)).getAllCategories();
    }

    @Test
    void convertToDTO_ShouldIncludeAllFields() {
        // Act
        BusinessDTO dto = controller.convertToDTO(business1);

        // Assert
        assertEquals(business1.getId(), dto.getId());
        assertEquals(business1.getBusinessName(), dto.getBusinessName());
        assertEquals(business1.getServiceCategory().getName(), dto.getCategoryName());
        assertNotNull(dto.getCreatedAt());
    }

    @Test
    void convertCategoryToDTO_ShouldIncludeAllFields() {
        // Act
        ServiceCategoryDTO dto = controller.convertCategoryToDTO(category1);

        // Assert
        assertEquals(category1.getId(), dto.getId());
        assertEquals(category1.getName(), dto.getName());
    }
}