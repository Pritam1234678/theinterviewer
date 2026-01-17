package com.example.theinterviewer.service;

import com.example.theinterviewer.entity.CreditTransaction;
import com.example.theinterviewer.entity.InterviewSession;
import com.example.theinterviewer.entity.Payment;
import com.example.theinterviewer.entity.User;
import com.example.theinterviewer.repository.CreditTransactionRepository;
import com.example.theinterviewer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreditService {

    private final UserRepository userRepository;
    private final CreditTransactionRepository creditTransactionRepository;

    /**
     * Initialize credits for existing users (null-safety)
     * Only sets in-memory values, actual DB update happens in write transactions
     */
    private void ensureCreditsInitialized(User user) {
        if (user.getCredits() == null) {
            user.setCredits(100); // Default 100 credits
        }

        if (user.getFreeInterviewsUsed() == null) {
            user.setFreeInterviewsUsed(0);
        }
    }

    /**
     * Check if user has sufficient credits
     */
    @Transactional(readOnly = true)
    public boolean hasEnoughCredits(Long userId, int required) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        ensureCreditsInitialized(user);
        return user.getCredits() >= required;
    }

    /**
     * Get user's current credit balance
     */
    @Transactional(readOnly = true)
    public int getCreditBalance(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        ensureCreditsInitialized(user);
        return user.getCredits();
    }

    /**
     * Atomic credit deduction with transaction logging
     * Uses SERIALIZABLE isolation to prevent race conditions
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void deductCredits(Long userId, int amount, CreditTransaction.TransactionType type,
            String description, InterviewSession relatedInterview) {
        log.info("Deducting {} credits from user {}", amount, userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ensureCreditsInitialized(user);

        // Check sufficient credits
        if (user.getCredits() < amount) {
            throw new InsufficientCreditsException(
                    String.format("Insufficient credits. Required: %d, Available: %d", amount, user.getCredits()));
        }

        // Deduct credits
        int newBalance = user.getCredits() - amount;
        user.setCredits(newBalance);
        userRepository.save(user);

        // Log transaction
        CreditTransaction transaction = new CreditTransaction();
        transaction.setUser(user);
        transaction.setCreditChange(-amount);
        transaction.setBalanceAfter(newBalance);
        transaction.setType(type);
        transaction.setDescription(description);
        transaction.setRelatedInterview(relatedInterview);
        creditTransactionRepository.save(transaction);

        log.info("Credits deducted successfully. New balance: {}", newBalance);
    }

    /**
     * Atomic credit addition (for payments)
     * Uses SERIALIZABLE isolation to prevent race conditions
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void addCredits(Long userId, int amount, CreditTransaction.TransactionType type,
            String description, Payment relatedPayment) {
        log.info("Adding {} credits to user {}", amount, userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ensureCreditsInitialized(user);

        // Add credits
        int newBalance = user.getCredits() + amount;
        user.setCredits(newBalance);
        userRepository.save(user);

        // Log transaction
        CreditTransaction transaction = new CreditTransaction();
        transaction.setUser(user);
        transaction.setCreditChange(amount);
        transaction.setBalanceAfter(newBalance);
        transaction.setType(type);
        transaction.setDescription(description);
        transaction.setRelatedPayment(relatedPayment);
        creditTransactionRepository.save(transaction);

        log.info("Credits added successfully. New balance: {}", newBalance);
    }

    /**
     * Get user's credit transaction history
     */
    @Transactional(readOnly = true)
    public List<CreditTransaction> getHistory(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return creditTransactionRepository.findByUserOrderByTimestampDesc(user);
    }

    /**
     * Get recent credit transactions (last 10)
     */
    @Transactional(readOnly = true)
    public List<CreditTransaction> getRecentHistory(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return creditTransactionRepository.findTop10ByUserOrderByTimestampDesc(user);
    }

    /**
     * Custom exception for insufficient credits
     */
    public static class InsufficientCreditsException extends RuntimeException {
        public InsufficientCreditsException(String message) {
            super(message);
        }
    }
}
