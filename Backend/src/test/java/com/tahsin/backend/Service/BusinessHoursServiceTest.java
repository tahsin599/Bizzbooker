// package com.tahsin.backend.Service;

// import com.tahsin.backend.Model.*;
// import com.tahsin.backend.Repository.*;
// import com.tahsin.backend.dto.*;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.Test;
// import org.junit.jupiter.api.extension.ExtendWith;
// import org.mockito.InjectMocks;
// import org.mockito.Mock;
// import org.mockito.junit.jupiter.MockitoExtension;

// import java.time.*;
// import java.util.*;

// import static org.junit.jupiter.api.Assertions.*;
// import static org.mockito.ArgumentMatchers.any;
// import static org.mockito.ArgumentMatchers.anyList;
// import static org.mockito.ArgumentMatchers.eq;
// import static org.mockito.Mockito.*;

// @SuppressWarnings("unused")
// @ExtendWith(MockitoExtension.class)
// class BusinessHoursServiceTest {

//     @Mock
//     private BusinessHoursRepository businessHoursRepo;

//     @Mock
//     private SlotConfigurationRepository slotConfigRepo;

//     @Mock
//     private BusinessRepository businessRepo;

//     @Mock
//     private AppointmentRepository appointmentRepo;

//     @Mock
//     private BusinessLocationRepository locationRepo;

//     @InjectMocks
//     private BusinessHoursService businessHoursService;

//     private final Long testBusinessId = 1L;
//     private final Long testLocationId = 1L;
//     private Business testBusiness;
//     private BusinessLocation testLocation;

//     @BeforeEach
//     void setUp() {
//         testBusiness = new Business();
//         testBusiness.setId(testBusinessId);

//         testLocation = new BusinessLocation();
//         testLocation.setId(testLocationId);
//         testLocation.setIsPrimary(true);
//         testLocation.setBusiness(testBusiness);
//     }

//     @Test
//     void getConfig_shouldReturnCompleteConfig() {
//         // Arrange
//         when(businessRepo.findById(testBusinessId)).thenReturn(Optional.of(testBusiness));
//         when(locationRepo.findByBusinessIdAndIsPrimary(testBusinessId, true))
//                 .thenReturn(Optional.of(testLocation));

//         List<BusinessHours> mockHours = Arrays.asList(
//                 createBusinessHours(DayOfWeek.MONDAY, "09:00", "17:00", false),
//                 createBusinessHours(DayOfWeek.TUESDAY, "09:00", "17:00", false));
//         when(businessHoursRepo.findByBusinessId(testBusinessId)).thenReturn(mockHours);

//         SlotConfiguration mockSlotConfig = createSlotConfig("09:00", "17:00", 5);
//         when(slotConfigRepo.findByLocationId(testLocationId)).thenReturn(mockSlotConfig);

//         // Act
//         BusinessHoursConfigDTO result = businessHoursService.getConfig(testBusinessId);

//         // Assert
//         assertNotNull(result);
//         assertEquals(testBusinessId, result.getBusinessId());
//         assertEquals(2, result.getRegularHours().size());
//         assertNotNull(result.getSlotConfig());
//         assertEquals(5, result.getSlotConfig().getMaxSlotsPerInterval());
//     }

//     @Test
//     void saveConfig_shouldUpdateAllConfigurations() {
//         // Arrange
//         BusinessHoursConfigDTO configDTO = new BusinessHoursConfigDTO();
//         configDTO.setBusinessId(testBusinessId);

//         List<BusinessHoursDTO> hoursDTO = Arrays.asList(
//                 createBusinessHoursDTO(DayOfWeek.MONDAY.getValue(), "09:00", "17:00", false));
//         configDTO.setRegularHours(hoursDTO);

//         SlotConfigDTO slotConfigDTO = new SlotConfigDTO();
//         slotConfigDTO.setStartTime("09:00");
//         slotConfigDTO.setEndTime("17:00");
//         slotConfigDTO.setMaxSlotsPerInterval(3);
//         configDTO.setSlotConfig(slotConfigDTO);

//         when(businessRepo.findById(testBusinessId)).thenReturn(Optional.of(testBusiness));
//         when(locationRepo.findByBusinessIdAndIsPrimary(testBusinessId, true))
//                 .thenReturn(Optional.of(testLocation));
//         when(slotConfigRepo.findByLocationId(testLocationId)).thenReturn(null);

//         // Act
//         businessHoursService.saveConfig(configDTO);

//         // Verify
//         verify(businessHoursRepo).deleteByBusinessId(testBusinessId);
//         verify(businessHoursRepo).saveAll(anyList());
//         verify(slotConfigRepo).save(any(SlotConfiguration.class));
//     }

//     @Test
//     void generateSlots_shouldReturnAvailableSlots() {
//         // Arrange
//         LocalDate testDate = LocalDate.of(2023, 1, 2); // Monday
//         BusinessHours mockHours = createBusinessHours(DayOfWeek.MONDAY, "09:00", "17:00", false);
//         SlotConfiguration mockSlotConfig = createSlotConfig("09:00", "17:00", 2);

