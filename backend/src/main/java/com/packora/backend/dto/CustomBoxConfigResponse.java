package com.packora.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomBoxConfigResponse {
    private Long id;
    private Long userId;
    private String configurationJson;
    private boolean isSavedDraft;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
