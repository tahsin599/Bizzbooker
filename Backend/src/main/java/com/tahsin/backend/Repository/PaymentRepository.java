package com.tahsin.backend.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import com.tahsin.backend.Model.Appointment;
import com.tahsin.backend.Model.Payment;


@Repository
@Component
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByAppointment(Appointment appointment);
    
    @Query("SELECT p FROM Payment p WHERE p.appointment.customer.id = :userId ORDER BY p.createdAt DESC")
    List<Payment> findUserPaymentHistory(@Param("userId") Long userId);
    
    @Query("SELECT SUM(p.amountPaid) FROM Payment p WHERE p.appointment.business.id = :businessId")
    BigDecimal calculateBusinessRevenue(@Param("businessId") Long businessId);
}
