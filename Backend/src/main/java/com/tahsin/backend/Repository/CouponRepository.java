package com.tahsin.backend.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import com.tahsin.backend.Model.Coupon;

@Repository
@Component
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCode(String code);
    
    @Query("SELECT c FROM Coupon c WHERE " +
           "c.isActive = true AND " +
           "c.validFrom <= CURRENT_TIMESTAMP AND " +
           "c.validUntil >= CURRENT_TIMESTAMP AND " +
           "(c.maxUses IS NULL OR c.currentUses < c.maxUses)")
    List<Coupon> findActiveCoupons();
    
    @Modifying
    @Query("UPDATE Coupon c SET c.currentUses = c.currentUses + 1 WHERE c.id = :couponId")
    void incrementUses(@Param("couponId") Long couponId);
}
