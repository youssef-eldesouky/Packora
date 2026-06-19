package com.packora.backend.repository;

import com.packora.backend.model.BusinessOwner;
import com.packora.backend.model.Order;
import com.packora.backend.model.enums.OrderStatus;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Database tests for OrderRepository using H2 in-memory database.
 * Tests CRUD, status queries, user-order relations, and aggregate queries.
 */
@DataJpaTest
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class OrderRepositoryTest {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private TestEntityManager entityManager;

    private BusinessOwner testUser;

    private BusinessOwner createUser(String username, String email) {
        BusinessOwner bo = new BusinessOwner();
        bo.setUsername(username);
        bo.setEmail(email);
        bo.setPassword("encoded_pass");
        return bo;
    }

    private Order createOrder(BusinessOwner user, Double amount, OrderStatus status) {
        Order order = new Order();
        order.setUser(user);
        order.setTotalAmount(amount);
        order.setStatus(status);
        order.setShippingAddress("123 Test Street, Cairo");
        return order;
    }

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        testUser = entityManager.persistAndFlush(createUser("orderuser", "orderuser@test.com"));
    }

    // ── CREATE ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("DB-037: Save a new order and verify persistence")
    void saveOrder_shouldPersistWithAllFields() {
        Order order = createOrder(testUser, 150.00, OrderStatus.PENDING);
        Order saved = orderRepository.save(order);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getTotalAmount()).isEqualTo(150.00);
        assertThat(saved.getStatus()).isEqualTo(OrderStatus.PENDING);
        assertThat(saved.getShippingAddress()).isEqualTo("123 Test Street, Cairo");
    }

    @Test
    @DisplayName("DB-038: Order defaults to PENDING status")
    void saveOrder_shouldDefaultToPending() {
        Order order = new Order();
        order.setUser(testUser);
        order.setTotalAmount(100.00);
        Order saved = orderRepository.save(order);

        assertThat(saved.getStatus()).isEqualTo(OrderStatus.PENDING);
    }

    // ── READ / FIND ───────────────────────────────────────────────────

    @Test
    @DisplayName("DB-039: Find order by ID")
    void findById_shouldReturnOrder() {
        Order saved = orderRepository.save(createOrder(testUser, 200.00, OrderStatus.PROCESSING));

        Optional<Order> found = orderRepository.findById(saved.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getTotalAmount()).isEqualTo(200.00);
    }

    @Test
    @DisplayName("DB-040: Find orders by user ID")
    void findByUserId_shouldReturnUserOrders() {
        orderRepository.save(createOrder(testUser, 100.00, OrderStatus.PENDING));
        orderRepository.save(createOrder(testUser, 200.00, OrderStatus.SHIPPED));

        BusinessOwner otherUser = entityManager.persistAndFlush(createUser("other", "other@test.com"));
        orderRepository.save(createOrder(otherUser, 300.00, OrderStatus.PENDING));

        List<Order> userOrders = orderRepository.findByUserId(testUser.getId());

        assertThat(userOrders).hasSize(2);
        assertThat(userOrders).allMatch(o -> o.getUser().getId().equals(testUser.getId()));
    }

    @Test
    @DisplayName("DB-041: Find orders by status")
    void findByStatus_shouldReturnMatchingOrders() {
        orderRepository.save(createOrder(testUser, 100.00, OrderStatus.PENDING));
        orderRepository.save(createOrder(testUser, 200.00, OrderStatus.PENDING));
        orderRepository.save(createOrder(testUser, 300.00, OrderStatus.SHIPPED));

        List<Order> pending = orderRepository.findByStatus(OrderStatus.PENDING);

        assertThat(pending).hasSize(2);
        assertThat(pending).allMatch(o -> o.getStatus() == OrderStatus.PENDING);
    }

    @Test
    @DisplayName("DB-042: Find user orders ordered by date descending")
    void findByUserIdOrderByOrderDateDesc_shouldReturnSorted() {
        orderRepository.save(createOrder(testUser, 100.00, OrderStatus.PENDING));
        orderRepository.save(createOrder(testUser, 200.00, OrderStatus.PROCESSING));
        orderRepository.save(createOrder(testUser, 300.00, OrderStatus.SHIPPED));

        List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(testUser.getId());

        assertThat(orders).hasSize(3);
        // Most recent first
        assertThat(orders.get(0).getOrderDate())
            .isAfterOrEqualTo(orders.get(1).getOrderDate());
    }

    @Test
    @DisplayName("DB-043: Find top 5 recent orders")
    void findTop5ByOrderByOrderDateDesc_shouldReturnMaxFive() {
        for (int i = 0; i < 7; i++) {
            orderRepository.save(createOrder(testUser, (double)(i * 100), OrderStatus.PENDING));
        }

        List<Order> top5 = orderRepository.findTop5ByOrderByOrderDateDesc();

        assertThat(top5).hasSizeLessThanOrEqualTo(5);
    }

    // ── BULK GROUP ────────────────────────────────────────────────────

    @Test
    @DisplayName("DB-044: Find orders by bulk group ID")
    void findByBulkGroupId_shouldReturnGroupedOrders() {
        String groupId = "bulk-uuid-123";

        Order o1 = createOrder(testUser, 100.00, OrderStatus.PENDING);
        o1.setBulkGroupId(groupId);
        orderRepository.save(o1);

        Order o2 = createOrder(testUser, 200.00, OrderStatus.PENDING);
        o2.setBulkGroupId(groupId);
        orderRepository.save(o2);

        Order o3 = createOrder(testUser, 300.00, OrderStatus.PENDING);
        o3.setBulkGroupId("other-group");
        orderRepository.save(o3);

        List<Order> bulkOrders = orderRepository.findByBulkGroupId(groupId);

        assertThat(bulkOrders).hasSize(2);
    }

    // ── AGGREGATE QUERIES ─────────────────────────────────────────────

    @Test
    @DisplayName("DB-045: Count all orders")
    void countOrders_shouldReturnCorrectCount() {
        orderRepository.save(createOrder(testUser, 100.00, OrderStatus.PENDING));
        orderRepository.save(createOrder(testUser, 200.00, OrderStatus.SHIPPED));

        long count = orderRepository.countOrders();

        assertThat(count).isEqualTo(2);
    }

    @Test
    @DisplayName("DB-046: Sum revenue excludes cancelled orders")
    void sumRevenue_shouldExcludeCancelled() {
        orderRepository.save(createOrder(testUser, 100.00, OrderStatus.PENDING));
        orderRepository.save(createOrder(testUser, 200.00, OrderStatus.SHIPPED));
        orderRepository.save(createOrder(testUser, 500.00, OrderStatus.CANCELLED));

        Double revenue = orderRepository.sumRevenue();

        assertThat(revenue).isEqualTo(300.00);
    }

    // ── UPDATE ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("DB-047: Update order status to SHIPPED")
    void updateStatus_shouldPersistChange() {
        Order saved = orderRepository.save(createOrder(testUser, 100.00, OrderStatus.PENDING));

        saved.setStatus(OrderStatus.SHIPPED);
        orderRepository.save(saved);

        Order updated = orderRepository.findById(saved.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(OrderStatus.SHIPPED);
    }

    @Test
    @DisplayName("DB-048: Cancel order by updating status")
    void cancelOrder_shouldSetStatusToCancelled() {
        Order saved = orderRepository.save(createOrder(testUser, 100.00, OrderStatus.PROCESSING));

        saved.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(saved);

        Order updated = orderRepository.findById(saved.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(OrderStatus.CANCELLED);
    }

    // ── DELETE ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("DB-049: Delete order by ID")
    void deleteById_shouldRemoveOrder() {
        Order saved = orderRepository.save(createOrder(testUser, 100.00, OrderStatus.PENDING));
        Long id = saved.getId();

        orderRepository.deleteById(id);

        assertThat(orderRepository.findById(id)).isEmpty();
    }

    // ── TIMESTAMP ─────────────────────────────────────────────────────

    @Test
    @DisplayName("DB-050: OrderDate timestamp is auto-generated")
    void save_shouldAutoGenerateOrderDate() {
        Order saved = orderRepository.save(createOrder(testUser, 100.00, OrderStatus.PENDING));

        assertThat(saved.getOrderDate()).isNotNull();
    }
}
