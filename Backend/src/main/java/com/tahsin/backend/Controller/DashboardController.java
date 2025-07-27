package com.tahsin.backend.Controller;

import com.tahsin.backend.Service.DashboardService;
import com.tahsin.backend.Service.JWTService;
import com.tahsin.backend.dto.AppointmentSummaryDto;
import com.tahsin.backend.dto.DashboardStatsDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Dashboard Controller for Customer Dashboard APIs
 * 
 * This controller provides endpoints for customer dashboard functionality:
 * - Dashboard statistics (bookings count, pending requests)
 * - Today's appointment list
 * 
 * Compatible with current JWT authentication system.
 * User ID is extracted from JWT token for all operations.
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private JWTService jwtService;

    /**
     * Extract user ID from JWT token in Authorization header
     */
    private Long extractUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid authorization header");
        }
        
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        String username = jwtService.extractUsername(token);
        
        // Get user ID from username - you may need to adjust this based on your UserService
        return dashboardService.getUserIdByUsername(username);
    }

    /**
     * Get dashboard statistics for authenticated user
     * 
     * Returns:
     * - Today's bookings count
     * - This month's bookings count  
     * - Total bookings count
     * - Pending requests count
     * 
     * @param authHeader JWT token in Authorization header
     * @return DashboardStatsDto with all statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats(@RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            DashboardStatsDto stats = dashboardService.getCustomerDashboardStats(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized or invalid token"));
        }
    }

    /**
     * Alternative endpoint using path variable for user ID (follows your current pattern)
     * 
     * @param userId User ID from path variable
     * @param authHeader JWT token for validation
     * @return DashboardStatsDto with all statistics
     */
    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<?> getDashboardStatsByUserId(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            // Validate that the token belongs to the requested user
            Long tokenUserId = extractUserIdFromToken(authHeader);
            if (!tokenUserId.equals(userId)) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }
            
            DashboardStatsDto stats = dashboardService.getCustomerDashboardStats(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized or invalid token"));
        }
    }

    /**
     * Get today's appointments for authenticated user
     * 
     * @param authHeader JWT token in Authorization header
     * @return List of AppointmentSummaryDto with formatted fields
     */
    @GetMapping("/appointments/today")
    public ResponseEntity<?> getTodaysAppointments(@RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            List<AppointmentSummaryDto> appointments = dashboardService.getTodaysAppointments(userId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized or invalid token"));
        }
    }

    /**
     * Get today's appointments using path variable (follows your current pattern)
     * 
     * @param userId User ID from path variable
     * @param authHeader JWT token for validation
     * @return List of AppointmentSummaryDto
     */
    @GetMapping("/user/{userId}/appointments/today")
    public ResponseEntity<?> getTodaysAppointmentsByUserId(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            // Validate that the token belongs to the requested user
            Long tokenUserId = extractUserIdFromToken(authHeader);
            if (!tokenUserId.equals(userId)) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }
            
            List<AppointmentSummaryDto> appointments = dashboardService.getTodaysAppointments(userId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized or invalid token"));
        }
    }

    /**
     * Get all appointments for authenticated user
     * 
     * @param status Optional status filter (CONFIRMED, PENDING, CANCELLED, COMPLETED)
     * @param authHeader JWT token in Authorization header
     * @return List of AppointmentSummaryDto
     */
    @GetMapping("/appointments")
    public ResponseEntity<?> getAllAppointments(
            @RequestParam(required = false) String status,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = extractUserIdFromToken(authHeader);
            
            List<AppointmentSummaryDto> appointments;
            if (status != null && !status.isEmpty()) {
                appointments = dashboardService.getAppointmentsByStatus(userId, status);
            } else {
                appointments = dashboardService.getAllCustomerAppointments(userId);
            }
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized or invalid token"));
        }
    }

    /**
     * Get all appointments using path variable (follows your current pattern)
     * 
     * @param userId User ID from path variable
     * @param status Optional status filter
     * @param authHeader JWT token for validation
     * @return List of AppointmentSummaryDto
     */
    @GetMapping("/user/{userId}/appointments")
    public ResponseEntity<?> getAllAppointmentsByUserId(
            @PathVariable Long userId,
            @RequestParam(required = false) String status,
            @RequestHeader("Authorization") String authHeader) {
        try {
            // Validate that the token belongs to the requested user
            Long tokenUserId = extractUserIdFromToken(authHeader);
            if (!tokenUserId.equals(userId)) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }
            
            List<AppointmentSummaryDto> appointments;
            if (status != null && !status.isEmpty()) {
                appointments = dashboardService.getAppointmentsByStatus(userId, status);
            } else {
                appointments = dashboardService.getAllCustomerAppointments(userId);
            }
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized or invalid token"));
        }
    }

    /**
     * Health check endpoint for dashboard service
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Dashboard service is running");
    }
}
