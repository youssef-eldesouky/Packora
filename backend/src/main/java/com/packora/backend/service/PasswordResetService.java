package com.packora.backend.service;

import com.packora.backend.model.PasswordResetToken;
import com.packora.backend.model.User;
import com.packora.backend.repository.PasswordResetTokenRepository;
import com.packora.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

    @Autowired private UserRepository               userRepository;
    @Autowired private PasswordResetTokenRepository tokenRepository;
    @Autowired private EmailService                 emailService;
    @Autowired private PasswordEncoder              passwordEncoder;

    /**
     * Self-inject via @Lazy so we can call @Transactional methods on the proxy
     * (direct this.method() calls bypass Spring's transaction proxy).
     */
    @Autowired @Lazy
    private PasswordResetService self;

    @Value("${packora.frontend-url}")
    private String frontendUrl;

    @Value("${packora.password-reset-token-expiry-minutes:30}")
    private int tokenExpiryMinutes;

    // ─────────────────────────────────────────────────────────────
    // PUBLIC — NOT transactional.
    // Delegates DB work to self.saveToken() so the transaction
    // commits BEFORE we attempt to send the email.
    // ─────────────────────────────────────────────────────────────
    public void initiatePasswordReset(String email) {
        // self.saveToken() runs in its own @Transactional context and commits
        String[] result = self.saveToken(email);

        if (result != null) {
            String userEmail  = result[0];
            String tokenValue = result[1];
            try {
                emailService.sendPasswordResetEmail(userEmail, tokenValue, frontendUrl);
                log.info("Password reset email sent to {}", userEmail);
            } catch (Exception ex) {
                // Token is already committed — log the SMTP error but don't fail the request.
                log.error("SMTP error sending reset email to {}: {}", userEmail, ex.getMessage());
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // PUBLIC @Transactional — creates & persists the token.
    // Must be public so Spring's proxy can wrap it.
    // Returns [email, tokenValue] or null if email not registered.
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public String[] saveToken(String email) {
        return userRepository.findByEmail(email).map(user -> {
            // Remove any old token for this user
            tokenRepository.deleteByUser(user);
            tokenRepository.flush();

            // Create a fresh token
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setToken(UUID.randomUUID().toString());
            resetToken.setUser(user);
            resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(tokenExpiryMinutes));
            tokenRepository.save(resetToken);
            tokenRepository.flush();

            log.info("Reset token created for user id={}, expires={}", user.getId(), resetToken.getExpiryDate());
            return new String[]{ user.getEmail(), resetToken.getToken() };
        }).orElse(null);
    }

    // ─────────────────────────────────────────────────────────────
    // RESET PASSWORD
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired password reset token."));

        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new RuntimeException("Password reset token has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenRepository.delete(resetToken);
        log.info("Password reset successfully for user id={}", user.getId());
    }

    // ─────────────────────────────────────────────────────────────
    // VALIDATE TOKEN
    // ─────────────────────────────────────────────────────────────
    public boolean validateToken(String token) {
        return tokenRepository.findByToken(token)
                .map(t -> !t.isExpired())
                .orElse(false);
    }
}
