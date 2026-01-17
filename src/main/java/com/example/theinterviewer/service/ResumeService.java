package com.example.theinterviewer.service;

import com.example.theinterviewer.dto.resume.ResumeAnalysisResponse;
import com.example.theinterviewer.dto.resume.ResumeUploadResponse;
import com.example.theinterviewer.entity.Resume;
import com.example.theinterviewer.entity.ResumeAnalysis;
import com.example.theinterviewer.exception.ResourceNotFoundException;
import com.example.theinterviewer.repository.ResumeAnalysisRepository;
import com.example.theinterviewer.repository.ResumeRepository;
import com.example.theinterviewer.service.ai.AiResponseParser;
import com.example.theinterviewer.service.ai.GroqClient;
import com.example.theinterviewer.service.storage.FileParsingService;
import com.example.theinterviewer.service.storage.FileValidationService;
import com.example.theinterviewer.service.storage.LocalFileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final FileValidationService fileValidationService;
    private final FileParsingService fileParsingService;
    private final LocalFileStorageService fileStorageService;
    private final GroqClient groqClient;
    private final AiResponseParser aiResponseParser;
    private final ModelMapper modelMapper;

    @Transactional
    public ResumeUploadResponse uploadResume(Long userId, MultipartFile file) throws IOException {
        log.info("Uploading resume for user: {}", userId);

        // Validate file
        fileValidationService.validateFile(file);

        // Parse resume text
        String parsedText = fileParsingService.parseResume(file);

        // Sanitize filename
        String sanitizedFilename = fileValidationService.sanitizeFileName(file.getOriginalFilename());

        // Upload file to storage
        String fileUrl = fileStorageService.uploadFile(file, sanitizedFilename);

        // Create new resume entity - always store new entry to track
        // history/improvement
        Resume resume = new Resume();
        resume.setUserId(userId);
        resume.setFileName(sanitizedFilename);
        resume.setFileUrl(fileUrl);
        resume.setParsedText(parsedText);

        log.info("Created new resume version for user: {}", userId);

        resume = resumeRepository.save(resume);

        log.info("Resume uploaded successfully with ID: {}", resume.getId());

        return new ResumeUploadResponse(
                resume.getId(),
                resume.getFileName(),
                resume.getUploadedAt());
    }

    @Transactional
    public ResumeAnalysisResponse analyzeResume(Long resumeId, Long userId) {
        log.info("Analyzing resume: {} for user: {}", resumeId, userId);

        // Get resume
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        // Verify ownership
        if (!resume.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Resume not found");
        }

        // Check if analysis already exists
        return resumeAnalysisRepository.findByResumeId(resumeId)
                .map(this::mapToResponse)
                .orElseGet(() -> performAnalysis(resume));
    }

    private ResumeAnalysisResponse performAnalysis(Resume resume) {
        // Call AI to analyze resume
        String aiResponse = groqClient.analyzeResume(resume.getParsedText(), resume.getUserId(), resume.getId());

        // Parse AI response
        ResumeAnalysis analysis = aiResponseParser.parseResumeAnalysis(aiResponse);
        analysis.setResumeId(resume.getId());

        log.info("Analysis parsed: atsScore={}, sections={}", analysis.getAtsScore(), analysis.getMissingSections());

        // Save analysis
        analysis = resumeAnalysisRepository.save(analysis);

        log.info("Resume analysis saved for resume ID: {}", resume.getId());

        ResumeAnalysisResponse response = mapToResponse(analysis);
        log.info("Mapped Response: atsScore={}", response.getAtsScore());

        return response;
    }

    public ResumeAnalysisResponse getResumeAnalysis(Long resumeId, Long userId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));

        if (!resume.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Resume not found");
        }

        ResumeAnalysis analysis = resumeAnalysisRepository.findByResumeId(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume analysis not found"));

        return mapToResponse(analysis);
    }

    public List<Resume> getUserResumes(Long userId) {
        return resumeRepository.findByUserIdOrderByUploadedAtDesc(userId);
    }

    private ResumeAnalysisResponse mapToResponse(ResumeAnalysis analysis) {
        if (analysis == null)
            return null;

        return new ResumeAnalysisResponse(
                analysis.getId(),
                analysis.getResumeId(),
                analysis.getAtsScore(),
                analysis.getStrengths(),
                analysis.getWeaknesses(),
                analysis.getMissingSections(),
                analysis.getFormatFeedback(),
                analysis.getContentFeedback(),
                analysis.getImprovementTips(),
                analysis.getOverallSummary());
    }
}
