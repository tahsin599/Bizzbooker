package com.tahsin.backend.Controller;

import com.tahsin.backend.Model.User;
import com.tahsin.backend.Repository.UserRepository;
import com.tahsin.backend.Service.UserService;
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
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@SuppressWarnings("unused")
@ExtendWith(MockitoExtension.class)
class LoginControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private LoginController loginController;

    private User testUser;
    private MultipartFile testFile;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setPassword("password123");
        
        testFile = new MockMultipartFile(
            "profilePicture",
            "test.jpg",
            "image/jpeg",
            "test image content".getBytes()
        );
    }

    @Test
    void register_ShouldCallServiceWithGeneratedUsername() throws IOException {
        // Arrange
        User registeredUser = new User();
        registeredUser.setUsername("test");
        when(userService.register(any(User.class), any(MultipartFile.class)))
            .thenReturn(registeredUser);

        // Act
        loginController.login(testUser, testFile);

        // Assert
        verify(userService, times(1)).register(argThat(user -> 
            user.getUsername().equals("test")),
            eq(testFile)
        );
    }

@Test
void register_WithInvalidEmail_ShouldStillProcess() throws IOException {
    // Arrange
    testUser.setEmail("invalid-email");
    User registeredUser = new User();
    registeredUser.setUsername("invalidemail");
    when(userService.register(any(User.class), any(MultipartFile.class)))
        .thenReturn(registeredUser);

    // Act
    loginController.login(testUser, testFile);

    // Assert
    verify(userService, times(1)).register(
        argThat(user -> user.getUsername().equals("invalidemail")),
        eq(testFile)
    );
}

    @Test
    void login_ShouldReturnSuccessResponse() {
        // Arrange
        when(userService.verify(any(User.class))).thenReturn("generated-token");
        when(userService.getUserByUsername(anyString())).thenReturn(testUser);
        testUser.setId(1L);

        // Act
        ResponseEntity<Map<String, String>> response = loginController.login(testUser);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        Map<String, String> body = response.getBody();
        assertNotNull(body);
        assertEquals("success", body.get("status"));
        assertEquals("generated-token", body.get("message"));
        assertEquals("generated-token", body.get("token"));
        assertEquals("1", body.get("userId"));
    }

    @Test
    void login_WithInvalidCredentials_ShouldStillReturnResponse() {
        // Arrange
        when(userService.verify(any(User.class))).thenReturn(null);
        when(userService.getUserByUsername(anyString())).thenReturn(testUser);
        testUser.setId(1L);

        // Act
        ResponseEntity<Map<String, String>> response = loginController.login(testUser);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals("success", response.getBody().get("status"));
    }

    @Test
    void greet_ShouldReturnWelcomeMessage() {
        // Act
        String response = loginController.greet();

        // Assert
        assertEquals("Hello, User!", response);
    }

    @Test
    void generateUniqueUsername_ShouldHandleStandardEmail() {
        // Act
        String username = loginController.generateUniqueUsername("user@example.com");

        // Assert
        assertEquals("user", username);
    }

    @Test
    void generateUniqueUsername_ShouldSanitizeSpecialChars() {
        // Act
        String username = loginController.generateUniqueUsername("user.name+test@example.com");

        // Assert
        assertEquals("usernametest", username);
    }

    @Test
    void generateUniqueUsername_ShouldHandleEmptyLocalPart() {
        // Act
        String username = loginController.generateUniqueUsername("@example.com");

        // Assert
        assertEquals("", username);
    }



    @Test
    void generateUniqueUsername_WithNullInput_ShouldThrowException() {
        assertThrows(NullPointerException.class, () -> {
            loginController.generateUniqueUsername(null);
        });
    }
}