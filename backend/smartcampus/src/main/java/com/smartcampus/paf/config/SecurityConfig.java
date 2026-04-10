package com.smartcampus.paf.config;

import com.smartcampus.paf.security.CustomUserDetailsService;
import com.smartcampus.paf.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors().and()
                .csrf().disable()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints (no authentication needed)
                        .requestMatchers("/api/auth/**", "/api/users/register", "/api/users/check").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()

                        // Public booking utility endpoints
                        .requestMatchers("/api/bookings/check-conflict").permitAll()
                        .requestMatchers("/api/bookings/available-slots").permitAll()

                        // Admin endpoints - MUST BE BEFORE general booking endpoints
                        .requestMatchers("/api/bookings/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // User endpoints (authenticated users)
                        .requestMatchers("/api/users/me", "/api/users/me/**").authenticated()

                        // General Booking endpoints - MUST BE AFTER admin pattern
                        .requestMatchers("/api/bookings/**").authenticated()

                        // Technician endpoints
                        .requestMatchers("/api/technician/**").hasAnyRole("TECHNICIAN", "ADMIN")

                        // All other endpoints need authentication - MUST BE LAST!
                        .anyRequest().authenticated()
                )
                .userDetailsService(customUserDetailsService)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        // Disable frame options for H2 console
        http.headers().frameOptions().disable();

        return http.build();
    }
}