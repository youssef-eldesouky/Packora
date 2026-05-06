package com.packora.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Sends a password-reset email containing a clickable link with the token.
     *
     * @param toEmail       recipient email address
     * @param token         the UUID reset token
     * @param frontendUrl   base URL of the frontend (e.g. http://localhost:3000)
     */
    public void sendPasswordResetEmail(String toEmail, String token, String frontendUrl) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Packora – Password Reset Request");
        message.setText(
                "Hello,\n\n"
                + "We received a request to reset your Packora account password.\n\n"
                + "Click the link below to choose a new password (valid for 30 minutes):\n"
                + resetLink + "\n\n"
                + "If you did not request a password reset, please ignore this email — your password will remain unchanged.\n\n"
                + "Best regards,\n"
                + "The Packora Team"
        );

        mailSender.send(message);
    }
}
