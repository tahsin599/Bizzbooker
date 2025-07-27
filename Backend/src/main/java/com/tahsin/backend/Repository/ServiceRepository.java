package com.tahsin.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import com.tahsin.backend.Model.Service;
import com.tahsin.backend.Model.ServiceCategory;

@Repository
@Component
public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findByCategory(ServiceCategory category);
    
    @Query("SELECT s FROM Service s JOIN s.businesses b WHERE b.id = :businessId")
    List<Service> findByBusinessId(@Param("businessId") Long businessId);
    
    @Query("SELECT s FROM Service s ORDER BY (SELECT AVG(r.rating) FROM Review r WHERE r.appointment.service.id = s.id) DESC")
    List<Service> findAllOrderByAverageRatingDesc();
}
