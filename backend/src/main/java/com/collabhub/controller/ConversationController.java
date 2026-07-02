package com.collabhub.controller;

import com.collabhub.model.dto.Dtos.*;
import com.collabhub.service.ConversationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    @PostMapping
    @ResponseStatus(HttpStatus.OK)
    public ConversationResponse openDm(@PathVariable UUID workspaceId,
                                       @Valid @RequestBody OpenDmRequest req,
                                       @AuthenticationPrincipal String userId) {
        return conversationService.getOrCreate(workspaceId, UUID.fromString(userId), req.targetUserId());
    }

    @GetMapping
    public List<ConversationResponse> getMyConversations(@PathVariable UUID workspaceId,
                                                         @AuthenticationPrincipal String userId) {
        return conversationService.getMyConversations(workspaceId, UUID.fromString(userId));
    }
}
