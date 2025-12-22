package com.abovesky.calendar.service;

import com.abovesky.calendar.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Service for managing Parent Mode PINs.
 * Handles PIN hashing, validation, and reset token generation.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class PinService {

    private final PasswordEncoder passwordEncoder;
    
    private static final Pattern PIN_PATTERN = Pattern.compile("^\\d{4}$");
    private static final int PIN_RESET_TOKEN_EXPIRY_HOURS = 1;

    /**
     * Validate PIN format (must be exactly 4 digits)
     */
    public boolean isValidPinFormat(String pin) {
        return pin != null && PIN_PATTERN.matcher(pin).matches();
    }

    /**
     * Hash a PIN using BCrypt
     */
    public String hashPin(String pin) {
        if (!isValidPinFormat(pin)) {
            throw new IllegalArgumentException("Invalid PIN format. PIN must be exactly 4 digits.");
        }
        return passwordEncoder.encode(pin);
    }

    /**
     * Validate a PIN against the stored hash
     */
    public boolean validatePin(String rawPin, String hashedPin) {
        if (hashedPin == null || rawPin == null) {
            return false;
        }
        try {
            return passwordEncoder.matches(rawPin, hashedPin);
        } catch (Exception e) {
            log.error("Error validating PIN", e);
            return false;
        }
    }

    /**
     * Generate a secure reset token
     */
    public String generateResetToken() {
        return UUID.randomUUID().toString();
    }

    /**
     * Set reset token and expiry on user
     */
    public void setResetToken(User user) {
        user.setPinResetToken(generateResetToken());
        user.setPinResetTokenExpiry(LocalDateTime.now().plusHours(PIN_RESET_TOKEN_EXPIRY_HOURS));
        log.info("PIN reset token generated for user: {}", user.getUsername());
    }

    /**
     * Check if reset token is valid and not expired
     */
    public boolean isResetTokenValid(User user) {
        if (user.getPinResetToken() == null || user.getPinResetTokenExpiry() == null) {
            return false;
        }
        return LocalDateTime.now().isBefore(user.getPinResetTokenExpiry());
    }

    /**
     * Clear reset token from user
     */
    public void clearResetToken(User user) {
        user.setPinResetToken(null);
        user.setPinResetTokenExpiry(null);
        log.info("PIN reset token cleared for user: {}", user.getUsername());
    }
}
