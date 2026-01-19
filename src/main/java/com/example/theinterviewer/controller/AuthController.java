package com.example.theinterviewer.controller;

import com.example.theinterviewer.dto.auth.AuthResponse;
import com.example.theinterviewer.dto.auth.LoginRequest;
import com.example.theinterviewer.dto.auth.RegisterRequest;
import com.example.theinterviewer.service.AuthService;
import com.example.theinterviewer.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User authentication endpoints")
public class AuthController {

    private final AuthService authService;
    private final EmailService emailService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Login user")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate")
    @Operation(summary = "Validate JWT token")
    public ResponseEntity<Boolean> validateToken(@RequestHeader("Authorization") String token) {
        String jwt = token.startsWith("Bearer ") ? token.substring(7) : token;
        boolean isValid = authService.validateToken(jwt);
        return ResponseEntity.ok(isValid);
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user profile")
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<AuthResponse> updateProfile(org.springframework.security.core.Authentication authentication,
            @Valid @RequestBody com.example.theinterviewer.dto.auth.UpdateProfileRequest request) {
        Long userId = (Long) authentication.getPrincipal();
        AuthResponse response = authService.updateProfile(userId, request);
        return ResponseEntity.ok(response);
    }
    // --- Password Reset Endpoints ---

    @PostMapping("/forgot-password")
    @Operation(summary = "Initiate password reset")
    public ResponseEntity<String> forgotPassword(@RequestParam("email") String email) {
        // Find user by email
        authService.getUserByEmail(email).ifPresent(user -> {
            String token = java.util.UUID.randomUUID().toString();
            authService.createPasswordResetTokenForUser(user, token);
            String resetLink = "https://theinterviewer.site/reset-password?token=" + token; // Frontend URL
            // User requested 'creddentional-id', so maybe:
            // /reset-password/creddentional-id?token=...
            // But cleaner is query param.

            emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetLink);
        });

        // Always return OK to prevent email enumeration
        return ResponseEntity.ok("If an account exists with that email, a password reset link has been sent.");
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password with token")
    public ResponseEntity<String> resetPassword(@RequestParam("token") String token,
            @RequestParam("newPassword") String newPassword) {
        String result = authService.validatePasswordResetToken(token);
        if (result != null) {
            return ResponseEntity.badRequest().body("Invalid or expired token : " + result);
        }

        com.example.theinterviewer.entity.User user = authService.getUserByPasswordResetToken(token);
        if (user != null) {
            authService.changeUserPassword(user, newPassword);
            return ResponseEntity.ok("Password reset successfully");
        }

        return ResponseEntity.badRequest().body("Invalid token");
    }
}
