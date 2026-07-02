package com.collabhub.service;

import com.collabhub.exception.ConflictException;
import com.collabhub.exception.ForbiddenException;
import com.collabhub.exception.ResourceNotFoundException;
import com.collabhub.model.dto.Dtos.*;
import com.collabhub.model.entity.Channel;
import com.collabhub.model.entity.ChannelMember;
import com.collabhub.model.entity.ChannelMember.ChannelMemberId;
import com.collabhub.model.entity.User;
import com.collabhub.model.entity.Workspace;
import com.collabhub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChannelService {

    private final ChannelRepository channelRepository;
    private final ChannelMemberRepository channelMemberRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public ChannelResponse create(UUID workspaceId, CreateChannelRequest req, UUID creatorId) {
        assertWorkspaceMember(workspaceId, creatorId);
        if (channelRepository.existsByWorkspaceIdAndName(workspaceId, req.name()))
            throw new ConflictException("Channel name already exists in this workspace");

        Workspace ws = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));
        User creator = getUser(creatorId);

        Channel channel = channelRepository.save(Channel.builder()
                .workspace(ws).name(req.name()).description(req.description())
                .isPrivate(req.isPrivate()).createdBy(creator).build());

        channelMemberRepository.save(ChannelMember.builder()
                .id(new ChannelMemberId(channel.getId(), creatorId))
                .channel(channel).user(creator).build());

        return toResponse(channel);
    }

    public List<ChannelResponse> getWorkspaceChannels(UUID workspaceId, UUID userId) {
        assertWorkspaceMember(workspaceId, userId);
        return channelRepository.findByMemberIdAndWorkspaceId(userId, workspaceId)
                .stream().map(this::toResponse).toList();
    }

    public ChannelResponse getChannel(UUID channelId, UUID userId) {
        Channel channel = getChannelEntity(channelId);
        assertChannelMember(channelId, userId);
        return toResponse(channel);
    }

    @Transactional
    public void join(UUID channelId, UUID userId) {
        Channel channel = getChannelEntity(channelId);
        assertWorkspaceMember(channel.getWorkspace().getId(), userId);
        if (channel.isPrivate())
            throw new ForbiddenException("Cannot self-join a private channel");
        if (channelMemberRepository.existsByChannelIdAndUserId(channelId, userId))
            throw new ConflictException("Already a member");

        channelMemberRepository.save(ChannelMember.builder()
                .id(new ChannelMemberId(channelId, userId))
                .channel(channel).user(getUser(userId)).build());
    }

    @Transactional
    public void leave(UUID channelId, UUID userId) {
        assertChannelMember(channelId, userId);
        channelMemberRepository.deleteByChannelIdAndUserId(channelId, userId);
    }

    public List<UserResponse> getMembers(UUID channelId, UUID requesterId) {
        assertChannelMember(channelId, requesterId);
        return channelMemberRepository.findByChannelId(channelId).stream()
                .map(cm -> {
                    User u = cm.getUser();
                    return new UserResponse(u.getId(), u.getUsername(), u.getEmail(),
                            u.getDisplayName(), u.getAvatarUrl(), u.getStatus());
                }).toList();
    }

    private void assertWorkspaceMember(UUID workspaceId, UUID userId) {
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId))
            throw new ForbiddenException("Not a workspace member");
    }

    private void assertChannelMember(UUID channelId, UUID userId) {
        if (!channelMemberRepository.existsByChannelIdAndUserId(channelId, userId))
            throw new ForbiddenException("Not a channel member");
    }

    private Channel getChannelEntity(UUID channelId) {
        return channelRepository.findById(channelId)
                .orElseThrow(() -> new ResourceNotFoundException("Channel not found"));
    }

    private User getUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private ChannelResponse toResponse(Channel c) {
        return new ChannelResponse(c.getId(), c.getWorkspace().getId(), c.getName(),
                c.getDescription(), c.isPrivate(), c.getCreatedAt());
    }
}
