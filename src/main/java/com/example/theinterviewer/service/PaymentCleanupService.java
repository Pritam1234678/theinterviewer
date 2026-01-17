package com.example.theinterviewer.service;

import com.example.theinterviewer.entity.Payment;
import com.example.theinterviewer.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service to clean up expired/stale payments
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentCleanupService {

    private final PaymentRepository paymentRepository;

    /**
     * Runs every 30 minutes to mark expired pending payments as FAILED
     * Payments older than 15 minutes in CREATED status are expired
     */
    @Scheduled(fixedDelay = 1800000) // 30 minutes
    @Transactional
    public void expirePendingPayments() {
        log.info("Starting cleanup of expired pending payments...");

        LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(15);

        // Find all CREATED payments older than 15 minutes
        List<Payment> expiredPayments = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.CREATED)
                .filter(p -> p.getCreatedAt().isBefore(cutoffTime))
                .toList();

        if (!expiredPayments.isEmpty()) {
            for (Payment payment : expiredPayments) {
                payment.setStatus(Payment.PaymentStatus.FAILED);
                paymentRepository.save(payment);
                log.info("Expired payment order: {} (created at {})",
                        payment.getRazorpayOrderId(),
                        payment.getCreatedAt());
            }
            log.info("Marked {} payments as FAILED (expired after 15 minutes)", expiredPayments.size());
        } else {
            log.info("No expired payments found.");
        }
    }
}
