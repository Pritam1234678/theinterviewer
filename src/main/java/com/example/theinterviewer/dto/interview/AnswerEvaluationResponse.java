package com.example.theinterviewer.dto.interview;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AnswerEvaluationResponse {
    private Integer score;
    private String feedback;
    private QuestionResponse nextQuestion;
}
