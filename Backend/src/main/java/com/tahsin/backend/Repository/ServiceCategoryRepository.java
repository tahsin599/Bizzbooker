package com.tahsin.backend.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import com.tahsin.backend.Model.ServiceCategory;


@Repository
@Component
public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, Long> {
    Optional<ServiceCategory> findByName(String name);
    
    @Query("SELECT sc FROM ServiceCategory sc ORDER BY sc.name")
    List<ServiceCategory> findAllOrdered();

    @Query("SELECT sc FROM ServiceCategory sc WHERE LOWER(sc.name) = LOWER(:name)")
    Optional<ServiceCategory> findByNameIgnoreCase(String name);
}
