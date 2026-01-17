package com.example.theinterviewer.dto.interview;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class InterviewProfileRequest {

    @NotBlank(message = "Current role is required")
    private String currentRole;

    @NotNull(message = "Experience years is required")
    private BigDecimal experienceYears;

    @NotEmpty(message = "Tech stack is required")
    private List<String> techStack;

    @NotNull(message = "Difficulty level is required")
    private String difficultyLevel; // EASY, MODERATE, HARD

    private String recentProjects;

    @NotNull(message = "Resume ID is required")
    private Long resumeId;
}
