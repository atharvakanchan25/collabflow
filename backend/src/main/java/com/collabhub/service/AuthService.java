package com.collabhub.service;

import com.collabhub.exception.ConflictException;
import com.collabhub.exception.ResourceNotFoundException;
import com.collabhub.model.dto.Dtos.*;
import com.collabhub.model.entity.User;
import com.collabhub.repository.UserRepository;
import com.collabhub.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email()))
            throw new ConflictException("Email already in use");
        if (userRepository.existsByUsername(req.username()))
            throw new ConflictException("Username already taken");

        User user = User.builder()
                .username(req.username())
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .displayName(req.displayName() != null ? req.displayName() : req.username())
                .build();
        user = userRepository.save(user);
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        // principal is userId string (from UserDetailsServiceImpl)
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return buildAuthResponse(user);
    }

    public AuthResponse refresh(RefreshRequest req) {
        if (!jwtTokenProvider.isValid(req.refreshToken()))
            throw new IllegalArgumentException("Invalid refresh token");
        User user = userRepository.findById(jwtTokenProvider.getUserId(req.refreshToken()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String access  = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String refresh = jwtTokenProvider.generateRefreshToken(user.getId(), user.getEmail());
        return new AuthResponse(access, refresh, userMapper.toResponse(user));
    }
}
