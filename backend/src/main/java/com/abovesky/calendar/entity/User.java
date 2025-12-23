package com.abovesky.calendar.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String roles = "ROLE_USER";

    // Family member specific fields
    @Column
    private String displayName;

    @Column
    private String color; // Hex color code for family member identification

    @Column
    private Integer age;

    @Column
    private Boolean isParent = false; // Admin rights

    @Column
    private Integer rewardPoints = 0;

    @Column(length = 5)
    private String preferredLocale = "en"; // Default language: English

    // Additional family member fields
    @Column(length = 512)
    private String photo; // Photo/avatar URL or path

    @Column
    private LocalDate dateOfBirth; // Date of birth

    @Column(length = 50)
    private String role; // Role in family: Parent, Child, etc.

    @Column(length = 50)
    private String phone; // Phone number

    @Column(length = 50)
    private String gender; // Gender: Male, Female, Other, Prefer not to say

    // Parent Mode / Silent Mode fields
    @Column
    private String parentModePin; // Hashed PIN for Parent Mode access

    @Column
    private Boolean isParentMode = false; // Current mode: true = Parent Mode, false = Silent Mode

    @Column
    private String pinResetToken; // Token for PIN reset via email

    @Column
    private LocalDateTime pinResetTokenExpiry; // Expiry time for reset token

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
