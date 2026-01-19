package com.example.theinterviewer.service.ai;

import com.example.theinterviewer.exception.AiServiceException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class GroqClient {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final AiUsageService aiUsageService;

    @Value("${groq.api.key}")
    private String apiKeysString;

    private List<String> apiKeys;
    private int currentKeyIndex = 0;

    @Value("${groq.api.url}")
    private String apiUrl;

    @Value("${groq.api.temperature}")
    private double temperature;

    @Value("${groq.api.max-tokens}")
    private int maxTokens;

    @Value("${groq.api.model.interview}")
    private String interviewModel; // llama-3.1-8b-instant

    @Value("${groq.api.model.resume}")
    private String resumeModel; // llama-3.3-70b-versatile

    @PostConstruct
    public void init() {
        if (apiKeysString != null && !apiKeysString.isEmpty()) {
            this.apiKeys = Arrays.stream(apiKeysString.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        } else {
            this.apiKeys = new ArrayList<>();
            log.warn("No Groq API keys configured!");
        }
        log.info("Loaded {} Groq API keys.", apiKeys.size());
    }

    // Core method to send prompts to Groq API with retry logic for network errors
    private String sendPrompt(String promptText, String model, Long userId, Long referenceId,
            com.example.theinterviewer.entity.AiUsageLog.Module module) {

        if (apiKeys.isEmpty()) {
            throw new AiServiceException("No Groq API keys available.");
        }

        long startTime = System.currentTimeMillis();
        String response = null;
        int maxNetworkRetries = 3; // Retry network errors 3 times
        int maxKeyRotations = apiKeys.size(); // Try all available keys for rate limits
        Exception lastException = null;

        // Try with network retries first
        for (int networkAttempt = 0; networkAttempt < maxNetworkRetries; networkAttempt++) {
            // For each network attempt, try all available keys if we hit rate limits
            for (int keyAttempt = 0; keyAttempt < maxKeyRotations; keyAttempt++) {
                String currentApiKey = apiKeys.get(currentKeyIndex);

                try {
                    if (networkAttempt == 0 && keyAttempt == 0) {
                        log.debug("Sending prompt to Groq API (Model: {}): {}", model,
                                promptText.substring(0, Math.min(100, promptText.length())));
                    } else {
                        log.info(
                                "Retrying Groq API request (Network attempt {}/{}, Key attempt {}/{}) with key index {}",
                                networkAttempt + 1, maxNetworkRetries, keyAttempt + 1, maxKeyRotations,
                                currentKeyIndex);
                    }

                    // Build request body for OpenAI-compatible API
                    Map<String, Object> requestBody = new HashMap<>();
                    requestBody.put("model", model);
                    requestBody.put("temperature", temperature);
                    requestBody.put("max_tokens", maxTokens);

                    Map<String, String> message = new HashMap<>();
                    message.put("role", "user");
                    message.put("content", promptText);
                    requestBody.put("messages", List.of(message));

                    // Make API call
                    response = webClient.post()
                            .uri(apiUrl)
                            .header("Authorization", "Bearer " + currentApiKey)
                            .header("Content-Type", "application/json")
                            .bodyValue(requestBody)
                            .retrieve()
                            .bodyToMono(String.class)
                            .block();

                    if (response == null || response.trim().isEmpty()) {
                        throw new AiServiceException("AI returned empty response");
                    }

                    // Call successful, return immediately
                    log.info("Successfully received response from Groq API");
                    long endTime = System.currentTimeMillis();
                    int responseTimeMs = (int) (endTime - startTime);

                    // Parse and log usage before returning
                    try {
                        JsonNode root = objectMapper.readTree(response);
                        int tokensUsed = 0;
                        if (root.has("usage")) {
                            tokensUsed = root.get("usage").path("total_tokens").asInt(0);
                        }
                        if (userId != null && module != null) {
                            aiUsageService.logUsage(userId, module, referenceId, tokensUsed, responseTimeMs);
                        }
                        String extractedText = extractText(root);
                        log.debug("Received response from Groq API");
                        return extractedText.trim();
                    } catch (Exception e) {
                        throw new AiServiceException("Failed to parse AI response: " + e.getMessage(), e);
                    }

                } catch (WebClientResponseException.TooManyRequests e) {
                    // Handle Rate Limit (429) - rotate key and try again
                    log.warn("Groq API Rate Limit hit (429) for key ending in ...{}. Rotating key.",
                            currentApiKey.length() > 4 ? currentApiKey.substring(currentApiKey.length() - 4) : "xxxx");
                    lastException = e;
                    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.size();
                    // Continue to next key

                } catch (org.springframework.web.reactive.function.client.WebClientRequestException e) {
                    // Network/DNS/Connection errors - retry with exponential backoff
                    log.warn("Network error calling Groq API (attempt {}/{}): {}",
                            networkAttempt + 1, maxNetworkRetries, e.getMessage());
                    lastException = e;

                    // Break inner loop to retry with backoff
                    break;

                } catch (io.netty.handler.timeout.ReadTimeoutException
                        | io.netty.handler.timeout.WriteTimeoutException e) {
                    // Timeout errors - retry with exponential backoff
                    log.warn("Timeout calling Groq API (attempt {}/{}): {}",
                            networkAttempt + 1, maxNetworkRetries, e.getMessage());
                    lastException = e;

                    // Break inner loop to retry with backoff
                    break;

                } catch (Exception e) {
                    // Other errors - fail immediately
                    log.error("Unexpected error calling Groq API: {}", e.getMessage(), e);
                    throw new AiServiceException("Failed to get AI response: " + e.getMessage(), e);
                }
            }

            // If we got here, we exhausted all keys for this network attempt
            // Apply exponential backoff before next network retry
            if (networkAttempt < maxNetworkRetries - 1) {
                int backoffMs = (int) (Math.pow(2, networkAttempt) * 1000); // 1s, 2s, 4s
                log.info("Applying exponential backoff of {}ms before retry", backoffMs);
                try {
                    Thread.sleep(backoffMs);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new AiServiceException("Retry interrupted", ie);
                }
            }
        }

        // All retries exhausted
        log.error("Failed to get response from Groq API after {} network retries and {} key rotations",
                maxNetworkRetries, maxKeyRotations);
        throw new AiServiceException(
                "Failed to get AI response after multiple retries. Please check your internet connection. Last error: "
                        + (lastException != null ? lastException.getMessage() : "Unknown"));
    }

    private String extractText(JsonNode root) {
        try {
            JsonNode choices = root.get("choices");
            if (choices != null && choices.isArray() && choices.size() > 0) {
                JsonNode firstChoice = choices.get(0);
                JsonNode message = firstChoice.get("message");
                if (message != null && message.has("content")) {
                    return message.get("content").asText();
                }
            }
            throw new AiServiceException("Unable to extract text from Groq response");
        } catch (Exception e) {
            throw new AiServiceException("Failed to extract text: " + e.getMessage(), e);
        }
    }

    // Public generic method for backward compatibility and flexible usage
    public String sendPrompt(String promptText, Long userId, Long referenceId,
            com.example.theinterviewer.entity.AiUsageLog.Module module) {
        String model = interviewModel;
        if (module == com.example.theinterviewer.entity.AiUsageLog.Module.RESUME_ANALYSIS) {
            model = resumeModel;
        }
        return sendPrompt(promptText, model, userId, referenceId, module);
    }

    public String analyzeResume(String resumeText, Long userId, Long resumeId) {
        // Use the powerful 70b model for deep resume analysis
        String prompt = buildResumeAnalysisPrompt(resumeText);
        return sendPrompt(prompt, resumeModel, userId, resumeId,
                com.example.theinterviewer.entity.AiUsageLog.Module.RESUME_ANALYSIS);
    }

    public String generateInterviewQuestions(String context, String roundType, Long userId, Long sessionId) {
        // Use the fast 8b model for interviews
        String prompt = buildInterviewQuestionPrompt(context, roundType);
        return sendPrompt(prompt, interviewModel, userId, sessionId,
                com.example.theinterviewer.entity.AiUsageLog.Module.INTERVIEW);
    }

    public String evaluateAnswer(String question, String answer, String context, Long userId, Long sessionId) {
        // Use the fast 8b model for answer evaluation
        String prompt = buildAnswerEvaluationPrompt(question, answer, context);
        return sendPrompt(prompt, interviewModel, userId, sessionId,
                com.example.theinterviewer.entity.AiUsageLog.Module.INTERVIEW);
    }

    // Prompt Builders (Same as GeminiClient, logic remains consistent)

    private String buildResumeAnalysisPrompt(String resumeText) {
        return """
                You are an expert ATS (Applicant Tracking System) and resume analyst. Analyze the following resume and provide a detailed evaluation.

                Resume Text:
                %s

                Provide your analysis in the following JSON format (respond ONLY with valid JSON, no additional text):
                {
                  "atsScore": <number between 0-100>,
                  "strengths": ["strength1", "strength2", "strength3"],
                  "weaknesses": ["weakness1", "weakness2", "weakness3"],
                  "missingSections": ["section1", "section2"],
                  "formatFeedback": "detailed feedback on resume formatting",
                  "contentFeedback": "detailed feedback on resume content quality",
                  "improvementTips": "specific actionable tips for improvement",
                  "overallSummary": "comprehensive summary of the resume quality and readiness"
                }

                Focus on:
                - ATS compatibility and keyword optimization
                - Structure and formatting
                - Content clarity and impact
                - Missing or weak sections
                - Overall professional presentation
                """
                .formatted(resumeText);
    }

    private String buildInterviewQuestionPrompt(String context, String roundType) {
        return """
                You are an expert technical interviewer. Generate %s interview questions based on the following context.

                Context:
                %s

                Generate ONLY 3 relevant questions. Respond ONLY with valid JSON in this format:
                {
                  "questions": [
                    {"questionText": "your question here"}
                  ]
                }

                Make the question appropriate for the experience level and technology stack mentioned in the context.
                """.formatted(roundType, context);
    }

    private String buildAnswerEvaluationPrompt(String question, String answer, String context) {
        return """
                You are an expert interviewer evaluating a candidate's answer.

                Question: %s

                Candidate's Answer: %s

                Context: %s

                Evaluate the answer and respond ONLY with valid JSON in this format:
                {
                  "score": <number between 0-10>,
                  "feedback": "detailed constructive feedback on the answer"
                }

                Consider:
                - Accuracy and correctness
                - Depth of understanding
                - Communication clarity
                - Relevance to the question
                """.formatted(question, answer, context);
    }

    public String generateFinalReport(String context, String interviewData, Long userId, Long sessionId) {
        // Use the powerful 70b model for final report generation to ensure high quality
        // summary
        String prompt = buildFinalReportPrompt(context, interviewData);
        // Using resumeModel (70b) for better quality summary
        return sendPrompt(prompt, resumeModel, userId, sessionId,
                com.example.theinterviewer.entity.AiUsageLog.Module.INTERVIEW);
    }

    private String buildFinalReportPrompt(String context, String interviewData) {
        // This is a minimal prompt builder inside GroqClient to delegate to
        // PromptTemplateService if needed,
        // but here we are receiving the FULL prompt from PromptTemplateService via
        // proper injection in Service layer.
        // Wait, the Service layer builds the prompt string using PromptTemplateService,
        // so here we just need to send it.
        // Correction: The method signature above takes 'context' and 'interviewData'.
        // Let's rely on PromptTemplateService to build the string in the Service layer,
        // OR we can reproduce the builder here.
        // Re-reading design: GroqClient has 'buildXXXPrompt' private methods.
        // It seems the pattern is: Service calls GroqClient.generateXXX ->
        // GroqClient.buildPrompt -> GroqClient.sendPrompt.
        // So I should implement the prompt builder HERE locally to match the pattern,
        // OR change the pattern.
        // Looking at line 205: prompt = buildInterviewQuestionPrompt(context,
        // roundType);
        // So GroqClient DOES build the prompt.
        // OK, I will add the private builder method here too for consistency.

        return """
                You are an expert interviewer. Generate a comprehensive final summary report for the candidate based on their interview performance.

                Candidate Context:
                %s

                Interview Q&A Data:
                %s

                Provide a detailed summary in the following JSON format (respond ONLY with valid JSON):
                {
                  "summary": "A detailed 2-3 paragraph summary of the candidate's performance, highlighting key strengths, areas for improvement, and an overall assessment of their fit for the role."
                }
                """
                .formatted(context, interviewData);
    }
}
