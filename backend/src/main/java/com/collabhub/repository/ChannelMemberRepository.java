package com.collabhub.repository;

import com.collabhub.model.entity.ChannelMember;
import com.collabhub.model.entity.ChannelMember.ChannelMemberId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChannelMemberRepository extends JpaRepository<ChannelMember, ChannelMemberId> {
    List<ChannelMember> findByChannelId(UUID channelId);
    boolean existsByChannelIdAndUserId(UUID channelId, UUID userId);
    void deleteByChannelIdAndUserId(UUID channelId, UUID userId);
}
