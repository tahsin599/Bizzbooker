// package com.tahsin.backend.Controller;

// import com.tahsin.backend.Model.*;
// import com.tahsin.backend.Repository.BusinessLocationRepository;
// import com.tahsin.backend.Repository.BusinessRepository;
// import com.tahsin.backend.Repository.SlotIntervalRepository;
// import com.tahsin.backend.Repository.UserRepository;
// import com.tahsin.backend.Service.*;
// import com.tahsin.backend.dto.AppointmentDTO;
// import com.tahsin.backend.dto.AppointmentResponseDTO;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.data.domain.Page;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.time.LocalDateTime;

// @RestController
// @RequestMapping("/api/appointments")
// public class AppointmentController {

//     @Autowired
//     private AppointmentService appointmentService;

//     @Autowired
//     private UserRepository userService;

//     @Autowired
//     private BusinessRepository businessService;

//     @Autowired
//     private BusinessLocationRepository locationService;

//     @Autowired
//     private SlotIntervalRepository repo;
//     @Autowired
//     private ReviewService reviewService;

    

    

//     @PostMapping
//     public ResponseEntity<Appointment> createAppointment(@RequestBody AppointmentDTO appointmentDTO) {
//         try {
//             // Validate required fields
//             if (appointmentDTO.getCustomerId() == null ||
//                 appointmentDTO.getBusinessId() == null ||
//                 appointmentDTO.getLocationId() == null ||
//                 appointmentDTO.getStartTime() == null ||
//                 appointmentDTO.getEndTime() == null) {
//                 return ResponseEntity.badRequest().build();
//             }

//             // Fetch related entities
//             User customer = userService.findById(appointmentDTO.getCustomerId())
//                 .orElseThrow(() -> new RuntimeException("Customer not found"));
//             Business business = businessService.findById(appointmentDTO.getBusinessId())
//                 .orElseThrow(() -> new RuntimeException("Business not found"));
//             BusinessLocation location = locationService.findById(appointmentDTO.getLocationId())
//                 .orElseThrow(() -> new RuntimeException("Location not found"));

//             // Create new appointment
//             Appointment appointment = new Appointment();
//             appointment.setCustomer(customer);
//             appointment.setBusiness(business);
//             appointment.setLocation(location);
//             appointment.setStartTime(appointmentDTO.getStartTime());
//             appointment.setEndTime(appointmentDTO.getEndTime());
//             appointment.setStatus(AppointmentStatus.PENDING);
            
//             repo.findByConfigurationIdAndStartTime(
//                     appointmentDTO.getConfigId(),
//                     appointmentDTO.getStartTime().toLocalTime())
//                 .ifPresent(interval -> {
                    
//                     interval.setUsedSlots(interval.getUsedSlots() + appointmentDTO.getUserSelectedCount());
//                     repo.save(interval);
//                 });

            
//             // Set optional service if provided
           

//             // Set optional notes if provided
//             if (appointmentDTO.getNotes() != null) {
//                 appointment.setNotes(appointmentDTO.getNotes());
//             }

//             // Save the appointment
//             Appointment savedAppointment = appointmentService.save(appointment);

//             return ResponseEntity.ok(savedAppointment);
//         } catch (Exception e) {
//             return ResponseEntity.internalServerError().build();
//         }
//     }

//     @GetMapping("/user/{userId}")
// public ResponseEntity<Page<AppointmentResponseDTO>> getUserAppointments(
//         @PathVariable Long userId,
//         @RequestParam(defaultValue = "0") int page,
//         @RequestParam(defaultValue = "15") int size) {
    
//     Page<Appointment> appointments = appointmentService.getAppointmentsByUser(userId, page, size);
    
