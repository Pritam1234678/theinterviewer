package com.example.theinterviewer.dto.payment;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyPaymentRequest {

    @NotBlank(message = "Order ID is required")
    private String razorpay_order_id;

    @NotBlank(message = "Payment ID is required")
    private String razorpay_payment_id;

    @NotBlank(message = "Signature is required")
    private String razorpay_signature;
}
