package com.tahsin.backend.Service;

import java.time.LocalDateTime;
import java.util.List;


import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.tahsin.backend.Model.Appointment;
import com.tahsin.backend.Model.AppointmentStatus;
import com.tahsin.backend.Repository.AppointmentRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class AppointmentCompletionService {
    
    private final AppointmentRepository appointmentRepository;
    
    // Constructor-based dependency injection
    public AppointmentCompletionService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }
    
    @Scheduled(cron = "0 * * * * *") // Runs every minute
    public void completePastAppointments() {
        LocalDateTime now = LocalDateTime.now();
        List<Appointment> appointments = appointmentRepository.findAppointmentsToComplete(now);
        
        appointments.forEach(appointment -> {
            appointment.setStatus(AppointmentStatus.COMPLETED);
            // Add any additional completion logic here
        });
        
        appointmentRepository.saveAll(appointments);
        
        if (!appointments.isEmpty()) {
            
        }
    }
}