package com.example.theinterviewer.controller;

import com.example.theinterviewer.dto.support.SupportRequest;
import com.example.theinterviewer.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
@Slf4j
public class SupportController {

    private final EmailService emailService;

    @PostMapping
    public ResponseEntity<String> submitSupportQuery(@Valid @RequestBody SupportRequest request) {
        log.info("Received support query from: {}", request.getEmail());

        emailService.sendSupportQuery(request.getName(), request.getEmail(), request.getQuery());

        return ResponseEntity.ok("Support query sent successfully");
    }
}