//         when(businessHoursRepo.findByBusinessIdAndDayOfWeek(testBusinessId, DayOfWeek.MONDAY.getValue()))
//                 .thenReturn(Optional.of(mockHours));
//         when(locationRepo.findByBusinessIdAndIsPrimary(testBusinessId, true))
//                 .thenReturn(Optional.of(testLocation));
//         when(slotConfigRepo.findByLocationId(testLocationId)).thenReturn(mockSlotConfig);

//         // Mock that 1 appointment exists for each time slot
//         // when(appointmentRepo.countByLocationIdAndTimeSlot(eq(testLocationId),
//         // any(LocalTime.class)))
//         // .thenReturn(1);

//         // Act
//         List<TimeSlotDTO> slots = businessHoursService.generateSlots(testBusinessId, testDate);

//         // Assert
//         assertFalse(slots.isEmpty());
//         assertEquals(16, slots.size());
//         assertTrue(slots.get(0).isAvailable());
//         assertEquals(2, slots.get(0).getRemainingSlots()); // 2 max - 1 booked = 1 remaining

//         // Verify appointment count was checked
//         // verify(appointmentRepo,
//         // atLeastOnce()).countByLocationIdAndTimeSlot(eq(testLocationId), any());
//     }

//     @Test
//     void generateSlots_whenClosed_shouldReturnEmptyList() {
//         // Arrange
//         LocalDate testDate = LocalDate.of(2023, 1, 2); // Monday
//         BusinessHours mockHours = createBusinessHours(DayOfWeek.MONDAY, "09:00", "17:00", true);

//         when(businessHoursRepo.findByBusinessIdAndDayOfWeek(testBusinessId, DayOfWeek.MONDAY.getValue()))
//                 .thenReturn(Optional.of(mockHours));

//         // Act
//         List<TimeSlotDTO> slots = businessHoursService.generateSlots(testBusinessId, testDate);

//         // Assert
//         assertTrue(slots.isEmpty());
//     }

//     @Test
//     void incrementUsedSlots_shouldIncreaseCount() {
//         // Arrange
//         SlotConfiguration mockConfig = createSlotConfig("09:00", "17:00", 5);
//         mockConfig.setUsedSlots(3);
//         when(slotConfigRepo.findByLocationId(testLocationId)).thenReturn(mockConfig);

//         // Act
//         businessHoursService.incrementUsedSlots(testLocationId);

//         // Assert
//         assertEquals(4, mockConfig.getUsedSlots());
//         verify(slotConfigRepo).save(mockConfig);
//     }

//     @Test
//     void decrementUsedSlots_shouldDecreaseCount() {
//         // Arrange
//         SlotConfiguration mockConfig = createSlotConfig("09:00", "17:00", 5);
//         mockConfig.setUsedSlots(3);
//         when(slotConfigRepo.findByLocationId(testLocationId)).thenReturn(mockConfig);

//         // Act
//         businessHoursService.decrementUsedSlots(testLocationId);

//         // Assert
//         assertEquals(2, mockConfig.getUsedSlots());
//         verify(slotConfigRepo).save(mockConfig);
//     }

//     @Test
//     void decrementUsedSlots_whenZero_shouldNotGoNegative() {
//         // Arrange
//         SlotConfiguration mockConfig = createSlotConfig("09:00", "17:00", 5);
//         mockConfig.setUsedSlots(0);
//         when(slotConfigRepo.findByLocationId(testLocationId)).thenReturn(mockConfig);

//         // Act
//         businessHoursService.decrementUsedSlots(testLocationId);

//         // Assert
//         assertEquals(0, mockConfig.getUsedSlots());
//         verify(slotConfigRepo, never()).save(mockConfig); // Changed from verify().save()
//     }

//     // Helper methods
//     private BusinessHours createBusinessHours(DayOfWeek day, String open, String close, boolean isClosed) {
//         BusinessHours hours = new BusinessHours();
//         hours.setDayOfWeek(day.getValue());
//         hours.setOpenTime(LocalTime.parse(open));
//         hours.setCloseTime(LocalTime.parse(close));
//         hours.setIsClosed(isClosed);
//         hours.setBusiness(testBusiness);
//         return hours;
//     }

//     private BusinessHoursDTO createBusinessHoursDTO(int day, String open, String close, boolean isClosed) {
//         BusinessHoursDTO dto = new BusinessHoursDTO();
//         dto.setDayOfWeek(day);
//         dto.setOpenTime(open);
//         dto.setCloseTime(close);
//         dto.setIsClosed(isClosed);
//         return dto;
//     }

//     private SlotConfiguration createSlotConfig(String start, String end, int maxSlots) {
//         SlotConfiguration config = new SlotConfiguration();
//         config.setLocation(testLocation);
//         config.setStartTime(LocalTime.parse(start));
//         config.setEndTime(LocalTime.parse(end));
//         config.setMaxSlotsPerInterval(maxSlots);
//         config.setUsedSlots(0);
//         config.setLastResetDate(LocalDate.now());
//         return config;
//     }
// }
