package com.tahsin.backend.Controller;

import com.tahsin.backend.Service.SearchService;
import com.tahsin.backend.dto.SearchResultDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SearchControllerTest {

    @Mock
    private SearchService searchService;

    @InjectMocks
    private SearchController searchController;

    private SearchResultDTO result1;
    private SearchResultDTO result2;

    @BeforeEach
    void setUp() {
        result1 = new SearchResultDTO();
        result1.setId(1L);
        result1.setName("Test Business 1");
        result1.setType("business");

        result2 = new SearchResultDTO();
        result2.setId(2L);
        result2.setName("Test Service 1");
        result2.setType("service");
    }

    @Test
    void search_ShouldReturnResultsWithDefaultPagination() {
        // Arrange
        List<SearchResultDTO> mockResults = Arrays.asList(result1, result2);
        when(searchService.searchAll(eq("test"), eq(0), eq(5)))
            .thenReturn(mockResults);

        // Act
        ResponseEntity<List<SearchResultDTO>> response = 
            searchController.search("test", 0, 5);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(2, response.getBody().size());
        assertEquals("Test Business 1", response.getBody().get(0).getName());
        verify(searchService, times(1)).searchAll("test", 0, 5);
    }

    @Test
    void search_ShouldUseCustomPagination() {
        // Arrange
        List<SearchResultDTO> mockResults = List.of(result1);
        when(searchService.searchAll(eq("query"), eq(2), eq(10)))
            .thenReturn(mockResults);

        // Act
        ResponseEntity<List<SearchResultDTO>> response = 
            searchController.search("query", 2, 10);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
        verify(searchService, times(1)).searchAll("query", 2, 10);
    }

    @Test
    void search_WithEmptyQuery_ShouldReturnEmptyList() {
        // Arrange
        when(searchService.searchAll(eq(""), anyInt(), anyInt()))
            .thenReturn(List.of());

        // Act
        ResponseEntity<List<SearchResultDTO>> response = 
            searchController.search("", 0, 5);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertTrue(response.getBody().isEmpty());
        verify(searchService, times(1)).searchAll("", 0, 5);
    }

    @Test
    void search_WithSpecialCharacters_ShouldPassThrough() {
        // Arrange
        String specialQuery = "café & restaurant #1";
        when(searchService.searchAll(eq(specialQuery), anyInt(), anyInt()))
            .thenReturn(List.of(result1));

        // Act
        ResponseEntity<List<SearchResultDTO>> response = 
            searchController.search(specialQuery, 0, 5);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        verify(searchService, times(1)).searchAll(specialQuery, 0, 5);
    }
}
