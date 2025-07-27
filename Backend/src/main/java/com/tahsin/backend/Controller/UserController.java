package com.tahsin.backend.Controller;

import com.tahsin.backend.Model.Appointment;
import com.tahsin.backend.Model.Business;
import com.tahsin.backend.Model.Notification;
import com.tahsin.backend.Model.User;
import com.tahsin.backend.Repository.UserRepository;
import com.tahsin.backend.Service.NotificationService;
import com.tahsin.backend.Service.UserService;
import com.tahsin.backend.dto.NotificationDto;
import com.tahsin.backend.dto.ReviewResponseDTO;
import com.tahsin.backend.dto.UserProfileDTO;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/userprofile")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<UserProfileResponse> getUserProfile(@RequestParam Long id) {

        UserProfileDTO userProfile = userService.getUserById(id);
        List<Notification> notifications = notificationService.getNotifications(id);
        List<NotificationDto> notificationDtos = new ArrayList<>();
        for (Notification notification : notifications) {
            notificationDtos.add(new NotificationDto(notification.getId(), notification.getCreatedAt(),
                    notification.getMessage(), notification.getIsRead(), notification.getRelatedEntityType(),
                    notification.getNotificationType()));

        }

        return ResponseEntity.ok(new UserProfileResponse(userProfile, notificationDtos));
    }

    @PostMapping("/update")
    public ResponseEntity<UserProfileDTO> updateUserProfile(@RequestBody UserProfileDTO userProfileDTO,
            @RequestParam Long id) throws Exception {
        UserProfileDTO updatedProfile = userService.updateUserProfile(userProfileDTO, id);
        return ResponseEntity.ok(updatedProfile);
    }

}

class UserProfileResponse {
    private UserProfileDTO userProfile;
    private List<NotificationDto> notifications;

    // Constructors, getters, setters
    public UserProfileResponse(UserProfileDTO userProfile, List<NotificationDto> notifications) {
        this.userProfile = userProfile;
        this.notifications = notifications;
    }

    public UserProfileDTO getUserProfile() {
        return userProfile;
    }

    public void setUserProfile(UserProfileDTO userProfile) {
        this.userProfile = userProfile;
    }

    public List<NotificationDto> getNotifications() {
        return notifications;
    }

    public void setNotifications(List<NotificationDto> notifications) {
        this.notifications = notifications;
    }

    // Getters and setters
}