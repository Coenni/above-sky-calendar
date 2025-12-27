package com.abovesky.calendar.service;

import com.abovesky.calendar.entity.User;
import com.abovesky.calendar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        List<SimpleGrantedAuthority> authorities = Arrays.stream(user.getRoles().split(","))
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                authorities
        );
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    public User updateUser(Long id, User userDetails) {
        User user = findById(id);
        if (userDetails.getEmail() != null) {
            user.setEmail(userDetails.getEmail());
        }
        if (userDetails.getUsername() != null) {
            user.setUsername(userDetails.getUsername());
        }
        if (userDetails.getDisplayName() != null) {
            user.setDisplayName(userDetails.getDisplayName());
        }
        if (userDetails.getColor() != null) {
            user.setColor(userDetails.getColor());
        }
        if (userDetails.getAge() != null) {
            user.setAge(userDetails.getAge());
        }
        if (userDetails.getIsParent() != null) {
            user.setIsParent(userDetails.getIsParent());
        }
        if (userDetails.getRewardPoints() != null) {
            user.setRewardPoints(userDetails.getRewardPoints());
        }
        if (userDetails.getPhoto() != null) {
            user.setPhoto(userDetails.getPhoto());
        }
        if (userDetails.getDateOfBirth() != null) {
            user.setDateOfBirth(userDetails.getDateOfBirth());
        }
        if (userDetails.getRole() != null) {
            user.setRole(userDetails.getRole());
        }
        if (userDetails.getPhone() != null) {
            user.setPhone(userDetails.getPhone());
        }
        if (userDetails.getGender() != null) {
            user.setGender(userDetails.getGender());
        }
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User createUser(User newUser) {
        // Set defaults if not provided
        if (newUser.getRewardPoints() == null) {
            newUser.setRewardPoints(0);
        }
        if (newUser.getIsParent() == null) {
            newUser.setIsParent(false);
        }
        if (newUser.getRoles() == null || newUser.getRoles().isEmpty()) {
            newUser.setRoles("ROLE_USER");
        }
        // Password should be hashed by the caller if needed
        // For family members without login, we can set a dummy password
        if (newUser.getPassword() == null || newUser.getPassword().isEmpty()) {
            newUser.setPassword("NO_LOGIN"); // Placeholder for non-login members
        }
        return userRepository.save(newUser);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
}
