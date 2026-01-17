package com.example.theinterviewer.dto.resume;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResumeAnalysisResponse {
    private Long id; // Changed from analysisId to match entity
    private Long resumeId;
    private Integer atsScore;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> missingSections;
    private String formatFeedback;
    private String contentFeedback;
    private String improvementTips;
    private String overallSummary;
}
