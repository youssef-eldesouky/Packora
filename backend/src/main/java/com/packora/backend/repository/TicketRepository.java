package com.packora.backend.repository;

import com.packora.backend.model.Ticket;
import com.packora.backend.model.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByUserId(Long userId);

    List<Ticket> findByAssignedStaffId(Long staffId);

    List<Ticket> findByStatus(TicketStatus status);
}
