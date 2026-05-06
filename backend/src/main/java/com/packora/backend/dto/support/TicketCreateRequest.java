package com.packora.backend.dto.support;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TicketCreateRequest {

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Message is required")
    private String message;

    private String contactName;
    private String contactEmail;
    private String category;
    private String priority;
    private String orderReference;
}
