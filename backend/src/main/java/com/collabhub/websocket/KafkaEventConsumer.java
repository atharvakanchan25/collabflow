package com.collabhub.websocket;

import com.collabhub.config.KafkaConfig;
import com.collabhub.model.event.Events.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class KafkaEventConsumer {

    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(topics = KafkaConfig.TOPIC_MESSAGES, groupId = "ws-messages")
    public void onMessage(MessageEvent event) {
        if (event.channelId() != null) {
            messagingTemplate.convertAndSend("/topic/channels/" + event.channelId(), event);
        } else if (event.conversationId() != null) {
            messagingTemplate.convertAndSend("/topic/conversations/" + event.conversationId(), event);
        }
    }

    @KafkaListener(topics = KafkaConfig.TOPIC_TYPING, groupId = "ws-typing")
    public void onTyping(TypingEvent event) {
        if (event.channelId() != null) {
            messagingTemplate.convertAndSend("/topic/channels/" + event.channelId() + "/typing", event);
        } else if (event.conversationId() != null) {
            messagingTemplate.convertAndSend("/topic/conversations/" + event.conversationId() + "/typing", event);
        }
    }

    @KafkaListener(topics = KafkaConfig.TOPIC_PRESENCE, groupId = "ws-presence")
    public void onPresence(PresenceEvent event) {
        messagingTemplate.convertAndSend("/topic/presence", event);
    }

    @KafkaListener(topics = KafkaConfig.TOPIC_NOTIFICATIONS, groupId = "ws-notifications")
    public void onNotification(NotificationEvent event) {
        messagingTemplate.convertAndSendToUser(
                event.userId().toString(), "/queue/notifications", event);
    }
}
