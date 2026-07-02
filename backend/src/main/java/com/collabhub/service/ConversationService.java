package com.collabhub.service;

import com.collabhub.exception.ResourceNotFoundException;
import com.collabhub.model.dto.Dtos.*;
import com.collabhub.model.entity.Conversation;
import com.collabhub.model.entity.User;
import com.collabhub.model.entity.Workspace;
import com.collabhub.repository.ConversationRepository;
import com.collabhub.repository.UserRepository;
import com.collabhub.repository.WorkspaceMemberRepository;
import com.collabhub.repository.WorkspaceRepository;
import com.collabhub.exception.ForbiddenException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Transactional
    public ConversationResponse getOrCreate(UUID workspaceId, UUID currentUserId, UUID targetUserId) {
        assertMember(workspaceId, currentUserId);
        assertMember(workspaceId, targetUserId);

        List<UUID> userIds = List.of(currentUserId, targetUserId);
        return conversationRepository.findDirectConversation(workspaceId, userIds)
                .map(this::toResponse)
                .orElseGet(() -> {
                    Workspace ws = workspaceRepository.findById(workspaceId)
                            .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));
                    User u1 = getUser(currentUserId);
                    User u2 = getUser(targetUserId);
                    Conversation conv = conversationRepository.save(Conversation.builder()
                            .workspace(ws).participants(List.of(u1, u2)).build());
                    return toResponse(conv);
                });
    }

    public List<ConversationResponse> getMyConversations(UUID workspaceId, UUID userId) {
        assertMember(workspaceId, userId);
        return conversationRepository.findByParticipantAndWorkspace(userId, workspaceId)
                .stream().map(this::toResponse).toList();
    }

    private void assertMember(UUID workspaceId, UUID userId) {
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId))
            throw new ForbiddenException("Not a workspace member");
    }

    private User getUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private ConversationResponse toResponse(Conversation c) {
        List<UserResponse> participants = c.getParticipants().stream()
                .map(userMapper::toResponse).toList();
        return new ConversationResponse(c.getId(), c.getWorkspace().getId(), participants, c.getCreatedAt());
    }
}
