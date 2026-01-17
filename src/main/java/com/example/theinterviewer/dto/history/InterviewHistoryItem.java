package com.example.theinterviewer.dto.history;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewHistoryItem {
    private Long id;
    private String role;
    private LocalDateTime date;
    private Double averageScore;
    private Integer roundsCompleted; // Placeholder as we don't have explicit rounds yet, maybe just 1?
    private String feedbackStatus;
}
