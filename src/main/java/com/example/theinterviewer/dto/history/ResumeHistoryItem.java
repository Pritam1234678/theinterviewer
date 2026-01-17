package com.example.theinterviewer.dto.history;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResumeHistoryItem {
    private Long id;
    private String fileName;
    private LocalDateTime analyzedAt;
    private Integer atsScore;
    private String summary;
}
