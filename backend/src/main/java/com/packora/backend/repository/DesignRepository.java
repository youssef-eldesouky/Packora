package com.packora.backend.repository;

import com.packora.backend.model.Design;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DesignRepository extends JpaRepository<Design, Long> {

    List<Design> findByPartnerId(Long partnerId);
}
