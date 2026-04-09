package com.packora.backend.repository;

import com.packora.backend.model.Shipment;
import com.packora.backend.model.enums.ShipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    Optional<Shipment> findByTrackingNumber(String trackingNumber);

    Optional<Shipment> findByOrderId(Long orderId);

    List<Shipment> findByShippingPartnerId(Long partnerId);

    List<Shipment> findByStatus(ShipmentStatus status);
}
