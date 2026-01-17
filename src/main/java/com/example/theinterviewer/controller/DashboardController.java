package com.example.theinterviewer.controller;

import com.example.theinterviewer.dto.dashboard.DashboardSummaryResponse;
import com.example.theinterviewer.dto.dashboard.UserRankResponse;
import com.example.theinterviewer.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Dashboard statistics endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    @Operation(summary = "Get dashboard summary")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        DashboardSummaryResponse response = dashboardService.getDashboardSummary(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/rank")
    @Operation(summary = "Get user rank")
    public ResponseEntity<UserRankResponse> getUserRank(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        UserRankResponse response = dashboardService.getUserRank(userId);
        return ResponseEntity.ok(response);
    }
}
