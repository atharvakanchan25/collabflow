package com.collabhub.repository;

import com.collabhub.model.entity.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReactionRepository extends JpaRepository<Reaction, UUID> {
    List<Reaction> findByMessageId(UUID messageId);
    Optional<Reaction> findByMessageIdAndUserIdAndEmoji(UUID messageId, UUID userId, String emoji);
    boolean existsByMessageIdAndUserIdAndEmoji(UUID messageId, UUID userId, String emoji);
    void deleteByMessageIdAndUserIdAndEmoji(UUID messageId, UUID userId, String emoji);
}
