package com.example.theinterviewer.controller;

import com.example.theinterviewer.dto.history.InterviewHistoryItem;
import com.example.theinterviewer.dto.history.ResumeHistoryItem;
import com.example.theinterviewer.service.HistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryController {

    private final HistoryService historyService;

    @GetMapping("/resumes")
    public ResponseEntity<List<ResumeHistoryItem>> getResumeHistory(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(historyService.getResumeHistory(userId));
    }

    @GetMapping("/interviews")
    public ResponseEntity<List<InterviewHistoryItem>> getInterviewHistory(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(historyService.getInterviewHistory(userId));
    }
}
