package com.packora.backend.controller;

import com.packora.backend.dto.product.ProductRequest;
import com.packora.backend.dto.product.ProductResponse;
import com.packora.backend.service.ProductService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ProductController — REST API for the product catalog.
 *
 * ┌──────────────────────────────────────────────────────────┬────────────────────────────────────┐
 * │ Endpoint                                                 │ Purpose                            │
 * ├──────────────────────────────────────────────────────────┼────────────────────────────────────┤
 * │ GET    /api/products                                     │ List all products (catalog)        │
 * │ GET    /api/products/{id}                                │ Get single product by ID           │
 * │ POST   /api/products                                     │ Create a new product (Admin)       │
 * │ PUT    /api/products/{id}                                │ Update a product (Admin)           │
 * │ DELETE /api/products/{id}                                │ Delete a product (Admin)           │
 * │ GET    /api/products/category/{category}                 │ Filter products by category        │
 * │ GET    /api/products/in-stock                            │ List only in-stock products        │
 * │ GET    /api/products/search?keyword=...                  │ Search products by name            │
 * └──────────────────────────────────────────────────────────┴────────────────────────────────────┘
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private static final Logger log = LoggerFactory.getLogger(ProductController.class);

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // ── GET /api/products ──────────────────────────────────────────────────────

    /**
     * List all products in the catalog.
     */
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        log.info("[ProductController] GET /api/products");
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // ── GET /api/products/{id} ─────────────────────────────────────────────────

    /**
     * Get a single product by its ID.
     * Returns 404 if not found.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        log.info("[ProductController] GET /api/products/{}", id);
        return ResponseEntity.ok(productService.getProductById(id));
    }

    // ── POST /api/products ─────────────────────────────────────────────────────

    /**
     * Create a new product.
     *
     * Request body example:
     * {
     *   "name": "Custom Mailer Box",
     *   "description": "Premium corrugated mailer box",
     *   "price": 2.99,
     *   "imageUrl": "https://example.com/box.jpg",
     *   "category": "Mailers",
     *   "minOrder": 100,
     *   "inStock": true,
     *   "sizes": ["Small", "Medium", "Large"],
     *   "materials": ["Corrugated", "Kraft"]
     * }
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductRequest request) {
        log.info("[ProductController] POST /api/products — name={}", request.getName());
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── PUT /api/products/{id} ─────────────────────────────────────────────────

    /**
     * Update an existing product.
     * Returns 404 if the product does not exist.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        log.info("[ProductController] PUT /api/products/{}", id);
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    // ── DELETE /api/products/{id} ──────────────────────────────────────────────

    /**
     * Delete a product.
     * Returns 204 No Content on success, 404 if not found.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        log.info("[ProductController] DELETE /api/products/{}", id);
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // ── GET /api/products/category/{category} ──────────────────────────────────

    /**
     * Filter products by category (e.g. "Boxes", "Mailers", "Bubble Wrap").
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<ProductResponse>> getProductsByCategory(@PathVariable String category) {
        log.info("[ProductController] GET /api/products/category/{}", category);
        return ResponseEntity.ok(productService.getProductsByCategory(category));
    }

    // ── GET /api/products/in-stock ─────────────────────────────────────────────

    /**
     * List only products that are currently in stock.
     */
    @GetMapping("/in-stock")
    public ResponseEntity<List<ProductResponse>> getInStockProducts() {
        log.info("[ProductController] GET /api/products/in-stock");
        return ResponseEntity.ok(productService.getInStockProducts());
    }

    // ── GET /api/products/search?keyword=... ───────────────────────────────────

    /**
     * Search products by name (case-insensitive partial match).
     */
    @GetMapping("/search")
    public ResponseEntity<List<ProductResponse>> searchProducts(@RequestParam String keyword) {
        log.info("[ProductController] GET /api/products/search?keyword={}", keyword);
        return ResponseEntity.ok(productService.searchProducts(keyword));
    }
}
