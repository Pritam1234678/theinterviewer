package com.example.theinterviewer.controller;

import com.example.theinterviewer.dto.credit.CreditBalanceResponse;
import com.example.theinterviewer.dto.credit.CreditTransactionDTO;
import com.example.theinterviewer.entity.CreditTransaction;
import com.example.theinterviewer.entity.User;
import com.example.theinterviewer.repository.UserRepository;
import com.example.theinterviewer.service.CreditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/credits")
@RequiredArgsConstructor
@Tag(name = "Credits", description = "Credit management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class CreditController {

        private final CreditService creditService;
        private final UserRepository userRepository;

        @GetMapping("/balance")
        @Operation(summary = "Get user's credit balance")
        public ResponseEntity<CreditBalanceResponse> getBalance(Authentication authentication) {
                Long userId = (Long) authentication.getPrincipal();

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                // Initialize credits if null (for existing users)
                int credits = user.getCredits() != null ? user.getCredits() : 100;
                int freeInterviewsUsed = user.getFreeInterviewsUsed() != null ? user.getFreeInterviewsUsed() : 0;
                int freeInterviewsRemaining = Math.max(0, 4 - freeInterviewsUsed);

                CreditBalanceResponse response = new CreditBalanceResponse(
                                credits,
                                freeInterviewsUsed,
                                freeInterviewsRemaining);

                return ResponseEntity.ok(response);
        }

        @GetMapping("/history")
        @Operation(summary = "Get credit transaction history")
        public ResponseEntity<List<CreditTransactionDTO>> getHistory(Authentication authentication) {
                Long userId = (Long) authentication.getPrincipal();

                List<CreditTransaction> transactions = creditService.getHistory(userId);

                List<CreditTransactionDTO> dtos = transactions.stream()
                                .map(t -> new CreditTransactionDTO(
                                                t.getId(),
                                                t.getCreditChange(),
                                                t.getBalanceAfter(),
                                                t.getType(),
                                                t.getDescription(),
                                                t.getTimestamp()))
                                .collect(Collectors.toList());

                return ResponseEntity.ok(dtos);
        }

        @GetMapping("/history/recent")
        @Operation(summary = "Get recent credit transactions (last 10)")
        public ResponseEntity<List<CreditTransactionDTO>> getRecentHistory(Authentication authentication) {
                Long userId = (Long) authentication.getPrincipal();

                List<CreditTransaction> transactions = creditService.getRecentHistory(userId);

                List<CreditTransactionDTO> dtos = transactions.stream()
                                .map(t -> new CreditTransactionDTO(
                                                t.getId(),
                                                t.getCreditChange(),
                                                t.getBalanceAfter(),
                                                t.getType(),
                                                t.getDescription(),
                                                t.getTimestamp()))
                                .collect(Collectors.toList());

                return ResponseEntity.ok(dtos);
        }
}
