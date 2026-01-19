package com.example.theinterviewer.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${email.from}")
    private String fromEmail;

    @Value("${email.from-name}")
    private String fromName;

    /**
     * Send welcome email to new user
     * 
     * @param toEmail  User's email address
     * @param userName User's full name
     */
    @Async
    public void sendWelcomeEmail(String toEmail, String userName) {
        try {
            log.info("Sending welcome email to: {}", toEmail);

            // Load HTML template
            String htmlContent = loadWelcomeEmailTemplate(userName);

            // Send email
            sendHtmlEmail(toEmail, "Welcome to The Interviewer! 🎉", htmlContent);

            log.info("Welcome email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            // Log error but don't throw - email failure shouldn't block registration
            log.error("Failed to send welcome email to: {}. Error: {}", toEmail, e.getMessage(), e);
        }
    }

    /**
     * Generic method to send HTML email
     * 
     * @throws UnsupportedEncodingException
     */
    private void sendHtmlEmail(String to, String subject, String htmlContent)
            throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail, fromName);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true); // true = HTML

        mailSender.send(message);
    }

    /**
     * Load and personalize welcome email template
     */
    private String loadWelcomeEmailTemplate(String userName) {
        try {
            ClassPathResource resource = new ClassPathResource("templates/welcome-email.html");
            String template = Files.readString(resource.getFile().toPath(), StandardCharsets.UTF_8);

            // Replace placeholders
            template = template.replace("{{userName}}", userName);
            template = template.replace("{{currentYear}}", String.valueOf(java.time.Year.now().getValue()));

            return template;
        } catch (Exception e) {
            log.error("Failed to load email template", e);
            // Fallback to simple text
            return getFallbackWelcomeEmail(userName);
        }
    }

    /**
     * Fallback email if template loading fails
     */
    private String getFallbackWelcomeEmail(String userName) {
        return String.format("""
                <html>
                <body style="font-family: Arial, sans-serif; background-color: #000000; color: #ffffff; padding: 20px;">
                    <h1 style="color: #2563EB;">Welcome to The Interviewer!</h1>
                    <p>Hi %s,</p>
                    <p>Thank you for joining The Interviewer. We're excited to help you ace your next interview!</p>
                    <p>Get started by uploading your resume and practicing with our AI-powered interview system.</p>
                    <p>Best regards,<br>The Interviewer Team</p>
                </body>
                </html>
                """, userName);
    }

    /**
     * Send support query email to admin
     */
    @Async
    public void sendSupportQuery(String name, String email, String query) {
        try {
            log.info("Sending support query from: {}", email);

            String htmlContent = loadSupportEmailTemplate(name, email, query);
            String subject = "New Support Query from " + name;

            // Send to support email
            sendHtmlEmail("help@theinterviewer.site", subject, htmlContent);

            log.info("Support email sent successfully");
        } catch (Exception e) {
            log.error("Failed to send support email", e);
        }
    }

    private String loadSupportEmailTemplate(String name, String email, String query) {
        try {
            // Simple HTML for support query
            return String.format("""
                    <html>
                    <body style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
                        <h2>New Support Query</h2>
                        <p><strong>From:</strong> %s (%s)</p>
                        <hr/>
                        <h3>Query:</h3>
                        <p style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">%s</p>
                        <hr/>
                        <p style="font-size: 12px; color: #666;">Received via The Interviewer Support Page</p>
                    </body>
                    </html>
                    """, name, email, query.replace("\\n", "<br/>"));
        } catch (Exception e) {
            return "Query from " + name + " (" + email + "): \n\n" + query;
        }
    }

    /**
     * Send password reset email
     */
    @Async
    public void sendPasswordResetEmail(String toEmail, String userName, String resetLink) {
        try {
            log.info("Sending password reset email to: {}", toEmail);

            String htmlContent = loadPasswordResetTemplate(userName, resetLink);
            sendHtmlEmail(toEmail, "Reset Your Password - The Interviewer", htmlContent);

            log.info("Password reset email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", toEmail, e);
        }
    }

    private String loadPasswordResetTemplate(String userName, String resetLink) {
        try {
            ClassPathResource resource = new ClassPathResource("templates/forgot-password-email.html");
            String template = Files.readString(resource.getFile().toPath(), StandardCharsets.UTF_8);

            // Replace placeholders
            template = template.replace("{{userName}}", userName);
            template = template.replace("{{resetLink}}", resetLink);
            template = template.replace("{{currentYear}}", String.valueOf(java.time.Year.now().getValue()));

            return template;
        } catch (Exception e) {
            log.error("Failed to load password reset template", e);
            return getFallbackPasswordResetEmail(userName, resetLink);
        }
    }

    private String getFallbackPasswordResetEmail(String userName, String resetLink) {
        return String.format(
                """
                        <html>
                        <body style="font-family: Arial, sans-serif; background-color: #000000; color: #ffffff; padding: 20px;">
                            <div style="max-width: 600px; margin: 0 auto; background-color: #111; border-radius: 10px; padding: 30px; border: 1px solid #333;">
                                <h2 style="color: #2563EB; margin-top: 0;">Password Reset Request</h2>
                                <p>Hi %s,</p>
                                <p>We received a request to reset your password for The Interviewer account.</p>
                                <p>Click the button below to set a new password:</p>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="%s" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
                                </div>
                                <p style="color: #999; font-size: 14px;">If you didn't request this, you can safely ignore this email. The link will expire in 24 hours.</p>
                                <hr style="border-color: #333; margin-top: 30px;">
                                <p style="color: #666; font-size: 12px;">© The Interviewer. All rights reserved.</p>
                            </div>
                        </body>
                        </html>
                        """,
                userName, resetLink);
    }
}
