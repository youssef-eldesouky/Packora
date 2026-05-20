package com.packora.backend.repository;

import com.packora.backend.model.SavedAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedAddressRepository extends JpaRepository<SavedAddress, Long> {
    List<SavedAddress> findByUserId(Long userId);
    Optional<SavedAddress> findByIdAndUserId(Long id, Long userId);
}
