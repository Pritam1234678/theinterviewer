package com.example.theinterviewer.repository;

import com.example.theinterviewer.entity.InterviewProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewProfileRepository extends JpaRepository<InterviewProfile, Long> {

    List<InterviewProfile> findByUserId(Long userId);

    List<InterviewProfile> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<InterviewProfile> findFirstByUserIdOrderByCreatedAtDesc(Long userId);
}
