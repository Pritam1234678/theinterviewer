package com.example.theinterviewer.repository;

import com.example.theinterviewer.entity.Payment;
import com.example.theinterviewer.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    Optional<Payment> findByRazorpayPaymentId(String razorpayPaymentId);

    boolean existsByIdempotencyKey(String idempotencyKey);

    List<Payment> findByUserOrderByCreatedAtDesc(User user);

    Optional<Payment> findByIdempotencyKey(String idempotencyKey);
}
