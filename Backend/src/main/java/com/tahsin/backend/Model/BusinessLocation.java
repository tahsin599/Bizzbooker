package com.tahsin.backend.Model;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "business_locations")
public class BusinessLocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false, length = 100)
    private String area;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(length = 20)
    private String postalCode;

    @Column(nullable = false, length = 20)
    private String contactPhone;

    @Column(length = 100)
    private String contactEmail;

    private Boolean isPrimary = false;

    @CreationTimestamp
    private LocalDateTime createdAt;



    @OneToMany(mappedBy = "location", cascade = CascadeType.ALL)
    private List<BusinessLocationImage> images;

    @OneToMany(mappedBy = "location")
    private List<Appointment> appointments;

    @OneToMany(mappedBy = "location", cascade = CascadeType.ALL)
    private List<SlotConfiguration> slotConfiguration;

    public List<SlotConfiguration> getSlotConfiguration() {
        return slotConfiguration;
    }

    public void setSlotConfiguration(List<SlotConfiguration> slotConfiguration) {
        this.slotConfiguration = slotConfiguration;
    }

    public BusinessLocation(Long locationId) {
        //TODO Auto-generated constructor stub
        this.id = locationId;
    }

    public BusinessLocation() {
        //TODO Auto-generated constructor stub
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Business getBusiness() {
        return business;
    }

    public void setBusiness(Business business) {
        this.business = business;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    

    public List<BusinessLocationImage> getImages() {
        return images;
    }

    public void setImages(List<BusinessLocationImage> images) {
        this.images = images;
    }

    public List<Appointment> getAppointments() {
        return appointments;
    }

    public void setAppointments(List<Appointment> appointments) {
        this.appointments = appointments;
    }

   

    @Override
    public String toString() {
        return "BusinessLocation [id=" + id + ", business=" + business + ", address=" + address + ", area=" + area
                + ", city=" + city + ", postalCode=" + postalCode + ", contactPhone=" + contactPhone + ", contactEmail="
                + contactEmail + ", isPrimary=" + isPrimary + ", createdAt=" + createdAt  + ", images=" + images + ", appointments=" + appointments + ", slotConfiguration="
                + slotConfiguration + "]";
    }

    
}
