// package com.tahsin.backend.Service;

// import com.tahsin.backend.Model.Business;
// import com.tahsin.backend.Model.BusinessLocation;
// import com.tahsin.backend.Model.SlotConfiguration;
// import com.tahsin.backend.dto.SlotConfigDTO;
// import com.tahsin.backend.Repository.BusinessLocationRepository;
// import com.tahsin.backend.Repository.BusinessRepository;
// import com.tahsin.backend.Repository.SlotConfigRepository;
// import jakarta.transaction.Transactional;

// import java.time.LocalDate;
// import java.util.List;

// import org.aspectj.weaver.patterns.ConcreteCflowPointcut.Slot;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;

// @Service
// public class SlotConfigService {

//     @Autowired
//     private SlotConfigRepository slotConfigRepository;

//     @Autowired
//     private BusinessLocationRepository locationRepository;

//     @Autowired
//     private SlotIntervalService slotIntervalService;
//     @Autowired
//     private BusinessRepository businessRepository;

//     @Transactional
//     public SlotConfiguration saveOrUpdateSlotConfig(SlotConfigDTO configDTO) {
//         Business business = businessRepository.findById(configDTO.getLocationId())
//                 .orElseThrow(() -> new RuntimeException("Location not found"));

//         List<BusinessLocation> locations = locationRepository.findByBusiness(business);
//         SlotConfiguration savedConfig1 = null;
//         for (BusinessLocation location : locations) {
//             SlotConfiguration config = slotConfigRepository.findByLocationId(location.getId())
//                     .orElse(new SlotConfiguration());

//             config.setLocation(location);
//             config.setStartTime(configDTO.getStartTime());
//             config.setEndTime(configDTO.getEndTime());
//             config.setSlotDuration(configDTO.getSlotDuration());
//             config.setMaxSlotsPerInterval(configDTO.getMaxSlotsPerInterval());

//             SlotConfiguration savedConfig = slotConfigRepository.save(config);
//             savedConfig1 = savedConfig1 == null ? savedConfig : savedConfig1;

//             // Initialize/Reinitialize slots
//             slotIntervalService.initializeSlots(savedConfig);
//         }

//         return savedConfig1;
//     }

//     public SlotConfiguration getByLocationId(Long locationId) {
//         return slotConfigRepository.findByLocationId(locationId)
//                 .orElseThrow(() -> new RuntimeException("Slot config not found for location"));
//     }

//     @Transactional
//     public void resetUsedSlots(Long locationId) {
//         SlotConfiguration config = getByLocationId(locationId);
//         config.setUsedSlots(0);
//         config.setLastResetDate(LocalDate.now());
//         slotConfigRepository.save(config);
//     }

// }
package com.tahsin.backend.Service;

import com.tahsin.backend.Model.Business;
import com.tahsin.backend.Model.BusinessLocation;
import com.tahsin.backend.Model.SlotConfiguration;
import com.tahsin.backend.dto.SlotConfigDTO;
import com.tahsin.backend.Repository.BusinessLocationRepository;
import com.tahsin.backend.Repository.BusinessRepository;
import com.tahsin.backend.Repository.SlotConfigRepository;
import jakarta.transaction.Transactional;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SlotConfigService {

    @Autowired
    private SlotConfigRepository slotConfigRepository;

    @Autowired
    private BusinessLocationRepository locationRepository;

    @Autowired
    private SlotIntervalService slotIntervalService;
    @Autowired
    private BusinessRepository businessRepository;

    @Transactional
    public SlotConfiguration saveOrUpdateSlotConfig(SlotConfigDTO configDTO) {
        Business business = businessRepository.findById(configDTO.getLocationId())
                .orElseThrow(() -> new RuntimeException("Location not found"));

        List<BusinessLocation> locations = locationRepository.findByBusiness(business);
        SlotConfiguration savedConfig1 = null;
        for (BusinessLocation location : locations) {
            SlotConfiguration  slotconfig=new SlotConfiguration();
           
            for(int i=0;i<7;i++){
                 SlotConfiguration config = slotConfigRepository.findByLocationIdAndDayOfWeek(location.getId(),i)
                    .orElse(new SlotConfiguration());
                  config.setLocation(location);
                  config.setStartTime(configDTO.getStartTime());
                  config.setEndTime(configDTO.getEndTime());
                  config.setSlotDuration(configDTO.getSlotDuration());
                  config.setMaxSlotsPerInterval(configDTO.getMaxSlotsPerInterval());
                  config.setSlotPrice(configDTO.getSlotPrice() != null ? configDTO.getSlotPrice() : 0.0);
                  config.setDayOfWeek(i);
                  slotConfigRepository.save(config);
                  slotconfig=config;
                  slotIntervalService.initializeSlots(slotconfig);


            }

            // config.setLocation(location);
            // config.setStartTime(configDTO.getStartTime());
            // config.setEndTime(configDTO.getEndTime());
            // config.setSlotDuration(configDTO.getSlotDuration());
            // config.setMaxSlotsPerInterval(configDTO.getMaxSlotsPerInterval());
            // config.setSlotPrice(configDTO.getSlotPrice() != null ? configDTO.getSlotPrice() : 0.0);

            // SlotConfiguration savedConfig = slotConfigRepository.save(config);
            savedConfig1 = savedConfig1 == null ? slotconfig : savedConfig1;

            // Initialize/Reinitialize slots
            
        }

        return savedConfig1;
    }

    public SlotConfiguration getByLocationId(Long locationId) {
        List<SlotConfiguration> configs=slotConfigRepository.findAllByLocationId(locationId);
        if(configs.isEmpty()){
            throw new RuntimeException();
        }
        return configs.get(0);
    }

    public SlotConfiguration getByLocationIdAndDayOfWeek(Long locationId,int dayOfWeek){
       return slotConfigRepository.findByLocationIdAndDayOfWeek(locationId,dayOfWeek)
                .orElseThrow(() -> new RuntimeException("Slot config not found for location")); 
        

    }

    @Transactional
    public void resetUsedSlots(Long locationId,int dayOfWeek) {
        SlotConfiguration config = getByLocationId(locationId);
        config.setUsedSlots(0);
        config.setLastResetDate(LocalDate.now());
        slotConfigRepository.save(config);
    }

}
