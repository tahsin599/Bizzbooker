package com.tahsin.backend.Controller;

import com.tahsin.backend.Model.BusinessLocation;
import com.tahsin.backend.Service.BusinessService;
import com.tahsin.backend.Service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationService locationService;
    private final BusinessService businessService;

    @Autowired
    public LocationController(LocationService locationService, BusinessService businessService) {
        this.locationService = locationService;
        this.businessService = businessService;
    }

    @PostMapping
    public ResponseEntity<?> addLocation(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody BusinessLocation location) {
        
       

            BusinessLocation savedLocation = locationService.addLocation(location);
            return ResponseEntity.ok(savedLocation);
      
    }

    @PutMapping("/{id}/primary")
    public ResponseEntity<?> setPrimaryLocation(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        
      

            locationService.setPrimaryLocation(id);
            return ResponseEntity.ok(Map.of("message", "Primary location updated successfully"));
            
     
    }
}
