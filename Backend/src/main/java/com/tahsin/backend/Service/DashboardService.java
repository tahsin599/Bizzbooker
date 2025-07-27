package com.tahsin.backend.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tahsin.backend.dto.DashboardStatsDto;
import com.tahsin.backend.dto.AppointmentSummaryDto;
import com.tahsin.backend.Repository.AppointmentRepository;
import com.tahsin.backend.Repository.UserRepository;
import com.tahsin.backend.Model.Appointment;
import com.tahsin.backend.Model.User;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Dashboard Service for Customer Dashboard functionality
 * 
 * This service provides dashboard-related data operations:
 * - Dashboard statistics (bookings count, pending requests)
 * - Today's appointment list
 * - User ID resolution from username (for JWT integration)
 * 
 * Compatible with current JWT authentication system.
 */
@Service
public class DashboardService {
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Get user ID by username - used for JWT token extraction
     * @param username The username from JWT token
     * @return User ID
     * @throws RuntimeException if user not found
     */
    public Long getUserIdByUsername(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found with username: " + username);
        }
        return user.getId();
    }
    
    /**
     * Get dashboard statistics for a specific customer
     * @param customerId The customer ID
     * @return DashboardStatsDto with statistics
     */
    public DashboardStatsDto getCustomerDashboardStats(Long customerId) {
        // Calculate today's date range for accurate filtering
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        
        int todayBookings = appointmentRepository.countTodayAppointmentsByUser(customerId, startOfDay, endOfDay);
        int monthlyBookings = appointmentRepository.countMonthlyAppointmentsByUser(customerId);
        int totalBookings = appointmentRepository.countTotalAppointmentsByUser(customerId);
        int pendingRequests = appointmentRepository.countPendingAppointmentsByUser(customerId);
        
        return new DashboardStatsDto(todayBookings, monthlyBookings, totalBookings, pendingRequests);
    }
    
    /**
     * Get today's appointments for a specific customer
     * @param customerId The customer ID
     * @return List of today's appointments
     */
    public List<AppointmentSummaryDto> getTodaysAppointments(Long customerId) {
        // Calculate today's date range for accurate filtering
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        
        List<Appointment> appointments = appointmentRepository.findTodayAppointmentsByUser(customerId, startOfDay, endOfDay);
        return appointments.stream()
                .map(this::convertToSummaryDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all appointments for a specific customer
     * @param customerId The customer ID
     * @return List of all appointments
     */
    public List<AppointmentSummaryDto> getAllCustomerAppointments(Long customerId) {
        List<Appointment> appointments = appointmentRepository.findAllAppointmentsByUser(customerId);
        return appointments.stream()
                .map(this::convertToSummaryDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get appointments by status for a specific customer
     * @param customerId The customer ID
     * @param status The appointment status
     * @return List of appointments with the specified status
     */
    public List<AppointmentSummaryDto> getAppointmentsByStatus(Long customerId, String status) {
        List<Appointment> appointments = appointmentRepository.findAppointmentsByUserAndStatus(customerId, status);
        return appointments.stream()
                .map(this::convertToSummaryDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Helper method to convert Appointment entity to DTO
     * Uses the enhanced AppointmentSummaryDto constructor for automatic formatting
     */
    private AppointmentSummaryDto convertToSummaryDto(Appointment appointment) {
        // Get required information with null safety
        String customerName = appointment.getCustomer() != null ? appointment.getCustomer().getName() : "Unknown Customer";
        String businessName = appointment.getBusiness() != null ? appointment.getBusiness().getBusinessName() : "Unknown Business";
        String serviceName = appointment.getService() != null ? appointment.getService().getName() : "Unknown Service";
        String status = appointment.getStatus() != null ? appointment.getStatus().toString() : "UNKNOWN";
        String locationAddress = appointment.getLocation() != null ? appointment.getLocation().getAddress() : "Unknown Location";
        
        // Use the enhanced constructor that automatically formats dates and times
        return new AppointmentSummaryDto(
                appointment.getId(),
                customerName,
                businessName,
                serviceName,
                appointment.getStartTime(),
                appointment.getEndTime(),
                status,
                locationAddress
        );
    }
}
