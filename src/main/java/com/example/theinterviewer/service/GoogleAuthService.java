package com.example.theinterviewer.service;

import com.example.theinterviewer.dto.auth.AuthResponse;
import com.example.theinterviewer.dto.auth.GoogleAuthRequest;
import com.example.theinterviewer.entity.User;
import com.example.theinterviewer.repository.UserRepository;
import com.example.theinterviewer.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;
    private final EmailService emailService;

    @Transactional
    public AuthResponse authenticateWithGoogle(GoogleAuthRequest request) {
        try {
            // Verify Google ID token and get user info
            String googleUserInfoUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + request.getIdToken();

            String response = webClientBuilder.build()
                    .get()
                    .uri(googleUserInfoUrl)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode userInfo = objectMapper.readTree(response);

            // Extract user information
            String email = userInfo.get("email").asText();
            String fullName = userInfo.has("name") ? userInfo.get("name").asText() : email.split("@")[0];

            // Check if user exists
            boolean isNewUser = !userRepository.existsByEmail(email);

            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> {
                        // Create new user
                        User newUser = new User();
                        newUser.setEmail(email);
                        newUser.setFullName(fullName);
                        newUser.setPasswordHash(""); // No password for OAuth users
                        newUser.setAccountStatus(User.AccountStatus.ACTIVE);
                        newUser.setLastLogin(LocalDateTime.now());

                        // Initialize credits for new user
                        newUser.setCredits(100); // 100 free credits
                        newUser.setFreeInterviewsUsed(0);

                        return userRepository.save(newUser);
                    });

            // Update last login for existing users
            if (user.getId() != null) {
                user.setLastLogin(LocalDateTime.now());
                userRepository.save(user);
            }

            // Send welcome email for new users (async - won't block login)
            if (isNewUser) {
                try {
                    emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());
                } catch (Exception e) {

                }
            }

            // Generate JWT token
            String token = tokenProvider.generateToken(user.getId(), user.getEmail());

            return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName());

        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid Google token: " + e.getMessage());
        }
    }
}
