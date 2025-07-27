// package com.tahsin.backend.Repository;

// import java.time.LocalDateTime;
// import java.util.List;

// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.Pageable;
// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.data.jpa.repository.Query;
// import org.springframework.data.repository.query.Param;
// import org.springframework.stereotype.Component;
// import org.springframework.stereotype.Repository;

// import com.tahsin.backend.Model.Appointment;
// import com.tahsin.backend.Model.Business;
// import com.tahsin.backend.Model.BusinessLocation;
// import com.tahsin.backend.Model.User;


// @Repository
// @Component
// public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
//     List<Appointment> findByCustomer(User customer);
//     List<Appointment> findByBusiness(Business business);
//     List<Appointment> findByLocation(BusinessLocation location);
    
//     @Query("SELECT a FROM Appointment a WHERE " +
//            "a.location.id = :locationId AND " +
//            "((a.startTime < :end AND a.endTime > :start))")
//     List<Appointment> findConflictingAppointments(
//         @Param("locationId") Long locationId,
//         @Param("start") LocalDateTime start,
//         @Param("end") LocalDateTime end);
    
//     @Query("SELECT a FROM Appointment a WHERE a.business.id = :businessId AND a.status = 'COMPLETED'")
//     List<Appointment> findCompletedAppointmentsByBusiness(@Param("businessId") Long businessId);

//     // Dashboard-specific query methods
    
//     /**
//      * Count today's appointments for a specific user using explicit date range
//      */
//     @Query("SELECT COUNT(a) FROM Appointment a WHERE a.customer.id = :userId AND a.startTime >= :startOfDay AND a.startTime < :endOfDay")
//     int countTodayAppointmentsByUser(@Param("userId") Long userId, @Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);
    
//     /**
//      * Count this month's appointments for a specific user
//      */
//     @Query("SELECT COUNT(a) FROM Appointment a WHERE a.customer.id = :userId AND MONTH(a.startTime) = MONTH(CURRENT_DATE) AND YEAR(a.startTime) = YEAR(CURRENT_DATE)")
//     int countMonthlyAppointmentsByUser(@Param("userId") Long userId);
    
//     /**
//      * Count total appointments for a specific user
//      */
//     @Query("SELECT COUNT(a) FROM Appointment a WHERE a.customer.id = :userId")
//     int countTotalAppointmentsByUser(@Param("userId") Long userId);
    
//     /**
//      * Count pending appointments for a specific user
//      */
//     @Query("SELECT COUNT(a) FROM Appointment a WHERE a.customer.id = :userId AND a.status = 'PENDING'")
//     int countPendingAppointmentsByUser(@Param("userId") Long userId);
    
//     /**
//      * Find today's appointments for a specific user using explicit date range
//      * This ensures proper timezone handling and accurate date filtering
//      */
//     @Query("SELECT a FROM Appointment a WHERE a.customer.id = :userId AND a.startTime >= :startOfDay AND a.startTime < :endOfDay ORDER BY a.startTime")
//     List<Appointment> findTodayAppointmentsByUser(@Param("userId") Long userId, @Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);
    
//     /**
//      * Find all appointments for a specific user
//      */
//     @Query("SELECT a FROM Appointment a WHERE a.customer.id = :userId ORDER BY a.startTime DESC")
//     List<Appointment> findAllAppointmentsByUser(@Param("userId") Long userId);
    
//     /**
//      * Find appointments by status for a specific user
//      */
//     @Query("SELECT a FROM Appointment a WHERE a.customer.id = :userId AND a.status = :status ORDER BY a.startTime DESC")
//     List<Appointment> findAppointmentsByUserAndStatus(@Param("userId") Long userId, @Param("status") String status);

//     //int countByLocationIdAndDateAndTime(Long locationId, LocalDate date, String time);


//     @Query("SELECT a FROM Appointment a WHERE " +
//            "(a.status = 'PENDING' OR a.status = 'CONFIRMED' OR a.status = 'COMPLETED') AND " +
//            "a.endTime < :currentTime")
//     List<Appointment> findAppointmentsToComplete(@Param("currentTime") LocalDateTime currentTime);

