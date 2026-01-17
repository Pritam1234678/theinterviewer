package com.example.theinterviewer.service;

import com.example.theinterviewer.dto.dashboard.DashboardSummaryResponse;
import com.example.theinterviewer.dto.dashboard.UserRankResponse;
import com.example.theinterviewer.entity.InterviewReport;
import com.example.theinterviewer.entity.InterviewSession;

import com.example.theinterviewer.entity.ResumeAnalysis;
import com.example.theinterviewer.entity.User;
import com.example.theinterviewer.exception.ResourceNotFoundException;
import com.example.theinterviewer.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final InterviewSessionRepository sessionRepository;
    private final InterviewReportRepository reportRepository;

    private final ResumeAnalysisRepository resumeAnalysisRepository;

    public DashboardSummaryResponse getDashboardSummary(Long userId) {
        log.info("Getting dashboard summary for user: {}", userId);

        // Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Get total interviews count
        long totalInterviews = sessionRepository.countByUserId(userId);

        // Get latest interview score & trend (only from COMPLETED sessions)
        Double latestInterviewScore = null;
        String interviewScoreTrend = null;

        List<InterviewSession> sessions = sessionRepository.findByUserIdOrderByStartedAtDesc(userId);

        // Filter only COMPLETED sessions with reports
        List<InterviewSession> completedSessions = sessions.stream()
                .filter(s -> s.getSessionStatus() == InterviewSession.SessionStatus.COMPLETED)
                .toList();

        if (!completedSessions.isEmpty()) {
            InterviewSession latestSession = completedSessions.get(0);

            // Get the latest score
            latestInterviewScore = reportRepository.findBySessionId(latestSession.getId())
                    .map(InterviewReport::getOverallScore)
                    .orElse(null);

            // Calculate trend if we have at least 2 completed sessions
            if (completedSessions.size() > 1 && latestInterviewScore != null) {
                InterviewSession previousSession = completedSessions.get(1);
                Double previousScore = reportRepository.findBySessionId(previousSession.getId())
                        .map(InterviewReport::getOverallScore)
                        .orElse(null);

                if (previousScore != null && previousScore > 0) {
                    double change = ((latestInterviewScore - previousScore) / previousScore) * 100;
                    interviewScoreTrend = (change >= 0 ? "+" : "") + String.format("%.0f%%", change);
                }
            } else if (latestInterviewScore != null) {
                interviewScoreTrend = "+0%"; // First interview
            }
        }

        // Get resume ATS score & trend
        Integer resumeAtsScore = null;
        String resumeScoreTrend = null;

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, 2);
        List<ResumeAnalysis> analyses = resumeAnalysisRepository.findLatestByUserId(userId, pageable);

        if (!analyses.isEmpty()) {
            ResumeAnalysis latest = analyses.get(0);
            resumeAtsScore = latest.getAtsScore();

            if (analyses.size() > 1) {
                ResumeAnalysis previous = analyses.get(1);
                if (previous.getAtsScore() != null && previous.getAtsScore() > 0 && resumeAtsScore != null) {
                    double change = ((double) (resumeAtsScore - previous.getAtsScore()) / previous.getAtsScore()) * 100;
                    resumeScoreTrend = (change >= 0 ? "+" : "") + String.format("%.0f%%", change);
                }
            } else {
                resumeScoreTrend = "+0%"; // First resume
            }
        }

        return new DashboardSummaryResponse(
                user.getFullName(),
                totalInterviews,
                latestInterviewScore,
                resumeAtsScore,
                resumeScoreTrend,
                interviewScoreTrend);
    }

    public UserRankResponse getUserRank(Long userId) {
        log.info("Calculating rank for user: {}", userId);

        // Get all users' most recent interview scores
        List<User> allUsers = userRepository.findAll();

        // Map to store each user's most recent score
        Map<Long, Double> userLatestScores = new HashMap<>();

        for (User user : allUsers) {
            // Get the most recent COMPLETED session for this user
            List<InterviewSession> userSessions = sessionRepository.findByUserIdOrderByStartedAtDesc(user.getId());

            for (InterviewSession session : userSessions) {
                // Only consider COMPLETED sessions
                if (session.getSessionStatus() == InterviewSession.SessionStatus.COMPLETED) {
                    Optional<InterviewReport> reportOpt = reportRepository.findBySessionId(session.getId());

                    if (reportOpt.isPresent()) {
                        Double score = reportOpt.get().getOverallScore();
                        if (score != null && score > 0) {
                            userLatestScores.put(user.getId(), score);
                            break; // Found the most recent completed interview
                        }
                    }
                }
            }
        }

        log.info("Total users with completed interviews: {}", userLatestScores.size());

        // Get current user's score
        Double currentUserScore = userLatestScores.get(userId);

        if (currentUserScore == null) {
            // User has no completed interviews with reports
            log.info("User {} has no completed interviews with reports", userId);
            return new UserRankResponse(0, userLatestScores.size(), 0.0);
        }

        log.info("User {} score: {}", userId, currentUserScore);

        // Calculate rank (how many users have a higher score)
        long usersWithHigherScore = userLatestScores.values().stream()
                .filter(score -> score > currentUserScore)
                .count();

        int rank = (int) (usersWithHigherScore + 1);
        int totalUsers = userLatestScores.size();

        log.info("User {} rank: {} out of {}", userId, rank, totalUsers);

        return new UserRankResponse(rank, totalUsers, currentUserScore);
    }
}
