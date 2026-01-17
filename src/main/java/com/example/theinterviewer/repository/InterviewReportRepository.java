package com.example.theinterviewer.repository;

import com.example.theinterviewer.entity.InterviewReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterviewReportRepository extends JpaRepository<InterviewReport, Long> {

    Optional<InterviewReport> findBySessionId(Long sessionId);

    @org.springframework.data.jpa.repository.Query("SELECT ir FROM InterviewReport ir JOIN FETCH ir.session s JOIN FETCH s.profile p WHERE s.userId = :userId ORDER BY s.startedAt DESC")
    java.util.List<InterviewReport> findAllBySessionUserId(
            @org.springframework.data.repository.query.Param("userId") Long userId);
}
