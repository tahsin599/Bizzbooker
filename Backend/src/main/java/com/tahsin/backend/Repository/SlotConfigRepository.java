package com.tahsin.backend.Repository;

import com.tahsin.backend.Model.SlotConfiguration;



import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SlotConfigRepository extends JpaRepository<SlotConfiguration, Long> {
    Optional<SlotConfiguration> findByLocationId(Long locationId);
    boolean existsByLocationId(Long locationId);

  
}