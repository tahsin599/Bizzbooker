package com.tahsin.backend.Service;

import com.tahsin.backend.Model.*;
import com.tahsin.backend.Repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BusinessServiceTest {

    @Mock
    private BusinessRepository businessRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BusinessLocationRepository locationRepository;

    @Mock
    private ServiceCategoryRepository categoryRepository;
    
    @Mock
    private NotificationService notificationService;
    @InjectMocks
    private BusinessService businessService;

    private User testUser;
    private ServiceCategory testCategory;
    private Business testBusiness;
    private BusinessLocation testLocation;
    private MultipartFile testImage;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);

        testCategory = new ServiceCategory();
        testCategory.setId(1L);
        testCategory.setName("Test Category");

        testBusiness = new Business();
        testBusiness.setId(1L);
        testBusiness.setBusinessName("Test Business");
        testBusiness.setOwner(testUser);
        testBusiness.setServiceCategory(testCategory);

        testLocation = new BusinessLocation();
        testLocation.setId(1L);
        testLocation.setBusiness(testBusiness);
        testLocation.setIsPrimary(true);

        testImage = new MockMultipartFile(
            "test.jpg",
            "test.jpg",
            "image/jpeg",
            "test image content".getBytes()
        );
    }

    @Test
    void businessNameExists_ShouldReturnTrueWhenExists() {
        when(businessRepository.existsByBusinessName("Existing Business"))
            .thenReturn(true);

        assertTrue(businessService.businessNameExists("Existing Business"));
    }

    @Test
    void registerBusiness_ShouldCreateNewBusiness() throws IOException {
        // Arrange
        when(categoryRepository.findByName("Test Category"))
            .thenReturn(Optional.of(testCategory));
        when(userRepository.findById(1L))
            .thenReturn(Optional.of(testUser));
        when(businessRepository.save(any(Business.class)))
            .thenReturn(testBusiness);
        

        // Act
        Business result = businessService.registerBusiness(
            1L, "Test Business", "Description", "Test Category", testImage,
            "123 Street", "Downtown", "City", "12345", "1234567890", "test@email.com"
        );

        // Assert
        assertNotNull(result);
        assertEquals("Test Business", result.getBusinessName());
        assertEquals(ApprovalStatus.PENDING, result.getApprovalStatus());
        assertFalse(result.getIsApproved());
        verify(businessRepository, times(1)).save(any(Business.class));
        //verify(locationRepository, times(1)).save(any(BusinessLocation.class));
    }

    @SuppressWarnings("unused")
    @Test
    void registerBusiness_ShouldCreateNewCategoryWhenNotFound() throws IOException {
        // Arrange
        when(categoryRepository.findByName("New Category"))
            .thenReturn(Optional.empty());
        when(categoryRepository.save(any(ServiceCategory.class)))
            .thenReturn(testCategory);
        when(userRepository.findById(1L))
            .thenReturn(Optional.of(testUser));
        when(businessRepository.save(any(Business.class)))
            .thenReturn(testBusiness);
        // when(locationRepository.save(any(BusinessLocation.class)))
        //     .thenReturn(testLocation);

        // Act
        Business result = businessService.registerBusiness(
            1L, "Test Business", "Description", "New Category", testImage,
            "123 Street", "Downtown", "City", "12345", "1234567890", "test@email.com"
        );

        // Assert
        verify(categoryRepository, times(1)).save(any(ServiceCategory.class));
    }

    @Test
    void getBusinessesByOwnerIdWithDetails_ShouldReturnBusinesses() {
        // Arrange
        when(businessRepository.findByOwnerIdWithDetails(1L))
            .thenReturn(Arrays.asList(testBusiness));

        // Act
        List<Business> result = businessService.getBusinessesByOwnerIdWithDetails(1L);

        // Assert
        assertEquals(1, result.size());
        assertEquals("Test Business", result.get(0).getBusinessName());
    }

    @Test
    void getBusinessById_ShouldReturnBusiness() {
        // Arrange
        when(businessRepository.findById(1L))
            .thenReturn(Optional.of(testBusiness));

        // Act
        Business result = businessService.getBusinessById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    void getBusinessById_ShouldThrowWhenNotFound() {
        // Arrange
        when(businessRepository.findById(99L))
            .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            businessService.getBusinessById(99L);
        });
    }

    @Test
    void findBusinessesForCustomers_ShouldFilterByCategoryAndArea() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        when(businessRepository.findByServiceCategoryIdAndLocationsArea(1L, "Downtown", pageable))
            .thenReturn(new PageImpl<>(List.of(testBusiness)));

        // Act
        Page<Business> result = businessService.findBusinessesForCustomers(1L, "Downtown", pageable);

        // Assert
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void findRandomBusinesses_ShouldReturnRequestedCount() {
        // Arrange
        when(businessRepository.findRandomBusinesses(3))
            .thenReturn(Arrays.asList(testBusiness));

        // Act
        List<Business> result = businessService.findRandomBusinesses(3);

        // Assert
        assertEquals(1, result.size());
    }

    @Test
    void getAllCategories_ShouldReturnAllCategories() {
        // Arrange
        when(categoryRepository.findAll())
            .thenReturn(Arrays.asList(testCategory));

        // Act
        List<ServiceCategory> result = businessService.getAllCategories();

        // Assert
        assertEquals(1, result.size());
        assertEquals("Test Category", result.get(0).getName());
    }
}