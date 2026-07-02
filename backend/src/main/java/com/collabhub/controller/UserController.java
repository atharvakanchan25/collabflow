package com.collabhub.controller;

import com.collabhub.exception.ResourceNotFoundException;
import com.collabhub.model.dto.Dtos.*;
import com.collabhub.model.entity.User;
import com.collabhub.repository.UserRepository;
import com.collabhub.service.UserMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @GetMapping("/me")
    public UserResponse getMe(@AuthenticationPrincipal String userId) {
        return userMapper.toResponse(fetchUser(UUID.fromString(userId)));
    }

    @PatchMapping("/me")
    public UserResponse updateProfile(@AuthenticationPrincipal String userId,
                                      @Valid @RequestBody UpdateProfileRequest req) {
        User user = fetchUser(UUID.fromString(userId));
        if (req.displayName() != null) user.setDisplayName(req.displayName());
        if (req.avatarUrl() != null) user.setAvatarUrl(req.avatarUrl());
        return userMapper.toResponse(userRepository.save(user));
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable UUID id) {
        return userMapper.toResponse(fetchUser(id));
    }

    private User fetchUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
