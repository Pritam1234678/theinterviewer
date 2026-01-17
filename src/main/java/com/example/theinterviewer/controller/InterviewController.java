package com.example.theinterviewer.controller;

import com.example.theinterviewer.dto.interview.*;
import com.example.theinterviewer.entity.InterviewSession;
import com.example.theinterviewer.service.InterviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
@Tag(name = "Interview", description = "AI Interview endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping("/profile")
    @Operation(summary = "Create interview profile")
    public ResponseEntity<java.util.Map<String, Long>> createProfile(
            @Valid @RequestBody InterviewProfileRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        Long profileId = interviewService.createProfile(userId, request);
        return ResponseEntity.ok(java.util.Map.of("id", profileId));
    }

    @PostMapping("/start")
    @Operation(summary = "Start new interview session")
    public ResponseEntity<InterviewSessionResponse> startInterview(
            @RequestParam Long profileId,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        InterviewSessionResponse response = interviewService.startInterview(userId, profileId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{sessionId}/question")
    @Operation(summary = "Get next question in interview")
    public ResponseEntity<QuestionResponse> getNextQuestion(
            @PathVariable Long sessionId,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        QuestionResponse response = interviewService.getNextQuestion(sessionId, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{sessionId}/answer")
    @Operation(summary = "Submit answer to question")
    public ResponseEntity<AnswerEvaluationResponse> submitAnswer(
            @PathVariable Long sessionId,
            @Valid @RequestBody AnswerRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        AnswerEvaluationResponse response = interviewService.submitAnswer(sessionId, userId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{sessionId}/complete")
    @Operation(summary = "Complete interview and generate final report")
    public ResponseEntity<InterviewReportResponse> completeInterview(
            @PathVariable Long sessionId,
            Authentication authentication) throws com.fasterxml.jackson.core.JsonProcessingException {
        Long userId = (Long) authentication.getPrincipal();
        InterviewReportResponse response = interviewService.completeInterview(sessionId, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{sessionId}/abandon")
    @Operation(summary = "Abandon interview session without generating report")
    public ResponseEntity<Void> abandonInterview(
            @PathVariable Long sessionId,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        interviewService.abandonInterview(sessionId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{sessionId}/report")
    @Operation(summary = "Get interview final report")
    public ResponseEntity<InterviewReportResponse> getInterviewReport(
            @PathVariable Long sessionId,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        InterviewReportResponse response = interviewService.getInterviewReport(sessionId, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get all interviews for current user")
    public ResponseEntity<List<InterviewSession>> getUserInterviews(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        List<InterviewSession> interviews = interviewService.getUserInterviews(userId);
        return ResponseEntity.ok(interviews);
    }
}
