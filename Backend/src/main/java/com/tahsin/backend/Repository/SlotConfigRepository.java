package com.tahsin.backend.Repository;

import com.tahsin.backend.Model.SlotConfiguration;



import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SlotConfigRepository extends JpaRepository<SlotConfiguration, Long> {
    List<SlotConfiguration> findAllByLocationId(Long locationId);
    boolean existsByLocationId(Long locationId);
    Optional<SlotConfiguration> findByLocationIdAndDayOfWeek(Long locationId, Integer dayOfWeek);

  
}