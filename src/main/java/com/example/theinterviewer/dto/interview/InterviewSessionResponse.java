package com.example.theinterviewer.dto.interview;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class InterviewSessionResponse {
    private Long sessionId;
    private String status;
    private LocalDateTime startedAt;
    private String currentRound;
}
