package com.tahsin.backend.Controller;

import com.tahsin.backend.Service.DashboardService;
import com.tahsin.backend.Service.JWTService;
import com.tahsin.backend.dto.AppointmentSummaryDto;
import com.tahsin.backend.dto.DashboardStatsDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardControllerTest {

    @Mock
    private DashboardService dashboardService;

    @Mock
    private JWTService jwtService;

    @InjectMocks
    private DashboardController dashboardController;

    private String validAuthHeader;
    private String invalidAuthHeader;
    private String validToken;
    private String validUsername;
    private Long validUserId;
    private DashboardStatsDto testStats;
    private List<AppointmentSummaryDto> testAppointments;

    @BeforeEach
    void setUp() {
        validAuthHeader = "Bearer validtoken123";
        invalidAuthHeader = "InvalidHeader";
        validToken = "validtoken123";
        validUsername = "testuser";
        validUserId = 1L;

        // Setup test data
        testStats = new DashboardStatsDto(3, 15, 50, 2);

        testAppointments = Arrays.asList(
                new AppointmentSummaryDto(
                        1L, "John Doe", "Test Business", "Consultation",
                        LocalDateTime.now().plusHours(2), LocalDateTime.now().plusHours(3),
                        "CONFIRMED", "123 Test St"
                ),
                new AppointmentSummaryDto(
                        2L, "Jane Smith", "Another Business", "Meeting",
                        LocalDateTime.now().plusHours(4), LocalDateTime.now().plusHours(5),
                        "PENDING", "456 Another St"
                )
        );
    }

    // =================== DASHBOARD STATS TESTS ===================

    @Test
    void getDashboardStats_Success() {
        // Arrange
        when(jwtService.extractUsername(validToken)).thenReturn(validUsername);
        when(dashboardService.getUserIdByUsername(validUsername)).thenReturn(validUserId);
        when(dashboardService.getCustomerDashboardStats(validUserId)).thenReturn(testStats);

        // Act
        ResponseEntity<?> response = dashboardController.getDashboardStats(validAuthHeader);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof DashboardStatsDto);
        DashboardStatsDto responseStats = (DashboardStatsDto) response.getBody();
        assertEquals(3, responseStats.todayBookings());
        assertEquals(15, responseStats.monthlyBookings());
        assertEquals(50, responseStats.totalBookings());
        assertEquals(2, responseStats.pendingRequests());

        verify(jwtService).extractUsername(validToken);
        verify(dashboardService).getUserIdByUsername(validUsername);
        verify(dashboardService).getCustomerDashboardStats(validUserId);
    }

    @Test
    void getDashboardStats_InvalidAuthHeader() {
        // Act
        ResponseEntity<?> response = dashboardController.getDashboardStats(invalidAuthHeader);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> responseBody = (Map<?, ?>) response.getBody();
        assertEquals("Unauthorized or invalid token", responseBody.get("error"));

        verify(jwtService, never()).extractUsername(anyString());
        verify(dashboardService, never()).getUserIdByUsername(anyString());
        verify(dashboardService, never()).getCustomerDashboardStats(anyLong());
    }

    @Test
    void getDashboardStats_NullAuthHeader() {
        // Act
        ResponseEntity<?> response = dashboardController.getDashboardStats(null);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> responseBody = (Map<?, ?>) response.getBody();
        assertEquals("Unauthorized or invalid token", responseBody.get("error"));
    }

    @Test
    void getDashboardStats_JWTServiceException() {
        // Arrange
        when(jwtService.extractUsername(validToken)).thenThrow(new RuntimeException("Invalid token"));

        // Act
        ResponseEntity<?> response = dashboardController.getDashboardStats(validAuthHeader);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> responseBody = (Map<?, ?>) response.getBody();
        assertEquals("Unauthorized or invalid token", responseBody.get("error"));
    }

    @Test
    void getDashboardStats_UserNotFound() {
        // Arrange
        when(jwtService.extractUsername(validToken)).thenReturn(validUsername);
        when(dashboardService.getUserIdByUsername(validUsername))
                .thenThrow(new RuntimeException("User not found"));

        // Act
        ResponseEntity<?> response = dashboardController.getDashboardStats(validAuthHeader);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> responseBody = (Map<?, ?>) response.getBody();
        assertEquals("Unauthorized or invalid token", responseBody.get("error"));
    }

    @Test
    void getDashboardStatsByUserId_Success() {
        // Arrange
        when(jwtService.extractUsername(validToken)).thenReturn(validUsername);
        when(dashboardService.getUserIdByUsername(validUsername)).thenReturn(validUserId);
        when(dashboardService.getCustomerDashboardStats(validUserId)).thenReturn(testStats);

        // Act
        ResponseEntity<?> response = dashboardController.getDashboardStatsByUserId(validUserId, validAuthHeader);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof DashboardStatsDto);
        DashboardStatsDto responseStats = (DashboardStatsDto) response.getBody();
        assertEquals(3, responseStats.todayBookings());
    }

    @Test
    void getDashboardStatsByUserId_AccessDenied() {
        // Arrange
        Long differentUserId = 2L;
        when(jwtService.extractUsername(validToken)).thenReturn(validUsername);
        when(dashboardService.getUserIdByUsername(validUsername)).thenReturn(validUserId);

        // Act
        ResponseEntity<?> response = dashboardController.getDashboardStatsByUserId(differentUserId, validAuthHeader);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> responseBody = (Map<?, ?>) response.getBody();
        assertEquals("Access denied", responseBody.get("error"));

        verify(dashboardService, never()).getCustomerDashboardStats(anyLong());
    }

    // =================== TODAY'S APPOINTMENTS TESTS ===================

    @Test
    void getTodaysAppointments_Success() {
        // Arrange
        when(jwtService.extractUsername(validToken)).thenReturn(validUsername);
        when(dashboardService.getUserIdByUsername(validUsername)).thenReturn(validUserId);
        when(dashboardService.getTodaysAppointments(validUserId)).thenReturn(testAppointments);

        // Act
        ResponseEntity<?> response = dashboardController.getTodaysAppointments(validAuthHeader);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof List);
        @SuppressWarnings("unchecked")
        List<AppointmentSummaryDto> responseAppointments = (List<AppointmentSummaryDto>) response.getBody();
        assertEquals(2, responseAppointments.size());
        assertEquals("John Doe", responseAppointments.get(0).customerName());
        assertEquals("Test Business", responseAppointments.get(0).businessName());

        verify(dashboardService).getTodaysAppointments(validUserId);
    }

    @Test
    void getTodaysAppointments_EmptyList() {
        // Arrange
        when(jwtService.extractUsername(validToken)).thenReturn(validUsername);
        when(dashboardService.getUserIdByUsername(validUsername)).thenReturn(validUserId);
        when(dashboardService.getTodaysAppointments(validUserId)).thenReturn(Collections.emptyList());

        // Act
        ResponseEntity<?> response = dashboardController.getTodaysAppointments(validAuthHeader);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof List);
        @SuppressWarnings("unchecked")
        List<AppointmentSummaryDto> responseAppointments = (List<AppointmentSummaryDto>) response.getBody();
        assertTrue(responseAppointments.isEmpty());
    }

    @Test
    void getTodaysAppointments_InvalidToken() {
        // Act
        ResponseEntity<?> response = dashboardController.getTodaysAppointments(invalidAuthHeader);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> responseBody = (Map<?, ?>) response.getBody();
        assertEquals("Unauthorized or invalid token", responseBody.get("error"));
    }

    @Test
    void getTodaysAppointmentsByUserId_Success() {
        // Arrange
        when(jwtService.extractUsername(validToken)).thenReturn(validUsername);
        when(dashboardService.getUserIdByUsername(validUsername)).thenReturn(validUserId);
        when(dashboardService.getTodaysAppointments(validUserId)).thenReturn(testAppointments);

        // Act
        ResponseEntity<?> response = dashboardController.getTodaysAppointmentsByUserId(validUserId, validAuthHeader);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof List);
        @SuppressWarnings("unchecked")
        List<AppointmentSummaryDto> responseAppointments = (List<AppointmentSummaryDto>) response.getBody();
        assertEquals(2, responseAppointments.size());
    }

    @Test
    void getTodaysAppointmentsByUserId_AccessDenied() {
        // Arrange
        Long differentUserId = 2L;
        when(jwtService.extractUsername(validToken)).thenReturn(validUsername);
        when(dashboardService.getUserIdByUsername(validUsername)).thenReturn(validUserId);

        // Act
        ResponseEntity<?> response = dashboardController.getTodaysAppointmentsByUserId(differentUserId, validAuthHeader);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> responseBody = (Map<?, ?>) response.getBody();
        assertEquals("Access denied", responseBody.get("error"));
    }

    // =================== ALL APPOINTMENTS TESTS ===================

    @Test
    void getAllAppointments_Success_NoFilter() {
        // Arrange
        when(jwtService.extractUsername(validToken)).thenReturn(validUsername);
        when(dashboardService.getUserIdByUsername(validUsername)).thenReturn(validUserId);
        when(dashboardService.getAllCustomerAppointments(validUserId)).thenReturn(testAppointments);

        // Act
        ResponseEntity<?> response = dashboardController.getAllAppointments(null, validAuthHeader);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof List);
        @SuppressWarnings("unchecked")
        List<AppointmentSummaryDto> responseAppointments = (List<AppointmentSummaryDto>) response.getBody();
        assertEquals(2, responseAppointments.size());

        verify(dashboardService).getAllCustomerAppointments(validUserId);
        verify(dashboardService, never()).getAppointmentsByStatus(anyLong(), anyString());
    }

    @Test
    void getAllAppointments_Success_WithStatusFilter() {
        // Arrange
        String status = "CONFIRMED";
        List<AppointmentSummaryDto> filteredAppointments = Collections.singletonList(testAppointments.get(0));
        
        when(jwtService.extractUsername(validToken)).thenReturn(validUsername);
        when(dashboardService.getUserIdByUsername(validUsername)).thenReturn(validUserId);
        when(dashboardService.getAppointmentsByStatus(validUserId, status)).thenReturn(filteredAppointments);

        // Act
        ResponseEntity<?> response = dashboardController.getAllAppointments(status, validAuthHeader);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof List);
        @SuppressWarnings("unchecked")
        List<AppointmentSummaryDto> responseAppointments = (List<AppointmentSummaryDto>) response.getBody();
        assertEquals(1, responseAppointments.size());
        assertEquals("CONFIRMED", responseAppointments.get(0).status());

        verify(dashboardService).getAppointmentsByStatus(validUserId, status);
        verify(dashboardService, never()).getAllCustomerAppointments(anyLong());
    }

    @Test
    void getAllAppointments_Success_EmptyStatusFilter() {
        // Arrange
        when(jwtService.extractUsername(validToken)).thenReturn(validUsername);
        when(dashboardService.getUserIdByUsername(validUsername)).thenReturn(validUserId);
        when(dashboardService.getAllCustomerAppointments(validUserId)).thenReturn(testAppointments);

        // Act
        ResponseEntity<?> response = dashboardController.getAllAppointments("", validAuthHeader);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(dashboardService).getAllCustomerAppointments(validUserId);
        verify(dashboardService, never()).getAppointmentsByStatus(anyLong(), anyString());
    }

    @Test
    void getAllAppointments_InvalidToken() {
        // Act
        ResponseEntity<?> response = dashboardController.getAllAppointments("CONFIRMED", invalidAuthHeader);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> responseBody = (Map<?, ?>) response.getBody();
        assertEquals("Unauthorized or invalid token", responseBody.get("error"));
    }

    @Test
    void getAllAppointmentsByUserId_Success() {
        // Arrange
        when(jwtService.extractUsername(validToken)).thenReturn(validUsername);
        when(dashboardService.getUserIdByUsername(validUsername)).thenReturn(validUserId);
        when(dashboardService.getAllCustomerAppointments(validUserId)).thenReturn(testAppointments);

        // Act
        ResponseEntity<?> response = dashboardController.getAllAppointmentsByUserId(validUserId, null, validAuthHeader);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof List);
        @SuppressWarnings("unchecked")
        List<AppointmentSummaryDto> responseAppointments = (List<AppointmentSummaryDto>) response.getBody();
        assertEquals(2, responseAppointments.size());
    }

    @Test
    void getAllAppointmentsByUserId_AccessDenied() {
        // Arrange
        Long differentUserId = 2L;
        when(jwtService.extractUsername(validToken)).thenReturn(validUsername);
        when(dashboardService.getUserIdByUsername(validUsername)).thenReturn(validUserId);

        // Act
        ResponseEntity<?> response = dashboardController.getAllAppointmentsByUserId(differentUserId, "CONFIRMED", validAuthHeader);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> responseBody = (Map<?, ?>) response.getBody();
        assertEquals("Access denied", responseBody.get("error"));
    }

    // =================== HEALTH CHECK TEST ===================

    @Test
    void healthCheck_Success() {
        // Act
        ResponseEntity<String> response = dashboardController.healthCheck();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Dashboard service is running", response.getBody());
    }
}
