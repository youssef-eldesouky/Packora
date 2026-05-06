package com.packora.backend.repository;

import com.packora.backend.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import com.packora.backend.dto.admin.TopProductResponse;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    @Query("SELECT new com.packora.backend.dto.admin.TopProductResponse(p.name, SUM(oi.quantity), SUM(oi.quantity * oi.unitPrice)) " +
           "FROM OrderItem oi JOIN oi.product p GROUP BY p.id, p.name ORDER BY SUM(oi.quantity) DESC")
    List<TopProductResponse> findTopProducts(Pageable pageable);
}
