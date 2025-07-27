// package com.tahsin.backend.Controller;

// import com.tahsin.backend.Service.BusinessHoursService;
// import com.tahsin.backend.dto.BusinessHoursConfigDTO;
// import com.tahsin.backend.dto.TimeSlotDTO;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.Test;
// import org.junit.jupiter.api.extension.ExtendWith;
// import org.mockito.InjectMocks;
// import org.mockito.Mock;
// import org.mockito.junit.jupiter.MockitoExtension;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;

// import java.time.LocalDate;
// import java.util.Arrays;
// import java.util.List;

// import static org.junit.jupiter.api.Assertions.*;
// import static org.mockito.Mockito.*;

// @ExtendWith(MockitoExtension.class)
// class BusinessHoursControllerTest {

//     @Mock
//     private BusinessHoursService businessHoursService;

//     @InjectMocks
//     private BusinessHoursController businessHoursController;

//     private final Long testBusinessId = 1L;
//     private BusinessHoursConfigDTO testConfigDTO;
//     private List<TimeSlotDTO> testTimeSlots;

//     @BeforeEach
//     void setUp() {
//         // Setup test config DTO
//         testConfigDTO = new BusinessHoursConfigDTO();
//         testConfigDTO.setBusinessId(testBusinessId);

//         // Setup test time slots
//         TimeSlotDTO slot1 = new TimeSlotDTO();
//         slot1.setTime("09:00");
//         slot1.setAvailable(true);
        
//         TimeSlotDTO slot2 = new TimeSlotDTO();
//         slot2.setTime("09:30");
//         slot2.setAvailable(true);
        
//         testTimeSlots = Arrays.asList(slot1, slot2);
//     }

//     @Test
//     void getConfig_shouldReturnBusinessHoursConfig() {
//         // Arrange
//         when(businessHoursService.getConfig(testBusinessId)).thenReturn(testConfigDTO);

//         // Act
//         ResponseEntity<BusinessHoursConfigDTO> response = 
//             businessHoursController.getConfig(testBusinessId);

//         // Assert
//         assertEquals(HttpStatus.OK, response.getStatusCode());
//         assertEquals(testConfigDTO, response.getBody());
//         verify(businessHoursService).getConfig(testBusinessId);
//     }

//     @Test
//     void saveConfig_shouldCallServiceAndReturnOk() {
//         // Arrange - no mocking needed since method is void

//         // Act
//         ResponseEntity<Void> response = 
//             businessHoursController.saveConfig(testConfigDTO);

//         // Assert
//         assertEquals(HttpStatus.OK, response.getStatusCode());
//         verify(businessHoursService).saveConfig(testConfigDTO);
//     }

//     @Test
//     void generateSlots_shouldReturnTimeSlots() {
//         // Arrange
//         LocalDate testDate = LocalDate.now();
//         when(businessHoursService.generateSlots(testBusinessId, testDate))
//             .thenReturn(testTimeSlots);

//         // Act
//         ResponseEntity<List<TimeSlotDTO>> response = 
//             businessHoursController.generateSlots(testBusinessId, testDate);

//         // Assert
//         assertEquals(HttpStatus.OK, response.getStatusCode());
//         assertEquals(testTimeSlots, response.getBody());
//         verify(businessHoursService).generateSlots(testBusinessId, testDate);
//     }

//     @Test
//     void generateSlots_withInvalidDate_shouldStillCallService() {
//         // Arrange
//         LocalDate pastDate = LocalDate.now().minusDays(1);
//         when(businessHoursService.generateSlots(testBusinessId, pastDate))
//             .thenReturn(testTimeSlots);

//         // Act
//         ResponseEntity<List<TimeSlotDTO>> response = 
//             businessHoursController.generateSlots(testBusinessId, pastDate);

//         // Assert
//         assertEquals(HttpStatus.OK, response.getStatusCode());
//         verify(businessHoursService).generateSlots(testBusinessId, pastDate);
//     }

//     @Test
//     void getConfig_withInvalidBusinessId_shouldPropagateException() {
//         // Arrange
//         Long invalidId = 999L;
//         when(businessHoursService.getConfig(invalidId))
//             .thenThrow(new RuntimeException("Business not found"));

//         // Act & Assert
//         assertThrows(RuntimeException.class, () -> {
//             businessHoursController.getConfig(invalidId);
//         });
//         verify(businessHoursService).getConfig(invalidId);
//     }
// }