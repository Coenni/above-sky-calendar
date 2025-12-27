package com.abovesky.calendar.controller;

import com.abovesky.calendar.entity.User;
import com.abovesky.calendar.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class FamilyMemberController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAllMembers() {
        try {
            List<User> members = userService.getAllUsers();
            // Remove passwords from response
            members.forEach(member -> member.setPassword(null));
            return ResponseEntity.ok(members);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getMemberById(@PathVariable Long id) {
        try {
            User member = userService.findById(id);
            // Remove password from response
            member.setPassword(null);
            return ResponseEntity.ok(member);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<User> createMember(@RequestBody User newMember, Authentication authentication) {
        try {
            // Only parents can create new members
            String username = authentication.getName();
            User currentUser = userService.findByUsername(username);
            
            if (!currentUser.getIsParent()) {
                return ResponseEntity.status(403).build(); // Forbidden
            }
            
            User createdMember = userService.createUser(newMember);
            // Remove password from response
            createdMember.setPassword(null);
            return ResponseEntity.ok(createdMember);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateMember(
            @PathVariable Long id,
            @RequestBody User memberDetails,
            Authentication authentication
    ) {
        try {
            // Only parents can update members
            String username = authentication.getName();
            User currentUser = userService.findByUsername(username);
            
            if (!currentUser.getIsParent()) {
                return ResponseEntity.status(403).build(); // Forbidden
            }
            
            User updatedMember = userService.updateUser(id, memberDetails);
            // Remove password from response
            updatedMember.setPassword(null);
            return ResponseEntity.ok(updatedMember);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable Long id, Authentication authentication) {
        try {
            // Only parents can delete members
            String username = authentication.getName();
            User currentUser = userService.findByUsername(username);
            
            if (!currentUser.getIsParent()) {
                return ResponseEntity.status(403).build(); // Forbidden
            }
            
            // Don't allow deleting yourself
            if (currentUser.getId().equals(id)) {
                return ResponseEntity.badRequest().build();
            }
            
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
