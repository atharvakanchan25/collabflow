package com.collabhub.service;

import com.collabhub.exception.ResourceNotFoundException;
import com.collabhub.model.dto.Dtos.AttachmentResponse;
import com.collabhub.model.entity.Attachment;
import com.collabhub.model.entity.Message;
import com.collabhub.repository.AttachmentRepository;
import com.collabhub.repository.MessageRepository;
import io.minio.*;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class FileService {

    private final MinioClient minioClient;
    private final AttachmentRepository attachmentRepository;
    private final MessageRepository messageRepository;

    @Value("${app.minio.bucket}")
    private String bucket;

    public AttachmentResponse upload(UUID messageId, MultipartFile file) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        String storageKey = messageId + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();

        try {
            ensureBucketExists();
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(storageKey)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());
        } catch (Exception e) {
            throw new RuntimeException("File upload failed: " + e.getMessage(), e);
        }

        Attachment attachment = attachmentRepository.save(Attachment.builder()
                .message(message)
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .storageKey(storageKey)
                .build());

        return new AttachmentResponse(attachment.getId(), attachment.getFileName(),
                attachment.getFileSize(), attachment.getMimeType(), "/api/files/" + attachment.getId());
    }

    public String getDownloadUrl(UUID attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));
        try {
            return minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .bucket(bucket)
                    .object(attachment.getStorageKey())
                    .method(Method.GET)
                    .expiry(1, TimeUnit.HOURS)
                    .build());
        } catch (Exception e) {
            throw new RuntimeException("Could not generate download URL", e);
        }
    }

    private void ensureBucketExists() throws Exception {
        boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
        if (!exists) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
        }
    }
}
