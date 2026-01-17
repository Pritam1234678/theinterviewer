package com.example.theinterviewer.controller;

import com.example.theinterviewer.dto.resume.ResumeAnalysisResponse;
import com.example.theinterviewer.dto.resume.ResumeUploadResponse;
import com.example.theinterviewer.entity.Resume;
import com.example.theinterviewer.service.ResumeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
@Tag(name = "Resume", description = "Resume upload and analysis endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping("/upload")
    @Operation(summary = "Upload a resume file")
    public ResponseEntity<ResumeUploadResponse> uploadResume(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {
        Long userId = (Long) authentication.getPrincipal();
        ResumeUploadResponse response = resumeService.uploadResume(userId, file);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{resumeId}/analyze")
    @Operation(summary = "Analyze a resume with AI")
    public ResponseEntity<ResumeAnalysisResponse> analyzeResume(
            @PathVariable Long resumeId,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        ResumeAnalysisResponse response = resumeService.analyzeResume(resumeId, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{resumeId}/analysis")
    @Operation(summary = "Get resume analysis report")
    public ResponseEntity<ResumeAnalysisResponse> getResumeAnalysis(
            @PathVariable Long resumeId,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        ResumeAnalysisResponse response = resumeService.getResumeAnalysis(resumeId, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get all resumes for the current user")
    public ResponseEntity<List<Resume>> getUserResumes(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        List<Resume> resumes = resumeService.getUserResumes(userId);
        return ResponseEntity.ok(resumes);
    }
}
