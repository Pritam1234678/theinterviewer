package com.example.theinterviewer.service;

import com.example.theinterviewer.dto.auth.AuthResponse;
import com.example.theinterviewer.dto.auth.LoginRequest;
import com.example.theinterviewer.dto.auth.RegisterRequest;
import com.example.theinterviewer.entity.User;
import com.example.theinterviewer.repository.UserRepository;
import com.example.theinterviewer.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import com.example.theinterviewer.entity.PasswordResetToken;
import com.example.theinterviewer.repository.PasswordResetTokenRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Create new user
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setAccountStatus(User.AccountStatus.ACTIVE);

        // Initialize credits for new user
        user.setCredits(100); // 100 free credits
        user.setFreeInterviewsUsed(0);

        user = userRepository.save(user);

        // Send welcome email (async - won't block registration)
        try {
            emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());
        } catch (Exception e) {
            // Log but don't fail registration if email fails
            // Email service already logs errors
        }

        // Generate JWT token
        String token = tokenProvider.generateToken(user.getId(), user.getEmail());

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName());
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        // Check if account is active
        if (user.getAccountStatus() != User.AccountStatus.ACTIVE) {
            throw new BadCredentialsException("Account is blocked");
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Generate JWT token
        String token = tokenProvider.generateToken(user.getId(), user.getEmail());

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName());
    }

    public boolean validateToken(String token) {
        return tokenProvider.validateToken(token);
    }

    @Transactional
    public AuthResponse updateProfile(Long userId, com.example.theinterviewer.dto.auth.UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            // Check if email is taken by another user
            if (!user.getEmail().equalsIgnoreCase(request.getEmail())
                    && userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already in use");
            }
            user.setEmail(request.getEmail().trim());
        }

        user = userRepository.save(user);

        // Generate new token since email might have changed (if email is part of token
        // claims)
        String token = tokenProvider.generateToken(user.getId(), user.getEmail());

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName());
    }

    // --- Password Reset Logic ---

    private final com.example.theinterviewer.repository.PasswordResetTokenRepository passwordResetTokenRepository;

    @Transactional
    public void createPasswordResetTokenForUser(User user, String token) {
        // Clear existing tokens
        passwordResetTokenRepository.deleteByUser(user);

        PasswordResetToken myToken = new PasswordResetToken(token, user);
        passwordResetTokenRepository.save(myToken);
    }

    public String validatePasswordResetToken(String token) {
        final PasswordResetToken passToken = passwordResetTokenRepository.findByToken(token)
                .orElse(null);

        if (passToken == null) {
            return "invalidToken";
        }

        if (passToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return "expired";
        }

        return null;
    }

    @Transactional
    public User getUserByPasswordResetToken(String token) {
        return passwordResetTokenRepository.findByToken(token)
                .map(PasswordResetToken::getUser)
                .orElse(null);
    }

    @Transactional
    public void changeUserPassword(User user, String password) {
        user.setPasswordHash(passwordEncoder.encode(password));
        userRepository.save(user);
        // Invalidate the token after use
        passwordResetTokenRepository.deleteByUser(user);
    }

    @Transactional(readOnly = true)
    public java.util.Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
