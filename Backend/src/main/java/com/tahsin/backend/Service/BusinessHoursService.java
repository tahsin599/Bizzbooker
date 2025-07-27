package com.tahsin.backend.Service;


import com.tahsin.backend.Model.*;
import com.tahsin.backend.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class BusinessHoursService {

    @Autowired
    private BusinessHoursRepository businessHoursRepository;
    
    @Autowired
    private BusinessRepository businessRepository;

    public List<BusinessHours> saveWeeklyBusinessHours(Long businessId, List<BusinessHours> weeklyHours) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow();

        // Validate we have exactly 7 days
        if (weeklyHours == null || weeklyHours.size() != 7) {
            throw new IllegalArgumentException("Must provide exactly 7 days of business hours");
        }

        // Delete existing hours for this business
        businessHoursRepository.deleteByBusinessId(businessId);

        // Save new hours
        List<BusinessHours> savedHours = new ArrayList<>();
        for (BusinessHours hours : weeklyHours) {
            // Validate day of week (0-6)
            if (hours.getDayOfWeek() < 0 || hours.getDayOfWeek() > 6) {
                throw new IllegalArgumentException("Invalid dayOfWeek: " + hours.getDayOfWeek());
            }

            hours.setBusiness(business);
            BusinessHours saved = businessHoursRepository.save(hours);
            savedHours.add(saved);
        }

        return savedHours;
    }

    public List<BusinessHours> findWeeklyByBusinessId(Long businessId) {
        List<BusinessHours> existingHours = businessHoursRepository.findByBusinessIdOrderByDayOfWeekAsc(businessId);
        
        // Ensure we always return 7 days, even if some are missing
        List<BusinessHours> weeklyHours = new ArrayList<>();
        for (int day = 0; day < 7; day++) {
            final int currentDay = day;
            BusinessHours hours = existingHours.stream()
                    .filter(h -> h.getDayOfWeek() == currentDay)
                    .findFirst()
                    .orElseGet(() -> {
                        BusinessHours defaultHours = new BusinessHours();
                        defaultHours.setDayOfWeek(currentDay);
                        defaultHours.setIsClosed(true); // Default to closed if not specified
                        return defaultHours;
                    });
            weeklyHours.add(hours);
        }
        
        return weeklyHours;
    }
}