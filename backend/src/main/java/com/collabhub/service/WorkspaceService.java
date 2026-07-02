package com.collabhub.service;

import com.collabhub.exception.ConflictException;
import com.collabhub.exception.ForbiddenException;
import com.collabhub.exception.ResourceNotFoundException;
import com.collabhub.model.dto.Dtos.*;
import com.collabhub.model.entity.Workspace;
import com.collabhub.model.entity.WorkspaceMember;
import com.collabhub.model.entity.WorkspaceMember.WorkspaceMemberId;
import com.collabhub.model.entity.User;
import com.collabhub.repository.UserRepository;
import com.collabhub.repository.WorkspaceMemberRepository;
import com.collabhub.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Transactional
    public WorkspaceResponse create(CreateWorkspaceRequest req, UUID ownerId) {
        if (workspaceRepository.existsBySlug(req.slug()))
            throw new ConflictException("Slug already taken");

        User owner = getUser(ownerId);
        Workspace ws = workspaceRepository.save(Workspace.builder()
                .name(req.name()).slug(req.slug()).owner(owner).build());

        workspaceMemberRepository.save(WorkspaceMember.builder()
                .id(new WorkspaceMemberId(ws.getId(), ownerId))
                .workspace(ws).user(owner).role("OWNER").build());

        return toResponse(ws);
    }

    public List<WorkspaceResponse> getMyWorkspaces(UUID userId) {
        return workspaceRepository.findByMemberId(userId).stream().map(this::toResponse).toList();
    }

    public WorkspaceResponse getBySlug(String slug) {
        return toResponse(workspaceRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found")));
    }

    @Transactional
    public WorkspaceResponse addMember(UUID workspaceId, UUID requesterId, UUID targetUserId) {
        Workspace ws = getWorkspace(workspaceId);
        assertOwnerOrAdmin(workspaceId, requesterId);
        if (workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, targetUserId))
            throw new ConflictException("User is already a member");

        User target = getUser(targetUserId);
        workspaceMemberRepository.save(WorkspaceMember.builder()
                .id(new WorkspaceMemberId(workspaceId, targetUserId))
                .workspace(ws).user(target).role("MEMBER").build());
        return toResponse(ws);
    }

    public List<UserResponse> getMembers(UUID workspaceId) {
        return workspaceMemberRepository.findByWorkspaceId(workspaceId).stream()
                .map(wm -> userMapper.toResponse(wm.getUser())).toList();
    }

    private void assertOwnerOrAdmin(UUID workspaceId, UUID userId) {
        workspaceMemberRepository.findByWorkspaceId(workspaceId).stream()
                .filter(m -> m.getUser().getId().equals(userId))
                .filter(m -> m.getRole().equals("OWNER") || m.getRole().equals("ADMIN"))
                .findFirst()
                .orElseThrow(() -> new ForbiddenException("Insufficient permissions"));
    }

    private Workspace getWorkspace(UUID id) {
        return workspaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));
    }

    private User getUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private WorkspaceResponse toResponse(Workspace ws) {
        return new WorkspaceResponse(ws.getId(), ws.getName(), ws.getSlug(),
                userMapper.toResponse(ws.getOwner()), ws.getIconUrl(), ws.getCreatedAt());
    }
}
