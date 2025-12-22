package com.abovesky.calendar.service;

import com.abovesky.calendar.entity.User;
import com.abovesky.calendar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing Parent Mode and Silent Mode functionality.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ModeService {

    private final UserRepository userRepository;
    private final PinService pinService;

    /**
     * Get the currently authenticated user
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    /**
     * Check if user is in Parent Mode
     */
    public boolean isParentMode() {
        User user = getCurrentUser();
        return user.getIsParentMode() != null && user.getIsParentMode();
    }

    /**
     * Check if user has set a PIN
     */
    public boolean hasPinSet() {
        User user = getCurrentUser();
        return user.getParentModePin() != null && !user.getParentModePin().isEmpty();
    }

    /**
     * Switch to Parent Mode (requires PIN if set)
     * @param pin The PIN to validate (null if PIN not yet set)
     * @return true if switched successfully
     */
    @Transactional
    public boolean switchToParentMode(String pin) {
        User user = getCurrentUser();
        
        // If PIN is set, validate it
        if (hasPinSet()) {
            if (pin == null || !pinService.validatePin(pin, user.getParentModePin())) {
                log.warn("Invalid PIN attempt for user: {}", user.getUsername());
                return false;
            }
        } else if (pin == null) {
            // PIN not set yet, require PIN to be provided for first-time setup
            log.warn("PIN required for first-time Parent Mode activation for user: {}", user.getUsername());
            throw new IllegalStateException("PIN must be set before enabling Parent Mode");
        }
        
        user.setIsParentMode(true);
        userRepository.save(user);
        log.info("User {} switched to Parent Mode", user.getUsername());
        return true;
    }

    /**
     * Switch to Silent Mode (no PIN required)
     */
    @Transactional
    public void switchToSilentMode() {
        User user = getCurrentUser();
        user.setIsParentMode(false);
        userRepository.save(user);
        log.info("User {} switched to Silent Mode", user.getUsername());
    }

    /**
     * Set or update PIN
     * @param currentPin Current PIN (required if PIN already set)
     * @param newPin New PIN to set
     * @return true if PIN set successfully
     */
    @Transactional
    public boolean setPin(String currentPin, String newPin) {
        User user = getCurrentUser();
        
        // Validate new PIN format
        if (!pinService.isValidPinFormat(newPin)) {
            throw new IllegalArgumentException("Invalid PIN format. PIN must be exactly 4 digits.");
        }
        
        // If user already has a PIN, validate the current PIN
        if (hasPinSet()) {
            if (currentPin == null || !pinService.validatePin(currentPin, user.getParentModePin())) {
                log.warn("Invalid current PIN when attempting to update for user: {}", user.getUsername());
                return false;
            }
        }
        
        // Hash and save the new PIN
        user.setParentModePin(pinService.hashPin(newPin));
        userRepository.save(user);
        log.info("PIN set/updated for user: {}", user.getUsername());
        return true;
    }

    /**
     * Get current user for external operations
     */
    public User getCurrentUserEntity() {
        return getCurrentUser();
    }
}
