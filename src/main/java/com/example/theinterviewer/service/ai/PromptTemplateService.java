package com.example.theinterviewer.service.ai;

import com.example.theinterviewer.entity.InterviewProfile;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class PromptTemplateService {

  public String buildInterviewContext(InterviewProfile profile, String resumeText, String recentProjects) {
    StringBuilder context = new StringBuilder();

    context.append("Candidate Profile:\n");
    context.append("- Current Role: ").append(profile.getCurrentRole()).append("\n");
    context.append("- Experience: ").append(profile.getExperienceYears()).append(" years\n");
    context.append("- Tech Stack: ").append(String.join(", ", profile.getTechStack())).append("\n");
    context.append("- Difficulty Level: ").append(profile.getDifficultyLevel()).append("\n");

    if (recentProjects != null && !recentProjects.isEmpty()) {
      context.append("\nRecent Projects:\n").append(recentProjects).append("\n");
    }

    if (resumeText != null && !resumeText.isEmpty()) {
      context.append("\nResume Summary:\n");
      // Include first 500 characters of resume for context
      int length = Math.min(500, resumeText.length());
      context.append(resumeText.substring(0, length));
      if (resumeText.length() > 500) {
        context.append("...");
      }
    }

    return context.toString();
  }

  public String buildHRQuestionPrompt(String context) {
    return """
        Generate HR/Personality round questions for the candidate.

        %s

        Focus on:
        - Communication skills
        - Problem-solving approach
        - Team collaboration
        - Career goals and motivation
        - Handling challenges

        Generate ONLY 1 behavioral question.

        Respond ONLY with valid JSON in this format:
        {
          "questions": [
            "Question text here"
          ]
        }
        """.formatted(context);
  }

  public String buildTechnicalQuestionPrompt(String context) {
    return """
        Generate Technical round questions for the candidate.

        %s

        Focus on:
        - Core technical concepts from their tech stack
        - Problem-solving and algorithms
        - System design (if applicable)
        - Best practices and patterns
        - Real-world application scenarios

        Generate ONLY 1 technical question appropriate for their experience level.

        Respond ONLY with valid JSON in this format:
        {
          "questions": [
            "Question text here"
          ]
        }
        """.formatted(context);
  }

  public String buildProjectQuestionPrompt(String context, String resumeText) {
    return """
        Generate Project-based questions for the candidate based on their resume.

        %s

        Resume Details:
        %s

        Focus on:
        - Specific projects mentioned in resume
        - Technology choices and architecture decisions
        - Challenges faced and solutions implemented
        - Team collaboration and ownership
        - Impact and results

        Generate ONLY 1 question directly related to their projects.

        Respond ONLY with valid JSON in this format:
        {
          "questions": [
            "Question text here"
          ]
        }
        """.formatted(context, resumeText);
  }

  public String buildFinalReportPrompt(String context, String interviewData) {
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
