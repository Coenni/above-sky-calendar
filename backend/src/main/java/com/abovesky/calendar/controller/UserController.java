package com.abovesky.calendar.controller;

import com.abovesky.calendar.entity.User;
import com.abovesky.calendar.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userService.findByUsername(username);
            // Remove password from response
            user.setPassword(null);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateCurrentUser(
            @RequestBody User userDetails,
            Authentication authentication
    ) {
        try {
            String username = authentication.getName();
            User currentUser = userService.findByUsername(username);
            User updatedUser = userService.updateUser(currentUser.getId(), userDetails);
            // Remove password from response
            updatedUser.setPassword(null);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
