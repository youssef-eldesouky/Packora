package com.packora.backend.repository;

import com.packora.backend.model.Packaging;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PackagingRepository extends JpaRepository<Packaging, Long> {

    List<Packaging> findByType(String type);

    List<Packaging> findByPartnerId(Long partnerId);

    List<Packaging> findByDesignId(Long designId);
}
