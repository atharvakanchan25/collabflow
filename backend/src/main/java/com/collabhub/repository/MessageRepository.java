package com.collabhub.repository;

import com.collabhub.model.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    @Query("SELECT m FROM Message m WHERE m.channel.id = :channelId AND m.deletedAt IS NULL AND m.parent IS NULL ORDER BY m.createdAt DESC")
    Page<Message> findByChannelId(UUID channelId, Pageable pageable);

    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId AND m.deletedAt IS NULL AND m.parent IS NULL ORDER BY m.createdAt DESC")
    Page<Message> findByConversationId(UUID conversationId, Pageable pageable);

    @Query("SELECT m FROM Message m WHERE m.parent.id = :parentId AND m.deletedAt IS NULL ORDER BY m.createdAt ASC")
    List<Message> findThreadReplies(UUID parentId);

    @Query(value = "SELECT * FROM messages WHERE deleted_at IS NULL AND to_tsvector('english', content) @@ plainto_tsquery('english', :query) AND (channel_id IN :channelIds OR conversation_id IN :convIds) ORDER BY created_at DESC LIMIT 50", nativeQuery = true)
    List<Message> searchMessages(String query, List<UUID> channelIds, List<UUID> convIds);
}
