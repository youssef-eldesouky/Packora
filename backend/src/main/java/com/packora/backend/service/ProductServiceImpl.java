package com.packora.backend.service;

import com.packora.backend.dto.product.ProductRequest;
import com.packora.backend.dto.product.ProductResponse;
import com.packora.backend.exception.ResourceNotFoundException;
import com.packora.backend.model.Product;
import com.packora.backend.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of ProductService — full CRUD and catalog queries.
 */
@Service
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductServiceImpl.class);

    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  CRUD
    // ═══════════════════════════════════════════════════════════════════════════

    @Override
    public List<ProductResponse> getAllProducts() {
        log.info("[ProductService] Fetching all products");
        return productRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProductResponse getProductById(Long id) {
        log.info("[ProductService] Fetching product id={}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        return toResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        log.info("[ProductService] Creating product name={}", request.getName());
        Product product = new Product();
        applyRequest(product, request);
        Product saved = productRepository.save(product);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        log.info("[ProductService] Updating product id={}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        applyRequest(product, request);
        Product saved = productRepository.save(product);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        log.info("[ProductService] Deleting product id={}", id);
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product", id);
        }
        productRepository.deleteById(id);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  Catalog Queries
    // ═══════════════════════════════════════════════════════════════════════════

    @Override
    public List<ProductResponse> getProductsByCategory(String category) {
        log.info("[ProductService] Fetching products by category={}", category);
        return productRepository.findByCategory(category).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponse> getInStockProducts() {
        log.info("[ProductService] Fetching in-stock products");
        return productRepository.findByInStockTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponse> searchProducts(String keyword) {
        log.info("[ProductService] Searching products keyword={}", keyword);
        return productRepository.findByNameContainingIgnoreCase(keyword).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  Helpers
    // ═══════════════════════════════════════════════════════════════════════════

    private void applyRequest(Product product, ProductRequest request) {
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(request.getCategory());
        product.setMinOrder(request.getMinOrder());
        product.setInStock(request.getInStock() != null ? request.getInStock() : true);
        product.setSizes(request.getSizes() != null ? request.getSizes() : new ArrayList<>());
        product.setMaterials(request.getMaterials() != null ? request.getMaterials() : new ArrayList<>());
    }

    private ProductResponse toResponse(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .imageUrl(p.getImageUrl())
                .category(p.getCategory())
                .minOrder(p.getMinOrder())
                .inStock(p.getInStock())
                .sizes(p.getSizes())
                .materials(p.getMaterials())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
