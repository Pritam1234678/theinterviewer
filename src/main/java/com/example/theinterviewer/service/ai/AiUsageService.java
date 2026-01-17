package com.example.theinterviewer.service.ai;

import com.example.theinterviewer.entity.AiUsageLog;
import com.example.theinterviewer.repository.AiUsageLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class AiUsageService {

    private final AiUsageLogRepository aiUsageLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logUsage(Long userId, AiUsageLog.Module module, Long referenceId, int tokensUsed, int responseTimeMs) {
        try {
            AiUsageLog usageLog = new AiUsageLog();
            usageLog.setUserId(userId);
            usageLog.setModule(module);
            usageLog.setReferenceId(referenceId);
            usageLog.setTokensUsed(tokensUsed);
            usageLog.setApiResponseTime(responseTimeMs);

            aiUsageLogRepository.save(usageLog);

            log.debug("Logged AI usage: User={}, Module={}, RefId={}, Tokens={}, Time={}ms",
                    userId, module, referenceId, tokensUsed, responseTimeMs);
        } catch (Exception e) {
            log.error("Failed to log AI usage", e);
            // Don't throw exception to avoid failing the main operation
        }
    }
}
