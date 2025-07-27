// package com.tahsin.backend.Service;

// import com.tahsin.backend.Model.Appointment;
// import com.tahsin.backend.Repository.AppointmentRepository;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.PageRequest;
// import org.springframework.data.domain.Pageable;
// import org.springframework.data.domain.Sort;
// import org.springframework.stereotype.Service;

// @Service
// public class AppointmentService {

//     @Autowired
//     private AppointmentRepository appointmentRepository;

//     public Appointment save(Appointment appointment) {
//         return appointmentRepository.save(appointment);
//     }

//     public Appointment getById(Long id) {
//         return appointmentRepository.findById(id)
//                 .orElseThrow(() -> new RuntimeException("Appointment not found"));
//     }

//     public Page<Appointment> getAppointmentsByUser(Long userId, int page, int size) {
//         Pageable pageable = PageRequest.of(page, size, Sort.by("startTime").descending());
//         return appointmentRepository.findByCustomerIdOrderByStartTimeDesc(userId, pageable);
//     }
    

    
// }


//     // Additional service methods would go here...
package com.tahsin.backend.Service;
import com.tahsin.backend.Model.Appointment;
import com.tahsin.backend.Model.AppointmentStatus;
import com.tahsin.backend.Model.SlotInterval;
import com.tahsin.backend.Repository.AppointmentRepository;
import com.tahsin.backend.Repository.SlotIntervalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private SlotIntervalRepository slotIntervalRepository;

    public Appointment save(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    public Appointment getById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
    }

    public Page<Appointment> getAppointmentsByUser(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("startTime").descending());
        return appointmentRepository.findByCustomerIdOrderByStartTimeDesc(userId, pageable);
    }

    public Appointment updateStatus(Long appointmentId, AppointmentStatus status) {
        System.out.println("[SERVICE] Updating appointment ID: " + appointmentId + " to status: " + status);
        Appointment appointment = getById(appointmentId);
        System.out.println("[SERVICE] Found appointment with current status: " + appointment.getStatus());
        appointment.setStatus(status);
        System.out.println("[SERVICE] Set new status to: " + appointment.getStatus());
        Appointment savedAppointment = appointmentRepository.save(appointment);
        System.out.println("[SERVICE] Saved appointment with status: " + savedAppointment.getStatus());
        return savedAppointment;
    }

    public Page<Appointment> getAppointmentsByUserWithFilters(Long userId, int page, int size, 
            String sort, String direction, String status, String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Appointment> appointments = appointmentRepository.findByCustomerIdOrderByStartTimeDesc(userId, pageable);
        return appointments;
    }

    @Transactional
    public Appointment cancelAppointment(Long appointmentId) {
        System.out.println("[SERVICE] Cancelling appointment ID: " + appointmentId);
        Appointment appointment = getById(appointmentId);
        
        // Store original status for logging
        AppointmentStatus originalStatus = appointment.getStatus();
        System.out.println("[SERVICE] Found appointment with current status: " + originalStatus);
        
        // Restore slot availability if the appointment was using slots BEFORE deleting
        try {
            restoreSlotAvailability(appointment);
            System.out.println("[SERVICE] Slot availability restored successfully");
        } catch (Exception e) {
            System.out.println("[WARNING] Failed to restore slot availability: " + e.getMessage());
            // Don't throw exception here as appointment cancellation should still succeed
        }
        
        // Delete the appointment from the database instead of just changing status
        appointmentRepository.delete(appointment);
        System.out.println("[SERVICE] Appointment deleted successfully from database");
        
        // Return the appointment object for response (it will have the original data)
        appointment.setStatus(AppointmentStatus.CANCELLED); // Set status for response purposes
        return appointment;
    }
    
    private void restoreSlotAvailability(Appointment appointment) {
        if (appointment.getStartTime() != null) {
            // Find the slot interval that was used for this appointment
            // We need to find the slot by the start time
            try {
                // Find slot interval by configuration and start time
                // First, we need to get the business location to find the slot configuration
                if (appointment.getLocation() != null) {
                    // Look for slot intervals by location and time
                    var intervals = slotIntervalRepository.findByConfigurationId(appointment.getLocation().getId());
                    
                    for (SlotInterval interval : intervals) {
                        // Check if this interval matches the appointment time
                        if (interval.getStartTime().equals(appointment.getStartTime().toLocalTime())) {
                            // Restore the slot by decrementing used slots
                            if (interval.getUsedSlots() > 0) {
                                interval.setUsedSlots(interval.getUsedSlots() - 1);
                                slotIntervalRepository.save(interval);
                                System.out.println("[SERVICE] Restored 1 slot for interval at " + interval.getStartTime());
                                break;
                            }
                        }
                    }
                }
            } catch (Exception e) {
                System.out.println("[WARNING] Could not restore slot availability: " + e.getMessage());
            }
        }
    }

    // Cleanup method to delete all cancelled appointments from database
    @Transactional
    public void deleteAllCancelledAppointments() {
        System.out.println("[SERVICE] Starting cleanup of cancelled appointments");
        List<Appointment> cancelledAppointments = appointmentRepository.findByStatus(AppointmentStatus.CANCELLED);
        
        if (!cancelledAppointments.isEmpty()) {
            System.out.println("[SERVICE] Found " + cancelledAppointments.size() + " cancelled appointments to delete");
            appointmentRepository.deleteAll(cancelledAppointments);
            System.out.println("[SERVICE] Deleted all cancelled appointments from database");
        } else {
            System.out.println("[SERVICE] No cancelled appointments found to delete");
        }
    }

    // Additional service methods would go here...
}
