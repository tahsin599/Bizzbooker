package com.tahsin.backend.dto;

import jakarta.persistence.Lob;

public class ReviewDTO {

    private String imageName;
    private String imageType;
    @Lob
    private byte[] imageData;
    private int rating;
    private String comment;
    private String businessReply;
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
    public int getRating() {
        return rating;
    }
    public void setRating(int rating) {
        this.rating = rating;
    }
    public String getComment() {
        return comment;
    }
    public void setComment(String comment) {
        this.comment = comment;
    }
    public String getBusinessReply() {
        return businessReply;
    }
    public void setBusinessReply(String businessReply) {
        this.businessReply = businessReply;
    }


}
