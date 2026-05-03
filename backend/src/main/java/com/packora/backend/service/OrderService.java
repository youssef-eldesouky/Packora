package com.packora.backend.service;

import com.packora.backend.dto.order.OrderResponse;
import com.packora.backend.dto.order.OrderStatusUpdateRequest;
import com.packora.backend.dto.order.PlaceOrderRequest;
import com.packora.backend.model.enums.OrderStatus;

import java.util.List;

/**
 * Order domain service interface.
 *
 * Covers the full order lifecycle:
 *   place → view → update status → cancel
 */
public interface OrderService {

    /**
     * Places a new order for a user.
     */
    OrderResponse placeOrder(PlaceOrderRequest request, Long userId);

    /**
     * Retrieve a single order by its primary key.
     * Throws {@link com.packora.backend.exception.ResourceNotFoundException} if missing.
     */
    OrderResponse getOrderById(Long orderId);

    /**
     * Fetch all orders belonging to a specific user,
     * sorted by most recent first.
     */
    List<OrderResponse> getOrdersByUser(Long userId);

    /**
     * Fetch all orders in the system (Admin use-case).
     * Returns newest first.
     */
    List<OrderResponse> getAllOrders();

    /**
     * Update the status of an order (Admin only).
     * Enforces transition rules — cancelled and delivered orders
     * cannot be moved to a prior status.
     */
    OrderResponse updateOrderStatus(Long orderId, OrderStatus status);

    /**
     * Cancel an order.
     * Only orders in PENDING or PROCESSING state can be cancelled.
     */
    OrderResponse cancelOrder(Long orderId);
}
