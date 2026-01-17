package com.example.theinterviewer.repository;

import com.example.theinterviewer.entity.ResumeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResumeAnalysisRepository extends JpaRepository<ResumeAnalysis, Long> {

    Optional<ResumeAnalysis> findByResumeId(Long resumeId);

    void deleteByResumeId(Long resumeId);

    @org.springframework.data.jpa.repository.Query("SELECT ra FROM ResumeAnalysis ra JOIN ra.resume r WHERE r.userId = :userId ORDER BY ra.createdAt DESC")
    java.util.List<ResumeAnalysis> findLatestByUserId(
            @org.springframework.data.repository.query.Param("userId") Long userId,
            org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT ra FROM ResumeAnalysis ra JOIN FETCH ra.resume r WHERE r.userId = :userId ORDER BY ra.createdAt DESC")
    java.util.List<ResumeAnalysis> findAllByUserId(
            @org.springframework.data.repository.query.Param("userId") Long userId);
}
