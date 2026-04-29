package com.packora.backend.controller;

import com.packora.backend.dto.order.OrderResponse;
import com.packora.backend.dto.order.OrderStatusUpdateRequest;
import com.packora.backend.dto.order.PlaceOrderRequest;

import com.packora.backend.service.OrderService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * OrderController — REST API for the full order lifecycle.
 *
 * ┌─────────────────────────────────────────────────────────┬───────────────────────────────┐
 * │ Endpoint                                                │ Purpose                       │
 * ├─────────────────────────────────────────────────────────┼───────────────────────────────┤
 * │ POST   /api/orders                                      │ Place a new order (checkout)  │
 * │ GET    /api/orders/me?userId={id}                       │ Get orders for current user   │
 * │ GET    /api/orders                                      │ Get all orders (Admin)        │
 * │ GET    /api/orders/{id}                                 │ Get single order by ID        │
 * │ PUT    /api/orders/{id}/status                          │ Update order status (Admin)   │
 * │ PUT    /api/orders/{id}/cancel                          │ Cancel an order               │
 * └─────────────────────────────────────────────────────────┴───────────────────────────────┘
 *
 * NOTE on authentication:
 * At this stage of the project, authentication via JWT has not been implemented.
 * The /me endpoint uses a ?userId= query param as a temporary stand-in.
 * Once Spring Security + JWT is wired up:
 *   1. Remove the userId query param from GET /me
 *   2. Extract principal from SecurityContextHolder in the service
 *   3. Add @PreAuthorize("hasRole('ADMIN')") to admin-only endpoints
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // ── POST /api/orders ───────────────────────────────────────────────────────

    /**
     * Place a new order.
     *
     * Called by the frontend ReviewOrder component when the user clicks
     * "Place Order". Returns 201 Created with the full order response.
     *
     * Request body example:
     * {
     *   "userId": 1,
     *   "shippingAddress": "John Smith, Acme Corp, 123 Main St, New York, NY 10001",
     *   "items": [
     *     { "productId": 1, "quantity": 500, "unitPrice": 1.25, "size": "Large", "material": "Double Wall" }
     *   ]
     * }
     */
    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(@Valid @RequestBody PlaceOrderRequest request) {
        log.info("[OrderController] POST /api/orders — userId={}", request.getUserId());
        OrderResponse response = orderService.placeOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── GET /api/orders/me ────────────────────────────────────────────────────

    /**
     * Get all orders for the currently authenticated user.
     *
     * TEMPORARY: uses ?userId= query param until JWT is in place.
     * Results are sorted newest-first.
     *
     * Used by:
     *   - Profile → Order History tab
     *   - Track page (to populate the orders list)
     */
    @GetMapping("/me")
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            // TODO: Replace with: @AuthenticationPrincipal UserDetails principal
            @RequestParam Long userId) {

        log.info("[OrderController] GET /api/orders/me — userId={}", userId);
        return ResponseEntity.ok(orderService.getOrdersByUser(userId));
    }

    // ── GET /api/orders ───────────────────────────────────────────────────────

    /**
     * Get all orders in the system. Admin use-case.
     *
     * Used by:
     *   - Admin Dashboard (recent orders widget)
     *   - Admin Orders management page
     *
     * TODO: Restrict with @PreAuthorize("hasRole('ADMIN')") once auth is wired up.
     */
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        log.info("[OrderController] GET /api/orders — fetching all orders");
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // ── GET /api/orders/{id} ──────────────────────────────────────────────────

    /**
     * Get a single order by its ID.
     * Returns 404 if the order does not exist.
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        log.info("[OrderController] GET /api/orders/{}", id);
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    // ── PUT /api/orders/{id}/status ───────────────────────────────────────────

    /**
     * Update an order's status. Admin use-case.
     *
     * Request body: { "status": "PROCESSING" }
     * Valid values: PENDING | PROCESSING | SHIPPED | DELIVERED | CANCELLED
     *
     * Returns 400 if the transition is not allowed (e.g. un-cancelling an order).
     *
     * TODO: Restrict with @PreAuthorize("hasRole('ADMIN')") once auth is wired up.
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request) {

        log.info("[OrderController] PUT /api/orders/{}/status — newStatus={}",
                id, request.getStatus());
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request.getStatus()));
    }

    // ── PUT /api/orders/{id}/cancel ───────────────────────────────────────────

    /**
     * Cancel an order.
     *
     * Only PENDING or PROCESSING orders can be cancelled. Attempting to cancel
     * a SHIPPED, DELIVERED, or already CANCELLED order will return 400.
     *
     * No request body needed — the action is implied by the endpoint.
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable Long id) {
        log.info("[OrderController] PUT /api/orders/{}/cancel", id);
        return ResponseEntity.ok(orderService.cancelOrder(id));
    }
}
