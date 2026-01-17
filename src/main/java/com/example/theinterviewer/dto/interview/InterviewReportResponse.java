package com.example.theinterviewer.dto.interview;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewReportResponse {
    private Long reportId;
    private Long sessionId;
    private Double hrScore;
    private Double technicalScore;
    private Double projectScore;
    private Double overallScore;
    private String finalVerdict;
    private String summary;
    private List<QuestionFeedbackDto> questions;
    private String resumeFeedback;
}
