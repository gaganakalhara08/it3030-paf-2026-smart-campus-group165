package com.smartcampus.paf.service.impl;

import com.smartcampus.paf.dto.request.LoginRequestDTO;
import com.smartcampus.paf.dto.request.SignupRequestDTO;
import com.smartcampus.paf.dto.response.AuthResponseDTO;
import com.smartcampus.paf.model.User;
import com.smartcampus.paf.model.enums.Role;
import com.smartcampus.paf.repository.UserRepository;
import com.smartcampus.paf.security.JwtTokenProvider;
import com.smartcampus.paf.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public void signup(SignupRequestDTO request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setName(request.getName());

        // 🔐 Encrypt password
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Assign default role
        user.setRoles(new HashSet<>());
        user.getRoles().add(Role.ROLE_USER);

        userRepository.save(user);
    }

    @Override
    public AuthResponseDTO login(LoginRequestDTO request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 🔐 Check password
        if (user.getPassword() == null ||
                !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Convert roles → comma string
        String roles = user.getRoles().stream()
                .map(Enum::name)
                .reduce((a, b) -> a + "," + b)
                .orElse("");

        String token = jwtTokenProvider.generateToken(
                user.getEmail(),
                user.getId(),
                roles
        );

        return new AuthResponseDTO(
                token,
                "Bearer",
                user.getEmail(),
                roles
        );
    }
}