//     // Convert Page<Appointment> to Page<AppointmentResponseDTO>
//     Page<AppointmentResponseDTO> responseDTOs = appointments.map(appointment -> {
//         AppointmentResponseDTO dto = new AppointmentResponseDTO();
//         Review existingReview = reviewService.findByAppointmentId(appointment.getId());
//         if(existingReview != null) {
//             dto.setReviewGiven(true);
//         } else {
//             dto.setReviewGiven(false);
//         }
//         dto.setAppointmentId(appointment.getId());
//         dto.setStatus(appointment.getStatus().toString());
        
//         // Safely handle nested entities that might be null
//         dto.setLocationName(appointment.getLocation() != null ? appointment.getLocation().getArea() : null);
//         dto.setBusinessName(appointment.getBusiness() != null ? appointment.getBusiness().getBusinessName() : null);
//         dto.setStartTime(appointment.getStartTime());
//         dto.setEndTime(appointment.getEndTime());
        
//         // Add any additional fields you want to include
//         if (appointment.getService() != null) {
//             dto.setServiceName(appointment.getService().getName());
//         }
//         if (appointment.getCustomer() != null) {
//             dto.setCustomerName(appointment.getCustomer().getName());
//         }
        
//         return dto;
//     });
    
//     return ResponseEntity.ok(responseDTOs);
// }






// }
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

