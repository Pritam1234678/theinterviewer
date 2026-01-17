package com.example.theinterviewer.service;

import com.example.theinterviewer.dto.interview.*;
import com.example.theinterviewer.entity.*;
import com.example.theinterviewer.exception.AiServiceException;
import com.example.theinterviewer.exception.ResourceNotFoundException;
import com.example.theinterviewer.repository.InterviewProfileRepository;
import com.example.theinterviewer.repository.InterviewQuestionRepository;
import com.example.theinterviewer.repository.InterviewReportRepository;
import com.example.theinterviewer.repository.InterviewSessionRepository;
import com.example.theinterviewer.repository.ResumeAnalysisRepository;
import com.example.theinterviewer.repository.ResumeRepository;
import com.example.theinterviewer.repository.UserRepository;
import com.example.theinterviewer.service.ai.AiResponseParser;
import com.example.theinterviewer.service.ai.GroqClient;
import com.example.theinterviewer.service.ai.PromptTemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewProfileRepository profileRepository;
    private final InterviewSessionRepository sessionRepository;
    private final InterviewQuestionRepository questionRepository;
    private final InterviewReportRepository reportRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final GroqClient groqClient;
    private final AiResponseParser aiResponseParser;
    private final PromptTemplateService promptTemplateService;
    private final CreditService creditService;
    private final UserRepository userRepository;

    @SuppressWarnings("null")
    @Transactional
    public Long createProfile(Long userId, InterviewProfileRequest request) {
        log.info("Creating interview profile for user: {}", userId);

        Resume resume = null;

        // Optimized Resume Handling
        if (request.getResumeId() != null && request.getResumeId() > 0) {
            resume = resumeRepository.findById(request.getResumeId())
                    .orElse(null);
        }

        // Fallback: Get latest resume
        if (resume == null || !resume.getUserId().equals(userId)) {
            List<Resume> userResumes = resumeRepository.findByUserIdOrderByUploadedAtDesc(userId);
            if (!userResumes.isEmpty()) {
                resume = userResumes.get(0);
            } else {
                // No resume found - handle gracefully by not throwing error yet,
                // or throw if critical. Assuming we CAN proceed without resume for now
                // or we'll create a mock empty resume context later.
                // For simplified flow, let's just log and continue, setting resumeId to null.
                log.warn("No resume found for user {}", userId);
            }
        }

        InterviewProfile profile = new InterviewProfile();
        profile.setUserId(userId);
        profile.setCurrentRole(request.getCurrentRole());
        profile.setExperienceYears(request.getExperienceYears());
        profile.setTechStack(request.getTechStack());
        profile.setDifficultyLevel(InterviewProfile.DifficultyLevel.valueOf(request.getDifficultyLevel()));
        profile.setRecentProjects(request.getRecentProjects());
        if (resume != null) {
            profile.setResumeId(resume.getId());
        }

        profile = profileRepository.save(profile);

        log.info("Interview profile created with ID: {}", profile.getId());
        return profile.getId();
    }

    @Transactional
    public InterviewSessionResponse startInterview(Long userId, Long profileId) {
        log.info("Starting interview for user: {} with profile: {}", userId, profileId);

        // STEP 1: Check and deduct credits BEFORE anything else
        if (!creditService.hasEnoughCredits(userId, 25)) {
            throw new CreditService.InsufficientCreditsException(
                    "Insufficient credits. You need 25 credits to start an interview.");
        }

        // Get profile
        InterviewProfile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview profile not found"));

        if (!profile.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Interview profile not found");
        }

        // Get resume - try profile link first, then fallback
        Resume resume = null;
        if (profile.getResumeId() != null) {
            resume = resumeRepository.findById(profile.getResumeId()).orElse(null);
        }

        if (resume == null) {
            List<Resume> userResumes = resumeRepository.findByUserIdOrderByUploadedAtDesc(userId);
            if (!userResumes.isEmpty()) {
                resume = userResumes.get(0);
            } else {
                throw new ResourceNotFoundException("No resume found. Please upload a resume first.");
            }
        }

        // Create interview session
        InterviewSession session = new InterviewSession();
        session.setUserId(userId);
        session.setResumeId(resume.getId());
        session.setProfileId(profileId);
        session.setSessionStatus(InterviewSession.SessionStatus.IN_PROGRESS);

        session = sessionRepository.save(session);

        // STEP 2: Deduct credits AFTER session is created (so we can link transaction)
        try {
            creditService.deductCredits(
                    userId,
                    25,
                    com.example.theinterviewer.entity.CreditTransaction.TransactionType.INTERVIEW_DEDUCTION,
                    "Interview: " + (profile.getCurrentRole() != null ? profile.getCurrentRole() : "General Interview"),
                    session);

            // Increment free interviews used
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            user.setFreeInterviewsUsed(user.getFreeInterviewsUsed() + 1);
            userRepository.save(user);

            log.info("Credits deducted successfully for user: {}", userId);
        } catch (Exception e) {
            // If credit deduction fails, delete the session and rollback
            log.error("Failed to deduct credits, rolling back session creation", e);
            sessionRepository.delete(session);
            throw e;
        }

        // Generate Round 1 (HR) questions
        try {
            generateQuestionsForRound(session, profile, resume, InterviewQuestion.RoundType.HR);
        } catch (Exception e) {
            log.error("Failed to generate HR questions for session {}: {}", session.getId(), e.getMessage(), e);
            // Delete the session since we couldn't generate questions
            // Credits will be rolled back automatically due to @Transactional
            sessionRepository.delete(session);
            throw new AiServiceException("Failed to generate interview questions: " + e.getMessage());
        }

        log.info("Interview session started with ID: {}", session.getId());

        return new InterviewSessionResponse(
                session.getId(),
                session.getSessionStatus().name(),
                session.getStartedAt(),
                "HR");
    }

    @Transactional
    public QuestionResponse getNextQuestion(Long sessionId, Long userId) {
        // Verify session belongs to user
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview session not found"));

        if (!session.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Interview session not found");
        }

        // Find next unanswered question
        List<InterviewQuestion> unansweredQuestions = questionRepository
                .findBySessionIdAndUserAnswerIsNull(sessionId);

        if (unansweredQuestions.isEmpty()) {
            throw new ResourceNotFoundException("No more questions available");
        }

        InterviewQuestion question = unansweredQuestions.get(0);

        return new QuestionResponse(
                question.getId(),
                question.getQuestionText(),
                question.getRoundType().name());
    }

    @Transactional
    public AnswerEvaluationResponse submitAnswer(Long sessionId, Long userId, AnswerRequest request) {
        log.info("Submitting answer for question: {} in session: {}", request.getQuestionId(), sessionId);

        // Verify session
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview session not found"));

        if (!session.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Interview session not found");
        }

        // Get question
        InterviewQuestion question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

        if (!question.getSessionId().equals(sessionId)) {
            throw new ResourceNotFoundException("Question not found");
        }

        // Update question with answer
        question.setUserAnswer(request.getUserAnswer());

        // Evaluate answer with AI
        InterviewProfile profile = profileRepository.findById(session.getProfileId())
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        Resume resume = resumeRepository.findById(session.getResumeId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        String context = promptTemplateService.buildInterviewContext(profile, resume.getParsedText(),
                profile.getRecentProjects());

        // AI evaluation with graceful error handling
        int score = 0;
        String feedback = "Evaluation could not be completed.";
        try {
            String evaluationJson = groqClient.evaluateAnswer(question.getQuestionText(), request.getUserAnswer(),
                    context,
                    userId, sessionId);
            AiResponseParser.EvaluationResult evaluation = aiResponseParser.parseEvaluation(evaluationJson);
            score = evaluation.score();
            feedback = evaluation.feedback();
        } catch (Exception e) {
            log.error("AI evaluation failed for question {}: {}", request.getQuestionId(), e.getMessage());
            feedback = "Automatic evaluation failed. Your answer has been recorded.";
        }

        question.setScore(score);
        question.setAiFeedback(feedback);
        questionRepository.save(question);

        log.info("Answer evaluated with score: {}", score);

        // Check if there are more questions in current round
        List<InterviewQuestion> unansweredQuestions = questionRepository
                .findBySessionIdAndUserAnswerIsNull(sessionId);

        QuestionResponse nextQuestion = null;

        if (!unansweredQuestions.isEmpty()) {
            InterviewQuestion next = unansweredQuestions.get(0);
            nextQuestion = new QuestionResponse(
                    next.getId(),
                    next.getQuestionText(),
                    next.getRoundType().name());
        } else {
            // Check if we need to generate next round questions
            generateNextRoundIfNeeded(session, profile, resume);

            // Try to get next question again
            unansweredQuestions = questionRepository.findBySessionIdAndUserAnswerIsNull(sessionId);
            if (!unansweredQuestions.isEmpty()) {
                InterviewQuestion next = unansweredQuestions.get(0);
                nextQuestion = new QuestionResponse(
                        next.getId(),
                        next.getQuestionText(),
                        next.getRoundType().name());
            }
        }

        return new AnswerEvaluationResponse(
                score,
                feedback,
                nextQuestion);
    }

    @Transactional
    public InterviewReportResponse completeInterview(Long sessionId, Long userId)
            throws com.fasterxml.jackson.core.JsonProcessingException {
        log.info("Completing interview session: {}", sessionId);

        // Verify session
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview session not found"));

        if (!session.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Interview session not found");
        }

        // Mark session as completed
        session.setSessionStatus(InterviewSession.SessionStatus.COMPLETED);
        session.setEndedAt(LocalDateTime.now());
        sessionRepository.save(session);

        // Generate final report MANUALLY (No AI Summary)
        List<InterviewQuestion> allQuestions = questionRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);

        // Calculate scores
        double hrScore = allQuestions.stream()
                .filter(q -> q.getRoundType() == InterviewQuestion.RoundType.HR)
                .mapToInt(InterviewQuestion::getScore)
                .average()
                .orElse(0.0);

        double technicalScore = allQuestions.stream()
                .filter(q -> q.getRoundType() == InterviewQuestion.RoundType.TECHNICAL)
                .mapToInt(InterviewQuestion::getScore)
                .average()
                .orElse(0.0);

        double projectScore = allQuestions.stream()
                .filter(q -> q.getRoundType() == InterviewQuestion.RoundType.PROJECT)
                .mapToInt(InterviewQuestion::getScore)
                .average()
                .orElse(0.0);

        double overallScore = allQuestions.stream()
                .mapToInt(InterviewQuestion::getScore)
                .average()
                .orElse(0.0);

        // Round all scores to 3 decimal places
        hrScore = Math.round(hrScore * 1000.0) / 1000.0;
        technicalScore = Math.round(technicalScore * 1000.0) / 1000.0;
        projectScore = Math.round(projectScore * 1000.0) / 1000.0;
        overallScore = Math.round(overallScore * 1000.0) / 1000.0;

        InterviewReport report = new InterviewReport();
        report.setSessionId(sessionId);
        report.setHrScore(hrScore);
        report.setTechnicalScore(technicalScore);
        report.setProjectScore(projectScore);
        report.setOverallScore(overallScore);

        // Determine Final Verdict
        if (overallScore >= 7) {
            report.setFinalVerdict(InterviewReport.FinalVerdict.STRONG);
        } else if (overallScore >= 4) {
            report.setFinalVerdict(InterviewReport.FinalVerdict.AVERAGE);
        } else {
            report.setFinalVerdict(InterviewReport.FinalVerdict.NEEDS_IMPROVEMENT);
        }

        // Generate AI Summary - no fallback, must succeed or fail properly
        InterviewProfile profile = profileRepository.findById(session.getProfileId())
                .orElseThrow(() -> new ResourceNotFoundException("Interview profile not found"));
        Resume resume = resumeRepository.findById(session.getResumeId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        String context = promptTemplateService.buildInterviewContext(profile, resume.getParsedText(),
                profile.getRecentProjects());

        StringBuilder interviewData = new StringBuilder();
        for (InterviewQuestion q : allQuestions) {
            interviewData.append("Question: ").append(q.getQuestionText()).append("\n");
            interviewData.append("Answer: ").append(q.getUserAnswer()).append("\n");
            interviewData.append("Score: ").append(q.getScore()).append("/10\n");
            interviewData.append("Feedback: ").append(q.getAiFeedback()).append("\n\n");
        }

        String summaryJson = groqClient.generateFinalReport(context, interviewData.toString(), userId, sessionId);

        // Use AiResponseParser to properly extract and sanitize JSON
        // This handles markdown code blocks AND unescaped control characters
        try {
            com.fasterxml.jackson.databind.JsonNode root = aiResponseParser.parseJson(summaryJson);
            if (root.has("summary")) {
                report.setSummary(root.get("summary").asText());
            } else {
                report.setSummary(summaryJson); // Fallback: save whole text if JSON doesn't have summary field
            }
        } catch (Exception e) {
            log.error("Failed to parse summary JSON, using raw response", e);
            report.setSummary(summaryJson); // If parsing fails, just save the raw text
        }

        report = reportRepository.save(report);

        log.info("Interview completed with overall score: {}", report.getOverallScore());

        return mapToReportResponse(report);
    }

    public InterviewReportResponse getInterviewReport(Long sessionId, Long userId) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview session not found"));

        if (!session.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Interview session not found");
        }

        InterviewReport report = reportRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview report not found"));

        // Self-healing: If report has 0 scores (due to previous bug), recalculate them
        if (report.getOverallScore() == 0) {
            List<InterviewQuestion> allQuestions = questionRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
            if (!allQuestions.isEmpty()) {
                double hrScore = allQuestions.stream()
                        .filter(q -> q.getRoundType() == InterviewQuestion.RoundType.HR)
                        .mapToInt(InterviewQuestion::getScore)
                        .average().orElse(0.0);
                double technicalScore = allQuestions.stream()
                        .filter(q -> q.getRoundType() == InterviewQuestion.RoundType.TECHNICAL)
                        .mapToInt(InterviewQuestion::getScore)
                        .average().orElse(0.0);
                double projectScore = allQuestions.stream()
                        .filter(q -> q.getRoundType() == InterviewQuestion.RoundType.PROJECT)
                        .mapToInt(InterviewQuestion::getScore)
                        .average().orElse(0.0);
                double overallScore = allQuestions.stream()
                        .mapToInt(InterviewQuestion::getScore)
                        .average().orElse(0.0);

                // Round all scores to 3 decimal places
                hrScore = Math.round(hrScore * 1000.0) / 1000.0;
                technicalScore = Math.round(technicalScore * 1000.0) / 1000.0;
                projectScore = Math.round(projectScore * 1000.0) / 1000.0;
                overallScore = Math.round(overallScore * 1000.0) / 1000.0;

                report.setHrScore(hrScore);
                report.setTechnicalScore(technicalScore);
                report.setProjectScore(projectScore);
                report.setOverallScore(overallScore);

                if (overallScore >= 7)
                    report.setFinalVerdict(InterviewReport.FinalVerdict.STRONG);
                else if (overallScore >= 4)
                    report.setFinalVerdict(InterviewReport.FinalVerdict.AVERAGE);
                else
                    report.setFinalVerdict(InterviewReport.FinalVerdict.NEEDS_IMPROVEMENT);

                report = reportRepository.save(report);
            }
        }

        return mapToReportResponse(report);
    }

    @Transactional
    public void abandonInterview(Long sessionId, Long userId) {
        log.info("Abandoning interview session: {}", sessionId);

        // Verify session belongs to user
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview session not found"));

        if (!session.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Interview session not found");
        }

        // Mark as abandoned
        session.setSessionStatus(InterviewSession.SessionStatus.ABANDONED);
        session.setEndedAt(LocalDateTime.now());
        sessionRepository.save(session);

        log.info("Interview session {} marked as ABANDONED", sessionId);
    }

    public List<InterviewSession> getUserInterviews(Long userId) {
        return sessionRepository.findByUserIdOrderByStartedAtDesc(userId);
    }

    private void generateQuestionsForRound(InterviewSession session, InterviewProfile profile,
            Resume resume, InterviewQuestion.RoundType roundType) {
        String context = promptTemplateService.buildInterviewContext(profile, resume.getParsedText(),
                profile.getRecentProjects());
        String prompt;

        switch (roundType) {
            case HR -> prompt = promptTemplateService.buildHRQuestionPrompt(context);
            case TECHNICAL -> prompt = promptTemplateService.buildTechnicalQuestionPrompt(context);
            case PROJECT -> prompt = promptTemplateService.buildProjectQuestionPrompt(context, resume.getParsedText());
            default -> throw new IllegalArgumentException("Invalid round type");
        }

        // Call AI to generate questions - if this fails, let the exception propagate
        // No fallback questions - AI must always generate proper questions
        String aiResponse = groqClient.sendPrompt(prompt, session.getUserId(), session.getId(),
                com.example.theinterviewer.entity.AiUsageLog.Module.INTERVIEW);
        List<String> questions = aiResponseParser.parseQuestions(aiResponse);

        for (String questionText : questions) {
            InterviewQuestion question = new InterviewQuestion();
            question.setSessionId(session.getId());
            question.setRoundType(roundType);
            question.setQuestionText(questionText);
            questionRepository.save(question);
        }

        log.info("Generated {} questions for {} round", questions.size(), roundType);
    }

    private void generateNextRoundIfNeeded(InterviewSession session, InterviewProfile profile, Resume resume) {
        List<InterviewQuestion> allQuestions = questionRepository.findBySessionId(session.getId());

        boolean hasHR = allQuestions.stream().anyMatch(q -> q.getRoundType() == InterviewQuestion.RoundType.HR);
        boolean hasTechnical = allQuestions.stream()
                .anyMatch(q -> q.getRoundType() == InterviewQuestion.RoundType.TECHNICAL);
        boolean hasProject = allQuestions.stream()
                .anyMatch(q -> q.getRoundType() == InterviewQuestion.RoundType.PROJECT);

        log.debug("Round status - HR: {}, Technical: {}, Project: {}", hasHR, hasTechnical, hasProject);

        if (hasHR && !hasTechnical) {
            log.info("Generating TECHNICAL round questions");
            generateQuestionsForRound(session, profile, resume, InterviewQuestion.RoundType.TECHNICAL);
        } else if (hasTechnical && !hasProject) {
            log.info("Generating PROJECT round questions");
            generateQuestionsForRound(session, profile, resume, InterviewQuestion.RoundType.PROJECT);
        } else {
            log.debug("No new round needed");
        }
    }

    private InterviewReportResponse mapToReportResponse(InterviewReport report) {
        InterviewReportResponse response = new InterviewReportResponse();
        response.setReportId(report.getId());
        response.setSessionId(report.getSessionId());
        response.setHrScore(report.getHrScore());
        response.setTechnicalScore(report.getTechnicalScore());
        response.setProjectScore(report.getProjectScore());
        response.setOverallScore(report.getOverallScore());
        response.setFinalVerdict(report.getFinalVerdict().name());
        response.setSummary(report.getSummary());

        // Fetch questions and map to DTO
        List<InterviewQuestion> questions = questionRepository
                .findBySessionIdOrderByCreatedAtAsc(report.getSessionId());
        List<com.example.theinterviewer.dto.interview.QuestionFeedbackDto> questionDtos = questions.stream()
                .map(q -> new com.example.theinterviewer.dto.interview.QuestionFeedbackDto(
                        q.getId(),
                        q.getQuestionText(),
                        q.getUserAnswer(),
                        q.getAiFeedback(),
                        q.getScore(),
                        q.getRoundType()))
                .toList();

        response.setQuestions(questionDtos);

        // Fetch Resume Feedback
        try {
            InterviewSession session = sessionRepository.findById(report.getSessionId()).orElse(null);
            if (session != null) {
                resumeAnalysisRepository.findByResumeId(session.getResumeId())
                        .ifPresent(analysis -> response.setResumeFeedback(analysis.getContentFeedback()));
            }
        } catch (Exception e) {
            log.warn("Failed to fetch resume feedback for report {}", report.getId(), e);
        }

        return response;
    }
}
