package com.packora.backend.dto;

import lombok.Data;

@Data
public class CustomBoxConfigRequest {
    private String configurationJson;
    private boolean isSavedDraft;
}
