package com.tahsin.backend.Repository;

import com.tahsin.backend.Model.Business;
import com.tahsin.backend.Model.BusinessLocation;
import com.tahsin.backend.Model.ServiceCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SearchRepository extends JpaRepository<Business, Long> {
    
@Query("""
    SELECT b FROM Business b 
    WHERE b.approvalStatus = 'APPROVED' 
    AND (
        LOWER(b.businessName) LIKE LOWER(CONCAT('%', :query, '%')) 
        OR 
        LOWER(b.description) LIKE LOWER(CONCAT('%', :query, '%')))
    """)
Page<Business> searchBusinesses(@Param("query") String query, Pageable pageable);

   @Query("SELECT l FROM BusinessLocation l " +
       "JOIN l.business b " +
       "WHERE b.approvalStatus = 'APPROVED' " +
       "AND (LOWER(l.address) LIKE LOWER(CONCAT('%', :query, '%')) " +
       "OR LOWER(l.area) LIKE LOWER(CONCAT('%', :query, '%')) " +
       "OR LOWER(l.city) LIKE LOWER(CONCAT('%', :query, '%')))")
Page<BusinessLocation> searchLocations(@Param("query") String query, Pageable pageable);

    @Query("SELECT c FROM ServiceCategory c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<ServiceCategory> searchCategories(@Param("query") String query, Pageable pageable);
}
