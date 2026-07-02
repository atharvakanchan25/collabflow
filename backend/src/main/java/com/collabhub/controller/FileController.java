package com.collabhub.controller;

import com.collabhub.model.dto.Dtos.AttachmentResponse;
import com.collabhub.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping("/messages/{messageId}")
    @ResponseStatus(HttpStatus.CREATED)
    public AttachmentResponse upload(@PathVariable UUID messageId,
                                     @RequestParam("file") MultipartFile file,
                                     @AuthenticationPrincipal String userId) {
        return fileService.upload(messageId, file);
    }

    @GetMapping("/{attachmentId}")
    public org.springframework.http.ResponseEntity<Void> download(@PathVariable UUID attachmentId) {
        String url = fileService.getDownloadUrl(attachmentId);
        return org.springframework.http.ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(url)).build();
    }
}
