package com.packora.backend.dto.design;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Response DTO for Design — includes file paths and partner ID.
 */
@Data
@Builder
public class DesignResponse {

    private Long id;
    private String logoFile;
    private String artworkFile;
    private String previewUrl;
    private Long partnerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
