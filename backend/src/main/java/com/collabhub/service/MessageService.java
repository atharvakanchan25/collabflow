package com.collabhub.service;

import com.collabhub.config.KafkaConfig;
import com.collabhub.exception.ForbiddenException;
import com.collabhub.exception.ResourceNotFoundException;
import com.collabhub.model.dto.Dtos.*;
import com.collabhub.model.entity.*;
import com.collabhub.model.event.Events.MessageEvent;
import com.collabhub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChannelRepository channelRepository;
    private final ConversationRepository conversationRepository;
    private final ChannelMemberRepository channelMemberRepository;
    private final ReactionRepository reactionRepository;
    private final UserRepository userRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final UserMapper userMapper;

    @Transactional
    public MessageResponse sendToChannel(UUID channelId, SendMessageRequest req, UUID senderId) {
        if (!channelMemberRepository.existsByChannelIdAndUserId(channelId, senderId))
            throw new ForbiddenException("Not a channel member");

        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new ResourceNotFoundException("Channel not found"));
        User sender = getUser(senderId);
        Message parent = req.parentId() != null ? getMessage(req.parentId()) : null;

        Message msg = messageRepository.save(Message.builder()
                .channel(channel).sender(sender).content(req.content()).parent(parent).build());

        publishMessageEvent("CREATED", msg);
        return toResponse(msg);
    }

    @Transactional
    public MessageResponse sendToConversation(UUID conversationId, SendMessageRequest req, UUID senderId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        boolean isParticipant = conv.getParticipants().stream()
                .anyMatch(p -> p.getId().equals(senderId));
        if (!isParticipant) throw new ForbiddenException("Not a conversation participant");

        User sender = getUser(senderId);
        Message parent = req.parentId() != null ? getMessage(req.parentId()) : null;

        Message msg = messageRepository.save(Message.builder()
                .conversation(conv).sender(sender).content(req.content()).parent(parent).build());

        publishMessageEvent("CREATED", msg);
        return toResponse(msg);
    }

    public PageResponse<MessageResponse> getChannelMessages(UUID channelId, UUID userId, int page, int size) {
        if (!channelMemberRepository.existsByChannelIdAndUserId(channelId, userId))
            throw new ForbiddenException("Not a channel member");
        Page<Message> p = messageRepository.findByChannelId(channelId, PageRequest.of(page, size));
        return toPage(p, page, size);
    }

    public PageResponse<MessageResponse> getConversationMessages(UUID conversationId, UUID userId, int page, int size) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        boolean isParticipant = conv.getParticipants().stream().anyMatch(p -> p.getId().equals(userId));
        if (!isParticipant) throw new ForbiddenException("Not a conversation participant");
        Page<Message> p = messageRepository.findByConversationId(conversationId, PageRequest.of(page, size));
        return toPage(p, page, size);
    }

    public List<MessageResponse> getThreadReplies(UUID parentId, UUID userId) {
        Message parent = getMessage(parentId);
        UUID channelId = parent.getChannel() != null ? parent.getChannel().getId() : null;
        if (channelId != null && !channelMemberRepository.existsByChannelIdAndUserId(channelId, userId))
            throw new ForbiddenException("Not a channel member");
        return messageRepository.findThreadReplies(parentId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public MessageResponse edit(UUID messageId, EditMessageRequest req, UUID userId) {
        Message msg = getMessage(messageId);
        if (!msg.getSender().getId().equals(userId))
            throw new ForbiddenException("Cannot edit another user's message");
        msg.setContent(req.content());
        msg.setEditedAt(Instant.now());
        msg = messageRepository.save(msg);
        publishMessageEvent("EDITED", msg);
        return toResponse(msg);
    }

    @Transactional
    public void delete(UUID messageId, UUID userId) {
        Message msg = getMessage(messageId);
        if (!msg.getSender().getId().equals(userId))
            throw new ForbiddenException("Cannot delete another user's message");
        msg.setDeletedAt(Instant.now());
        messageRepository.save(msg);
        publishMessageEvent("DELETED", msg);
    }

    @Transactional
    public List<ReactionSummary> toggleReaction(UUID messageId, String emoji, UUID userId) {
        getMessage(messageId); // existence check
        if (reactionRepository.existsByMessageIdAndUserIdAndEmoji(messageId, userId, emoji)) {
            reactionRepository.deleteByMessageIdAndUserIdAndEmoji(messageId, userId, emoji);
        } else {
            Message msg = getMessage(messageId);
            User user = getUser(userId);
            reactionRepository.save(Reaction.builder().message(msg).user(user).emoji(emoji).build());
        }
        return buildReactionSummary(messageId, userId);
    }

    public List<MessageResponse> search(String query, List<UUID> channelIds, List<UUID> convIds) {
        return messageRepository.searchMessages(query, channelIds, convIds)
                .stream().map(this::toResponse).toList();
    }

    private void publishMessageEvent(String eventType, Message msg) {
        UUID channelId = msg.getChannel() != null ? msg.getChannel().getId() : null;
        UUID convId = msg.getConversation() != null ? msg.getConversation().getId() : null;
        UUID parentId = msg.getParent() != null ? msg.getParent().getId() : null;
        MessageEvent event = new MessageEvent(eventType, msg.getId(), channelId, convId,
                msg.getSender().getId(), msg.getSender().getUsername(),
                msg.getContent(), msg.getMessageType().name(), parentId, msg.getCreatedAt());
        String key = channelId != null ? channelId.toString() : convId.toString();
        kafkaTemplate.send(KafkaConfig.TOPIC_MESSAGES, key, event);
    }

    private List<ReactionSummary> buildReactionSummary(UUID messageId, UUID currentUserId) {
        return reactionRepository.findByMessageId(messageId).stream()
                .collect(java.util.stream.Collectors.groupingBy(Reaction::getEmoji))
                .entrySet().stream()
                .map(e -> new ReactionSummary(e.getKey(), e.getValue().size(),
                        e.getValue().stream().anyMatch(r -> r.getUser().getId().equals(currentUserId))))
                .toList();
    }

    private PageResponse<MessageResponse> toPage(Page<Message> p, int page, int size) {
        return new PageResponse<>(p.getContent().stream().map(this::toResponse).toList(),
                page, size, p.getTotalElements(), p.hasNext());
    }

    private MessageResponse toResponse(Message m) {
        List<AttachmentResponse> attachments = m.getAttachments() == null ? List.of() :
                m.getAttachments().stream().map(a -> new AttachmentResponse(
                        a.getId(), a.getFileName(), a.getFileSize(), a.getMimeType(), "/api/files/" + a.getId())).toList();
        List<ReactionSummary> reactions = m.getReactions() == null ? List.of() :
                buildReactionSummaryFromList(m.getReactions(), m.getSender().getId());
        return new MessageResponse(m.getId(),
                m.getChannel() != null ? m.getChannel().getId() : null,
                m.getConversation() != null ? m.getConversation().getId() : null,
                userMapper.toResponse(m.getSender()), m.getContent(),
                m.getMessageType().name(),
                m.getParent() != null ? m.getParent().getId() : null,
                attachments, reactions, m.getEditedAt(), m.getCreatedAt());
    }

    private List<ReactionSummary> buildReactionSummaryFromList(List<Reaction> reactions, UUID currentUserId) {
        return reactions.stream()
                .collect(java.util.stream.Collectors.groupingBy(Reaction::getEmoji))
                .entrySet().stream()
                .map(e -> new ReactionSummary(e.getKey(), e.getValue().size(),
                        e.getValue().stream().anyMatch(r -> r.getUser().getId().equals(currentUserId))))
                .toList();
    }

    private Message getMessage(UUID id) {
        return messageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
    }

    private User getUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
