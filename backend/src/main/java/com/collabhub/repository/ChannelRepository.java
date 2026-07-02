package com.collabhub.repository;

import com.collabhub.model.entity.Channel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChannelRepository extends JpaRepository<Channel, UUID> {
    List<Channel> findByWorkspaceId(UUID workspaceId);
    Optional<Channel> findByWorkspaceIdAndName(UUID workspaceId, String name);
    boolean existsByWorkspaceIdAndName(UUID workspaceId, String name);

    @Query("SELECT cm.channel FROM ChannelMember cm WHERE cm.user.id = :userId AND cm.channel.workspace.id = :workspaceId")
    List<Channel> findByMemberIdAndWorkspaceId(UUID userId, UUID workspaceId);
}
