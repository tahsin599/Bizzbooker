package com.tahsin.backend.dto;



import com.tahsin.backend.Model.ApprovalStatus;


import java.time.LocalDateTime;
import java.util.List;


public class BusinessDTO {
    private Long id;
    private String businessName;
    private String description;
    private String imageName;
    private String imageType;
    private byte[] imageData;
    private ApprovalStatus approvalStatus;
    private Boolean isApproved;
    private LocalDateTime createdAt;
    private String categoryName;
    private List<LocationDTO> locations;
    public BusinessDTO() {
        // Default constructor
    }

    public BusinessDTO(Long id, String businessName, String description, String imageName, 
                       String imageType, byte[] imageData, ApprovalStatus approvalStatus, 
                       Boolean isApproved, LocalDateTime createdAt, String categoryName, 
                       List<LocationDTO> locations) {
        this.id = id;
        this.businessName = businessName;
        this.description = description;
        this.imageName = imageName;
        this.imageType = imageType;
        this.imageData = imageData;
        this.approvalStatus = approvalStatus;
        this.isApproved = isApproved;
        this.createdAt = createdAt;
        this.categoryName = categoryName;
        this.locations = locations;
    }
    public static class LocationDTO {
        private Long locationId;
        private String address;
        private String area;
        private String city;
        private String postalCode;
        private String contactPhone;
        private String contactEmail;
        private Boolean isPrimary;

        public LocationDTO(Long id,String address, String area, String city, 
                         String postalCode, String contactPhone, 
                         String contactEmail, Boolean isPrimary) {
            this.locationId= id;
            this.address = address;
            this.area = area;
            this.city = city;
            this.postalCode = postalCode;
            this.contactPhone = contactPhone;
            this.contactEmail = contactEmail;
            this.isPrimary = isPrimary;
        }
        public Long getLocationId() {
            return locationId;
        }
        public void setLocationId(Long locationId) {
            this.locationId = locationId;
        }

        public String getAddress() {
            return address;
        }

        public void setAddress(String address) {
            this.address = address;
        }

        public String getArea() {
            return area;
        }

        public void setArea(String area) {
            this.area = area;
        }

        public String getCity() {
            return city;
        }

        public void setCity(String city) {
            this.city = city;
        }

        public String getPostalCode() {
            return postalCode;
        }

        public void setPostalCode(String postalCode) {
            this.postalCode = postalCode;
        }

        public String getContactPhone() {
            return contactPhone;
        }

        public void setContactPhone(String contactPhone) {
            this.contactPhone = contactPhone;
        }

        public String getContactEmail() {
            return contactEmail;
        }

        public void setContactEmail(String contactEmail) {
            this.contactEmail = contactEmail;
        }

        public Boolean getIsPrimary() {
            return isPrimary;
        }

        public void setIsPrimary(Boolean isPrimary) {
            this.isPrimary = isPrimary;
        }
    }
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getBusinessName() {
        return businessName;
    }
    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public String getImageName() {
        return imageName;
    }
    public void setImageName(String imageName) {
        this.imageName = imageName;
    }
    public String getImageType() {
        return imageType;
    }
    public void setImageType(String imageType) {
        this.imageType = imageType;
    }
    public byte[] getImageData() {
        return imageData;
    }
    public void setImageData(byte[] imageData) {
        this.imageData = imageData;
    }
    public ApprovalStatus getApprovalStatus() {
        return approvalStatus;
    }
    public void setApprovalStatus(ApprovalStatus approvalStatus) {
        this.approvalStatus = approvalStatus;
    }
    public Boolean getIsApproved() {
        return isApproved;
    }
    public void setIsApproved(Boolean isApproved) {
        this.isApproved = isApproved;
    }
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    public String getCategoryName() {
        return categoryName;
    }
    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }
    public List<LocationDTO> getLocations() {
        return locations;
    }
    public void setLocations(List<LocationDTO> locations) {
        this.locations = locations;
    }
}