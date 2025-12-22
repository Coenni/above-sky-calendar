package com.abovesky.calendar.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Service for sending various types of emails using templates and async processing.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    // Reusable SecureRandom instance for better performance
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Value("${spring.mail.username:noreply@aboveskycalendar.com}")
    private String fromEmail;

    @Value("${spring.application.name:Above Sky Calendar}")
    private String applicationName;

    // TODO: For production, replace with Redis or database storage
    // In-memory storage is not suitable for production as it:
    // 1. Won't survive application restarts
    // 2. Doesn't work in multi-instance deployments
    // 3. Not suitable for horizontal scaling
    // Store for OTP verification (in production, use Redis or database)
    private final Map<String, OtpData> otpStore = new HashMap<>();

    // Store for reset tokens (in production, use database)
    private final Map<String, TokenData> resetTokenStore = new HashMap<>();

    /**
     * Send OTP (One-Time Password) email for verification
     */
    @Async
    public void sendOtpEmail(String to, String username) {
        try {
            String otp = generateOtp();
            LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(10);
            
            // Store OTP (in production, use Redis or database)
            otpStore.put(to, new OtpData(otp, expiryTime));
            
            Context context = new Context();
            context.setVariable("username", username);
            context.setVariable("otp", otp);
            context.setVariable("expiryMinutes", "10");
            context.setVariable("applicationName", applicationName);
            
            String htmlContent = templateEngine.process("otp-email", context);
            
            sendEmail(to, "Your One-Time Password", htmlContent);
            log.info("OTP email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}", to, e);
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    /**
     * Validate OTP
     */
    public boolean validateOtp(String email, String otp) {
        OtpData otpData = otpStore.get(email);
        
        if (otpData == null) {
            log.warn("OTP not found for email: {}", email);
            return false;
        }
        
        if (LocalDateTime.now().isAfter(otpData.expiryTime)) {
            otpStore.remove(email);
            log.warn("OTP expired for email: {}", email);
            return false;
        }
        
        if (otpData.otp.equals(otp)) {
            otpStore.remove(email);
            log.info("OTP validated successfully for email: {}", email);
            return true;
        }
        
        log.warn("Invalid OTP provided for email: {}", email);
        return false;
    }

    /**
     * Send password reset email with secure token
     */
    @Async
    public void sendPasswordResetEmail(String to, String username, String baseUrl) {
        try {
            String resetToken = generateResetToken();
            LocalDateTime expiryTime = LocalDateTime.now().plusHours(1);
            
            // Store reset token (in production, use database)
            resetTokenStore.put(resetToken, new TokenData(to, expiryTime));
            
            String resetLink = baseUrl + "/reset-password?token=" + resetToken;
            
            Context context = new Context();
            context.setVariable("username", username);
            context.setVariable("resetLink", resetLink);
            context.setVariable("expiryHours", "1");
            context.setVariable("applicationName", applicationName);
            
            String htmlContent = templateEngine.process("password-reset-email", context);
            
            sendEmail(to, "Password Reset Request", htmlContent);
            log.info("Password reset email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", to, e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    /**
     * Validate reset token
     */
    public boolean validateResetToken(String token) {
        TokenData tokenData = resetTokenStore.get(token);
        
        if (tokenData == null) {
            log.warn("Reset token not found: {}", token);
            return false;
        }
        
        if (LocalDateTime.now().isAfter(tokenData.expiryTime)) {
            resetTokenStore.remove(token);
            log.warn("Reset token expired: {}", token);
            return false;
        }
        
        log.info("Reset token validated successfully for email: {}", tokenData.email);
        return true;
    }

    /**
     * Get email associated with reset token and remove token
     */
    public String getEmailByResetToken(String token) {
        TokenData tokenData = resetTokenStore.remove(token);
        return tokenData != null ? tokenData.email : null;
    }

    /**
     * Send marketing/promotional email
     */
    @Async
    public void sendMarketingEmail(String to, String subject, String content, String unsubscribeToken) {
        try {
            String unsubscribeLink = "https://aboveskycalendar.com/unsubscribe?token=" + unsubscribeToken;
            
            Context context = new Context();
            context.setVariable("content", content);
            context.setVariable("unsubscribeLink", unsubscribeLink);
            context.setVariable("applicationName", applicationName);
            
            String htmlContent = templateEngine.process("marketing-email", context);
            
            sendEmail(to, subject, htmlContent);
            log.info("Marketing email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send marketing email to: {}", to, e);
            // Don't throw exception for marketing emails
            log.warn("Continuing after marketing email failure");
        }
    }

    /**
     * Send welcome email to new user
     */
    @Async
    public void sendWelcomeEmail(String to, String username) {
        try {
            Context context = new Context();
            context.setVariable("username", username);
            context.setVariable("applicationName", applicationName);
            context.setVariable("loginUrl", "https://aboveskycalendar.com/login");
            
            String htmlContent = templateEngine.process("welcome-email", context);
            
            sendEmail(to, "Welcome to " + applicationName, htmlContent);
            log.info("Welcome email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", to, e);
        }
    }

    /**
     * Send PIN reset email with secure token
     */
    @Async
    public void sendPinResetEmail(String to, String username, String resetToken, String baseUrl) {
        try {
            LocalDateTime expiryTime = LocalDateTime.now().plusHours(1);
            
            String resetLink = baseUrl + "/reset-pin?token=" + resetToken;
            
            Context context = new Context();
            context.setVariable("username", username);
            context.setVariable("resetLink", resetLink);
            context.setVariable("expiryHours", "1");
            context.setVariable("applicationName", applicationName);
            
            String htmlContent = templateEngine.process("pin-reset-email", context);
            
            sendEmail(to, "PIN Reset Request", htmlContent);
            log.info("PIN reset email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send PIN reset email to: {}", to, e);
            throw new RuntimeException("Failed to send PIN reset email", e);
        }
    }

    /**
     * Send generic email
     */
    private void sendEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        
        mailSender.send(message);
    }

    /**
     * Generate 6-digit OTP
     */
    private String generateOtp() {
        int otp = 100000 + SECURE_RANDOM.nextInt(900000);
        return String.valueOf(otp);
    }

    /**
     * Generate secure reset token
     */
    private String generateResetToken() {
        return UUID.randomUUID().toString();
    }

    /**
     * Inner class to store OTP data
     */
    private static class OtpData {
        private final String otp;
        private final LocalDateTime expiryTime;

        public OtpData(String otp, LocalDateTime expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }

    /**
     * Inner class to store reset token data
     */
    private static class TokenData {
        private final String email;
        private final LocalDateTime expiryTime;

        public TokenData(String email, LocalDateTime expiryTime) {
            this.email = email;
            this.expiryTime = expiryTime;
        }
    }
}
