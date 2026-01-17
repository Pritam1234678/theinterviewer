package com.example.theinterviewer.controller;

import com.example.theinterviewer.dto.auth.AuthResponse;
import com.example.theinterviewer.dto.auth.GoogleAuthRequest;
import com.example.theinterviewer.service.GoogleAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/google")
@RequiredArgsConstructor
@Tag(name = "Google Authentication", description = "Google OAuth2 authentication endpoints")
public class GoogleAuthController {

    private final GoogleAuthService googleAuthService;

    @PostMapping("/login")
    @Operation(summary = "Login/Register with Google")
    public ResponseEntity<AuthResponse> googleLogin(@Valid @RequestBody GoogleAuthRequest request) {
        AuthResponse response = googleAuthService.authenticateWithGoogle(request);
        return ResponseEntity.ok(response);
    }
}
