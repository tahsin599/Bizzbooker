package com.tahsin.backend.Repository;

import com.tahsin.backend.Model.BusinessLocationImage;
import com.tahsin.backend.dto.BusinessLocationDataDTO;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusinessLocationImageRepository extends JpaRepository<BusinessLocationImage, Long> {

    // Find all images for a specific location
    List<BusinessLocationImage> findByLocationId(Long locationId);

    // Find primary image for a location (if exists)
    BusinessLocationImage findByLocationIdAndIsPrimary(Long locationId, Boolean isPrimary);

    // Count images for a location
    long countByLocationId(Long locationId);

    // Delete all images for a location
    @Modifying
    @Query("DELETE FROM BusinessLocationImage i WHERE i.location.id = :locationId")
    void deleteAllByLocationId(Long locationId);

    // Set all images as non-primary for a location
    @Modifying
    @Query("UPDATE BusinessLocationImage i SET i.isPrimary = false WHERE i.location.id = :locationId")
    void unsetPrimaryImages(Long locationId);

    // Find images by type (optional)
    List<BusinessLocationImage> findByImageType(String imageType);

    @Query("SELECT new com.tahsin.backend.dto.BusinessLocationDataDTO(bli.imageName, bli.imageData, bli.imageType,bli.id) " +
           "FROM BusinessLocationImage bli " +
           "WHERE bli.location.id = :locationId")
    List<BusinessLocationDataDTO> findImageDataByLocationId(@Param("locationId") Long locationId);
}