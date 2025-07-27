package com.tahsin.backend.dto;

public class UserProfileDTO {
    private Long id;
    private String name;
    private String bio;
    private String imageData; // Base64 encoded string
    private String email;
    private String role;

    // Constructors
    public UserProfileDTO() {
    }

    public UserProfileDTO(Long id, String name, String bio, String imageData, String email, String role) {
        this.id = id;
        this.name = name;
        this.bio = bio;
        this.imageData = imageData;
        this.email = email;
        this.role = role;
    }

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

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getImageData() {
        return imageData;
    }

    public void setImageData(String imageData) {
        this.imageData = imageData;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}