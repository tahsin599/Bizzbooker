package com.tahsin.backend.dto;

public class ServiceCategoryDTO {
    private Long id;
    private String name;

    // Constructors
    public ServiceCategoryDTO() {}

    // Getters and Setters
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
}
