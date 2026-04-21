package com.smartcampus.paf.service.impl;

import com.smartcampus.paf.dto.request.ChangePasswordRequestDTO;
import com.smartcampus.paf.dto.request.UpdateUserRequestDTO;
import com.smartcampus.paf.dto.request.UserRequestDTO;
import com.smartcampus.paf.dto.response.UserResponseDTO;
import com.smartcampus.paf.model.User;
import com.smartcampus.paf.model.enums.Role;
import com.smartcampus.paf.repository.UserRepository;
import com.smartcampus.paf.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;
    
    @Override
    public UserResponseDTO createOrUpdateUser(UserRequestDTO userRequest) {
        User user = userRepository.findByEmail(userRequest.getEmail())
                .orElse(new User());
        
        user.setEmail(userRequest.getEmail());
        user.setName(userRequest.getName());
        user.setPictureUrl(userRequest.getPictureUrl());
        user.setLastLogin(LocalDateTime.now());
        
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            user.getRoles().add(Role.ROLE_USER);
        }
        
        User savedUser = userRepository.save(user);
        
        return mapToResponse(savedUser);
    }
    
    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    @Override
    public UserResponseDTO getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToResponse(user);
    }
    
    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    @Override
    @Transactional
    public UserResponseDTO updateUserProfile(String userId, UpdateUserRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setName(request.getName());
        if (request.getPictureUrl() != null) {
            user.setPictureUrl(request.getPictureUrl());
        }
        
        User updated = userRepository.save(user);
        return mapToResponse(updated);
    }
    
    @Override
    @Transactional
    public void changePassword(String userId, ChangePasswordRequestDTO request) {
        // For OAuth users, password change might not be applicable
        // This is for future if you add local authentication
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }
        // In production, you would encode and save password
        // Since we use OAuth, this is optional
    }
    
    @Override
    @Transactional
    public void deleteUserAccount(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }
    
    @Override
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public UserResponseDTO updateUserRole(String userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Clear existing roles and add new one
        user.getRoles().clear();
        user.getRoles().add(Role.valueOf(role));
        
        User updated = userRepository.save(user);
        return mapToResponse(updated);
    }
    
    private UserResponseDTO mapToResponse(User user) {
        return new UserResponseDTO(
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getPictureUrl(),
            user.getRoles().stream().map(Enum::name).collect(Collectors.toSet())
        );
    }
}