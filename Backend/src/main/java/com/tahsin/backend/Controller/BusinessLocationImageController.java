package com.tahsin.backend.Controller;



import com.tahsin.backend.Model.BusinessLocationImage;
import com.tahsin.backend.Service.BusinessLocationImageService;
import com.tahsin.backend.dto.BusinessLocationDataDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/locations/{locationId}/images")
public class BusinessLocationImageController {

    @Autowired
    private BusinessLocationImageService imageService;

    // Get all images for a location
    @GetMapping
    public ResponseEntity<List<BusinessLocationDataDTO>> getLocationImageData(
        @PathVariable Long locationId) {
    
        List<BusinessLocationDataDTO> imageData = imageService.getLocationImageData(locationId);
        return ResponseEntity.ok(imageData);
   }

    // Upload new image
    @PostMapping
    public BusinessLocationImage uploadImage(
            @PathVariable Long locationId,
            @RequestParam("file") MultipartFile file) throws IOException {
        return imageService.saveImage(locationId, file);
    }

    // Delete image
    @DeleteMapping("/{imageId}")
    public void deleteImage(@PathVariable Long imageId) {
        imageService.deleteImage(imageId);
    }
}