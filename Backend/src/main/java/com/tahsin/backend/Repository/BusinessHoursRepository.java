package com.tahsin.backend.Repository;

import com.tahsin.backend.Model.BusinessHours;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;


@Repository
public interface BusinessHoursRepository extends JpaRepository<BusinessHours, Long> {
    
    List<BusinessHours> findByBusinessIdOrderByDayOfWeekAsc(Long businessId);
    
    @Transactional
    void deleteByBusinessId(Long businessId);
    
    Optional<BusinessHours> findByBusinessIdAndDayOfWeek(Long businessId, Integer dayOfWeek);

    List<BusinessHours> findByBusinessId(Long businessId);
}