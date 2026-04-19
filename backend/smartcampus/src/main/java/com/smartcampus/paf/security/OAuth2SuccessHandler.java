package com.smartcampus.paf.security;

import com.smartcampus.paf.model.User;
import com.smartcampus.paf.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import com.smartcampus.paf.model.enums.Role;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        System.out.println("🔥 SUCCESS HANDLER TRIGGERED");
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");
        String picture = oauthUser.getAttribute("picture");

        // 🔹 Check if user exists
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setPictureUrl(picture);

            Set<Role> roles = new HashSet<>();
            roles.add(Role.ROLE_USER);

            newUser.setRoles(roles);

            return userRepository.save(newUser);
        });

        // 🔹 Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // 🔹 Generate JWT
        String token = jwtTokenProvider.generateToken(
                user.getEmail(),
                user.getId(),
                user.getRoles().stream()
                    .map(Enum::name)
                    .reduce((a, b) -> a + "," + b)
                    .orElse("")
        );

        // 🔹 Redirect to frontend LOGIN page (not dashboard)
        // Login.jsx will capture the token and store it in localStorage
        response.setStatus(HttpServletResponse.SC_FOUND);
        response.setHeader("Location", "http://localhost:5173/login?token=" + token);
    }
}