package com.example.theinterviewer.repository;

import com.example.theinterviewer.entity.AiUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiUsageLogRepository extends JpaRepository<AiUsageLog, Long> {

    List<AiUsageLog> findByUserId(Long userId);

    @Query("SELECT SUM(a.tokensUsed) FROM AiUsageLog a WHERE a.userId = :userId")
    Long sumTokensUsedByUserId(Long userId);
}
