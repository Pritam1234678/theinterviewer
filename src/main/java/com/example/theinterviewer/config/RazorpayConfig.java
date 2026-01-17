package com.example.theinterviewer.config;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class RazorpayConfig {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Bean
    public RazorpayClient razorpayClient() throws RazorpayException {
        log.info("Initializing Razorpay client with key: {}", razorpayKeyId);
        return new RazorpayClient(razorpayKeyId, razorpayKeySecret);
    }

    @Bean
    public String razorpayKeyId() {
        return razorpayKeyId;
    }

    @Bean
    public String razorpayKeySecret() {
        return razorpayKeySecret;
    }
}
