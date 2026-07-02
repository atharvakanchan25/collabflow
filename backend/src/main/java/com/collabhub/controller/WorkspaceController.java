package com.collabhub.controller;

import com.collabhub.model.dto.Dtos.*;
import com.collabhub.service.WorkspaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkspaceResponse create(@Valid @RequestBody CreateWorkspaceRequest req,
                                    @AuthenticationPrincipal String userId) {
        return workspaceService.create(req, UUID.fromString(userId));
    }

    @GetMapping
    public List<WorkspaceResponse> getMyWorkspaces(@AuthenticationPrincipal String userId) {
        return workspaceService.getMyWorkspaces(UUID.fromString(userId));
    }

    @GetMapping("/{slug}")
    public WorkspaceResponse getBySlug(@PathVariable String slug) {
        return workspaceService.getBySlug(slug);
    }

    @GetMapping("/{workspaceId}/members")
    public List<UserResponse> getMembers(@PathVariable UUID workspaceId) {
        return workspaceService.getMembers(workspaceId);
    }

    @PostMapping("/{workspaceId}/members/{targetUserId}")
    @ResponseStatus(HttpStatus.CREATED)
    public WorkspaceResponse addMember(@PathVariable UUID workspaceId,
                                       @PathVariable UUID targetUserId,
                                       @AuthenticationPrincipal String userId) {
        return workspaceService.addMember(workspaceId, UUID.fromString(userId), targetUserId);
    }
}
