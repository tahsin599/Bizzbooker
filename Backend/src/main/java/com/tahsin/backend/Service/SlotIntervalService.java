
// package com.tahsin.backend.Service;

// import com.tahsin.backend.Model.*;
// import com.tahsin.backend.Repository.*;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import java.time.LocalTime;
// import java.util.List;
// import java.util.stream.Collectors;

// @Service
// public class SlotIntervalService {
//     private final SlotIntervalRepository slotIntervalRepository;
//     private final SlotConfigRepository slotConfigRepository;

//     public SlotIntervalService(SlotIntervalRepository slotIntervalRepository, 
//                              SlotConfigRepository slotConfigRepository) {
//         this.slotIntervalRepository = slotIntervalRepository;
//         this.slotConfigRepository = slotConfigRepository;
//     }

//       @Transactional
//     public void initializeSlots(SlotConfiguration config) {
//         // Clear existing intervals
//         slotIntervalRepository.deleteByConfigurationId(config.getId());
        
//         // Create new intervals
//         LocalTime current = config.getStartTime();
//         while (current.isBefore(config.getEndTime())) {
//             SlotInterval interval = new SlotInterval();
//             interval.setConfiguration(config);
//             interval.setStartTime(current);
//             interval.setEndTime(current.plusMinutes(config.getSlotDuration()));
//             interval.setMaxSlots(config.getMaxSlotsPerInterval());
//             interval.setUsedSlots(0);
            
//             slotIntervalRepository.save(interval);
            
//             current = current.plusMinutes(config.getSlotDuration());
//         }
//     }

//     @Transactional
//     public boolean bookSlot(Long configId, LocalTime startTime) {
//         SlotInterval interval = slotIntervalRepository
//             .findByConfigurationIdAndStartTime(configId, startTime)
//             .orElseThrow(() -> new RuntimeException("Slot not found"));
        
//         if (interval.getUsedSlots() >= interval.getMaxSlots()) {
//             return false;
//         }
        
//         int updated = slotIntervalRepository.incrementUsedSlots(interval.getId());
//         return updated > 0;
//     }

//     public List<SlotInterval> getAvailableSlots(Long configId) {
//         return slotIntervalRepository.findByConfigurationId(configId).stream()
//             .filter(interval -> interval.getUsedSlots() < interval.getMaxSlots())
//             .collect(Collectors.toList());
//     }
//       public List<SlotInterval> getIntervalsByConfigId(Long configId) {
//         return slotIntervalRepository.findByConfigurationIdOrderByStartTimeAsc(configId);
//     }
// }

package com.tahsin.backend.Service;

import com.tahsin.backend.Model.*;
import com.tahsin.backend.Repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SlotIntervalService {
    private final SlotIntervalRepository slotIntervalRepository;
    private final SlotConfigRepository slotConfigRepository;

    public SlotIntervalService(SlotIntervalRepository slotIntervalRepository, 
                             SlotConfigRepository slotConfigRepository) {
        this.slotIntervalRepository = slotIntervalRepository;
        this.slotConfigRepository = slotConfigRepository;
    }

      @Transactional
    public void initializeSlots(SlotConfiguration config) {
        // Clear existing intervals
        slotIntervalRepository.deleteByConfigurationId(config.getId());
        
        // Create new intervals
        LocalTime current = config.getStartTime();
        while (current.isBefore(config.getEndTime())) {
            SlotInterval interval = new SlotInterval();
            interval.setConfiguration(config);
            interval.setStartTime(current);
            interval.setEndTime(current.plusMinutes(config.getSlotDuration()));
            interval.setMaxSlots(config.getMaxSlotsPerInterval());
            interval.setUsedSlots(0);
            interval.setPrice(config.getSlotPrice() != null ? config.getSlotPrice() : 0.0);
            
            slotIntervalRepository.save(interval);
            
            current = current.plusMinutes(config.getSlotDuration());
        }
    }

    @Transactional
    public boolean bookSlot(Long configId, LocalTime startTime) {
        SlotInterval interval = slotIntervalRepository
            .findByConfigurationIdAndStartTime(configId, startTime)
            .orElseThrow(() -> new RuntimeException("Slot not found"));
        
        if (interval.getUsedSlots() >= interval.getMaxSlots()) {
            return false;
        }
        
        int updated = slotIntervalRepository.incrementUsedSlots(interval.getId());
        return updated > 0;
    }

    public List<SlotInterval> getAvailableSlots(Long configId) {
        return slotIntervalRepository.findByConfigurationId(configId).stream()
            .filter(interval -> interval.getUsedSlots() < interval.getMaxSlots())
            .collect(Collectors.toList());
    }
      public List<SlotInterval> getIntervalsByConfigId(Long configId) {
        return slotIntervalRepository.findByConfigurationIdOrderByStartTimeAsc(configId);
    }
}
