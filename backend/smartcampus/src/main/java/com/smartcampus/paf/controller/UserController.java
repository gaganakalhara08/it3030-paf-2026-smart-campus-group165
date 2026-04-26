package com.smartcampus.paf.controller;

import com.smartcampus.paf.dto.request.ChangePasswordRequestDTO;
import com.smartcampus.paf.dto.request.UpdateUserRequestDTO;
import com.smartcampus.paf.dto.request.UserRequestDTO;
import com.smartcampus.paf.dto.response.UserResponseDTO;
import com.smartcampus.paf.security.JwtTokenProvider;
import com.smartcampus.paf.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    
    private String getEmailFromToken(String authHeader) {
        String token = authHeader.substring(7);
        return jwtTokenProvider.getEmailFromToken(token);
    }
    
    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> registerUser(@Valid @RequestBody UserRequestDTO userRequest) {
        UserResponseDTO user = userService.createOrUpdateUser(userRequest);
        return ResponseEntity.ok(user);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable String id) {
        UserResponseDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
    
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkUserExists(@RequestParam String email) {
        boolean exists = userService.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }
    
    // Update own profile - PUT
    @PutMapping("/me")
    public ResponseEntity<UserResponseDTO> updateProfile(
            @Valid @RequestBody UpdateUserRequestDTO request,
            @RequestHeader("Authorization") String authHeader) {
        String email = getEmailFromToken(authHeader);
        UserResponseDTO user = userService.findByEmail(email)
                .map(u -> userService.updateUserProfile(u.getId(), request))
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
    
    // Change password - PUT
    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody ChangePasswordRequestDTO request,
            @RequestHeader("Authorization") String authHeader) {
        String email = getEmailFromToken(authHeader);
        userService.findByEmail(email)
                .ifPresentOrElse(
                    user -> userService.changePassword(user.getId(), request),
                    () -> { throw new RuntimeException("User not found"); }
                );
        return ResponseEntity.ok("Password changed successfully");
    }
    
    // Delete own account - DELETE
    @DeleteMapping("/me")
    public ResponseEntity<?> deleteAccount(
            @RequestHeader("Authorization") String authHeader) {
        String email = getEmailFromToken(authHeader);
        userService.findByEmail(email)
                .ifPresentOrElse(
                    user -> userService.deleteUserAccount(user.getId()),
                    () -> { throw new RuntimeException("User not found"); }
                );
        return ResponseEntity.ok("Account deleted successfully");
    }
}