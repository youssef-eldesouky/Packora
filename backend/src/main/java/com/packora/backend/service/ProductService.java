package com.packora.backend.service;

import com.packora.backend.dto.product.ProductRequest;
import com.packora.backend.dto.product.ProductResponse;

import java.util.List;

/**
 * Service interface for Product CRUD and catalog queries.
 */
public interface ProductService {

    List<ProductResponse> getAllProducts();

    ProductResponse getProductById(Long id);

    ProductResponse createProduct(ProductRequest request);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);

    List<ProductResponse> getProductsByCategory(String category);

    List<ProductResponse> getInStockProducts();

    List<ProductResponse> searchProducts(String keyword);
}
