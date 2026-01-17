package com.example.theinterviewer.service;

import com.example.theinterviewer.dto.history.InterviewHistoryItem;
import com.example.theinterviewer.dto.history.ResumeHistoryItem;
import com.example.theinterviewer.repository.InterviewReportRepository;
import com.example.theinterviewer.repository.ResumeAnalysisRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class HistoryService {

    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final InterviewReportRepository interviewReportRepository;

    public List<ResumeHistoryItem> getResumeHistory(Long userId) {
        log.info("Fetching resume history for user: {}", userId);
        return resumeAnalysisRepository.findAllByUserId(userId).stream()
                .map(analysis -> new ResumeHistoryItem(
                        analysis.getId(),
                        analysis.getResume().getFileName(),
                        analysis.getCreatedAt(),
                        analysis.getAtsScore(),
                        analysis.getOverallSummary()))
                .collect(Collectors.toList());
    }

    public List<InterviewHistoryItem> getInterviewHistory(Long userId) {
        log.info("Fetching interview history for user: {}", userId);
        return interviewReportRepository.findAllBySessionUserId(userId).stream()
                .map(report -> {
                    String role = report.getSession().getProfile().getCurrentRole();
                    // Fallback to tech stack if role is empty (though it shouldn't be)
                    if (role == null || role.isEmpty()) {
                        role = String.join(", ", report.getSession().getProfile().getTechStack());
                    }

                    String feedbackStatus = report.getFinalVerdict() != null ? report.getFinalVerdict().toString()
                            : "COMPLETED";

                    return new InterviewHistoryItem(
                            report.getSession().getId(),
                            role,
                            report.getSession().getStartedAt(),
                            report.getOverallScore(),
                            1, // Placeholder for rounds
                            feedbackStatus);
                })
                .collect(Collectors.toList());
    }
}
