package com.tahsin.backend.Service;

import com.tahsin.backend.Model.Appointment;
import com.tahsin.backend.Model.AppointmentStatus;
import com.tahsin.backend.Model.Business;
import com.tahsin.backend.Model.BusinessLocation;
import com.tahsin.backend.Model.User;
import com.tahsin.backend.Repository.AppointmentRepository;
import com.tahsin.backend.Repository.UserRepository;
import com.tahsin.backend.dto.AppointmentSummaryDto;
import com.tahsin.backend.dto.DashboardStatsDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DashboardService dashboardService;

    private Long testUserId;
    private String testUsername;
    private User testUser;
    private List<Appointment> testAppointments;
    private Appointment testAppointment1;
    private Appointment testAppointment2;

    @BeforeEach
    void setUp() {
        testUserId = 1L;
        testUsername = "testuser";

        // Setup test user
        testUser = new User();
        testUser.setId(testUserId);
        testUser.setUsername(testUsername);
        testUser.setName("Test User");

        // Setup test business
        Business testBusiness = new Business();
        testBusiness.setId(1L);
        testBusiness.setBusinessName("Test Business");

        // Setup test location
        BusinessLocation testLocation = new BusinessLocation();
        testLocation.setId(1L);
        testLocation.setAddress("123 Test St");

        // Setup test appointments
        testAppointment1 = new Appointment();
        testAppointment1.setId(1L);
        testAppointment1.setCustomer(testUser);
        testAppointment1.setBusiness(testBusiness);
        testAppointment1.setLocation(testLocation);
        testAppointment1.setStartTime(LocalDateTime.now().plusHours(2));
        testAppointment1.setEndTime(LocalDateTime.now().plusHours(3));
        testAppointment1.setStatus(AppointmentStatus.CONFIRMED);

        testAppointment2 = new Appointment();
        testAppointment2.setId(2L);
        testAppointment2.setCustomer(testUser);
        testAppointment2.setBusiness(testBusiness);
        testAppointment2.setLocation(testLocation);
        testAppointment2.setStartTime(LocalDateTime.now().plusHours(4));
        testAppointment2.setEndTime(LocalDateTime.now().plusHours(5));
        testAppointment2.setStatus(AppointmentStatus.PENDING);

        testAppointments = Arrays.asList(testAppointment1, testAppointment2);
    }

    // =================== getUserIdByUsername TESTS ===================

    @Test
    void getUserIdByUsername_Success() {
        // Arrange
        when(userRepository.findByUsername(testUsername)).thenReturn(testUser);

        // Act
        Long result = dashboardService.getUserIdByUsername(testUsername);

        // Assert
        assertEquals(testUserId, result);
        verify(userRepository).findByUsername(testUsername);
    }

    @Test
    void getUserIdByUsername_UserNotFound() {
        // Arrange
        when(userRepository.findByUsername(testUsername)).thenReturn(null);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> dashboardService.getUserIdByUsername(testUsername));
        assertEquals("User not found with username: " + testUsername, exception.getMessage());
        verify(userRepository).findByUsername(testUsername);
    }

    @Test
    void getUserIdByUsername_NullUsername() {
        // Arrange
        String nullUsername = null;
        when(userRepository.findByUsername(nullUsername)).thenReturn(null);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> dashboardService.getUserIdByUsername(nullUsername));
        assertEquals("User not found with username: null", exception.getMessage());
    }

    // =================== getCustomerDashboardStats TESTS ===================

    @Test
    void getCustomerDashboardStats_Success() {
        // Arrange
        when(appointmentRepository.countTodayAppointmentsByUser(eq(testUserId), any(), any())).thenReturn(3);
        when(appointmentRepository.countMonthlyAppointmentsByUser(testUserId)).thenReturn(15);
        when(appointmentRepository.countTotalAppointmentsByUser(testUserId)).thenReturn(50);
        when(appointmentRepository.countPendingAppointmentsByUser(testUserId)).thenReturn(2);

        // Act
        DashboardStatsDto result = dashboardService.getCustomerDashboardStats(testUserId);

        // Assert
        assertNotNull(result);
        assertEquals(3, result.todayBookings());
        assertEquals(15, result.monthlyBookings());
        assertEquals(50, result.totalBookings());
        assertEquals(2, result.pendingRequests());

        verify(appointmentRepository).countTodayAppointmentsByUser(eq(testUserId), any(), any());
        verify(appointmentRepository).countMonthlyAppointmentsByUser(testUserId);
        verify(appointmentRepository).countTotalAppointmentsByUser(testUserId);
        verify(appointmentRepository).countPendingAppointmentsByUser(testUserId);
    }

    @Test
    void getCustomerDashboardStats_NoAppointments() {
        // Arrange
        when(appointmentRepository.countTodayAppointmentsByUser(eq(testUserId), any(), any())).thenReturn(0);
        when(appointmentRepository.countMonthlyAppointmentsByUser(testUserId)).thenReturn(0);
        when(appointmentRepository.countTotalAppointmentsByUser(testUserId)).thenReturn(0);
        when(appointmentRepository.countPendingAppointmentsByUser(testUserId)).thenReturn(0);

        // Act
        DashboardStatsDto result = dashboardService.getCustomerDashboardStats(testUserId);

        // Assert
        assertNotNull(result);
        assertEquals(0, result.todayBookings());
        assertEquals(0, result.monthlyBookings());
        assertEquals(0, result.totalBookings());
        assertEquals(0, result.pendingRequests());
    }

    @Test
    void getCustomerDashboardStats_RepositoryException() {
        // Arrange
        when(appointmentRepository.countTodayAppointmentsByUser(eq(testUserId), any(), any()))
            .thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        assertThrows(RuntimeException.class, 
            () -> dashboardService.getCustomerDashboardStats(testUserId));
    }

    // =================== getTodaysAppointments TESTS ===================

    @Test
    void getTodaysAppointments_Success() {
        // Arrange
        when(appointmentRepository.findTodayAppointmentsByUser(eq(testUserId), any(), any()))
            .thenReturn(testAppointments);

        // Act
        List<AppointmentSummaryDto> result = dashboardService.getTodaysAppointments(testUserId);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        
        AppointmentSummaryDto firstAppointment = result.get(0);
        assertEquals(1L, firstAppointment.id());
        assertEquals("Test User", firstAppointment.customerName());
        assertEquals("Test Business", firstAppointment.businessName());
        assertEquals("CONFIRMED", firstAppointment.status());
        assertEquals("123 Test St", firstAppointment.locationAddress());

        verify(appointmentRepository).findTodayAppointmentsByUser(eq(testUserId), any(), any());
    }

    @Test
    void getTodaysAppointments_EmptyList() {
        // Arrange
        when(appointmentRepository.findTodayAppointmentsByUser(eq(testUserId), any(), any()))
            .thenReturn(Collections.emptyList());

        // Act
        List<AppointmentSummaryDto> result = dashboardService.getTodaysAppointments(testUserId);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(appointmentRepository).findTodayAppointmentsByUser(eq(testUserId), any(), any());
    }

    @Test
    void getTodaysAppointments_NullFields() {
        // Arrange
        Appointment appointmentWithNulls = new Appointment();
        appointmentWithNulls.setId(3L);
        appointmentWithNulls.setCustomer(null);
        appointmentWithNulls.setBusiness(null);
        appointmentWithNulls.setLocation(null);
        appointmentWithNulls.setStartTime(LocalDateTime.now());
        appointmentWithNulls.setEndTime(LocalDateTime.now().plusHours(1));
        appointmentWithNulls.setStatus(null);

        when(appointmentRepository.findTodayAppointmentsByUser(eq(testUserId), any(), any()))
            .thenReturn(Collections.singletonList(appointmentWithNulls));

        // Act
        List<AppointmentSummaryDto> result = dashboardService.getTodaysAppointments(testUserId);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        
        AppointmentSummaryDto appointment = result.get(0);
        assertEquals(3L, appointment.id());
        assertEquals("Unknown Customer", appointment.customerName());
        assertEquals("Unknown Business", appointment.businessName());
        assertEquals("Unknown Service", appointment.serviceName());
        assertEquals("UNKNOWN", appointment.status());
        assertEquals("Unknown Location", appointment.locationAddress());
    }

    // =================== getAllCustomerAppointments TESTS ===================

    @Test
    void getAllCustomerAppointments_Success() {
        // Arrange
        when(appointmentRepository.findAllAppointmentsByUser(testUserId)).thenReturn(testAppointments);

        // Act
        List<AppointmentSummaryDto> result = dashboardService.getAllCustomerAppointments(testUserId);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(1L, result.get(0).id());
        assertEquals(2L, result.get(1).id());
        verify(appointmentRepository).findAllAppointmentsByUser(testUserId);
    }

    @Test
    void getAllCustomerAppointments_EmptyList() {
        // Arrange
        when(appointmentRepository.findAllAppointmentsByUser(testUserId)).thenReturn(Collections.emptyList());

        // Act
        List<AppointmentSummaryDto> result = dashboardService.getAllCustomerAppointments(testUserId);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(appointmentRepository).findAllAppointmentsByUser(testUserId);
    }

    // =================== getAppointmentsByStatus TESTS ===================

    @Test
    void getAppointmentsByStatus_Success() {
        // Arrange
        String status = "CONFIRMED";
        List<Appointment> confirmedAppointments = Collections.singletonList(testAppointment1);
        when(appointmentRepository.findAppointmentsByUserAndStatus(testUserId, status))
            .thenReturn(confirmedAppointments);

        // Act
        List<AppointmentSummaryDto> result = dashboardService.getAppointmentsByStatus(testUserId, status);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("CONFIRMED", result.get(0).status());
        verify(appointmentRepository).findAppointmentsByUserAndStatus(testUserId, status);
    }

    @Test
    void getAppointmentsByStatus_PendingStatus() {
        // Arrange
        String status = "PENDING";
        List<Appointment> pendingAppointments = Collections.singletonList(testAppointment2);
        when(appointmentRepository.findAppointmentsByUserAndStatus(testUserId, status))
            .thenReturn(pendingAppointments);

        // Act
        List<AppointmentSummaryDto> result = dashboardService.getAppointmentsByStatus(testUserId, status);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("PENDING", result.get(0).status());
        verify(appointmentRepository).findAppointmentsByUserAndStatus(testUserId, status);
    }

    @Test
    void getAppointmentsByStatus_InvalidStatus() {
        // Arrange
        String invalidStatus = "INVALID_STATUS";
        when(appointmentRepository.findAppointmentsByUserAndStatus(testUserId, invalidStatus))
            .thenReturn(Collections.emptyList());

        // Act
        List<AppointmentSummaryDto> result = dashboardService.getAppointmentsByStatus(testUserId, invalidStatus);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(appointmentRepository).findAppointmentsByUserAndStatus(testUserId, invalidStatus);
    }

    @Test
    void getAppointmentsByStatus_NullStatus() {
        // Arrange
        String nullStatus = null;
        when(appointmentRepository.findAppointmentsByUserAndStatus(testUserId, nullStatus))
            .thenReturn(Collections.emptyList());

        // Act
        List<AppointmentSummaryDto> result = dashboardService.getAppointmentsByStatus(testUserId, nullStatus);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(appointmentRepository).findAppointmentsByUserAndStatus(testUserId, nullStatus);
    }

   

    @Test
    void integrationTest_CompleteWorkflow() {
        // This test simulates the complete workflow from username to dashboard data
        
        // Arrange
        when(userRepository.findByUsername(testUsername)).thenReturn(testUser);
        when(appointmentRepository.countTodayAppointmentsByUser(eq(testUserId), any(), any())).thenReturn(2);
        when(appointmentRepository.countMonthlyAppointmentsByUser(testUserId)).thenReturn(10);
        when(appointmentRepository.countTotalAppointmentsByUser(testUserId)).thenReturn(25);
        when(appointmentRepository.countPendingAppointmentsByUser(testUserId)).thenReturn(1);
        when(appointmentRepository.findTodayAppointmentsByUser(eq(testUserId), any(), any()))
            .thenReturn(testAppointments);

        // Act
        Long userId = dashboardService.getUserIdByUsername(testUsername);
        DashboardStatsDto stats = dashboardService.getCustomerDashboardStats(userId);
        List<AppointmentSummaryDto> todaysAppointments = dashboardService.getTodaysAppointments(userId);

        // Assert
        assertEquals(testUserId, userId);
        
        assertEquals(2, stats.todayBookings());
        assertEquals(10, stats.monthlyBookings());
        assertEquals(25, stats.totalBookings());
        assertEquals(1, stats.pendingRequests());
        
        assertEquals(2, todaysAppointments.size());
        assertEquals("Test User", todaysAppointments.get(0).customerName());
        assertEquals("Test Business", todaysAppointments.get(0).businessName());

        // Verify all repository calls
        verify(userRepository).findByUsername(testUsername);
        verify(appointmentRepository).countTodayAppointmentsByUser(eq(testUserId), any(), any());
        verify(appointmentRepository).countMonthlyAppointmentsByUser(testUserId);
        verify(appointmentRepository).countTotalAppointmentsByUser(testUserId);
        verify(appointmentRepository).countPendingAppointmentsByUser(testUserId);
        verify(appointmentRepository).findTodayAppointmentsByUser(eq(testUserId), any(), any());
    }
}
