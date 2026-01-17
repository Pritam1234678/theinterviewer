package com.example.theinterviewer.service.ai;

import com.example.theinterviewer.entity.InterviewReport;
import com.example.theinterviewer.entity.ResumeAnalysis;
import com.example.theinterviewer.exception.AiServiceException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class AiResponseParser {

    private final ObjectMapper objectMapper;

    public ResumeAnalysis parseResumeAnalysis(String aiResponse) {
        try {
            // Extract JSON from response (in case there's extra text)
            String jsonResponse = extractJson(aiResponse);

            JsonNode root = objectMapper.readTree(jsonResponse);

            ResumeAnalysis analysis = new ResumeAnalysis();
            // Use path() which returns MissingNode instead of null, then use asInt/asText
            // with defaults
            analysis.setAtsScore(root.path("atsScore").asInt(0));
            analysis.setStrengths(parseStringArray(root.get("strengths")));
            analysis.setWeaknesses(parseStringArray(root.get("weaknesses")));
            analysis.setMissingSections(parseStringArray(root.get("missingSections")));
            analysis.setFormatFeedback(root.path("formatFeedback").asText("No feedback provided."));
            analysis.setContentFeedback(root.path("contentFeedback").asText("No content feedback provided."));
            analysis.setImprovementTips(root.path("improvementTips").asText("No improvement tips provided."));
            analysis.setOverallSummary(root.path("overallSummary").asText("No summary provided."));

            return analysis;
        } catch (Exception e) {
            log.error("Error parsing resume analysis response", e);
            throw new AiServiceException("Failed to parse AI response: " + e.getMessage());
        }
    }

    public List<String> parseQuestions(String aiResponse) {
        try {
            log.debug("Raw AI response for questions: {}", aiResponse);
            String jsonResponse = extractJson(aiResponse);
            log.debug("Cleaned JSON for questions: {}", jsonResponse);
            JsonNode root = objectMapper.readTree(jsonResponse);

            JsonNode questionsNode;
            if (root.isArray()) {
                questionsNode = root;
            } else {
                questionsNode = root.get("questions");
            }

            List<String> questions = new ArrayList<>();
            if (questionsNode != null && questionsNode.isArray()) {
                for (JsonNode questionNode : questionsNode) {
                    if (questionNode.isObject()) {
                        // Try "questionText" first, then "question", then fallback to string
                        if (questionNode.has("questionText")) {
                            questions.add(questionNode.get("questionText").asText());
                        } else if (questionNode.has("question")) {
                            questions.add(questionNode.get("question").asText());
                        } else {
                            questions.add(questionNode.asText());
                        }
                    } else {
                        // Fallback: maybe it's just a string?
                        questions.add(questionNode.asText());
                    }
                }
            }

            log.debug("Parsed {} questions from AI response", questions.size());
            return questions;
        } catch (Exception e) {
            log.error("Error parsing questions response", e);
            throw new AiServiceException("Failed to parse questions: " + e.getMessage());
        }
    }

    public EvaluationResult parseEvaluation(String aiResponse) {
        try {
            String jsonResponse = extractJson(aiResponse);
            JsonNode root = objectMapper.readTree(jsonResponse);

            int score = root.path("score").asInt(0);
            String feedback = root.path("feedback").asText("No feedback provided.");

            return new EvaluationResult(score, feedback);
        } catch (Exception e) {
            log.error("Error parsing evaluation response", e);
            throw new AiServiceException("Failed to parse evaluation: " + e.getMessage());
        }
    }

    /**
     * Public method to parse any JSON response from AI
     * Handles markdown code blocks and unescaped control characters
     */
    public com.fasterxml.jackson.databind.JsonNode parseJson(String aiResponse) {
        try {
            String jsonResponse = extractJson(aiResponse);
            return objectMapper.readTree(jsonResponse);
        } catch (Exception e) {
            log.error("Error parsing JSON response", e);
            throw new AiServiceException("Failed to parse JSON: " + e.getMessage());
        }
    }

    private List<String> parseStringArray(JsonNode arrayNode) {
        List<String> result = new ArrayList<>();
        if (arrayNode != null && arrayNode.isArray()) {
            for (JsonNode item : arrayNode) {
                result.add(item.asText());
            }
        }
        return result;
    }

    private String extractJson(String response) {
        try {
            if (response == null || response.isEmpty()) {
                throw new AiServiceException("Empty response from AI");
            }

            // Log raw response for debugging
            log.debug("Raw AI Response: {}", response);

            // First, sanitize the string to escape control characters within JSON strings
            String sanitized = sanitizeJsonString(response);
            String cleaned = sanitized.trim();

            // Remove markdown code blocks if present (AI sometimes wraps JSON in ```json
            // ... ```)
            if (cleaned.startsWith("```")) {
                // Find the end of the opening code fence
                int firstNewline = cleaned.indexOf('\n');
                if (firstNewline != -1) {
                    cleaned = cleaned.substring(firstNewline + 1);
                }
                // Remove closing code fence
                if (cleaned.endsWith("```")) {
                    cleaned = cleaned.substring(0, cleaned.length() - 3);
                }
                cleaned = cleaned.trim();
            }

            int jsonStart = cleaned.indexOf('{');
            int arrayStart = cleaned.indexOf('[');

            // Logic: Determine if it's an Object or Array based on which comes first
            // If it starts with { (or { comes before [), treat as Object
            if (jsonStart != -1 && (arrayStart == -1 || jsonStart < arrayStart)) {
                int jsonEnd = cleaned.lastIndexOf('}');
                if (jsonEnd > jsonStart) {
                    String extracted = cleaned.substring(jsonStart, jsonEnd + 1);
                    log.debug("Extracted JSON Object: {}", extracted);
                    return extracted;
                }
            }

            // If it starts with [ (or [ comes before {), treat as Array
            if (arrayStart != -1 && (jsonStart == -1 || arrayStart < jsonStart)) {
                int arrayEnd = cleaned.lastIndexOf(']');
                if (arrayEnd > arrayStart) {
                    String extracted = cleaned.substring(arrayStart, arrayEnd + 1);
                    log.debug("Extracted JSON Array: {}", extracted);
                    return extracted;
                }
            }

            // Fallback: If we assume mixed content but failed above, try standard object
            // extraction as default
            if (jsonStart != -1) {
                int jsonEnd = cleaned.lastIndexOf('}');
                if (jsonEnd > jsonStart) {
                    return cleaned.substring(jsonStart, jsonEnd + 1);
                }
            }

            log.warn("No JSON braces found in response: {}", response);
            throw new AiServiceException("Failed to extract JSON: No JSON object or array found");

        } catch (Exception e) {
            log.error("Error extracting JSON from response. Response length: {}",
                    response != null ? response.length() : 0);
            throw new AiServiceException("Failed to extract JSON from AI response: " + e.getMessage());
        }
    }

    /**
     * Sanitizes a raw JSON string by escaping unescaped control characters.
     * AI models sometimes return JSON with literal newlines inside string values,
     * which causes parsing failures.
     */
    private String sanitizeJsonString(String input) {
        if (input == null)
            return null;

        StringBuilder result = new StringBuilder();
        boolean inString = false;
        boolean escaped = false;

        for (char c : input.toCharArray()) {
            if (escaped) {
                result.append(c);
                escaped = false;
                continue;
            }

            if (c == '\\') {
                escaped = true;
                result.append(c);
                continue;
            }

            if (c == '"') {
                inString = !inString;
                result.append(c);
                continue;
            }

            // If we're inside a string, escape control characters
            if (inString) {
                switch (c) {
                    case '\n' -> result.append("\\n");
                    case '\r' -> result.append("\\r");
                    case '\t' -> result.append("\\t");
                    default -> result.append(c);
                }
            } else {
                result.append(c);
            }
        }

        return result.toString();
    }

    public record EvaluationResult(int score, String feedback) {
    }
}
