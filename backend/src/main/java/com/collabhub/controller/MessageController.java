package com.collabhub.controller;

import com.collabhub.model.dto.Dtos.*;
import com.collabhub.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    // ── Channel messages ──────────────────────────────────────────────────────

    @PostMapping("/api/channels/{channelId}/messages")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse sendToChannel(@PathVariable UUID channelId,
                                         @Valid @RequestBody SendMessageRequest req,
                                         @AuthenticationPrincipal String userId) {
        return messageService.sendToChannel(channelId, req, UUID.fromString(userId));
    }

    @GetMapping("/api/channels/{channelId}/messages")
    public PageResponse<MessageResponse> getChannelMessages(@PathVariable UUID channelId,
                                                            @RequestParam(defaultValue = "0") int page,
                                                            @RequestParam(defaultValue = "50") int size,
                                                            @AuthenticationPrincipal String userId) {
        return messageService.getChannelMessages(channelId, UUID.fromString(userId), page, size);
    }

    // ── Conversation (DM) messages ────────────────────────────────────────────

    @PostMapping("/api/conversations/{conversationId}/messages")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse sendToConversation(@PathVariable UUID conversationId,
                                              @Valid @RequestBody SendMessageRequest req,
                                              @AuthenticationPrincipal String userId) {
        return messageService.sendToConversation(conversationId, req, UUID.fromString(userId));
    }

    @GetMapping("/api/conversations/{conversationId}/messages")
    public PageResponse<MessageResponse> getConversationMessages(@PathVariable UUID conversationId,
                                                                 @RequestParam(defaultValue = "0") int page,
                                                                 @RequestParam(defaultValue = "50") int size,
                                                                 @AuthenticationPrincipal String userId) {
        return messageService.getConversationMessages(conversationId, UUID.fromString(userId), page, size);
    }

    // ── Threads ───────────────────────────────────────────────────────────────

    @GetMapping("/api/messages/{messageId}/replies")
    public List<MessageResponse> getThreadReplies(@PathVariable UUID messageId,
                                                  @AuthenticationPrincipal String userId) {
        return messageService.getThreadReplies(messageId, UUID.fromString(userId));
    }

    // ── Edit / Delete ─────────────────────────────────────────────────────────

    @PatchMapping("/api/messages/{messageId}")
    public MessageResponse edit(@PathVariable UUID messageId,
                                @Valid @RequestBody EditMessageRequest req,
                                @AuthenticationPrincipal String userId) {
        return messageService.edit(messageId, req, UUID.fromString(userId));
    }

    @DeleteMapping("/api/messages/{messageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID messageId,
                       @AuthenticationPrincipal String userId) {
        messageService.delete(messageId, UUID.fromString(userId));
    }

    // ── Reactions ─────────────────────────────────────────────────────────────

    @PostMapping("/api/messages/{messageId}/reactions/{emoji}")
    public List<ReactionSummary> toggleReaction(@PathVariable UUID messageId,
                                                @PathVariable String emoji,
                                                @AuthenticationPrincipal String userId) {
        return messageService.toggleReaction(messageId, emoji, UUID.fromString(userId));
    }

    // ── Search ────────────────────────────────────────────────────────────────

    @GetMapping("/api/workspaces/{workspaceId}/search")
    public SearchResponse search(@PathVariable UUID workspaceId,
                                 @RequestParam String q,
                                 @AuthenticationPrincipal String userId) {
        // channels and convs the user belongs to are resolved in service
        List<MessageResponse> results = messageService.search(q, List.of(), List.of());
        return new SearchResponse(results, results.size());
    }
}
