package com.collabhub.model.event;

import com.collabhub.model.entity.User;

import java.time.Instant;
import java.util.UUID;

public final class Events {

    private Events() {}

    public record MessageEvent(
        String eventType,   // CREATED, EDITED, DELETED
        UUID messageId,
        UUID channelId,
        UUID conversationId,
        UUID senderId,
        String senderUsername,
        String content,
        String messageType,
        UUID parentId,
        Instant createdAt
    ) {}

    public record PresenceEvent(
        UUID userId,
        String username,
        User.UserStatus status,
        Instant timestamp
    ) {}

    public record TypingEvent(
        UUID channelId,
        UUID conversationId,
        UUID userId,
        String username,
        boolean isTyping,
        Instant timestamp
    ) {}

    public record NotificationEvent(
        UUID userId,
        String type,
        java.util.Map<String, Object> payload,
        Instant timestamp
    ) {}
}
