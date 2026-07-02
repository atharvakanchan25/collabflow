package com.collabhub.websocket;

import com.collabhub.config.KafkaConfig;
import com.collabhub.model.dto.Dtos;
import com.collabhub.model.entity.User;
import com.collabhub.model.event.Events;
import com.collabhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.Instant;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class WebSocketHandler {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final UserRepository userRepository;

    @MessageMapping("/typing")
    public void handleTyping(@Payload Dtos.TypingEvent event, Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        String key = event.channelId() != null ? event.channelId().toString()
                : event.conversationId() != null ? event.conversationId().toString() : userId.toString();

        Events.TypingEvent kafkaEvent = new Events.TypingEvent(
                event.channelId(), event.conversationId(), userId, event.username(),
                event.isTyping(), Instant.now());
        kafkaTemplate.send(KafkaConfig.TOPIC_TYPING, key, kafkaEvent);
    }

    @MessageMapping("/presence")
    public void handlePresence(@Payload Dtos.PresenceEvent event, Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        userRepository.findById(userId).ifPresent(user -> {
            user.setStatus(event.status());
            userRepository.save(user);
        });

        userRepository.findById(userId).ifPresent(user -> {
            Events.PresenceEvent kafkaEvent = new Events.PresenceEvent(
                    userId, user.getUsername(), event.status(), Instant.now());
            kafkaTemplate.send(KafkaConfig.TOPIC_PRESENCE, userId.toString(), kafkaEvent);
        });
    }
}
