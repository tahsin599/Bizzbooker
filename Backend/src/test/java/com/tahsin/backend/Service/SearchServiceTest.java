package com.tahsin.backend.Service;


import com.tahsin.backend.Model.Business;
import com.tahsin.backend.Model.BusinessLocation;
import com.tahsin.backend.Model.ServiceCategory;
import com.tahsin.backend.Repository.SearchRepository;
import com.tahsin.backend.dto.SearchResultDTO;
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

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@SuppressWarnings("unused")
@ExtendWith(MockitoExtension.class)
class SearchServiceTest {

    @Mock
    private SearchRepository searchRepository;

    @InjectMocks
    private SearchService searchService;

    private Business business1;
    private Business business2;
    private BusinessLocation location1;
    private ServiceCategory category1;

    @BeforeEach
    void setUp() {
        // Setup test businesses
        business1 = new Business();
        business1.setId(1L);
        business1.setBusinessName("Test Business 1");
        business1.setImageData(new byte[]{0x1, 0x2});

        business2 = new Business();
        business2.setId(2L);
        business2.setBusinessName("Test Business 2");
        business2.setImageData(new byte[]{0x3, 0x4});

        // Setup test location
        location1 = new BusinessLocation();
        location1.setId(1L);
        location1.setArea("Downtown");
        location1.setCity("Metropolis");
        location1.setBusiness(business1); // Belongs to business1

        // Setup test category
        category1 = new ServiceCategory();
        category1.setId(1L);
        category1.setName("Test Category");
    }

  @Test
void searchAll_ShouldReturnCombinedResults() {
    // Arrange
    Pageable pageable = PageRequest.of(0, 5);
    
    // Mock repository responses
    when(searchRepository.searchBusinesses(eq("test"), any(Pageable.class)))
        .thenReturn(new PageImpl<>(Arrays.asList(business1, business2)));
    
    when(searchRepository.searchLocations(eq("test"), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of(location1)));
    
    when(searchRepository.searchCategories(eq("test"), any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of(category1)));

    // Act
    List<SearchResultDTO> results = searchService.searchAll("test", 0, 5);

    // Assert
    assertEquals(3, results.size());
    
    // Verify business results
    SearchResultDTO businessResult1 = results.get(0);
    assertEquals(1L, businessResult1.getId());
    assertEquals("Test Business 1", businessResult1.getName()); 
    assertEquals("business", businessResult1.getType());
    assertArrayEquals(new byte[]{0x1, 0x2}, businessResult1.getImageData());
    
    
    SearchResultDTO locationResult = results.get(1);
    assertEquals(2L, locationResult.getId());
    assertEquals("Test Business 2", locationResult.getName()); 
    assertEquals(null, locationResult.getArea());
    assertEquals(null, locationResult.getCity());
    
    
    SearchResultDTO categoryResult = results.get(2);
    assertEquals(1L, categoryResult.getId());
    assertEquals("Test Category", categoryResult.getName()); // Changed from getTitle()
    assertEquals("category", categoryResult.getType());
}

    @Test
    void searchAll_ShouldHandleEmptyResults() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 5);
        
        when(searchRepository.searchBusinesses(any(), any()))
            .thenReturn(new PageImpl<>(List.of()));
        
        when(searchRepository.searchLocations(any(), any()))
            .thenReturn(new PageImpl<>(List.of()));
        
        when(searchRepository.searchCategories(any(), any()))
            .thenReturn(new PageImpl<>(List.of()));

        // Act
        List<SearchResultDTO> results = searchService.searchAll("empty", 0, 5);

        // Assert
        assertTrue(results.isEmpty());
    }

    @Test
    void searchAll_ShouldFilterDuplicateBusinesses() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 5);
        
        // Both business search and location search return the same business
        when(searchRepository.searchBusinesses(eq("duplicate"), any()))
            .thenReturn(new PageImpl<>(List.of(business1)));
        
        when(searchRepository.searchLocations(eq("duplicate"), any()))
            .thenReturn(new PageImpl<>(List.of(location1))); // location1 belongs to business1
        
        when(searchRepository.searchCategories(eq("duplicate"), any()))
            .thenReturn(new PageImpl<>(List.of()));

        // Act
        List<SearchResultDTO> results = searchService.searchAll("duplicate", 0, 5);

        // Assert
        assertEquals(1, results.size()); 
        assertEquals(1L, results.get(0).getId());
    }

    @Test
    void searchAll_ShouldHandleNullFields() {
        // Arrange
        Business businessWithNulls = new Business();
        businessWithNulls.setId(3L);
        businessWithNulls.setBusinessName("Null Business");
        
        Pageable pageable = PageRequest.of(0, 5);
        
        when(searchRepository.searchBusinesses(eq("null"), any()))
            .thenReturn(new PageImpl<>(List.of(businessWithNulls)));
        
        when(searchRepository.searchLocations(eq("null"), any()))
            .thenReturn(new PageImpl<>(List.of()));
        
        when(searchRepository.searchCategories(eq("null"), any()))
            .thenReturn(new PageImpl<>(List.of()));

        // Act
        List<SearchResultDTO> results = searchService.searchAll("null", 0, 5);

        // Assert
        assertEquals(1, results.size());
        SearchResultDTO result = results.get(0);
        assertEquals(3L, result.getId());
        assertEquals("Null Business", result.getName());
        assertNull(result.getArea());
        assertNull(result.getCity());
        assertNull(result.getImageData());
    }
}
