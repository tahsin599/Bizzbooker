package com.tahsin.backend.Service;

import com.tahsin.backend.Model.Payment;
import com.tahsin.backend.Repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    public Payment save(Payment payment) {
        try {
            return paymentRepository.save(payment);
        } catch (Exception e) {
            System.out.println("[PAYMENT SERVICE] Error saving payment: " + e.getMessage());
            throw e;
        }
    }

    public Payment getByAppointmentId(Long appointmentId) {
        try {
            Optional<Payment> payment = paymentRepository.findByAppointmentId(appointmentId);
            return payment.orElse(null);
        } catch (Exception e) {
            System.out.println("[PAYMENT SERVICE] Error finding payment by appointment ID " + appointmentId + ": " + e.getMessage());
            return null;
        }
    }

    public Payment findById(Long id) {
        try {
            Optional<Payment> payment = paymentRepository.findById(id);
            return payment.orElse(null);
        } catch (Exception e) {
            System.out.println("[PAYMENT SERVICE] Error finding payment by ID " + id + ": " + e.getMessage());
            return null;
        }
    }

    public List<Payment> findAll() {
        try {
            return paymentRepository.findAll();
        } catch (Exception e) {
            System.out.println("[PAYMENT SERVICE] Error finding all payments: " + e.getMessage());
            return List.of();
        }
    }

    public void deleteById(Long id) {
        try {
            paymentRepository.deleteById(id);
        } catch (Exception e) {
            System.out.println("[PAYMENT SERVICE] Error deleting payment by ID " + id + ": " + e.getMessage());
            throw e;
        }
    }

    public boolean existsByAppointmentId(Long appointmentId) {
        try {
            return paymentRepository.findByAppointmentId(appointmentId).isPresent();
        } catch (Exception e) {
            System.out.println("[PAYMENT SERVICE] Error checking if payment exists by appointment ID " + appointmentId + ": " + e.getMessage());
            return false;
        }
    }
}
