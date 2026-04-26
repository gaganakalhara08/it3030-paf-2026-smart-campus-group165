package com.smartcampus.paf.service;

import com.smartcampus.paf.dto.request.ChangePasswordRequestDTO;
import com.smartcampus.paf.dto.request.UpdateUserRequestDTO;
import com.smartcampus.paf.dto.request.UserRequestDTO;
import com.smartcampus.paf.dto.response.UserResponseDTO;
import com.smartcampus.paf.model.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    UserResponseDTO createOrUpdateUser(UserRequestDTO userRequest);
    Optional<User> findByEmail(String email);
    UserResponseDTO getUserById(String id);
    boolean existsByEmail(String email);
    
    // NEW METHODS
    UserResponseDTO updateUserProfile(String userId, UpdateUserRequestDTO request);
    void changePassword(String userId, ChangePasswordRequestDTO request);
    void deleteUserAccount(String userId);
    List<UserResponseDTO> getAllUsers();  // Admin only
    UserResponseDTO updateUserRole(String userId, String role);  // Admin only
}