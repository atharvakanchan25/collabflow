package com.collabhub.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "channel_members")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChannelMember {

    @EmbeddedId
    private ChannelMemberId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("channelId")
    @JoinColumn(name = "channel_id")
    private Channel channel;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant joinedAt = Instant.now();

    @Embeddable
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
    public static class ChannelMemberId implements java.io.Serializable {
        private UUID channelId;
        private UUID userId;
    }
}
