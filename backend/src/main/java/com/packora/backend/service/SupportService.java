package com.packora.backend.service;

import com.packora.backend.dto.support.TicketCreateRequest;
import com.packora.backend.dto.support.TicketResponse;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface SupportService {
    TicketResponse createTicket(TicketCreateRequest request, Authentication authentication);
    List<TicketResponse> getAllTickets();
    TicketResponse getTicketById(Long id);
    List<TicketResponse> getMyTickets(Long userId);
}
