package com.tahsin.backend.dto;

// SearchResultDTO.java


public class SearchResultDTO {
    private Long id;
    private String name;
    private String type; // "business", "location", or "category"
    private String area;
    private String city;
    private byte[] imageData;
    
    // Constructors, getters, and setters
    public SearchResultDTO() {}
    
    public SearchResultDTO(Long id, String name, String type, String area, String city, byte[] imageData) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.area = area;
        this.city = city;
        this.imageData = imageData;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
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

    public byte[] getImageData() {
        return imageData;
    }

    public void setImageData(byte[] imageData) {
        this.imageData = imageData;
    }
    
    // Getters and setters for all fields
    // ...
}