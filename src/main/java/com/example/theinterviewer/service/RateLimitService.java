package com.example.theinterviewer.service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Service
public class RateLimitService {

    private final Cache<String, Bucket> cache;

    public RateLimitService() {
        this.cache = Caffeine.newBuilder()
                .expireAfterWrite(1, TimeUnit.HOURS)
                .build();
    }

    public Bucket resolveBucket(String key) {
        return cache.get(key, this::newBucket);
    }

    /**
     * Payment-specific rate limit: 5 attempts per hour
     */
    public Bucket resolvePaymentBucket(String key) {
        return cache.get("payment:" + key, this::newPaymentBucket);
    }

    private Bucket newBucket(String key) {
        // Limit: 20 requests per minute
        Bandwidth limit = Bandwidth.classic(20, Refill.greedy(20, Duration.ofMinutes(1)));
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private Bucket newPaymentBucket(String key) {
        // SECURITY: Limit payment creation to 5 attempts per hour
        Bandwidth limit = Bandwidth.classic(5, Refill.greedy(5, Duration.ofHours(1)));
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
}
