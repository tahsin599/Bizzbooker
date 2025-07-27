package com.tahsin.backend.Configuration;

import org.springframework.boot.CommandLineRunner;

import org.springframework.stereotype.Component;

import com.tahsin.backend.Model.Role;
import com.tahsin.backend.Model.User;
import com.tahsin.backend.Repository.UserRepository;

@Component
public class AdminUserInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    

    public AdminUserInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
        
    }

    @Override
    public void run(String... args) throws Exception {
        // Check if admin already exists
        User existingAdmin = userRepository.findByUsername("admin");
        if (existingAdmin == null) {
            // Create admin user if it doesn't exist
            // Password is encrypted using the password encoder
            // Ensure to use a secure password in production
            System.out.println("Creating admin user...");
        } else {
            System.out.println("Admin user already exists.");
        }
        if (existingAdmin == null) {
            User admin = new User(
                "admin",
                "admin@gmail.com",
                "$2a$12$siRz.37N4sUC6bm2DWEuX.XD9XQ2EPIjl/wQi585mQ3TLrPcG6RGi", // Encrypt password
                "System Admin",
                Role.ADMIN
            );
            userRepository.save(admin);
            System.out.println("Created admin user");
        }
    }
}