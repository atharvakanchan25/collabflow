package com.collabhub.repository;

import com.collabhub.model.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    @Query("SELECT c FROM Conversation c JOIN c.participants p WHERE p.id = :userId AND c.workspace.id = :workspaceId")
    List<Conversation> findByParticipantAndWorkspace(UUID userId, UUID workspaceId);

    @Query("""
        SELECT c FROM Conversation c
        WHERE c.workspace.id = :workspaceId
          AND (SELECT COUNT(p) FROM c.participants p WHERE p.id IN :userIds) = 2
          AND (SELECT COUNT(p) FROM c.participants p) = 2
        """)
    Optional<Conversation> findDirectConversation(UUID workspaceId, List<UUID> userIds);
}
