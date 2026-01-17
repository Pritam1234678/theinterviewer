package com.example.theinterviewer.service;

import com.example.theinterviewer.dto.payment.PaymentOrderResponse;
import com.example.theinterviewer.dto.payment.PaymentVerificationResponse;
import com.example.theinterviewer.entity.CreditTransaction;
import com.example.theinterviewer.entity.Payment;
import com.example.theinterviewer.entity.User;
import com.example.theinterviewer.repository.PaymentRepository;
import com.example.theinterviewer.repository.UserRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final RazorpayClient razorpayClient;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final CreditService creditService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    /**
     * Create Razorpay order for credit purchase
     * Step 1 of payment flow
     */
    @Transactional
    public PaymentOrderResponse createOrder(Long userId, int credits) throws RazorpayException {
        log.info("Creating payment order for user {} - {} credits", userId, credits);

        // SECURITY: Validate credit amount
        if (credits < 10) {
            throw new IllegalArgumentException("Minimum credit purchase is 10 credits");
        }
        if (credits > 10000) {
            throw new IllegalArgumentException("Maximum credit purchase is 10,000 credits");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Calculate amount (1 credit = ₹1, convert to paise)
        BigDecimal amountInRupees = BigDecimal.valueOf(credits);
        BigDecimal amountInPaise = amountInRupees.multiply(BigDecimal.valueOf(100));

        // Create Razorpay order
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise.intValue());
        orderRequest.put("currency", "INR");
        // Receipt must be max 40 chars - using timestamp + short random string
        String receipt = "rcpt_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
        orderRequest.put("receipt", receipt);

        Order razorpayOrder = razorpayClient.orders.create(orderRequest);
        String orderId = razorpayOrder.get("id");

        // Save payment record with CREATED status
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setRazorpayOrderId(orderId);
        payment.setCreditsAdded(credits);
        payment.setAmount(amountInRupees);
        payment.setStatus(Payment.PaymentStatus.CREATED);
        payment.setIdempotencyKey(UUID.randomUUID().toString());
        paymentRepository.save(payment);

        log.info("Payment order created: {} for {} credits (₹{})", orderId, credits, amountInRupees);

        return new PaymentOrderResponse(
                orderId,
                amountInPaise,
                "INR",
                credits,
                razorpayKeyId);
    }

    /**
     * Verify payment signature and process successful payment
     * Step 2 of payment flow - CRITICAL SECURITY
     */
    @Transactional
    public PaymentVerificationResponse verifyAndProcessPayment(
            String orderId,
            String paymentId,
            String signature) {
        log.info("Verifying payment: orderId={}, paymentId={}", orderId, paymentId);

        // 1. Find payment record
        Payment payment = paymentRepository.findByRazorpayOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Payment order not found"));

        // 2. SECURITY: Check payment timeout (15 minutes)
        LocalDateTime paymentCreatedAt = payment.getCreatedAt();
        LocalDateTime now = LocalDateTime.now();
        long minutesSinceCreation = java.time.Duration.between(paymentCreatedAt, now).toMinutes();

        if (minutesSinceCreation > 15) {
            log.error("Payment timeout: order {} created {} minutes ago", orderId, minutesSinceCreation);
            payment.setStatus(Payment.PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new SecurityException("Payment timeout - order expired after 15 minutes");
        }

        // 3. Check if already processed (idempotency)
        if (payment.getStatus() == Payment.PaymentStatus.SUCCESS) {
            log.warn("Payment already processed: {}", orderId);
            return new PaymentVerificationResponse(
                    true,
                    "Payment already processed",
                    payment.getCreditsAdded(),
                    payment.getUser().getCredits());
        }

        // 4. Verify signature (CRITICAL)
        boolean isValid = verifySignature(orderId, paymentId, signature);
        if (!isValid) {
            log.error("Invalid payment signature for order: {}", orderId);
            payment.setStatus(Payment.PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new SecurityException("Invalid payment signature");
        }

        // 5. Update payment record
        payment.setRazorpayPaymentId(paymentId);
        payment.setRazorpaySignature(signature);
        payment.setStatus(Payment.PaymentStatus.SUCCESS);
        payment.setCompletedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        // 6. Add credits to user account
        creditService.addCredits(
                payment.getUser().getId(),
                payment.getCreditsAdded(),
                CreditTransaction.TransactionType.PURCHASE,
                "Credit purchase via Razorpay - Order: " + orderId,
                payment);

        User user = userRepository.findById(payment.getUser().getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        log.info("Payment verified and credits added successfully");

        return new PaymentVerificationResponse(
                true,
                "Payment successful",
                payment.getCreditsAdded(),
                user.getCredits());
    }

    /**
     * Verify Razorpay payment signature using HMAC SHA256
     * CRITICAL SECURITY FUNCTION
     */
    private boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;

            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(
                    razorpayKeySecret.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256");
            mac.init(secretKey);

            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String generatedSignature = bytesToHex(hash);

            boolean isValid = generatedSignature.equals(signature);
            log.debug("Signature verification result: {}", isValid);

            return isValid;
        } catch (Exception e) {
            log.error("Error verifying signature", e);
            return false;
        }
    }

    /**
     * Convert byte array to hex string
     */
    private String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }

    /**
     * Handle Razorpay webhook (for payment status updates)
     */
    @Transactional
    public void handleWebhook(String payload, String webhookSignature) {
        log.info("Received Razorpay webhook");

        // Verify webhook signature
        if (!verifyWebhookSignature(payload, webhookSignature)) {
            log.error("Invalid webhook signature");
            throw new SecurityException("Invalid webhook signature");
        }

        // Process webhook payload
        JSONObject event = new JSONObject(payload);
        String eventType = event.getString("event");

        log.info("Processing webhook event: {}", eventType);

        if ("payment.captured".equals(eventType)) {
            JSONObject paymentData = event.getJSONObject("payload")
                    .getJSONObject("payment")
                    .getJSONObject("entity");

            String paymentId = paymentData.getString("id");
            String orderId = paymentData.getString("order_id");

            // Find and update payment
            paymentRepository.findByRazorpayOrderId(orderId).ifPresent(payment -> {
                if (payment.getStatus() != Payment.PaymentStatus.SUCCESS) {
                    payment.setRazorpayPaymentId(paymentId);
                    payment.setStatus(Payment.PaymentStatus.SUCCESS);
                    payment.setCompletedAt(LocalDateTime.now());
                    paymentRepository.save(payment);

                    // Add credits
                    creditService.addCredits(
                            payment.getUser().getId(),
                            payment.getCreditsAdded(),
                            CreditTransaction.TransactionType.PURCHASE,
                            "Credit purchase via webhook - Order: " + orderId,
                            payment);

                    log.info("Webhook processed successfully for order: {}", orderId);
                }
            });
        }
    }

    /**
     * Verify webhook signature
     */
    private boolean verifyWebhookSignature(String payload, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(
                    razorpayKeySecret.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256");
            mac.init(secretKey);

            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String generatedSignature = bytesToHex(hash);

            return generatedSignature.equals(signature);
        } catch (Exception e) {
            log.error("Error verifying webhook signature", e);
            return false;
        }
    }
}
