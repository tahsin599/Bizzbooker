package com.tahsin.backend.Controller;

import com.tahsin.backend.Model.BusinessLocationImage;
import com.tahsin.backend.Service.BusinessLocationImageService;
import com.tahsin.backend.dto.BusinessLocationDataDTO;
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
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BusinessLocationImageControllerTest {

    @Mock
    private BusinessLocationImageService imageService;

    @InjectMocks
    private BusinessLocationImageController controller;

    private BusinessLocationDataDTO imageDto1;
    private BusinessLocationDataDTO imageDto2;
    private BusinessLocationImage savedImage;
    private MultipartFile testFile;

    @BeforeEach
    void setUp() {
        imageDto1 = new BusinessLocationDataDTO(1L, "image1.jpg", "image/jpeg", new byte[10]);
        imageDto2 = new BusinessLocationDataDTO(2L, "image2.png", "image/png", new byte[20]);
        
        savedImage = new BusinessLocationImage();
        savedImage.setId(1L);
        savedImage.setImageName("test.jpg");
        
        testFile = new MockMultipartFile(
            "testFile", 
            "test.jpg", 
            "image/jpeg", 
            "test image content".getBytes()
        );
    }

    @Test
    void getLocationImageData_ShouldReturnImages() {
        // Arrange
        List<BusinessLocationDataDTO> expectedImages = Arrays.asList(imageDto1, imageDto2);
        when(imageService.getLocationImageData(anyLong())).thenReturn(expectedImages);

        // Act
        ResponseEntity<List<BusinessLocationDataDTO>> response = controller.getLocationImageData(1L);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(2, response.getBody().size());
        verify(imageService, times(1)).getLocationImageData(1L);
    }

    @Test
    void getLocationImageData_EmptyList_ShouldReturnEmptyList() {
        // Arrange
        when(imageService.getLocationImageData(anyLong())).thenReturn(List.of());

        // Act
        ResponseEntity<List<BusinessLocationDataDTO>> response = controller.getLocationImageData(1L);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertTrue(response.getBody().isEmpty());
    }

    @Test
    void uploadImage_ShouldSaveAndReturnImage() throws IOException {
        // Arrange
        when(imageService.saveImage(anyLong(), any(MultipartFile.class))).thenReturn(savedImage);

        // Act
        BusinessLocationImage result = controller.uploadImage(1L, testFile);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(imageService, times(1)).saveImage(eq(1L), any(MultipartFile.class));
    }

    @Test
    void uploadImage_IOException_ShouldPropagateException() throws IOException {
        // Arrange
        when(imageService.saveImage(anyLong(), any(MultipartFile.class)))
            .thenThrow(new IOException("File upload failed"));

        // Act & Assert
        assertThrows(IOException.class, () -> {
            controller.uploadImage(1L, testFile);
        });
    }

    @Test
    void deleteImage_ShouldCallService() {
        // Arrange
        doNothing().when(imageService).deleteImage(anyLong());

        // Act
        controller.deleteImage(1L);

        // Assert
        verify(imageService, times(1)).deleteImage(1L);
    }

    @Test
    void deleteImage_InvalidId_ShouldPassThrough() {
        // Arrange
        doNothing().when(imageService).deleteImage(anyLong());

        // Act
        controller.deleteImage(999L);

        // Assert
        verify(imageService, times(1)).deleteImage(999L);
    }
}