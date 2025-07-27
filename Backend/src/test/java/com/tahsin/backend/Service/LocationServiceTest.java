package com.tahsin.backend.Service;

import com.tahsin.backend.Model.Business;
import com.tahsin.backend.Model.BusinessLocation;
import com.tahsin.backend.Repository.BusinessLocationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LocationServiceTest {

    @Mock
    private BusinessLocationRepository locationRepository;

    @InjectMocks
    private LocationService locationService;

    private BusinessLocation testLocation;
    private Business testBusiness;

    @BeforeEach
    void setUp() {
        testBusiness = new Business();
        testBusiness.setId(1L);

        testLocation = new BusinessLocation();
        testLocation.setId(1L);
        testLocation.setBusiness(testBusiness);
        testLocation.setIsPrimary(false);
    }

    @Test
    void addLocation_ShouldSaveNewLocation() {
        // Arrange
        when(locationRepository.save(any(BusinessLocation.class))).thenReturn(testLocation);

        // Act
        BusinessLocation result = locationService.addLocation(testLocation);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(locationRepository, times(1)).save(testLocation);
    }

    @Test
    void addLocation_WithPrimaryTrue_ShouldUnsetExistingPrimary() {
        // Arrange
        testLocation.setIsPrimary(true);
        when(locationRepository.save(any(BusinessLocation.class))).thenReturn(testLocation);
        doNothing().when(locationRepository).unsetPrimaryLocations(anyLong());

        // Act
        BusinessLocation result = locationService.addLocation(testLocation);

        // Assert
        assertTrue(result.getIsPrimary());
        verify(locationRepository, times(1)).unsetPrimaryLocations(1L);
        verify(locationRepository, times(1)).save(testLocation);
    }

    @Test
    void addLocation_WithPrimaryFalse_ShouldNotUnsetExistingPrimary() {
        // Arrange
        testLocation.setIsPrimary(false);
        when(locationRepository.save(any(BusinessLocation.class))).thenReturn(testLocation);

        // Act
        BusinessLocation result = locationService.addLocation(testLocation);

        // Assert
        assertFalse(result.getIsPrimary());
        verify(locationRepository, never()).unsetPrimaryLocations(anyLong());
        verify(locationRepository, times(1)).save(testLocation);
    }

    @Test
    void setPrimaryLocation_ShouldUpdatePrimaryStatus() {
        // Arrange
        when(locationRepository.findById(1L)).thenReturn(Optional.of(testLocation));
        doNothing().when(locationRepository).unsetPrimaryLocations(1L);
        when(locationRepository.save(any(BusinessLocation.class))).thenReturn(testLocation);

        // Act
        locationService.setPrimaryLocation(1L);

        // Assert
        assertTrue(testLocation.getIsPrimary());
        verify(locationRepository, times(1)).unsetPrimaryLocations(1L);
        verify(locationRepository, times(1)).save(testLocation);
    }

    @Test
    void setPrimaryLocation_WithInvalidId_ShouldThrowException() {
        // Arrange
        when(locationRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            locationService.setPrimaryLocation(99L);
        });
        verify(locationRepository, never()).unsetPrimaryLocations(anyLong());
        verify(locationRepository, never()).save(any());
    }

    @Test
    void getLocationById_ShouldReturnLocation() {
        // Arrange
        when(locationRepository.findById(1L)).thenReturn(Optional.of(testLocation));

        // Act
        BusinessLocation result = locationService.getLocationById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    void getLocationById_WithInvalidId_ShouldThrowException() {
        // Arrange
        when(locationRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            locationService.getLocationById(99L);
        });
    }
}