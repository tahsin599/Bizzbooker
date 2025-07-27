package com.tahsin.backend.Service;

import com.tahsin.backend.Model.BusinessLocation;
import com.tahsin.backend.Repository.BusinessLocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;

@Service
public class LocationService {

    private final BusinessLocationRepository locationRepository;

    @Autowired
    public LocationService(BusinessLocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    @Transactional
    public BusinessLocation addLocation(BusinessLocation location) {
        // Set first location as primary if none exists
        if (location.getIsPrimary()) {
            // If new location is primary, unset existing primary
            locationRepository.unsetPrimaryLocations(location.getBusiness().getId());
        }
        
        return locationRepository.save(location);
    }

    @Transactional
    public void setPrimaryLocation(Long locationId) {
        BusinessLocation location = locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Location not found"));
        
        // Unset all primary locations for this business
        locationRepository.unsetPrimaryLocations(location.getBusiness().getId());
        
        // Set this location as primary
        location.setIsPrimary(true);
        locationRepository.save(location);
    }

    public BusinessLocation getLocationById(Long id) {
        return locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found"));
    }
}