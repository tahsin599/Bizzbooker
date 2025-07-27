package com.tahsin.backend.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.tahsin.backend.Repository.UserRepository;
import com.tahsin.backend.dto.UserProfileDTO;
import com.tahsin.backend.Model.User;

@Service
public class UserService {

    @Autowired
    UserRepository repo;

    @Autowired
    private JWTService jwtService;
    
    @Autowired
    AuthenticationManager authenticationManager;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public User register(User user, MultipartFile profilePicture) throws IOException {
        if (profilePicture == null) {
            throw new IllegalArgumentException("Profile picture cannot be null");
        }
        
        user.setPassword(encoder.encode(user.getPassword()));
        
        user.setImageName(profilePicture.getOriginalFilename());
        user.setImageType(profilePicture.getContentType());
        user.setImageData(profilePicture.getBytes());
            
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        repo.save(user);
        return user;
    }

    public String verify(User user) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
        );

        if(authentication.isAuthenticated()){
            return jwtService.generateToken(user.getUsername());
        }
        
        return "failure";
    }
    
    public User getUserByUsername(String username) {
        return repo.findByUsername(username);
    }

    public UserProfileDTO getUserById(Long id) {
        User user = repo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        return convertToProfileDTO(user); 
    }

    public UserProfileDTO getUserProfileByToken(String token) {
        String username = jwtService.extractUsername(token);
        User user = repo.findByUsername(username);
        return convertToProfileDTO(user);
    }

    public UserProfileDTO convertToProfileDTO(User user) {
        String imageData = user.getImageData() != null ? 
                Base64.getEncoder().encodeToString(user.getImageData()) : null;

        return new UserProfileDTO(
                user.getId(),
                user.getName(),
                user.getBio(),
                imageData,
                user.getEmail(),
                user.getRole().name()
        );
    }

       public UserProfileDTO updateUserProfile(UserProfileDTO userProfileDTO,Long id) throws Exception {
        User user=repo.findById(id).orElse(null);
        if(user==null){
            throw new Exception();

        }
        user.setBio(userProfileDTO.getBio());
        user.setName(userProfileDTO.getName());
        repo.save(user);
        return userProfileDTO;
        
        // TODO Auto-generated method stub
        
    }
}