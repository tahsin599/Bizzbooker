package com.tahsin.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import com.tahsin.backend.Model.CouponRedemption;

@Repository
@Component
public interface CouponRedemptionRepository extends JpaRepository<CouponRedemption, Long> {
    @Query("SELECT cr FROM CouponRedemption cr WHERE cr.coupon.id = :couponId")
    List<CouponRedemption> findByCouponId(@Param("couponId") Long couponId);
    
    @Query("SELECT cr FROM CouponRedemption cr WHERE cr.user.id = :userId")
    List<CouponRedemption> findByUserId(@Param("userId") Long userId);
}
