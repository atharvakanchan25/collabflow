package com.collabhub.repository;

import com.collabhub.model.entity.WorkspaceMember;
import com.collabhub.model.entity.WorkspaceMember.WorkspaceMemberId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, WorkspaceMemberId> {
    List<WorkspaceMember> findByWorkspaceId(UUID workspaceId);
    boolean existsByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);
}
