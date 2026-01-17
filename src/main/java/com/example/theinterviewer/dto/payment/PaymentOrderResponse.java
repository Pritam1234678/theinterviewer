package com.example.theinterviewer.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderResponse {
    private String razorpayOrderId;
    private BigDecimal amount; // In paise (multiply by 100)
    private String currency;
    private Integer credits;
    private String razorpayKeyId; // For frontend Razorpay checkout
}
