package com.packora.backend.dto.support;

import com.packora.backend.model.enums.TicketStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TicketResponse {
    private Long id;
    private String subject;
    private String message;
    private TicketStatus status;
    private String contactName;
    private String contactEmail;
    private String category;
    private String priority;
    private String orderReference;
    private Long userId;
    private String username;
    private Long assignedStaffId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
