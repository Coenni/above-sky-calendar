package com.abovesky.calendar.service;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.concurrent.CompletableFuture;

/**
 * SendGrid Email Service for Production
 * Uses SendGrid API to send emails in production environment
 */
@Slf4j
@Service
@Profile("prod")
public class SendGridEmailService {

    @Value("${sendgrid.api-key}")
    private String sendGridApiKey;

    @Value("${sendgrid.from-email}")
    private String fromEmail;

    @Value("${sendgrid.from-name:Above Sky Calendar}")
    private String fromName;

    // Rate limiting: max emails per second
    private static final int MAX_EMAILS_PER_SECOND = 10;
    private long lastEmailTime = 0;
    private int emailCount = 0;

    /**
     * Send an email using SendGrid
     */
    public CompletableFuture<Boolean> sendEmail(String to, String subject, String htmlContent) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Rate limiting
                enforceRateLimit();

                Email from = new Email(fromEmail, fromName);
                Email toEmail = new Email(to);
                Content content = new Content("text/html", htmlContent);
                Mail mail = new Mail(from, subject, toEmail, content);

                SendGrid sg = new SendGrid(sendGridApiKey);
                Request request = new Request();

                request.setMethod(Method.POST);
                request.setEndpoint("mail/send");
                request.setBody(mail.build());

                Response response = sg.api(request);

                if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                    log.info("Email sent successfully to: {}, subject: {}", to, subject);
                    return true;
                } else {
                    log.error("Failed to send email. Status: {}, Body: {}", 
                             response.getStatusCode(), response.getBody());
                    return false;
                }

            } catch (IOException e) {
                log.error("Error sending email to: {}", to, e);
                return false;
            }
        });
    }

    /**
     * Send OTP email
     */
    public CompletableFuture<Boolean> sendOtpEmail(String to, String otp) {
        String subject = "Your OTP Code - Above Sky Calendar";
        String htmlContent = buildOtpEmailHtml(otp);
        return sendEmail(to, subject, htmlContent);
    }

    /**
     * Send password reset email
     */
    public CompletableFuture<Boolean> sendPasswordResetEmail(String to, String resetToken, String resetUrl) {
        String subject = "Password Reset Request - Above Sky Calendar";
        String htmlContent = buildPasswordResetEmailHtml(resetUrl);
        return sendEmail(to, subject, htmlContent);
    }

    /**
     * Send welcome email
     */
    public CompletableFuture<Boolean> sendWelcomeEmail(String to, String userName) {
        String subject = "Welcome to Above Sky Calendar!";
        String htmlContent = buildWelcomeEmailHtml(userName);
        return sendEmail(to, subject, htmlContent);
    }

    /**
     * Send task reminder email
     */
    public CompletableFuture<Boolean> sendTaskReminderEmail(String to, String taskTitle, String dueDate) {
        String subject = "Task Reminder: " + taskTitle;
        String htmlContent = buildTaskReminderEmailHtml(taskTitle, dueDate);
        return sendEmail(to, subject, htmlContent);
    }

    /**
     * Enforce rate limiting to prevent abuse
     */
    private synchronized void enforceRateLimit() {
        long currentTime = System.currentTimeMillis();
        long timeDiff = currentTime - lastEmailTime;

        if (timeDiff < 1000) {
            // Within the same second
            emailCount++;
            if (emailCount > MAX_EMAILS_PER_SECOND) {
                try {
                    Thread.sleep(1000 - timeDiff);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                emailCount = 0;
                lastEmailTime = System.currentTimeMillis();
            }
        } else {
            // New second
            emailCount = 0;
            lastEmailTime = currentTime;
        }
    }

    // HTML email templates

    private String buildOtpEmailHtml(String otp) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .otp-box { background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; }
                    .footer { margin-top: 30px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Your OTP Code</h2>
                    <p>Use the following OTP code to complete your authentication:</p>
                    <div class="otp-box">%s</div>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this code, please ignore this email.</p>
                    <div class="footer">
                        <p>Above Sky Calendar - Family Task Management</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(otp);
    }

    private String buildPasswordResetEmailHtml(String resetUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .button { display: inline-block; padding: 12px 24px; background: #3498db; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
                    .footer { margin-top: 30px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Password Reset Request</h2>
                    <p>We received a request to reset your password. Click the button below to create a new password:</p>
                    <a href="%s" class="button">Reset Password</a>
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p>%s</p>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't request this password reset, please ignore this email.</p>
                    <div class="footer">
                        <p>Above Sky Calendar - Family Task Management</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(resetUrl, resetUrl);
    }

    private String buildWelcomeEmailHtml(String userName) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #3498db; color: white; padding: 30px; text-align: center; border-radius: 4px; }
                    .content { padding: 20px 0; }
                    .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Above Sky Calendar!</h1>
                    </div>
                    <div class="content">
                        <p>Hi %s,</p>
                        <p>Thank you for joining Above Sky Calendar - your family's task management solution!</p>
                        <p>You can now:</p>
                        <ul>
                            <li>Create and manage calendar events</li>
                            <li>Track tasks and earn rewards</li>
                            <li>Plan meals for your family</li>
                            <li>Share photos and memories</li>
                            <li>Organize lists and to-dos</li>
                        </ul>
                        <p>Get started today and bring your family together!</p>
                    </div>
                    <div class="footer">
                        <p>Above Sky Calendar - Family Task Management</p>
                        <p>If you have any questions, please contact our support team.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName);
    }

    private String buildTaskReminderEmailHtml(String taskTitle, String dueDate) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .reminder-box { background: #fff3cd; border-left: 4px solid #f39c12; padding: 15px; margin: 20px 0; }
                    .footer { margin-top: 30px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Task Reminder</h2>
                    <div class="reminder-box">
                        <h3>%s</h3>
                        <p><strong>Due Date:</strong> %s</p>
                    </div>
                    <p>Don't forget to complete your task!</p>
                    <div class="footer">
                        <p>Above Sky Calendar - Family Task Management</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(taskTitle, dueDate);
    }
}
