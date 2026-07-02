package com.collabhub.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    public static final String TOPIC_MESSAGES    = "collabhub.messages";
    public static final String TOPIC_PRESENCE    = "collabhub.presence";
    public static final String TOPIC_TYPING      = "collabhub.typing";
    public static final String TOPIC_NOTIFICATIONS = "collabhub.notifications";

    @Bean public NewTopic messagesTopic()      { return TopicBuilder.name(TOPIC_MESSAGES).partitions(6).replicas(1).build(); }
    @Bean public NewTopic presenceTopic()      { return TopicBuilder.name(TOPIC_PRESENCE).partitions(3).replicas(1).build(); }
    @Bean public NewTopic typingTopic()        { return TopicBuilder.name(TOPIC_TYPING).partitions(3).replicas(1).build(); }
    @Bean public NewTopic notificationsTopic() { return TopicBuilder.name(TOPIC_NOTIFICATIONS).partitions(3).replicas(1).build(); }
}
