package com.collabhub.model.dto;

import com.collabhub.model.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class Dtos {

    private Dtos() {}

    // ── Auth ──────────────────────────────────────────────────────────────────

    public record RegisterRequest(
        @NotBlank @Size(min = 3, max = 50) String username,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8) String password,
        String displayName
    ) {}

    public record LoginRequest(
        @NotBlank String email,
        @NotBlank String password
    ) {}

    public record AuthResponse(
        String accessToken,
        String refreshToken,
        UserResponse user
    ) {}

    public record RefreshRequest(@NotBlank String refreshToken) {}

    // ── User ──────────────────────────────────────────────────────────────────

    public record UserResponse(
        UUID id,
        String username,
        String email,
        String displayName,
        String avatarUrl,
        User.UserStatus status
    ) {}

    public record UpdateProfileRequest(
        @Size(max = 100) String displayName,
        String avatarUrl
    ) {}

    // ── Workspace ─────────────────────────────────────────────────────────────

    public record CreateWorkspaceRequest(
        @NotBlank @Size(min = 2, max = 100) String name,
        @NotBlank @Size(min = 2, max = 100) String slug
    ) {}

    public record WorkspaceResponse(
        UUID id,
        String name,
        String slug,
        UserResponse owner,
        String iconUrl,
        Instant createdAt
    ) {}

    // ── Channel ───────────────────────────────────────────────────────────────

    public record CreateChannelRequest(
        @NotBlank @Size(min = 1, max = 100) String name,
        @Size(max = 500) String description,
        boolean isPrivate
    ) {}

    public record ChannelResponse(
        UUID id,
        UUID workspaceId,
        String name,
        String description,
        boolean isPrivate,
        Instant createdAt
    ) {}

    // ── Message ───────────────────────────────────────────────────────────────

    public record SendMessageRequest(
        @NotBlank String content,
        UUID parentId
    ) {}

    public record MessageResponse(
        UUID id,
        UUID channelId,
        UUID conversationId,
        UserResponse sender,
        String content,
        String messageType,
        UUID parentId,
        List<AttachmentResponse> attachments,
        List<ReactionSummary> reactions,
        Instant editedAt,
        Instant createdAt
    ) {}

    public record AttachmentResponse(
        UUID id,
        String fileName,
        Long fileSize,
        String mimeType,
        String downloadUrl
    ) {}

    public record ReactionSummary(
        String emoji,
        long count,
        boolean reactedByMe
    ) {}

    public record EditMessageRequest(@NotBlank String content) {}

    // ── Conversation ──────────────────────────────────────────────────────────

    public record OpenDmRequest(@NotNull UUID targetUserId) {}

    public record ConversationResponse(
        UUID id,
        UUID workspaceId,
        List<UserResponse> participants,
        Instant createdAt
    ) {}

    // ── WebSocket events ──────────────────────────────────────────────────────

    public record TypingEvent(
        UUID channelId,
        UUID conversationId,
        UUID userId,
        String username,
        boolean isTyping
    ) {}

    public record PresenceEvent(
        UUID userId,
        User.UserStatus status
    ) {}

    // ── Search ────────────────────────────────────────────────────────────────

    public record SearchResponse(
        List<MessageResponse> messages,
        int total
    ) {}

    // ── Notification ──────────────────────────────────────────────────────────

    public record NotificationResponse(
        UUID id,
        String type,
        Map<String, Object> payload,
        boolean isRead,
        Instant createdAt
    ) {}

    // ── Pagination ────────────────────────────────────────────────────────────

    public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        boolean hasMore
    ) {}
}
