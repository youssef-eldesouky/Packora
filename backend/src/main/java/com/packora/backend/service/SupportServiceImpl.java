package com.packora.backend.service;

import com.packora.backend.dto.support.TicketCreateRequest;
import com.packora.backend.dto.support.TicketResponse;
import com.packora.backend.model.Ticket;
import com.packora.backend.model.User;
import com.packora.backend.repository.TicketRepository;
import com.packora.backend.repository.UserRepository;
import com.packora.backend.security.services.UserDetailsImpl;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupportServiceImpl implements SupportService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public SupportServiceImpl(TicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public TicketResponse createTicket(TicketCreateRequest request, Authentication authentication) {
        Ticket ticket = new Ticket();
        ticket.setSubject(request.getSubject());
        ticket.setMessage(request.getMessage());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        ticket.setOrderReference(request.getOrderReference());

        boolean isLoggedIn = authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal());

        if (isLoggedIn && authentication.getPrincipal() instanceof UserDetailsImpl userDetails) {
            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            ticket.setUser(user);
            ticket.setContactName(user.getUsername());
            ticket.setContactEmail(user.getEmail());
        } else {
            ticket.setContactName(request.getContactName());
            ticket.setContactEmail(request.getContactEmail());
        }

        Ticket savedTicket = ticketRepository.save(ticket);
        return mapToResponse(savedTicket);
    }

    @Override
    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public TicketResponse getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id).orElseThrow(() -> new RuntimeException("Ticket not found"));
        return mapToResponse(ticket);
    }

    @Override
    public List<TicketResponse> getMyTickets(Long userId) {
        return ticketRepository.findByUserId(userId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private TicketResponse mapToResponse(Ticket ticket) {
        TicketResponse res = new TicketResponse();
        res.setId(ticket.getId());
        res.setSubject(ticket.getSubject());
        res.setMessage(ticket.getMessage());
        res.setStatus(ticket.getStatus());
        res.setCategory(ticket.getCategory());
        res.setPriority(ticket.getPriority());
        res.setOrderReference(ticket.getOrderReference());
        res.setContactName(ticket.getContactName());
        res.setContactEmail(ticket.getContactEmail());
        
        if (ticket.getUser() != null) {
            res.setUserId(ticket.getUser().getId());
            res.setUsername(ticket.getUser().getUsername());
        }
        
        if (ticket.getAssignedStaff() != null) {
            res.setAssignedStaffId(ticket.getAssignedStaff().getId());
        }
        
        res.setCreatedAt(ticket.getCreatedAt());
        res.setUpdatedAt(ticket.getUpdatedAt());
        return res;
    }
}
