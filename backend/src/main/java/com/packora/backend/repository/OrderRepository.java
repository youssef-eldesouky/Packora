package com.packora.backend.repository;

import com.packora.backend.model.Order;
import com.packora.backend.model.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long userId);

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    List<Order> findTop5ByOrderByOrderDateDesc();

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status != 'CANCELLED'")
    Double sumRevenue();

    @Query("SELECT COUNT(o) FROM Order o")
    long countOrders();
}
