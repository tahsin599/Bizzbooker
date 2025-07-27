package com.tahsin.backend.Service;

import com.tahsin.backend.Model.Role;
import com.tahsin.backend.Model.User;
import com.tahsin.backend.Repository.UserRepository;
import com.tahsin.backend.dto.UserProfileDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SuppressWarnings("unused")
@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JWTService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private MultipartFile testFile;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setPassword("password");
        testUser.setEmail("test@example.com");
        testUser.setName("Test User");
        testUser.setRole(Role.CUSTOMER);

        testFile = new MockMultipartFile(
            "profile.jpg",
            "profile.jpg",
            "image/jpeg",
            "test image content".getBytes()
        );
    }

    @Test
    void register_ShouldSaveUserWithEncryptedPassword() throws IOException {
        // Arrange
        when(passwordEncoder.encode(anyString())).thenReturn("encryptedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        User result = userService.register(testUser, testFile);

        // Assert
        assertNotNull(result);
        assertEquals("encryptedPassword", result.getPassword());
        assertEquals("profile.jpg", result.getImageName());
        assertEquals("image/jpeg", result.getImageType());
        assertArrayEquals("test image content".getBytes(), result.getImageData());
        assertNotNull(result.getCreatedAt());
        assertNotNull(result.getUpdatedAt());
        
        verify(passwordEncoder, times(1)).encode("password");
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void register_WithNullFile_ShouldThrowException() {
        assertThrows(IllegalArgumentException.class, () -> {
            userService.register(testUser, null);
        });
    }

    @Test
    void verify_ShouldReturnTokenWhenAuthenticated() {
        // Arrange
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(authenticationManager.authenticate(any()))
            .thenReturn(auth);
        when(jwtService.generateToken(anyString()))
            .thenReturn("testToken");

        // Act
        String result = userService.verify(testUser);

        // Assert
        assertEquals("testToken", result);
        verify(authenticationManager, times(1))
            .authenticate(new UsernamePasswordAuthenticationToken("testuser", "password"));
    }

    @Test
    void verify_ShouldReturnFailureWhenNotAuthenticated() {
        // Arrange
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(false);
        when(authenticationManager.authenticate(any()))
            .thenReturn(auth);

        // Act
        String result = userService.verify(testUser);

        // Assert
        assertEquals("failure", result);
    }

    @Test
    void getUserByUsername_ShouldReturnUser() {
        // Arrange
        when(userRepository.findByUsername("testuser"))
            .thenReturn(testUser);

        // Act
        User result = userService.getUserByUsername("testuser");

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("testuser", result.getUsername());
    }

    @Test
    void getUserProfileByToken_ShouldReturnProfileDTO() {
        // Arrange
        when(jwtService.extractUsername("validToken"))
            .thenReturn("testuser");
        when(userRepository.findByUsername("testuser"))
            .thenReturn(testUser);
        testUser.setImageData("test image content".getBytes());

        // Act
        UserProfileDTO result = userService.getUserProfileByToken("validToken");

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Test User", result.getName());
        assertEquals(Base64.getEncoder().encodeToString("test image content".getBytes()), 
                    result.getImageData());
        assertEquals("test@example.com", result.getEmail());
    }

    @Test
    void getUserProfileByToken_WithNullImage_ShouldReturnDTOWithoutImage() {
        // Arrange
        when(jwtService.extractUsername("validToken"))
            .thenReturn("testuser");
        when(userRepository.findByUsername("testuser"))
            .thenReturn(testUser);
        testUser.setImageData(null);

        // Act
        UserProfileDTO result = userService.getUserProfileByToken("validToken");

        // Assert
        assertNotNull(result);
        assertNull(result.getImageData());
    }

    @Test
    void convertToProfileDTO_ShouldHandleAllFields() {
        // Arrange
        testUser.setBio("Test bio");
        testUser.setImageData("test image".getBytes());

        // Act
        UserProfileDTO result = userService.convertToProfileDTO(testUser);

        // Assert
        assertEquals(1L, result.getId());
        assertEquals("Test User", result.getName());
        assertEquals("Test bio", result.getBio());
        assertEquals(Base64.getEncoder().encodeToString("test image".getBytes()), 
                    result.getImageData());
        assertEquals("test@example.com", result.getEmail());
    }
}