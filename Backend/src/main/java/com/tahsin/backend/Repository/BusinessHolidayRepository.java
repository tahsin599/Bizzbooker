package com.tahsin.backend.Repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import com.tahsin.backend.Model.Business;
import com.tahsin.backend.Model.BusinessHoliday;

@Repository
@Component
public interface BusinessHolidayRepository extends JpaRepository<BusinessHoliday, Long> {
    List<BusinessHoliday> findByBusiness(Business business);
    
    @Query("SELECT bh FROM BusinessHoliday bh WHERE " +
           "bh.business.id = :businessId AND " +
           "(bh.holidayDate = :date OR " +
           "(bh.isRecurring = true AND " +
           "MONTH(bh.holidayDate) = MONTH(:date) AND " +
           "DAY(bh.holidayDate) = DAY(:date)))")
    List<BusinessHoliday> findHolidaysForDate(
        @Param("businessId") Long businessId,
        @Param("date") LocalDate date);
}