//       Page<Appointment> findByCustomerIdOrderByStartTimeDesc(Long customerId, Pageable pageable);
// }
package com.tahsin.backend.Repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import com.tahsin.backend.Model.Appointment;
import com.tahsin.backend.Model.Business;
import com.tahsin.backend.Model.AppointmentStatus;
import com.tahsin.backend.Model.BusinessLocation;
import com.tahsin.backend.Model.User;


@Repository
@Component
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByCustomer(User customer);
    List<Appointment> findByBusiness(Business business);
    List<Appointment> findByLocation(BusinessLocation location);
    
    @Query("SELECT a FROM Appointment a WHERE " +
           "a.location.id = :locationId AND " +
           "((a.startTime < :end AND a.endTime > :start))")
    List<Appointment> findConflictingAppointments(
        @Param("locationId") Long locationId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end);
    
    @Query("SELECT a FROM Appointment a WHERE a.business.id = :businessId AND a.status = 'COMPLETED'")
    List<Appointment> findCompletedAppointmentsByBusiness(@Param("businessId") Long businessId);

    // Dashboard-specific query methods
    
    /**
     * Count today's appointments for a specific user using explicit date range
     */
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.customer.id = :userId AND a.startTime >= :startOfDay AND a.startTime < :endOfDay")
    int countTodayAppointmentsByUser(@Param("userId") Long userId, @Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);
    
    /**
     * Count this month's appointments for a specific user
     */
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.customer.id = :userId AND MONTH(a.startTime) = MONTH(CURRENT_DATE) AND YEAR(a.startTime) = YEAR(CURRENT_DATE)")
    int countMonthlyAppointmentsByUser(@Param("userId") Long userId);
    
    /**
     * Count total appointments for a specific user
     */
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.customer.id = :userId")
    int countTotalAppointmentsByUser(@Param("userId") Long userId);
    
    /**
     * Count pending appointments for a specific user
     */
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.customer.id = :userId AND a.status = 'PENDING'")
    int countPendingAppointmentsByUser(@Param("userId") Long userId);
    
    /**
     * Find today's appointments for a specific user using explicit date range
     * This ensures proper timezone handling and accurate date filtering
     */
    @Query("SELECT a FROM Appointment a WHERE a.customer.id = :userId AND a.startTime >= :startOfDay AND a.startTime < :endOfDay ORDER BY a.startTime")
    List<Appointment> findTodayAppointmentsByUser(@Param("userId") Long userId, @Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);
    
    /**
     * Find all appointments for a specific user
     */
    @Query("SELECT a FROM Appointment a WHERE a.customer.id = :userId ORDER BY a.startTime DESC")
    List<Appointment> findAllAppointmentsByUser(@Param("userId") Long userId);
    
    /**
     * Find appointments by status for a specific user
     */
    @Query("SELECT a FROM Appointment a WHERE a.customer.id = :userId AND a.status = :status ORDER BY a.startTime DESC")
    List<Appointment> findAppointmentsByUserAndStatus(@Param("userId") Long userId, @Param("status") String status);

    //int countByLocationIdAndDateAndTime(Long locationId, LocalDate date, String time);


    @Query("SELECT a FROM Appointment a WHERE " +
           "(a.status = 'PENDING' OR a.status = 'CONFIRMED') AND " +
           "a.endTime < :currentTime")
    List<Appointment> findAppointmentsToComplete(@Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT a FROM Appointment a WHERE a.customer.id = :customerId ORDER BY a.startTime DESC")
    Page<Appointment> findByCustomerIdOrderByStartTimeDesc(@Param("customerId") Long customerId, Pageable pageable);
    
    // Find appointments by status
    List<Appointment> findByStatus(AppointmentStatus status);

    @Query("SELECT a.business, COUNT(a.id) as appointmentCount " +
           "FROM Appointment a " +
           "WHERE a.customer.id = :userId " +
           "GROUP BY a.business " +
           "ORDER BY appointmentCount DESC")
    Page<Object[]> findBusinessesByUserAppointments(
        @Param("userId") Long userId, 
        Pageable pageable
    );
}
