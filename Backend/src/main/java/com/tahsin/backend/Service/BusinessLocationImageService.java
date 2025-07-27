package com.tahsin.backend.Service;

import com.tahsin.backend.Model.BusinessLocation;
import com.tahsin.backend.Model.BusinessLocationImage;
import com.tahsin.backend.Repository.BusinessLocationImageRepository;
import com.tahsin.backend.Repository.BusinessLocationRepository;
import com.tahsin.backend.dto.BusinessLocationDataDTO;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class BusinessLocationImageService {

    @Autowired
    private BusinessLocationImageRepository imageRepository;

    public List<BusinessLocationImage> findByLocationId(Long locationId) {
        return imageRepository.findByLocationId(locationId);
    }

    public BusinessLocationImage saveImage(Long locationId, MultipartFile file) throws IOException {
        BusinessLocationImage image = new BusinessLocationImage();
        image.setLocation(new BusinessLocation(locationId)); // Just set ID, no full object
        image.setImageName(file.getOriginalFilename());
        image.setImageType(file.getContentType());
        image.setImageData(file.getBytes());
        return imageRepository.save(image);
    }

    public void deleteImage(Long imageId) {
        imageRepository.deleteById(imageId);
    }

    public List<BusinessLocationDataDTO> getLocationImageData(Long locationId) {
        return imageRepository.findImageDataByLocationId(locationId);
    }
}