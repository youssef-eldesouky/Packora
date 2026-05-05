package com.packora.backend.dto.design;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request metadata for creating / updating a Design.
 * File uploads (logo, artwork) are handled separately as MultipartFile params.
 */
@Data
public class DesignRequest {

    @NotNull(message = "Partner ID is required")
    private Long partnerId;

    /** Optional preview URL (e.g. an external link to a rendered preview) */
    private String previewUrl;
}
