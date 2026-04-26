package com.smartcampus.paf.controller;

import com.smartcampus.paf.dto.request.LoginRequestDTO;
import com.smartcampus.paf.dto.request.SignupRequestDTO;
import com.smartcampus.paf.dto.request.UserRequestDTO;
import com.smartcampus.paf.dto.response.AuthResponseDTO;
import com.smartcampus.paf.dto.response.UserResponseDTO;
import com.smartcampus.paf.security.JwtTokenProvider;
import com.smartcampus.paf.service.AuthService;
import com.smartcampus.paf.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AuthController {
    
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthService authService;
    
    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@Valid @RequestBody UserRequestDTO userRequest) {
        // Create or update user
        UserResponseDTO user = userService.createOrUpdateUser(userRequest);
        
        // Generate JWT token
        String token = jwtTokenProvider.generateToken(
            user.getEmail(),
            user.getId(),
            String.join(",", user.getRoles())
        );
        
        // Create response
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("type", "Bearer");
        response.put("user", user);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getCurrentUser(@RequestHeader("Authorization") String token) {
        // Extract email from token and get user
        String email = jwtTokenProvider.getEmailFromToken(token.replace("Bearer ", ""));
        UserResponseDTO user = userService.findByEmail(email)
                .map(u -> new UserResponseDTO(
                    u.getId(),
                    u.getEmail(),
                    u.getName(),
                    u.getPictureUrl(),
                    u.getRoles().stream().map(Enum::name).collect(Collectors.toSet())
                ))
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    @PostMapping("/signup")
        public ResponseEntity<?> signup(@RequestBody SignupRequestDTO request) {
            authService.signup(request);
            return ResponseEntity.ok("User registered successfully");
        }

        @PostMapping("/login")
        public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO request) {
            return ResponseEntity.ok(authService.login(request));
        }
}