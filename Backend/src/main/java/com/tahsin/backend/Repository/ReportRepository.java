package com.tahsin.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import com.tahsin.backend.Model.Report;
import com.tahsin.backend.Model.ReportStatus;
import com.tahsin.backend.Model.ReportedEntityType;

@Repository
@Component
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByStatus(ReportStatus status);
    
    @Query("SELECT r FROM Report r WHERE r.reportedEntityType = :entityType")
    List<Report> findByEntityType(@Param("entityType") ReportedEntityType entityType);
    
    @Modifying
    @Query("UPDATE Report r SET r.status = :status, r.resolvedBy = :adminId, r.resolutionNotes = :notes WHERE r.id = :reportId")
    void resolveReport(
        @Param("reportId") Long reportId,
        @Param("status") ReportStatus status,
        @Param("adminId") Long adminId,
        @Param("notes") String notes);
}
