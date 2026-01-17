package com.example.theinterviewer.repository;

import com.example.theinterviewer.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {

    List<InterviewSession> findByUserId(Long userId);

    List<InterviewSession> findByUserIdOrderByStartedAtDesc(Long userId);

    List<InterviewSession> findByUserIdAndSessionStatus(Long userId, InterviewSession.SessionStatus status);

    long countByUserId(Long userId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE InterviewSession s SET s.sessionStatus = 'ABANDONED' WHERE s.sessionStatus = 'IN_PROGRESS' AND s.updatedAt < :cutoffTime")
    int markAbandonedSessions(
            @org.springframework.data.repository.query.Param("cutoffTime") java.time.LocalDateTime cutoffTime);
}
