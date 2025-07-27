package com.tahsin.backend.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import com.tahsin.backend.Model.Appointment;
import com.tahsin.backend.Model.Review;
@Repository
@Component
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByAppointment(Appointment appointment);
    
    @Query("SELECT r FROM Review r WHERE r.appointment.business.id = :businessId ORDER BY r.createdAt DESC")
    List<Review> findByBusinessId(@Param("businessId") Long businessId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.appointment.business.id = :businessId")
    Double calculateAverageRating(@Param("businessId") Long businessId);

    @Query("SELECT r FROM Review r JOIN r.appointment a JOIN a.business b WHERE b.id = :businessId")
    Page<Review> findByBusinessId2(@Param("businessId") Long businessId, Pageable pageable);

       @Query("SELECT AVG(r.rating) FROM Review r JOIN r.appointment a WHERE a.business.id = :businessId")
    Double findAverageRatingByBusiness(@Param("businessId") Long businessId);

    @Query("SELECT COUNT(r) FROM Review r JOIN r.appointment a WHERE a.business.id = :businessId")
    Long countByBusinessId(@Param("businessId") Long businessId);

    Review findByAppointmentId(Long appointmentId);

        @Query("SELECT r FROM Review r WHERE r.appointment.business.id = :businessId AND r.businessReply IS NULL")
    Page<Review> findUnrepliedReviewsByBusinessId(@Param("businessId") Long businessId, Pageable pageable);
}
