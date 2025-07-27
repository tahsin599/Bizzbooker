package com.tahsin.backend.dto;

import java.time.LocalDateTime;

import jakarta.persistence.Lob;

public class BusinessLocationDataDTO {
    private String imageName;
    private byte[] imageData;
    private String imageType;
    private Long id;

    // Constructors
    public BusinessLocationDataDTO() {}

    public BusinessLocationDataDTO(String imageName, byte[] imageData, String imageType,Long id) {
        this.imageName = imageName;
        this.imageData = imageData;
        this.imageType = imageType;
        this.id=id;
    }

    public BusinessLocationDataDTO(long l, String string, String string2, byte[] bs) {
        //TODO Auto-generated constructor stub
        this.id = l;
        this.imageName = string;
        this.imageType = string2;
        this.imageData = bs;
    }

    // Getters and Setters
    public String getImageName() {
        return imageName;
    }

    public void setImageName(String imageName) {
        this.imageName = imageName;
    }

    public byte[] getImageData() {
        return imageData;
    }

    public void setImageData(byte[] imageData) {
        this.imageData = imageData;
    }

    public String getImageType() {
        return imageType;
    }

    public void setImageType(String imageType) {
        this.imageType = imageType;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}