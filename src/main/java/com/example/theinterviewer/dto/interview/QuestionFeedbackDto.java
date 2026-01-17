package com.example.theinterviewer.dto.interview;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.example.theinterviewer.entity.InterviewQuestion;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionFeedbackDto {
    private Long id;
    private String questionText;
    private String userAnswer;
    private String aiFeedback;
    private Integer score;
    private InterviewQuestion.RoundType roundType;
}
