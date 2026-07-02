package com.collabhub.repository;

import com.collabhub.model.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkspaceRepository extends JpaRepository<Workspace, UUID> {
    Optional<Workspace> findBySlug(String slug);
    boolean existsBySlug(String slug);

    @Query("SELECT wm.workspace FROM WorkspaceMember wm WHERE wm.user.id = :userId")
    List<Workspace> findByMemberId(UUID userId);
}
