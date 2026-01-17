package com.example.theinterviewer.controller;

import com.example.theinterviewer.dto.payment.CreateOrderRequest;
import com.example.theinterviewer.dto.payment.PaymentOrderResponse;
import com.example.theinterviewer.dto.payment.PaymentVerificationResponse;
import com.example.theinterviewer.dto.payment.VerifyPaymentRequest;
import com.example.theinterviewer.service.PaymentService;
import com.example.theinterviewer.service.RateLimitService;
import com.razorpay.RazorpayException;
import io.github.bucket4j.Bucket;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment and credit purchase endpoints")
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final RateLimitService rateLimitService;

    @PostMapping("/create-order")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Create Razorpay order for credit purchase")
    public ResponseEntity<?> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            Authentication authentication) {
        try {
            Long userId = (Long) authentication.getPrincipal();

            // SECURITY: Rate limiting - 5 payment attempts per hour
            Bucket bucket = rateLimitService.resolvePaymentBucket(userId.toString());
            if (!bucket.tryConsume(1)) {
                log.warn("Payment rate limit exceeded for user: {}", userId);
                return ResponseEntity.status(429)
                        .body(new ErrorResponse("Too many payment attempts. Please try again later."));
            }

            log.info("Creating payment order for user: {}, credits: {}", userId, request.getCredits());

            PaymentOrderResponse response = paymentService.createOrder(userId, request.getCredits());
            return ResponseEntity.ok(response);
        } catch (RazorpayException e) {
            log.error("Razorpay error while creating order: {}", e.getMessage(), e);
            String errorMsg = e.getMessage() != null ? e.getMessage() : "Unknown Razorpay error";
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Razorpay Error: " + errorMsg));
        } catch (IllegalArgumentException e) {
            log.error("Invalid argument: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error while creating order: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Failed to create payment order. Please try again."));
        }
    }

    @PostMapping("/verify")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Verify payment and add credits")
    public ResponseEntity<PaymentVerificationResponse> verifyPayment(
            @Valid @RequestBody VerifyPaymentRequest request,
            Authentication authentication) {
        try {
            log.info("Verifying payment: orderId={}", request.getRazorpay_order_id());

            PaymentVerificationResponse response = paymentService.verifyAndProcessPayment(
                    request.getRazorpay_order_id(),
                    request.getRazorpay_payment_id(),
                    request.getRazorpay_signature());

            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            log.error("Payment verification failed", e);
            return ResponseEntity.badRequest().body(
                    new PaymentVerificationResponse(false, "Invalid payment signature", 0, 0));
        } catch (Exception e) {
            log.error("Error verifying payment", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/webhook")
    @Operation(summary = "Razorpay webhook handler")
    public ResponseEntity<Void> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature) {
        try {
            log.info("Received Razorpay webhook");
            paymentService.handleWebhook(payload, signature);
            return ResponseEntity.ok().build();
        } catch (SecurityException e) {
            log.error("Invalid webhook signature", e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error processing webhook", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}

// Simple error response record
record ErrorResponse(String error) {
}
