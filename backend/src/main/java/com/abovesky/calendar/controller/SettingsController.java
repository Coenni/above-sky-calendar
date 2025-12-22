package com.abovesky.calendar.controller;

import com.abovesky.calendar.api.SettingsApi;
import com.abovesky.calendar.api.model.*;
import com.abovesky.calendar.entity.User;
import com.abovesky.calendar.repository.UserRepository;
import com.abovesky.calendar.service.EmailService;
import com.abovesky.calendar.service.ModeService;
import com.abovesky.calendar.service.PinService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controller for managing Parent/Silent Mode settings and PIN operations.
 */
@RestController
@Slf4j
@RequiredArgsConstructor
public class SettingsController implements SettingsApi {

    private final ModeService modeService;
    private final PinService pinService;
    private final EmailService emailService;
    private final UserRepository userRepository;

    @Value("${app.base-url:http://localhost:4200}")
    private String baseUrl;

    @Override
    public ResponseEntity<ModeResponse> getCurrentMode() {
        try {
            ModeResponse response = new ModeResponse();
            response.setIsParentMode(modeService.isParentMode());
            response.setHasPinSet(modeService.hasPinSet());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting current mode", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to get current mode");
        }
    }

    @Override
    public ResponseEntity<ModeResponse> switchMode(ModeSwitchRequest modeSwitchRequest) {
        try {
            ModeSwitchRequest.TargetModeEnum targetMode = modeSwitchRequest.getTargetMode();
            
            if (targetMode == ModeSwitchRequest.TargetModeEnum.PARENT) {
                // Switching to Parent Mode requires PIN validation
                if (!modeService.hasPinSet()) {
                    throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, 
                        "PIN must be set before switching to Parent Mode. Please set a PIN first."
                    );
                }
                
                String pin = modeSwitchRequest.getPin();
                if (pin == null || pin.isEmpty()) {
                    throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, 
                        "PIN is required to switch to Parent Mode"
                    );
                }
                
                boolean success = modeService.switchToParentMode(pin);
                if (!success) {
                    throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, 
                        "Invalid PIN"
                    );
                }
            } else {
                // Switching to Silent Mode requires no PIN
                modeService.switchToSilentMode();
            }
            
            ModeResponse response = new ModeResponse();
            response.setIsParentMode(modeService.isParentMode());
            response.setHasPinSet(modeService.hasPinSet());
            return ResponseEntity.ok(response);
            
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error switching mode", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to switch mode");
        }
    }

    @Override
    public ResponseEntity<SetupPin200Response> setupPin(PinSetupRequest pinSetupRequest) {
        try {
            String currentPin = pinSetupRequest.getCurrentPin();
            String newPin = pinSetupRequest.getNewPin();
            
            if (!pinService.isValidPinFormat(newPin)) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, 
                    "Invalid PIN format. PIN must be exactly 4 digits."
                );
            }
            
            boolean success = modeService.setPin(currentPin, newPin);
            if (!success) {
                throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, 
                    "Invalid current PIN"
                );
            }
            
            SetupPin200Response response = new SetupPin200Response();
            response.setMessage("PIN set successfully");
            return ResponseEntity.ok(response);
            
        } catch (ResponseStatusException e) {
            throw e;
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            log.error("Error setting up PIN", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to set up PIN");
        }
    }

    @Override
    public ResponseEntity<RequestPinReset200Response> requestPinReset() {
        try {
            User user = modeService.getCurrentUserEntity();
            
            if (!modeService.hasPinSet()) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, 
                    "No PIN has been set yet"
                );
            }
            
            // Generate and save reset token
            pinService.setResetToken(user);
            userRepository.save(user);
            
            // Send reset email
            emailService.sendPinResetEmail(
                user.getEmail(), 
                user.getDisplayName() != null ? user.getDisplayName() : user.getUsername(),
                user.getPinResetToken(),
                baseUrl
            );
            
            RequestPinReset200Response response = new RequestPinReset200Response();
            response.setMessage("Reset email sent successfully");
            return ResponseEntity.ok(response);
            
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error requesting PIN reset", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send reset email");
        }
    }

    @Override
    public ResponseEntity<ResetPin200Response> resetPin(PinResetRequest pinResetRequest) {
        try {
            String token = pinResetRequest.getToken();
            String newPin = pinResetRequest.getNewPin();
            
            if (!pinService.isValidPinFormat(newPin)) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, 
                    "Invalid PIN format. PIN must be exactly 4 digits."
                );
            }
            
            // Find user by reset token
            User user = userRepository.findByPinResetToken(token)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, 
                    "Invalid or expired reset token"
                ));
            
            // Validate token expiry
            if (!pinService.isResetTokenValid(user)) {
                pinService.clearResetToken(user);
                userRepository.save(user);
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, 
                    "Reset token has expired"
                );
            }
            
            // Set new PIN
            user.setParentModePin(pinService.hashPin(newPin));
            pinService.clearResetToken(user);
            userRepository.save(user);
            
            ResetPin200Response response = new ResetPin200Response();
            response.setMessage("PIN reset successfully");
            return ResponseEntity.ok(response);
            
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error resetting PIN", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to reset PIN");
        }
    }
}
