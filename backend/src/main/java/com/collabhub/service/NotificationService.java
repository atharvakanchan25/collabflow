package com.collabhub.service;

import com.collabhub.exception.ResourceNotFoundException;
import com.collabhub.model.dto.Dtos.*;
import com.collabhub.model.entity.Notification;
import com.collabhub.model.entity.User;
import com.collabhub.repository.NotificationRepository;
import com.collabhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public PageResponse<NotificationResponse> getNotifications(UUID userId, int page, int size) {
        Page<Notification> p = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
        return new PageResponse<>(p.getContent().stream().map(this::toResponse).toList(),
                page, size, p.getTotalElements(), p.hasNext());
    }

    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAllRead(UUID userId) {
        notificationRepository.markAllReadByUserId(userId);
    }

    @Transactional
    public void markRead(UUID notificationId, UUID userId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!n.getUser().getId().equals(userId))
            throw new com.collabhub.exception.ForbiddenException("Access denied");
        n.setRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public void create(UUID userId, String type, Map<String, Object> payload) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        notificationRepository.save(Notification.builder()
                .user(user).type(type).payload(payload).build());
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(n.getId(), n.getType(), n.getPayload(), n.isRead(), n.getCreatedAt());
    }
}
