package com.collabhub.controller;

import com.collabhub.model.dto.Dtos.*;
import com.collabhub.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public PageResponse<NotificationResponse> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal String userId) {
        return notificationService.getNotifications(UUID.fromString(userId), page, size);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(@AuthenticationPrincipal String userId) {
        return Map.of("count", notificationService.getUnreadCount(UUID.fromString(userId)));
    }

    @PostMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllRead(@AuthenticationPrincipal String userId) {
        notificationService.markAllRead(UUID.fromString(userId));
    }

    @PatchMapping("/{notificationId}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markRead(@PathVariable UUID notificationId,
                         @AuthenticationPrincipal String userId) {
        notificationService.markRead(notificationId, UUID.fromString(userId));
    }
}
