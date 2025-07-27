package com.tahsin.backend.Controller;

import com.tahsin.backend.Model.BusinessLocation;
import com.tahsin.backend.Service.BusinessService;
import com.tahsin.backend.Service.LocationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@SuppressWarnings("unused")
@ExtendWith(MockitoExtension.class)
class LocationControllerTest {

    @Mock
    private LocationService locationService;

    @Mock
    private BusinessService businessService;

    @InjectMocks
    private LocationController locationController;

    private BusinessLocation testLocation;

    @BeforeEach
    void setUp() {
        testLocation = new BusinessLocation();
        testLocation.setId(1L);
        testLocation.setAddress("123 Main St");
        testLocation.setCity("Springfield");
        testLocation.setIsPrimary(false);
    }

    @Test
    void addLocation_ShouldReturnSavedLocation() {
        // Arrange
        when(locationService.addLocation(any(BusinessLocation.class)))
            .thenReturn(testLocation);

        // Act
        ResponseEntity<?> response = locationController.addLocation("Bearer token", testLocation);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof BusinessLocation);
        assertEquals(testLocation.getId(), ((BusinessLocation) response.getBody()).getId());
        verify(locationService, times(1)).addLocation(testLocation);
    }

    @Test
    void setPrimaryLocation_ShouldReturnSuccessMessage() {
        // Arrange
        doNothing().when(locationService).setPrimaryLocation(anyLong());

        // Act
        ResponseEntity<?> response = locationController.setPrimaryLocation("Bearer token", 1L);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof Map);
        assertEquals("Primary location updated successfully", 
                    ((Map<?, ?>) response.getBody()).get("message"));
        verify(locationService, times(1)).setPrimaryLocation(1L);
    }

    @Test
    void setPrimaryLocation_WithInvalidId_ShouldStillCallService() {
        // Arrange
        doNothing().when(locationService).setPrimaryLocation(anyLong());

        // Act
        ResponseEntity<?> response = locationController.setPrimaryLocation("Bearer token", 999L);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        verify(locationService, times(1)).setPrimaryLocation(999L);
    }
}