package com.tahsin.backend.Controller;

import com.tahsin.backend.Model.Business;
import com.tahsin.backend.Service.BusinessService;
import com.tahsin.backend.dto.BusinessDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BusinessControllerTest {

    @Mock
    private BusinessService businessService;

    @InjectMocks
    private BusinessController businessController;

    private Business testBusiness;
    private BusinessDTO testBusinessDTO;
    private MultipartFile testFile;

    @BeforeEach
    void setUp() {
        testBusiness = new Business();
        testBusiness.setId(1L);
        testBusiness.setBusinessName("Test Business");
        testBusiness.setDescription("Test Description");
        
        testBusinessDTO = new BusinessDTO();
        testBusinessDTO.setId(1L);
        testBusinessDTO.setBusinessName("Test Business");
        testBusinessDTO.setDescription("Test Description");
        
        testFile = new MockMultipartFile(
            "testFile", 
            "test.png", 
            "image/png", 
            "test content".getBytes()
        );
    }

    @Test
    void registerBusiness_Success() throws IOException {
        when(businessService.businessNameExists(anyString())).thenReturn(false);
        when(businessService.registerBusiness(
            anyLong(), anyString(), anyString(), anyString(), any(MultipartFile.class),
            anyString(), anyString(), anyString(), anyString(), anyString(), anyString()
        )).thenReturn(testBusiness);

        ResponseEntity<?> response = businessController.registerBusiness(
            1L, "Test Business", "Description", "Category", testFile,
            "Address", "Area", "City", "PostalCode", "Phone", "Email"
        );

        assertEquals(200, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> responseBody = (Map<?, ?>) response.getBody();
        assertEquals("success", responseBody.get("status"));
        assertEquals(1L, responseBody.get("businessId"));
    }

    @Test
    void registerBusiness_BusinessNameExists() throws IOException {
        when(businessService.businessNameExists(anyString())).thenReturn(true);

        ResponseEntity<?> response = businessController.registerBusiness(
            1L, "Existing Business", "Description", "Category", testFile,
            "Address", "Area", "City", "PostalCode", "Phone", "Email"
        );

        assertEquals(400, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> responseBody = (Map<?, ?>) response.getBody();
        assertEquals("Business name already exists", responseBody.get("error"));
    }

    @Test
    void registerBusiness_IOException() throws IOException {
        when(businessService.businessNameExists(anyString())).thenReturn(false);
        when(businessService.registerBusiness(
            anyLong(), anyString(), anyString(), anyString(), any(MultipartFile.class),
            anyString(), anyString(), anyString(), anyString(), anyString(), anyString()
        )).thenThrow(new IOException("File processing error"));

        assertThrows(IOException.class, () -> {
            businessController.registerBusiness(
                1L, "Test Business", "Description", "Category", testFile,
                "Address", "Area", "City", "PostalCode", "Phone", "Email"
            );
        });
    }

    @Test
    void getUserBusinesses_WithResults() {
        when(businessService.getBusinessesByOwnerIdWithDetails(anyLong()))
            .thenReturn(Collections.singletonList(testBusiness));

        ResponseEntity<?> response = businessController.getUserBusinesses(1L);

        assertEquals(200, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof List);
        List<?> responseBody = (List<?>) response.getBody();
        assertEquals(1, responseBody.size());
        assertTrue(responseBody.get(0) instanceof BusinessDTO);
    }

    @Test
    void getUserBusinesses_EmptyResult() {
        when(businessService.getBusinessesByOwnerIdWithDetails(anyLong()))
            .thenReturn(Collections.emptyList());

        ResponseEntity<?> response = businessController.getUserBusinesses(1L);

        assertEquals(200, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof List);
        List<?> responseBody = (List<?>) response.getBody();
        assertTrue(responseBody.isEmpty());
    }

    @Test
    void getBusinessById_Success() {
        when(businessService.getBusinessById(anyLong())).thenReturn(testBusiness);

        ResponseEntity<?> response = businessController.getBusinessById(1L, "Bearer token");

        assertEquals(200, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof BusinessDTO);
        BusinessDTO responseBody = (BusinessDTO) response.getBody();
        assertEquals(1L, responseBody.getId());
        assertEquals("Test Business", responseBody.getBusinessName());
    }

    @Test
    void getBusinessById_NotFound() {
        when(businessService.getBusinessById(anyLong())).thenThrow(new RuntimeException("Business not found"));

        ResponseEntity<?> response = businessController.getBusinessById(99L, "Bearer token");

        assertEquals(404, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> responseBody = (Map<?, ?>) response.getBody();
        assertEquals("Business not found", responseBody.get("error"));
    }

    @Test
    void convertToDTO_CompleteConversion() {
        // Setup testBusiness with all fields populated
        testBusiness.setImageData("imageData".getBytes());
        testBusiness.setImageType("image/png");
        testBusiness.setImageName("test.png");
        
        BusinessDTO result = businessController.convertToDTO(testBusiness);
        
        assertNotNull(result);
        assertEquals(testBusiness.getId(), result.getId());
        assertEquals(testBusiness.getBusinessName(), result.getBusinessName());
        assertEquals(testBusiness.getDescription(), result.getDescription());
        assertEquals(testBusiness.getImageName(), result.getImageName());
        assertEquals(testBusiness.getImageType(), result.getImageType());
        assertArrayEquals(testBusiness.getImageData(), result.getImageData());
    }
}