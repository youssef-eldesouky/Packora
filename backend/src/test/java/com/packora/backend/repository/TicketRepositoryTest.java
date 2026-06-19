package com.packora.backend.repository;

import com.packora.backend.model.BusinessOwner;
import com.packora.backend.model.SupportStaff;
import com.packora.backend.model.Ticket;
import com.packora.backend.model.enums.TicketStatus;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Database tests for TicketRepository using H2 in-memory database.
 * Tests CRUD operations, user/staff associations, status filtering, and audit fields.
 */
@DataJpaTest
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class TicketRepositoryTest {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TestEntityManager entityManager;

    private BusinessOwner testUser;
    private SupportStaff testStaff;

    private BusinessOwner createUser(String username, String email) {
        BusinessOwner bo = new BusinessOwner();
        bo.setUsername(username);
        bo.setEmail(email);
        bo.setPassword("encoded_pass");
        return bo;
    }

    private SupportStaff createSupportStaff(String username, String email) {
        SupportStaff staff = new SupportStaff();
        staff.setUsername(username);
        staff.setEmail(email);
        staff.setPassword("encoded_pass");
        staff.setShiftTime("09:00 - 17:00");
        return staff;
    }

    private Ticket createTicket(String subject, String message, TicketStatus status) {
        Ticket ticket = new Ticket();
        ticket.setSubject(subject);
        ticket.setMessage(message);
        ticket.setStatus(status);
        ticket.setContactName("John Customer");
        ticket.setContactEmail("john@customer.com");
        ticket.setCategory("Billing");
        ticket.setPriority("HIGH");
        return ticket;
    }

    @BeforeEach
    void setUp() {
        ticketRepository.deleteAll();
        testUser = entityManager.persistAndFlush(createUser("customer1", "customer1@test.com"));
        testStaff = entityManager.persistAndFlush(createSupportStaff("staff1", "staff1@test.com"));
    }

    // ── CREATE ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("DB-051: Save a guest contact/support ticket and verify persistence")
    void saveGuestTicket_shouldPersistWithAllFields() {
        Ticket ticket = createTicket("Late Shipping", "My order is delayed", TicketStatus.OPEN);
        Ticket saved = ticketRepository.save(ticket);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getSubject()).isEqualTo("Late Shipping");
        assertThat(saved.getMessage()).isEqualTo("My order is delayed");
        assertThat(saved.getStatus()).isEqualTo(TicketStatus.OPEN);
        assertThat(saved.getUser()).isNull();
    }

    @Test
    @DisplayName("DB-052: Save a registered user support ticket with associations")
    void saveUserTicket_shouldPersistWithUserAndStaffAssociations() {
        Ticket ticket = createTicket("Refund Request", "Double charge on checkout", TicketStatus.IN_PROGRESS);
        ticket.setUser(testUser);
        ticket.setAssignedStaff(testStaff);

        Ticket saved = ticketRepository.save(ticket);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getUser().getId()).isEqualTo(testUser.getId());
        assertThat(saved.getAssignedStaff().getId()).isEqualTo(testStaff.getId());
    }

    // ── READ / FIND ───────────────────────────────────────────────────

    @Test
    @DisplayName("DB-053: Find ticket by ID")
    void findById_shouldReturnTicket() {
        Ticket saved = ticketRepository.save(createTicket("Wrong Item Delivered", "Got boxes instead of envelopes", TicketStatus.OPEN));

        Optional<Ticket> found = ticketRepository.findById(saved.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getSubject()).isEqualTo("Wrong Item Delivered");
    }

    @Test
    @DisplayName("DB-054: Find tickets by user ID")
    void findByUserId_shouldReturnAssociatedTickets() {
        Ticket t1 = createTicket("T1", "M1", TicketStatus.OPEN);
        t1.setUser(testUser);
        ticketRepository.save(t1);

        Ticket t2 = createTicket("T2", "M2", TicketStatus.RESOLVED);
        t2.setUser(testUser);
        ticketRepository.save(t2);

        // Guest or other user ticket
        ticketRepository.save(createTicket("Guest Ticket", "M3", TicketStatus.OPEN));

        List<Ticket> userTickets = ticketRepository.findByUserId(testUser.getId());

        assertThat(userTickets).hasSize(2);
        assertThat(userTickets).extracting(Ticket::getSubject).containsExactlyInAnyOrder("T1", "T2");
    }

    @Test
    @DisplayName("DB-055: Find tickets by assigned staff ID")
    void findByAssignedStaffId_shouldReturnStaffTickets() {
        Ticket t1 = createTicket("T1", "M1", TicketStatus.IN_PROGRESS);
        t1.setAssignedStaff(testStaff);
        ticketRepository.save(t1);

        // Unassigned ticket
        ticketRepository.save(createTicket("T2", "M2", TicketStatus.OPEN));

        List<Ticket> staffTickets = ticketRepository.findByAssignedStaffId(testStaff.getId());

        assertThat(staffTickets).hasSize(1);
        assertThat(staffTickets.get(0).getSubject()).isEqualTo("T1");
    }

    @Test
    @DisplayName("DB-056: Find tickets by status")
    void findByStatus_shouldFilterTickets() {
        ticketRepository.save(createTicket("T1", "M1", TicketStatus.OPEN));
        ticketRepository.save(createTicket("T2", "M2", TicketStatus.IN_PROGRESS));
        ticketRepository.save(createTicket("T3", "M3", TicketStatus.OPEN));

        List<Ticket> openTickets = ticketRepository.findByStatus(TicketStatus.OPEN);

        assertThat(openTickets).hasSize(2);
        assertThat(openTickets).extracting(Ticket::getSubject).containsExactlyInAnyOrder("T1", "T3");
    }

    // ── UPDATE ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("DB-057: Update ticket status and assigned staff")
    void updateTicket_shouldPersistStatusAndStaffChanges() {
        Ticket saved = ticketRepository.save(createTicket("T1", "M1", TicketStatus.OPEN));

        saved.setStatus(TicketStatus.RESOLVED);
        saved.setAssignedStaff(testStaff);
        ticketRepository.save(saved);

        Ticket updated = ticketRepository.findById(saved.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(TicketStatus.RESOLVED);
        assertThat(updated.getAssignedStaff().getId()).isEqualTo(testStaff.getId());
    }

    // ── DELETE ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("DB-058: Delete ticket by ID")
    void deleteById_shouldRemoveTicket() {
        Ticket saved = ticketRepository.save(createTicket("T1", "M1", TicketStatus.OPEN));
        Long id = saved.getId();

        ticketRepository.deleteById(id);

        assertThat(ticketRepository.findById(id)).isEmpty();
    }

    // ── TIMESTAMP ─────────────────────────────────────────────────────

    @Test
    @DisplayName("DB-059: Ticket timestamps are auto-generated")
    void save_shouldAutoGenerateTimestamps() {
        Ticket saved = ticketRepository.save(createTicket("T1", "M1", TicketStatus.OPEN));

        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
    }
}