import java.util.Map;
import java.util.HashMap;

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
    private com.tahsin.backend.Repository.PaymentRepository paymentRepository;
    @Autowired
    private ReviewService reviewService;

    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody AppointmentDTO appointmentDTO) {
        try {
            System.out.println("[APPOINTMENT] Incoming DTO: " + appointmentDTO);
            // Validate required fields
            if (appointmentDTO.getCustomerId() == null ||
                appointmentDTO.getBusinessId() == null ||
                appointmentDTO.getLocationId() == null ||
                appointmentDTO.getStartTime() == null ||
                appointmentDTO.getEndTime() == null ||
                appointmentDTO.getPaymentReference() == null) {
                System.out.println("[APPOINTMENT] Missing required fields: " + appointmentDTO);
                return ResponseEntity.badRequest().body(new ErrorResponse("Missing required fields"));
            }

            System.out.println("[DEBUG] Checking payment reference: " + appointmentDTO.getPaymentReference());
            com.tahsin.backend.Model.Payment payment = paymentRepository.findByTransactionId(appointmentDTO.getPaymentReference())
                .orElse(paymentRepository.findByStripePaymentIntentId(appointmentDTO.getPaymentReference()).orElse(null));
            System.out.println("[DEBUG] Payment found: " + payment);
            if (payment != null && payment.getAppointment() != null) {
                System.out.println("[APPOINTMENT] Duplicate paymentReference, not inserting: " + payment.getAppointment());
                return ResponseEntity.ok(payment.getAppointment());
            }

            // Fetch related entities
            User customer = userService.findById(appointmentDTO.getCustomerId())
                .orElse(null);
            if (customer == null) {
                System.out.println("[ERROR] Customer not found for ID: " + appointmentDTO.getCustomerId());
                return ResponseEntity.status(404).body(new ErrorResponse("Customer not found for ID: " + appointmentDTO.getCustomerId()));
            }
            Business business = businessService.findById(appointmentDTO.getBusinessId())
                .orElse(null);
            if (business == null) {
                System.out.println("[ERROR] Business not found for ID: " + appointmentDTO.getBusinessId());
                return ResponseEntity.status(404).body(new ErrorResponse("Business not found for ID: " + appointmentDTO.getBusinessId()));
            }
            BusinessLocation location = locationService.findById(appointmentDTO.getLocationId())
                .orElse(null);
            if (location == null) {
                System.out.println("[ERROR] Location not found for ID: " + appointmentDTO.getLocationId());
                return ResponseEntity.status(404).body(new ErrorResponse("Location not found for ID: " + appointmentDTO.getLocationId()));
            }

            // Get slot price from the slot interval
            Double slotPrice = 0.0;
            SlotInterval slotInterval = null;
            if (appointmentDTO.getConfigId() != null) {
                slotInterval = repo.findByConfigurationIdAndStartTime(
                        appointmentDTO.getConfigId(),
                        appointmentDTO.getStartTime().toLocalTime())
                    .orElse(null);
                if (slotInterval != null) {
                    slotPrice = slotInterval.getPrice();
                }
            }

            // Check if slot is available before creating appointment
            if (slotInterval != null) {
                if (slotInterval.getUsedSlots() + appointmentDTO.getUserSelectedCount() > slotInterval.getMaxSlots()) {
                    return ResponseEntity.status(400).body(new ErrorResponse("Slot is fully booked"));
                }
                slotInterval.setUsedSlots(slotInterval.getUsedSlots() + appointmentDTO.getUserSelectedCount());
                repo.save(slotInterval);
            }

            // Create new appointment
            Appointment appointment = new Appointment();
            appointment.setCustomer(customer);
            appointment.setBusiness(business);
            appointment.setLocation(location);
            appointment.setStartTime(appointmentDTO.getStartTime());
            appointment.setEndTime(appointmentDTO.getEndTime());
            appointment.setStatus(AppointmentStatus.PENDING);
            appointment.setSlotPrice(slotPrice); // Store the slot price in the appointment

            // Set optional notes if provided
            if (appointmentDTO.getNotes() != null) {
                appointment.setNotes(appointmentDTO.getNotes());
            }

            // Only create appointment and payment if not already present
            if (payment == null) {
                // Save the appointment
                Appointment savedAppointment = appointmentService.save(appointment);
                System.out.println("[APPOINTMENT] After save: " + savedAppointment);
                payment = new com.tahsin.backend.Model.Payment();
                payment.setAppointment(savedAppointment);
                payment.setAmountPaid(java.math.BigDecimal.valueOf(slotPrice));
                payment.setAmount(java.math.BigDecimal.valueOf(slotPrice));
                payment.setPaymentMethod("stripe");
                payment.setStatus(com.tahsin.backend.Model.PaymentStatus.COMPLETED);
                payment.setTransactionId(appointmentDTO.getPaymentReference());
                payment.setStripePaymentIntentId(appointmentDTO.getPaymentReference());
                paymentRepository.save(payment);
                System.out.println("[APPOINTMENT] Registered: " + savedAppointment);
                
                // Return a safe DTO instead of the full entity
                AppointmentResponseDTO responseDTO = new AppointmentResponseDTO();
                responseDTO.setAppointmentId(savedAppointment.getId());
                responseDTO.setStatus(savedAppointment.getStatus().toString());
                responseDTO.setLocationName(savedAppointment.getLocation() != null ? savedAppointment.getLocation().getArea() : null);
                responseDTO.setBusinessName(savedAppointment.getBusiness() != null ? savedAppointment.getBusiness().getBusinessName() : null);
                responseDTO.setStartTime(savedAppointment.getStartTime());
                responseDTO.setEndTime(savedAppointment.getEndTime());
                responseDTO.setSlotPrice(savedAppointment.getSlotPrice());
                if (savedAppointment.getCustomer() != null) {
                    responseDTO.setCustomerName(savedAppointment.getCustomer().getName());
                }
                
                return ResponseEntity.ok(responseDTO);
            } else if (payment.getAppointment() == null) {
                // Link payment to appointment if not already linked
                Appointment savedAppointment = appointmentService.save(appointment);
                System.out.println("[APPOINTMENT] After save: " + savedAppointment);
                payment.setAppointment(savedAppointment);
                paymentRepository.save(payment);
                System.out.println("[APPOINTMENT] Registered: " + savedAppointment);
                
                // Return a safe DTO instead of the full entity
                AppointmentResponseDTO responseDTO = new AppointmentResponseDTO();
                responseDTO.setAppointmentId(savedAppointment.getId());
                responseDTO.setStatus(savedAppointment.getStatus().toString());
                responseDTO.setLocationName(savedAppointment.getLocation() != null ? savedAppointment.getLocation().getArea() : null);
                responseDTO.setBusinessName(savedAppointment.getBusiness() != null ? savedAppointment.getBusiness().getBusinessName() : null);
                responseDTO.setStartTime(savedAppointment.getStartTime());
                responseDTO.setEndTime(savedAppointment.getEndTime());
                responseDTO.setSlotPrice(savedAppointment.getSlotPrice());
                if (savedAppointment.getCustomer() != null) {
                    responseDTO.setCustomerName(savedAppointment.getCustomer().getName());
                }
                
                return ResponseEntity.ok(responseDTO);
            } else {
                // Duplicate, return existing appointment as DTO
                System.out.println("[APPOINTMENT] Duplicate paymentReference, not inserting: " + payment.getAppointment());
                Appointment existingAppointment = payment.getAppointment();
                
                AppointmentResponseDTO responseDTO = new AppointmentResponseDTO();
                responseDTO.setAppointmentId(existingAppointment.getId());
                responseDTO.setStatus(existingAppointment.getStatus().toString());
                responseDTO.setLocationName(existingAppointment.getLocation() != null ? existingAppointment.getLocation().getArea() : null);
                responseDTO.setBusinessName(existingAppointment.getBusiness() != null ? existingAppointment.getBusiness().getBusinessName() : null);
                responseDTO.setStartTime(existingAppointment.getStartTime());
                responseDTO.setEndTime(existingAppointment.getEndTime());
                responseDTO.setSlotPrice(existingAppointment.getSlotPrice());
                if (existingAppointment.getCustomer() != null) {
                    responseDTO.setCustomerName(existingAppointment.getCustomer().getName());
                }
                
                return ResponseEntity.ok(responseDTO);
            }
        } catch (Exception e) {
            System.out.println("[EXCEPTION] " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }

    // Error response DTO for clear error messages
    public static class ErrorResponse {
        private String error;
        
        public ErrorResponse(String error) { 
            this.error = error; 
        }
        
        public String getError() { 
            return error; 
        }
        
        public void setError(String error) { 
            this.error = error; 
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
        
        // Set the slot price from the appointment
        dto.setSlotPrice(appointment.getSlotPrice());
        
        return dto;
    });
    
    return ResponseEntity.ok(responseDTOs);
}

@PatchMapping("/{appointmentId}/status")
public ResponseEntity<?> updateAppointmentStatus(
        @PathVariable Long appointmentId,
        @RequestParam String status) {
    try {
        System.out.println("[APPOINTMENT] Received status update request for ID: " + appointmentId + " to status: " + status);
        
        AppointmentStatus appointmentStatus = AppointmentStatus.valueOf(status.toUpperCase());
        System.out.println("[APPOINTMENT] Parsed status enum: " + appointmentStatus);
        
        Appointment updatedAppointment = appointmentService.updateStatus(appointmentId, appointmentStatus);
        System.out.println("[APPOINTMENT] Status updated successfully for ID " + appointmentId + " to " + status);
        System.out.println("[APPOINTMENT] Updated appointment details: " + updatedAppointment.toString());
        
        // Return a safe DTO instead of the full entity to avoid JSON serialization issues
        AppointmentResponseDTO responseDTO = new AppointmentResponseDTO();
        responseDTO.setAppointmentId(updatedAppointment.getId());
        responseDTO.setStatus(updatedAppointment.getStatus().toString());
        responseDTO.setLocationName(updatedAppointment.getLocation() != null ? updatedAppointment.getLocation().getArea() : null);
        responseDTO.setBusinessName(updatedAppointment.getBusiness() != null ? updatedAppointment.getBusiness().getBusinessName() : null);
        responseDTO.setStartTime(updatedAppointment.getStartTime());
        responseDTO.setEndTime(updatedAppointment.getEndTime());
        responseDTO.setSlotPrice(updatedAppointment.getSlotPrice());
        if (updatedAppointment.getCustomer() != null) {
            responseDTO.setCustomerName(updatedAppointment.getCustomer().getName());
        }
        
        System.out.println("[APPOINTMENT] Returning response DTO with status: " + responseDTO.getStatus());
        return ResponseEntity.ok(responseDTO);
    } catch (IllegalArgumentException e) {
        System.out.println("[ERROR] Invalid status provided: " + status);
        return ResponseEntity.badRequest().body(new ErrorResponse("Invalid status: " + status));
    } catch (RuntimeException e) {
        System.out.println("[ERROR] Appointment not found for ID: " + appointmentId);
        return ResponseEntity.status(404).body(new ErrorResponse("Appointment not found"));
    } catch (Exception e) {
        System.out.println("[EXCEPTION] Error updating appointment status: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.status(500).body(new ErrorResponse("Internal Server Error: " + e.getMessage()));
    }
}

@PostMapping("/pending")
public ResponseEntity<?> createPendingAppointment(@RequestBody AppointmentDTO appointmentDTO) {
    try {
        System.out.println("[APPOINTMENT] Creating pending appointment: " + appointmentDTO);
        // Validate required fields (no payment reference needed for pending)
        if (appointmentDTO.getCustomerId() == null ||
            appointmentDTO.getBusinessId() == null ||
            appointmentDTO.getLocationId() == null ||
            appointmentDTO.getStartTime() == null ||
            appointmentDTO.getEndTime() == null) {
            System.out.println("[APPOINTMENT] Missing required fields: " + appointmentDTO);
            return ResponseEntity.badRequest().body(new ErrorResponse("Missing required fields"));
        }

        // Fetch related entities
        User customer = userService.findById(appointmentDTO.getCustomerId())
            .orElse(null);
        if (customer == null) {
            System.out.println("[ERROR] Customer not found for ID: " + appointmentDTO.getCustomerId());
            return ResponseEntity.status(404).body(new ErrorResponse("Customer not found for ID: " + appointmentDTO.getCustomerId()));
        }
        Business business = businessService.findById(appointmentDTO.getBusinessId())
            .orElse(null);
        if (business == null) {
            System.out.println("[ERROR] Business not found for ID: " + appointmentDTO.getBusinessId());
            return ResponseEntity.status(404).body(new ErrorResponse("Business not found for ID: " + appointmentDTO.getBusinessId()));
        }
        BusinessLocation location = locationService.findById(appointmentDTO.getLocationId())
            .orElse(null);
        if (location == null) {
            System.out.println("[ERROR] Location not found for ID: " + appointmentDTO.getLocationId());
            return ResponseEntity.status(404).body(new ErrorResponse("Location not found for ID: " + appointmentDTO.getLocationId()));
        }

        // Get slot price from the slot interval
        Double slotPrice = 0.0;
        SlotInterval slotInterval = null;
        if (appointmentDTO.getConfigId() != null) {
            slotInterval = repo.findByConfigurationIdAndStartTime(
                    appointmentDTO.getConfigId(),
                    appointmentDTO.getStartTime().toLocalTime())
                .orElse(null);
            if (slotInterval != null) {
                slotPrice = slotInterval.getPrice();
            }
        }

        // Check if slot is available before creating appointment
        if (slotInterval != null) {
            if (slotInterval.getUsedSlots() + appointmentDTO.getUserSelectedCount() > slotInterval.getMaxSlots()) {
                return ResponseEntity.status(400).body(new ErrorResponse("Slot is fully booked"));
            }
            slotInterval.setUsedSlots(slotInterval.getUsedSlots() + appointmentDTO.getUserSelectedCount());
            repo.save(slotInterval);
        }

        // Create new pending appointment
        Appointment appointment = new Appointment();
        appointment.setCustomer(customer);
        appointment.setBusiness(business);
        appointment.setLocation(location);
        appointment.setStartTime(appointmentDTO.getStartTime());
        appointment.setEndTime(appointmentDTO.getEndTime());
        appointment.setStatus(AppointmentStatus.PENDING);
        appointment.setSlotPrice(slotPrice*appointmentDTO.getUserSelectedCount());

        // Set optional notes if provided
        if (appointmentDTO.getNotes() != null) {
            appointment.setNotes(appointmentDTO.getNotes());
        }

        // Save the pending appointment
        Appointment savedAppointment = appointmentService.save(appointment);
        System.out.println("[APPOINTMENT] Pending appointment created: " + savedAppointment);
        System.out.println("[APPOINTMENT] Saved appointment ID: " + savedAppointment.getId());
        
        // Return a simple response with just the ID to avoid any serialization issues
        Map<String, Object> response = new HashMap<>();
        response.put("appointmentId", savedAppointment.getId());
        response.put("status", savedAppointment.getStatus().toString());
        response.put("startTime", savedAppointment.getStartTime());
        response.put("endTime", savedAppointment.getEndTime());
        response.put("slotPrice", savedAppointment.getSlotPrice());
        
        // Safely get related entity data
        try {
            if (savedAppointment.getLocation() != null) {
                response.put("locationName", savedAppointment.getLocation().getArea());
            }
        } catch (Exception e) {
            System.out.println("[WARNING] Could not get location name: " + e.getMessage());
        }
        
        try {
            if (savedAppointment.getBusiness() != null) {
                response.put("businessName", savedAppointment.getBusiness().getBusinessName());
            }
        } catch (Exception e) {
            System.out.println("[WARNING] Could not get business name: " + e.getMessage());
        }
        
        try {
            if (savedAppointment.getCustomer() != null) {
                response.put("customerName", savedAppointment.getCustomer().getName());
            }
        } catch (Exception e) {
            System.out.println("[WARNING] Could not get customer name: " + e.getMessage());
        }
        
        System.out.println("[APPOINTMENT] Returning response: " + response);
        return ResponseEntity.ok(response);

    } catch (Exception e) {
        System.out.println("[EXCEPTION] " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.status(500).body(new ErrorResponse("Internal Server Error: " + e.getMessage()));
    }
}

@GetMapping("/{appointmentId}")
    public ResponseEntity<?> getAppointmentById(@PathVariable Long appointmentId) {
        try {
            Appointment appointment = appointmentService.getById(appointmentId);
            
            // Return a safe DTO instead of the full entity
            AppointmentResponseDTO responseDTO = new AppointmentResponseDTO();
            responseDTO.setAppointmentId(appointment.getId());
            responseDTO.setStatus(appointment.getStatus().toString());
            responseDTO.setLocationName(appointment.getLocation() != null ? appointment.getLocation().getArea() : null);
            responseDTO.setBusinessName(appointment.getBusiness() != null ? appointment.getBusiness().getBusinessName() : null);
            responseDTO.setStartTime(appointment.getStartTime());
            responseDTO.setEndTime(appointment.getEndTime());
            responseDTO.setSlotPrice(appointment.getSlotPrice());
            if (appointment.getCustomer() != null) {
                responseDTO.setCustomerName(appointment.getCustomer().getName());
            }
            
            return ResponseEntity.ok(responseDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(new ErrorResponse("Appointment not found"));
        } catch (Exception e) {
            System.out.println("[EXCEPTION] " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}/bookings")
    public ResponseEntity<Page<AppointmentResponseDTO>> getUserBookings(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startTime") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        
        try {
            System.out.println("[BOOKINGS] Fetching bookings for user " + userId + 
                " - page: " + page + ", size: " + size + ", status: " + status + ", search: " + search);
            
            Page<Appointment> appointments = appointmentService.getAppointmentsByUserWithFilters(
                userId, page, size, sort, direction, status, search);
            
            // Convert Page<Appointment> to Page<AppointmentResponseDTO>
            Page<AppointmentResponseDTO> responseDTOs = appointments.map(appointment -> {
                AppointmentResponseDTO dto = new AppointmentResponseDTO();
                dto.setAppointmentId(appointment.getId());
                dto.setStatus(appointment.getStatus().toString());
                
                // Business information
                if (appointment.getBusiness() != null) {
                    dto.setBusinessName(appointment.getBusiness().getBusinessName());
                    dto.setBusinessId(appointment.getBusiness().getId());
                }
                
                // Location information
                if (appointment.getLocation() != null) {
                    dto.setLocationName(appointment.getLocation().getArea());
                    dto.setLocationAddress(appointment.getLocation().getAddress() + ", " + appointment.getLocation().getCity());
                }
                
                // Service information
                if (appointment.getService() != null) {
                    dto.setServiceName(appointment.getService().getName());
                }
                
                // Customer information
                if (appointment.getCustomer() != null) {
                    dto.setCustomerName(appointment.getCustomer().getName());
                }
                
                // Time and price information
                dto.setStartTime(appointment.getStartTime());
                dto.setEndTime(appointment.getEndTime());
                dto.setSlotPrice(appointment.getSlotPrice());
                
                return dto;
            });
            
            System.out.println("[BOOKINGS] Returning " + responseDTOs.getNumberOfElements() + 
                " bookings out of " + responseDTOs.getTotalElements() + " total");
            
            return ResponseEntity.ok(responseDTOs);
            
        } catch (Exception e) {
            System.out.println("[EXCEPTION] Error fetching bookings: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @PatchMapping("/{appointmentId}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long appointmentId) {
        try {
            System.out.println("[APPOINTMENT] Received cancellation request for ID: " + appointmentId);
            
            Appointment cancelledAppointment = appointmentService.cancelAppointment(appointmentId);
            System.out.println("[APPOINTMENT] Appointment cancelled successfully for ID " + appointmentId);
            
            // Return a safe DTO instead of the full entity
            AppointmentResponseDTO responseDTO = new AppointmentResponseDTO();
            responseDTO.setAppointmentId(cancelledAppointment.getId());
            responseDTO.setStatus(cancelledAppointment.getStatus().toString());
            responseDTO.setLocationName(cancelledAppointment.getLocation() != null ? cancelledAppointment.getLocation().getArea() : null);
            responseDTO.setBusinessName(cancelledAppointment.getBusiness() != null ? cancelledAppointment.getBusiness().getBusinessName() : null);
            responseDTO.setStartTime(cancelledAppointment.getStartTime());
            responseDTO.setEndTime(cancelledAppointment.getEndTime());
            responseDTO.setSlotPrice(cancelledAppointment.getSlotPrice());
            if (cancelledAppointment.getCustomer() != null) {
                responseDTO.setCustomerName(cancelledAppointment.getCustomer().getName());
            }
            
            System.out.println("[APPOINTMENT] Returning response DTO with status: " + responseDTO.getStatus());
            return ResponseEntity.ok(responseDTO);
        } catch (RuntimeException e) {
            System.out.println("[ERROR] Appointment not found for ID: " + appointmentId);
            return ResponseEntity.status(404).body(new ErrorResponse("Appointment not found"));
        } catch (Exception e) {
            System.out.println("[EXCEPTION] Error cancelling appointment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }
    
    // Cleanup endpoint to delete all cancelled appointments
    @DeleteMapping("/cleanup-cancelled")
    public ResponseEntity<?> cleanupCancelledAppointments() {
        try {
            System.out.println("[APPOINTMENT] Starting cleanup of cancelled appointments");
            appointmentService.deleteAllCancelledAppointments();
            return ResponseEntity.ok(Map.of("message", "All cancelled appointments have been deleted successfully"));
        } catch (Exception e) {
            System.out.println("[EXCEPTION] Error during cleanup: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ErrorResponse("Internal Server Error: " + e.getMessage()));
        }
    }
}
