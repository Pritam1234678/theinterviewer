package com.example.theinterviewer.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardSummaryResponse {
    private String userName;
    private Long totalInterviews;
    private Double latestInterviewScore;
    private Integer resumeAtsScore;
    private String resumeScoreTrend;
    private String interviewScoreTrend;
}
