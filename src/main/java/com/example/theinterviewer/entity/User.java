package com.example.theinterviewer.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false)
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(nullable = false, columnDefinition = "INT DEFAULT 100")
    private Integer credits = 100;

    @Column(name = "free_interviews_used", nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer freeInterviewsUsed = 0;

    @Version
    private Long version; // For optimistic locking to prevent race conditions

    @PrePersist
    protected void onCreate() {
        if (credits == null) {
            credits = 100;
        }
        if (freeInterviewsUsed == null) {
            freeInterviewsUsed = 0;
        }
    }

    public enum AccountStatus {
        ACTIVE,
        BLOCKED
    }
}
