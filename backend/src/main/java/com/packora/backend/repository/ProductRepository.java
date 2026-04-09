package com.packora.backend.repository;

import com.packora.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategory(String category);

    List<Product> findByInStockTrue();

    List<Product> findByCategoryAndInStockTrue(String category);

    List<Product> findByNameContainingIgnoreCase(String keyword);
}
