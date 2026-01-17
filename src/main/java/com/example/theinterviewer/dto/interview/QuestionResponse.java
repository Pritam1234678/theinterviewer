package com.example.theinterviewer.dto.interview;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class QuestionResponse {
    private Long questionId;
    private String questionText;
    private String roundType;
}
