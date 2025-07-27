package com.tahsin.backend.Controller;

import com.tahsin.backend.Model.*;
import com.tahsin.backend.Repository.BusinessLocationRepository;
import com.tahsin.backend.Repository.BusinessRepository;
import com.tahsin.backend.Repository.SlotIntervalRepository;
import com.tahsin.backend.Repository.UserRepository;
import com.tahsin.backend.Service.*;
import com.tahsin.backend.dto.AppointmentDTO;
import com.tahsin.backend.dto.AppointmentResponseDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private UserRepository userService;

    @Autowired
    private BusinessRepository businessService;

    @Autowired
    private BusinessLocationRepository locationService;

    @Autowired
    private SlotIntervalRepository repo;
    @Autowired
    private ReviewService reviewService;

    

    

    @PostMapping
    public ResponseEntity<Appointment> createAppointment(@RequestBody AppointmentDTO appointmentDTO) {
        try {
            // Validate required fields
            if (appointmentDTO.getCustomerId() == null ||
                appointmentDTO.getBusinessId() == null ||
                appointmentDTO.getLocationId() == null ||
                appointmentDTO.getStartTime() == null ||
                appointmentDTO.getEndTime() == null) {
                return ResponseEntity.badRequest().build();
            }

            // Fetch related entities
            User customer = userService.findById(appointmentDTO.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
            Business business = businessService.findById(appointmentDTO.getBusinessId())
                .orElseThrow(() -> new RuntimeException("Business not found"));
            BusinessLocation location = locationService.findById(appointmentDTO.getLocationId())
                .orElseThrow(() -> new RuntimeException("Location not found"));

            // Create new appointment
            Appointment appointment = new Appointment();
            appointment.setCustomer(customer);
            appointment.setBusiness(business);
            appointment.setLocation(location);
            appointment.setStartTime(appointmentDTO.getStartTime());
            appointment.setEndTime(appointmentDTO.getEndTime());
            appointment.setStatus(AppointmentStatus.PENDING);
            
            repo.findByConfigurationIdAndStartTime(
                    appointmentDTO.getConfigId(),
                    appointmentDTO.getStartTime().toLocalTime())
                .ifPresent(interval -> {
                    
                    interval.setUsedSlots(interval.getUsedSlots() + appointmentDTO.getUserSelectedCount());
                    repo.save(interval);
                });

            
            // Set optional service if provided
           

            // Set optional notes if provided
            if (appointmentDTO.getNotes() != null) {
                appointment.setNotes(appointmentDTO.getNotes());
            }

            // Save the appointment
            Appointment savedAppointment = appointmentService.save(appointment);

            return ResponseEntity.ok(savedAppointment);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/user/{userId}")
public ResponseEntity<Page<AppointmentResponseDTO>> getUserAppointments(
        @PathVariable Long userId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "15") int size) {
    
    Page<Appointment> appointments = appointmentService.getAppointmentsByUser(userId, page, size);
    
    // Convert Page<Appointment> to Page<AppointmentResponseDTO>
    Page<AppointmentResponseDTO> responseDTOs = appointments.map(appointment -> {
        AppointmentResponseDTO dto = new AppointmentResponseDTO();
        Review existingReview = reviewService.findByAppointmentId(appointment.getId());
        if(existingReview != null) {
            dto.setReviewGiven(true);
        } else {
            dto.setReviewGiven(false);
        }
        dto.setAppointmentId(appointment.getId());
        dto.setStatus(appointment.getStatus().toString());
        
        // Safely handle nested entities that might be null
        dto.setLocationName(appointment.getLocation() != null ? appointment.getLocation().getArea() : null);
        dto.setBusinessName(appointment.getBusiness() != null ? appointment.getBusiness().getBusinessName() : null);
        dto.setStartTime(appointment.getStartTime());
        dto.setEndTime(appointment.getEndTime());
        
        // Add any additional fields you want to include
        if (appointment.getService() != null) {
            dto.setServiceName(appointment.getService().getName());
        }
        if (appointment.getCustomer() != null) {
            dto.setCustomerName(appointment.getCustomer().getName());
        }
        
        return dto;
    });
    
    return ResponseEntity.ok(responseDTOs);
}






}
