package com.tahsin.backend.Service;

import com.tahsin.backend.Model.BusinessLocation;
import com.tahsin.backend.Model.BusinessLocationImage;
import com.tahsin.backend.Repository.BusinessLocationImageRepository;
import com.tahsin.backend.dto.BusinessLocationDataDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;


@SuppressWarnings("unused")
@ExtendWith(MockitoExtension.class)
public class BusinessLocationImageServiceTest {

    @Mock
    private BusinessLocationImageRepository imageRepository;

    @InjectMocks
    private BusinessLocationImageService imageService;

    private BusinessLocationImage image1;
    private BusinessLocationImage image2;
    private BusinessLocationDataDTO dto1;
    private BusinessLocationDataDTO dto2;
    private MultipartFile testFile;

    @BeforeEach
    void setUp() {
        // Setup test images
        image1 = new BusinessLocationImage();
        image1.setId(1L);
        image1.setLocation(new BusinessLocation(1L));
        image1.setImageName("image1.jpg");
        image1.setImageType("image/jpeg");
        image1.setImageData(new byte[]{0x1, 0x2});

        image2 = new BusinessLocationImage();
        image2.setId(2L);
        image2.setLocation(new BusinessLocation(1L));
        image2.setImageName("image2.png");
        image2.setImageType("image/png");
        image2.setImageData(new byte[]{0x3, 0x4});

        // Setup test DTOs
        dto1 = new BusinessLocationDataDTO(1L, "image1.jpg", "image/jpeg", new byte[]{0x1, 0x2});
        dto2 = new BusinessLocationDataDTO(2L, "image2.png", "image/png", new byte[]{0x3, 0x4});

        // Setup test file
        testFile = new MockMultipartFile(
            "testFile",
            "test.jpg",
            "image/jpeg",
            "test image content".getBytes()
        );
    }

    @Test
    void findByLocationId_ShouldReturnImages() {
        // Arrange
        when(imageRepository.findByLocationId(1L)).thenReturn(Arrays.asList(image1, image2));

        // Act
        List<BusinessLocationImage> results = imageService.findByLocationId(1L);

        // Assert
        assertEquals(2, results.size());
        assertEquals("image1.jpg", results.get(0).getImageName());
        assertEquals("image2.png", results.get(1).getImageName());
    }

    @Test
    void saveImage_ShouldStoreImageData() throws IOException {
        // Arrange
          when(imageRepository.save(argThat(img -> 
        img.getImageName().equals("test.jpg"))))
         .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        BusinessLocationImage result = imageService.saveImage(1L, testFile);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getLocation().getId());
        assertEquals(testFile.getOriginalFilename(), result.getImageName());
        assertEquals(testFile.getContentType(), result.getImageType());
        assertArrayEquals(testFile.getBytes(), result.getImageData());
    }

    @Test
    void saveImage_WithIOException_ShouldPropagateException() throws IOException {
        // Arrange
        MultipartFile corruptFile = mock(MultipartFile.class);
        when(corruptFile.getOriginalFilename()).thenReturn("corrupt.jpg");
        when(corruptFile.getContentType()).thenReturn("image/jpeg");
        when(corruptFile.getBytes()).thenThrow(new IOException("File read error"));

        // Act & Assert
        assertThrows(IOException.class, () -> {
            imageService.saveImage(1L, corruptFile);
        });
    }

    @Test
    void deleteImage_ShouldCallRepository() {
        // Arrange
        doNothing().when(imageRepository).deleteById(1L);

        // Act
        imageService.deleteImage(1L);

        // Assert
        verify(imageRepository, times(1)).deleteById(1L);
    }

    @Test
    void getLocationImageData_ShouldReturnDTOs() {
        // Arrange
        when(imageRepository.findImageDataByLocationId(1L)).thenReturn(Arrays.asList(dto1, dto2));

        // Act
        List<BusinessLocationDataDTO> results = imageService.getLocationImageData(1L);

        // Assert
        assertEquals(2, results.size());
        assertEquals("image1.jpg", results.get(0).getImageName());
        assertEquals("image2.png", results.get(1).getImageName());
    }

    @Test
    void getLocationImageData_WithNoImages_ShouldReturnEmptyList() {
        // Arrange
        when(imageRepository.findImageDataByLocationId(1L)).thenReturn(List.of());

        // Act
        List<BusinessLocationDataDTO> results = imageService.getLocationImageData(1L);

        // Assert
        assertTrue(results.isEmpty());
    }
}