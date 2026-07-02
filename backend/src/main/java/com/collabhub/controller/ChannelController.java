package com.collabhub.controller;

import com.collabhub.model.dto.Dtos.*;
import com.collabhub.service.ChannelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/channels")
@RequiredArgsConstructor
public class ChannelController {

    private final ChannelService channelService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ChannelResponse create(@PathVariable UUID workspaceId,
                                  @Valid @RequestBody CreateChannelRequest req,
                                  @AuthenticationPrincipal String userId) {
        return channelService.create(workspaceId, req, UUID.fromString(userId));
    }

    @GetMapping
    public List<ChannelResponse> getChannels(@PathVariable UUID workspaceId,
                                             @AuthenticationPrincipal String userId) {
        return channelService.getWorkspaceChannels(workspaceId, UUID.fromString(userId));
    }

    @GetMapping("/{channelId}")
    public ChannelResponse getChannel(@PathVariable UUID workspaceId,
                                      @PathVariable UUID channelId,
                                      @AuthenticationPrincipal String userId) {
        return channelService.getChannel(channelId, UUID.fromString(userId));
    }

    @PostMapping("/{channelId}/join")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void join(@PathVariable UUID channelId,
                     @AuthenticationPrincipal String userId) {
        channelService.join(channelId, UUID.fromString(userId));
    }

    @DeleteMapping("/{channelId}/leave")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void leave(@PathVariable UUID channelId,
                      @AuthenticationPrincipal String userId) {
        channelService.leave(channelId, UUID.fromString(userId));
    }

    @GetMapping("/{channelId}/members")
    public List<UserResponse> getMembers(@PathVariable UUID channelId,
                                         @AuthenticationPrincipal String userId) {
        return channelService.getMembers(channelId, UUID.fromString(userId));
    }
}
