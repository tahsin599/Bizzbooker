package com.tahsin.backend.Service;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.tahsin.backend.Model.ApprovalStatus;
import com.tahsin.backend.Model.Business;
import com.tahsin.backend.Model.BusinessLocation;
import com.tahsin.backend.Model.ServiceCategory;
import com.tahsin.backend.Model.User;
import com.tahsin.backend.Repository.BusinessLocationRepository;
import com.tahsin.backend.Repository.BusinessRepository;
import com.tahsin.backend.Repository.ServiceCategoryRepository;
import com.tahsin.backend.Repository.UserRepository;
import com.tahsin.backend.dto.PendingBusinessDTO;

@Service
@Transactional
public class BusinessService {

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BusinessLocationRepository locationRepository;
    @Autowired
    private NotificationService notificationService;

    public boolean businessNameExists(String businessName) {
        return businessRepository.existsByBusinessName(businessName);
    }

    public Business registerBusiness(
            Long userId, String businessName, String description,
            String categoryName, MultipartFile image,
            String address, String area, String city,
            String postalCode, String contactPhone, String contactEmail) throws IOException {

        // 1. Get or create the service category
        ServiceCategory category = categoryRepository.findByName(categoryName)
                .orElseGet(() -> {
                    ServiceCategory newCategory = new ServiceCategory();
                    newCategory.setName(categoryName);
                    return categoryRepository.save(newCategory);
                });

        // 2. Get the owner
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 3. Create the business
        Business business = new Business();
        business.setOwner(owner);
        business.setBusinessName(businessName);
        business.setDescription(description);
        business.setServiceCategory(category);
        business.setApprovalStatus(ApprovalStatus.PENDING);
        business.setIsApproved(false);

        // Handle image
        if (image != null && !image.isEmpty()) {
            business.setImageName(image.getOriginalFilename());
            business.setImageType(image.getContentType());
            business.setImageData(image.getBytes());
        }

        // 4. Create the location
        BusinessLocation location = new BusinessLocation();
        location.setBusiness(business);
        location.setAddress(address);
        location.setArea(area);
        location.setCity(city);
        location.setPostalCode(postalCode);
        location.setContactPhone(contactPhone);
        location.setContactEmail(contactEmail);
        location.setIsPrimary(true);

        // 5. Set relationships and save
        business.setLocations(List.of(location));
        Business savedBusiness = businessRepository.save(business);
        notificationService.addNotification(
                "Your Business Creation request has been submitted. We will check your request and let you know our feedbacks and you will be notified if your business gets approved",
                userId, "Business Creation", business.getBusinessName());

        return savedBusiness;
    }

    public List<Business> getBusinessesByOwnerIdWithDetails(Long ownerId) {
        // TODO Auto-generated method stub
        return businessRepository.findByOwnerIdWithDetails(ownerId);
    }

    public Business getBusinessById(Long id) {
        // TODO Auto-generated method stub
        return businessRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Business not found with id: " + id));
    }

    @Autowired
    private ServiceCategoryRepository categoryRepository;

    public Page<Business> findBusinessesForCustomers(Long categoryId, String area, Pageable pageable) {
        if (categoryId != null && area != null) {
            return businessRepository.findByServiceCategoryIdAndLocationsArea(categoryId, area, pageable);
        } else if (categoryId != null) {
            return businessRepository.findByServiceCategoryId(categoryId, pageable);
        } else if (area != null) {
            return businessRepository.findByLocationsArea(area, pageable);
        }
        return businessRepository.findByApprovalStatus(ApprovalStatus.APPROVED, pageable);
    }

    public List<Business> findRandomBusinesses(int count) {
        return businessRepository.findRandomBusinesses(count);
    }

    public List<ServiceCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Page<PendingBusinessDTO> getPendingBusinesses(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Business> pendingBusinesses=businessRepository.findPendingBusinessesWithDetails(ApprovalStatus.PENDING, pageable);
        return pendingBusinesses.map(this::convertToPendingBusinessDTO);
    }

    private PendingBusinessDTO convertToPendingBusinessDTO(Business business) {
        PendingBusinessDTO dto = new PendingBusinessDTO();
        dto.setId(business.getId());
        dto.setBusinessName(business.getBusinessName());

        // Set owner information
        User owner = business.getOwner();
        if (owner != null) {
            dto.setOwnerName(owner.getName());
            dto.setEmail(owner.getEmail());
            dto.setImageName(owner.getImageName());
            dto.setImageType(owner.getImageType());
            dto.setImageData(owner.getImageData());
        }

        return dto;
    }

}
