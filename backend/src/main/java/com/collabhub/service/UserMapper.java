package com.collabhub.service;

import com.collabhub.model.dto.Dtos.UserResponse;
import com.collabhub.model.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserResponse toResponse(User u) {
        return new UserResponse(u.getId(), u.getUsername(), u.getEmail(),
                u.getDisplayName(), u.getAvatarUrl(), u.getStatus());
    }
}
