package com.packora.backend.repository;

import com.packora.backend.model.BusinessOwner;
import com.packora.backend.model.Admin;
import com.packora.backend.model.User;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Database tests for UserRepository using H2 in-memory database.
 * Tests CRUD operations, finder methods, existence checks, and
 * Single Table Inheritance (STI) for User subtypes.
 */
@DataJpaTest
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    private BusinessOwner createBusinessOwner(String username, String email) {
        BusinessOwner bo = new BusinessOwner();
        bo.setUsername(username);
        bo.setEmail(email);
        bo.setPassword("encoded_password_123");
        bo.setPhone("+201234567890");
        bo.setCompanyName("Test Corp");
        bo.setBillingAddress("123 Test St");
        bo.setShippingAddress("456 Ship Ave");
        return bo;
    }

    private Admin createAdmin(String username, String email) {
        Admin admin = new Admin();
        admin.setUsername(username);
        admin.setEmail(email);
        admin.setPassword("encoded_admin_pass");
        admin.setPermissionsLevel("FULL");
        return admin;
    }

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    // ── CREATE ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("DB-019: Save a BusinessOwner and verify persistence")
    void saveBusinessOwner_shouldPersistWithAllFields() {
        BusinessOwner bo = createBusinessOwner("johndoe", "john@packora.com");
        User saved = userRepository.save(bo);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getUsername()).isEqualTo("johndoe");
        assertThat(saved.getEmail()).isEqualTo("john@packora.com");
        assertThat(saved.getCompanyName()).isEqualTo("Test Corp");
    }

    @Test
    @DisplayName("DB-020: Save an Admin user (STI discrimination)")
    void saveAdmin_shouldPersistWithDiscriminator() {
        Admin admin = createAdmin("admin1", "admin@packora.com");
        User saved = userRepository.save(admin);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getRole()).isEqualTo("ADMIN");
    }

    // ── READ / FIND ───────────────────────────────────────────────────

    @Test
    @DisplayName("DB-021: Find user by email")
    void findByEmail_shouldReturnUser() {
        userRepository.save(createBusinessOwner("findme", "findme@test.com"));

        Optional<User> found = userRepository.findByEmail("findme@test.com");

        assertThat(found).isPresent();
        assertThat(found.get().getUsername()).isEqualTo("findme");
    }

    @Test
    @DisplayName("DB-022: Find user by email returns empty for non-existent")
    void findByEmail_shouldReturnEmptyForNonExistent() {
        Optional<User> found = userRepository.findByEmail("nobody@test.com");
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("DB-023: Find user by username")
    void findByUsername_shouldReturnUser() {
        userRepository.save(createBusinessOwner("uniqueuser", "unique@test.com"));

        Optional<User> found = userRepository.findByUsername("uniqueuser");

        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("unique@test.com");
    }

    @Test
    @DisplayName("DB-024: Find user by username returns empty for non-existent")
    void findByUsername_shouldReturnEmptyForNonExistent() {
        Optional<User> found = userRepository.findByUsername("ghost");
        assertThat(found).isEmpty();
    }

    // ── EXISTS CHECKS ─────────────────────────────────────────────────

    @Test
    @DisplayName("DB-025: existsByEmail returns true for existing email")
    void existsByEmail_shouldReturnTrueWhenExists() {
        userRepository.save(createBusinessOwner("exists_user", "exists@test.com"));

        assertThat(userRepository.existsByEmail("exists@test.com")).isTrue();
    }

    @Test
    @DisplayName("DB-026: existsByEmail returns false for non-existing email")
    void existsByEmail_shouldReturnFalseWhenNotExists() {
        assertThat(userRepository.existsByEmail("nope@test.com")).isFalse();
    }

    @Test
    @DisplayName("DB-027: existsByUsername returns true for existing username")
    void existsByUsername_shouldReturnTrueWhenExists() {
        userRepository.save(createBusinessOwner("taken_username", "taken@test.com"));

        assertThat(userRepository.existsByUsername("taken_username")).isTrue();
    }

    @Test
    @DisplayName("DB-028: existsByUsername returns false for non-existing username")
    void existsByUsername_shouldReturnFalseWhenNotExists() {
        assertThat(userRepository.existsByUsername("available_name")).isFalse();
    }

    // ── UPDATE ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("DB-029: Update user phone number")
    void updateUser_shouldPersistPhoneChange() {
        User saved = userRepository.save(createBusinessOwner("update_user", "update@test.com"));

        saved.setPhone("+20987654321");
        userRepository.save(saved);

        User updated = userRepository.findById(saved.getId()).orElseThrow();
        assertThat(updated.getPhone()).isEqualTo("+20987654321");
    }

    @Test
    @DisplayName("DB-030: Update user company name")
    void updateUser_shouldPersistCompanyNameChange() {
        User saved = userRepository.save(createBusinessOwner("company_user", "company@test.com"));

        saved.setCompanyName("New Company Name");
        userRepository.save(saved);

        User updated = userRepository.findById(saved.getId()).orElseThrow();
        assertThat(updated.getCompanyName()).isEqualTo("New Company Name");
    }

    // ── DELETE ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("DB-031: Delete user by ID")
    void deleteById_shouldRemoveUser() {
        User saved = userRepository.save(createBusinessOwner("delete_me", "delete@test.com"));
        Long id = saved.getId();

        userRepository.deleteById(id);

        assertThat(userRepository.findById(id)).isEmpty();
        assertThat(userRepository.existsByEmail("delete@test.com")).isFalse();
    }

    // ── SINGLE TABLE INHERITANCE ──────────────────────────────────────

    @Test
    @DisplayName("DB-032: Both Admin and BusinessOwner stored in same table")
    void singleTableInheritance_shouldStoreAllSubtypesInOneTable() {
        userRepository.save(createBusinessOwner("bo_user", "bo@test.com"));
        userRepository.save(createAdmin("admin_user", "admin@test.com"));

        assertThat(userRepository.count()).isEqualTo(2);

        // findAll returns both subtypes
        assertThat(userRepository.findAll()).hasSize(2);
    }

    @Test
    @DisplayName("DB-033: BusinessOwner role is BUSINESS_OWNER via discriminator")
    void businessOwner_shouldHaveCorrectRole() {
        User saved = userRepository.save(createBusinessOwner("role_bo", "role_bo@test.com"));

        User found = userRepository.findById(saved.getId()).orElseThrow();
        assertThat(found.getRole()).isEqualTo("BUSINESS_OWNER");
        assertThat(found).isInstanceOf(BusinessOwner.class);
    }

    // ── TIMESTAMP AUTO-GENERATION ─────────────────────────────────────

    @Test
    @DisplayName("DB-034: CreatedAt timestamp is auto-generated on save")
    void save_shouldAutoGenerateCreatedAt() {
        User saved = userRepository.save(createBusinessOwner("ts_user", "ts@test.com"));

        assertThat(saved.getCreatedAt()).isNotNull();
    }

    // ── UNIQUE CONSTRAINT BEHAVIOR ────────────────────────────────────

    @Test
    @DisplayName("DB-035: Cannot save two users with same email")
    void save_shouldRejectDuplicateEmail() {
        userRepository.save(createBusinessOwner("user1", "same@test.com"));

        org.junit.jupiter.api.Assertions.assertThrows(
            org.springframework.dao.DataIntegrityViolationException.class,
            () -> {
                userRepository.save(createBusinessOwner("user2", "same@test.com"));
                userRepository.flush(); // force the constraint check
            }
        );
    }

    @Test
    @DisplayName("DB-036: Cannot save two users with same username")
    void save_shouldRejectDuplicateUsername() {
        userRepository.save(createBusinessOwner("sameuser", "email1@test.com"));

        org.junit.jupiter.api.Assertions.assertThrows(
            org.springframework.dao.DataIntegrityViolationException.class,
            () -> {
                userRepository.save(createBusinessOwner("sameuser", "email2@test.com"));
                userRepository.flush();
            }
        );
    }
}
