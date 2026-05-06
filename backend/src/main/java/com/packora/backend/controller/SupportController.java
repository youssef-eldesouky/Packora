package com.packora.backend.controller;

import com.packora.backend.dto.support.TicketCreateRequest;
import com.packora.backend.dto.support.TicketResponse;
import com.packora.backend.service.SupportService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/support/tickets")
public class SupportController {

    private final SupportService supportService;

    public SupportController(SupportService supportService) {
        this.supportService = supportService;
    }

    /**
     * Create a new support ticket. Accessible by guests and logged-in users.
     */
    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody TicketCreateRequest request,
            Authentication authentication) {
        TicketResponse response = supportService.createTicket(request, authentication);
        return ResponseEntity.ok(response);
    }

    /**
     * Admin/SupportStaff: Get all tickets
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT_STAFF')")
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        return ResponseEntity.ok(supportService.getAllTickets());
    }
}
