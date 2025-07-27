package com.tahsin.backend.Controller;

import com.tahsin.backend.dto.ReviewCustomerDTO;
import com.tahsin.backend.dto.ReviewReplyRequest;
import com.tahsin.backend.dto.ReviewRequestDTO;
import com.tahsin.backend.dto.ReviewResponseDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tahsin.backend.Model.Review;
import com.tahsin.backend.Repository.ReviewRepository;
import com.tahsin.backend.Service.AppointmentService;
import com.tahsin.backend.Service.ReviewService;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    // Add methods to handle review requests
    // For example, a method to create a new review
    @Autowired
    private ReviewService reviewService;
    @Autowired
    private AppointmentService appointmentService;
    @Autowired
    private ReviewRepository reviewRepository;

    @PostMapping
    public ResponseEntity<String> createReview(@RequestBody ReviewRequestDTO reviewRequest) {
        // Logic to create a review based on the request
        // Review existingReview =
        // reviewService.findByAppointmentId(reviewRequest.getAppointmentId());
        Review newReview = new Review();

        newReview.setAppointment(appointmentService.getById(reviewRequest.getAppointmentId()));
        newReview.setRating(reviewRequest.getRating());
        newReview.setComment(reviewRequest.getComment());

        reviewService.save(newReview);
        return ResponseEntity.ok("saved");
    }

    @GetMapping("/business/{businessId}")
    public ResponseEntity<Page<ReviewCustomerDTO>> getBusinessCustomerReviews(
            @PathVariable Long businessId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<ReviewCustomerDTO> reviews = reviewService.getReviewsByBusinessCustomer(businessId, page, size);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/{businessId}")
    public ResponseEntity<Page<ReviewResponseDTO>> getBusinessReviews(
            @PathVariable Long businessId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {

        Page<ReviewResponseDTO> reviews = reviewService.getReviewsByBusiness(businessId, page, size);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/average/{businessId}")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long businessId) {
        Double averageRating = reviewService.getAverageRatingByBusiness(businessId);
        return ResponseEntity.ok(averageRating);
    }

    @PostMapping("/{reviewId}/reply")
    
    public ResponseEntity<?> submitBusinessReply(
            @PathVariable Long reviewId,
            @RequestBody ReviewReplyRequest reviewReplyRequest  // Directly accept String
    ) {

        Review review = reviewRepository.findById(reviewId).orElse(null);
        if (review == null) {
            return ResponseEntity.notFound().build();
        }
        
        review.setBusinessReply(reviewReplyRequest.getReply());
        reviewService.save(review);
        return ResponseEntity.ok("Reply submitted successfully");


    }

}
