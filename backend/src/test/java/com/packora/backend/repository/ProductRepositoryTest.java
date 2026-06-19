package com.packora.backend.repository;

import com.packora.backend.model.Product;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Database tests for ProductRepository using H2 in-memory database.
 * Tests CRUD operations, custom query methods, and data integrity.
 */
@DataJpaTest
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    private Product createProduct(String name, String category, Double price, boolean inStock) {
        Product p = new Product();
        p.setName(name);
        p.setCategory(category);
        p.setPrice(price);
        p.setInStock(inStock);
        p.setStock(inStock ? 100 : 0);
        p.setMinOrder(1);
        p.setDescription("Test product: " + name);
        p.setSizes(List.of("Small", "Medium", "Large"));
        p.setMaterials(List.of("Cardboard", "Kraft"));
        return p;
    }

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();
    }

    // ── CREATE ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("DB-001: Save a new product and verify it's persisted")
    void saveProduct_shouldPersistAndGenerateId() {
        Product product = createProduct("Premium Mailer Box", "Mailers", 25.99, true);
        Product saved = productRepository.save(product);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getName()).isEqualTo("Premium Mailer Box");
        assertThat(saved.getCategory()).isEqualTo("Mailers");
        assertThat(saved.getPrice()).isEqualTo(25.99);
        assertThat(saved.getInStock()).isTrue();
    }

    @Test
    @DisplayName("DB-002: Save product with sizes and materials (ElementCollection)")
    void saveProduct_shouldPersistSizesAndMaterials() {
        Product product = createProduct("Custom Box", "Boxes", 15.00, true);
        Product saved = productRepository.save(product);

        Product found = productRepository.findById(saved.getId()).orElseThrow();
        assertThat(found.getSizes()).containsExactly("Small", "Medium", "Large");
        assertThat(found.getMaterials()).containsExactly("Cardboard", "Kraft");
    }

    // ── READ ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("DB-003: Find product by ID")
    void findById_shouldReturnProduct() {
        Product saved = productRepository.save(createProduct("Bubble Mailer", "Mailers", 12.50, true));

        Optional<Product> found = productRepository.findById(saved.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Bubble Mailer");
    }

    @Test
    @DisplayName("DB-004: Find product by ID returns empty for non-existent ID")
    void findById_shouldReturnEmptyForNonExistent() {
        Optional<Product> found = productRepository.findById(999L);
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("DB-005: Find product by exact name")
    void findByName_shouldReturnMatchingProduct() {
        productRepository.save(createProduct("Eco Kraft Box", "Boxes", 18.00, true));

        Optional<Product> found = productRepository.findByName("Eco Kraft Box");

        assertThat(found).isPresent();
        assertThat(found.get().getPrice()).isEqualTo(18.00);
    }

    @Test
    @DisplayName("DB-006: Find products by category")
    void findByCategory_shouldReturnAllInCategory() {
        productRepository.save(createProduct("Small Mailer", "Mailers", 10.00, true));
        productRepository.save(createProduct("Large Mailer", "Mailers", 20.00, true));
        productRepository.save(createProduct("Gift Box", "Boxes", 30.00, true));

        List<Product> mailers = productRepository.findByCategory("Mailers");

        assertThat(mailers).hasSize(2);
        assertThat(mailers).allMatch(p -> p.getCategory().equals("Mailers"));
    }

    @Test
    @DisplayName("DB-007: Find products by category returns empty for unknown category")
    void findByCategory_shouldReturnEmptyForUnknown() {
        productRepository.save(createProduct("Test Product", "Boxes", 10.00, true));

        List<Product> found = productRepository.findByCategory("NonExistent");

        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("DB-008: Find only in-stock products")
    void findByInStockTrue_shouldReturnOnlyInStockProducts() {
        productRepository.save(createProduct("In Stock Item", "Boxes", 10.00, true));
        productRepository.save(createProduct("Out of Stock Item", "Boxes", 15.00, false));

        List<Product> inStock = productRepository.findByInStockTrue();

        assertThat(inStock).hasSize(1);
        assertThat(inStock.get(0).getName()).isEqualTo("In Stock Item");
    }

    @Test
    @DisplayName("DB-009: Find in-stock products by category")
    void findByCategoryAndInStockTrue_shouldFilterByCategoryAndStock() {
        productRepository.save(createProduct("Active Mailer", "Mailers", 10.00, true));
        productRepository.save(createProduct("Sold Out Mailer", "Mailers", 12.00, false));
        productRepository.save(createProduct("Active Box", "Boxes", 20.00, true));

        List<Product> result = productRepository.findByCategoryAndInStockTrue("Mailers");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Active Mailer");
    }

    @Test
    @DisplayName("DB-010: Search products by name keyword (case-insensitive)")
    void findByNameContainingIgnoreCase_shouldSearchCaseInsensitive() {
        productRepository.save(createProduct("Premium Gift Box", "Boxes", 30.00, true));
        productRepository.save(createProduct("Budget Box", "Boxes", 10.00, true));
        productRepository.save(createProduct("Mailer Envelope", "Mailers", 5.00, true));

        List<Product> result = productRepository.findByNameContainingIgnoreCase("box");

        assertThat(result).hasSize(2);
        assertThat(result).extracting(Product::getName)
            .containsExactlyInAnyOrder("Premium Gift Box", "Budget Box");
    }

    @Test
    @DisplayName("DB-011: Search with no matching keyword returns empty list")
    void findByNameContainingIgnoreCase_shouldReturnEmptyForNoMatch() {
        productRepository.save(createProduct("Mailer", "Mailers", 5.00, true));

        List<Product> result = productRepository.findByNameContainingIgnoreCase("xyz");

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("DB-012: Find all products")
    void findAll_shouldReturnAllProducts() {
        productRepository.save(createProduct("Product A", "Boxes", 10.00, true));
        productRepository.save(createProduct("Product B", "Mailers", 20.00, true));
        productRepository.save(createProduct("Product C", "Wrapping", 30.00, false));

        List<Product> all = productRepository.findAll();

        assertThat(all).hasSize(3);
    }

    // ── UPDATE ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("DB-013: Update product price")
    void updateProduct_shouldPersistPriceChange() {
        Product saved = productRepository.save(createProduct("Updatable Box", "Boxes", 10.00, true));

        saved.setPrice(19.99);
        productRepository.save(saved);

        Product updated = productRepository.findById(saved.getId()).orElseThrow();
        assertThat(updated.getPrice()).isEqualTo(19.99);
    }

    @Test
    @DisplayName("DB-014: Update product stock status")
    void updateProduct_shouldPersistStockChange() {
        Product saved = productRepository.save(createProduct("Stock Test", "Boxes", 10.00, true));

        saved.setInStock(false);
        saved.setStock(0);
        productRepository.save(saved);

        Product updated = productRepository.findById(saved.getId()).orElseThrow();
        assertThat(updated.getInStock()).isFalse();
        assertThat(updated.getStock()).isEqualTo(0);
    }

    // ── DELETE ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("DB-015: Delete product by ID")
    void deleteById_shouldRemoveProduct() {
        Product saved = productRepository.save(createProduct("Delete Me", "Boxes", 5.00, true));
        Long id = saved.getId();

        productRepository.deleteById(id);

        assertThat(productRepository.findById(id)).isEmpty();
    }

    @Test
    @DisplayName("DB-016: Delete all products")
    void deleteAll_shouldClearTable() {
        productRepository.save(createProduct("A", "Boxes", 1.00, true));
        productRepository.save(createProduct("B", "Boxes", 2.00, true));

        productRepository.deleteAll();

        assertThat(productRepository.count()).isZero();
    }

    // ── DATA INTEGRITY ────────────────────────────────────────────────

    @Test
    @DisplayName("DB-017: Product count returns correct number")
    void count_shouldReturnCorrectCount() {
        assertThat(productRepository.count()).isZero();

        productRepository.save(createProduct("P1", "Boxes", 1.00, true));
        productRepository.save(createProduct("P2", "Boxes", 2.00, true));

        assertThat(productRepository.count()).isEqualTo(2);
    }

    @Test
    @DisplayName("DB-018: CreatedAt timestamp is auto-generated")
    void save_shouldAutoGenerateCreatedAt() {
        Product saved = productRepository.save(createProduct("Timestamped", "Boxes", 10.00, true));

        assertThat(saved.getCreatedAt()).isNotNull();
    }
}
