package com.example.theinterviewer.service;

import com.example.theinterviewer.repository.InterviewSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewCleanupService {

    private final InterviewSessionRepository interviewSessionRepository;

    /**
     * Runs every 15 minutes to mark abandoned sessions.
     * Criteria: Session is IN_PROGRESS and hasn't been updated for > 1 hour.
     */
    @Scheduled(fixedRate = 900000) // 15 minutes = 900,000 ms
    @Transactional
    public void cleanupAbandonedSessions() {
        log.info("Starting cleanup of abandoned interview sessions...");

        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(1);
        int updatedCount = interviewSessionRepository.markAbandonedSessions(cutoffTime);

        if (updatedCount > 0) {
            log.info("Marked {} sessions as ABANDONED (Inactive since {})", updatedCount, cutoffTime);
        } else {
            log.info("No abandoned sessions found.");
        }
    }
}
