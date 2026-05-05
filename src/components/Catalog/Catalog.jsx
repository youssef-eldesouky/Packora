import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Search,
  Filter,
  Star,
} from 'lucide-react';
import products from '../../mockdata/product.json';
import Navbar from '../Navbar/Navbar';
import './Catalog.css';
import Footer from '../Footer/Footer';

const CATEGORIES = ['All', 'Boxes', 'Mailers', 'Protective', 'Eco-Friendly', 'Tape & Labels'];

export default function Catalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="catalog-page">
      <Navbar />

      <main className="catalog-main">
        <div className="catalog-hero">
          <h1 className="catalog-title">Packaging Catalog</h1>
          <p className="catalog-subtitle">
            Browse our complete selection of packaging and shipping supplies
          </p>
        </div>

        <div className="catalog-search-wrap">
          <div className="catalog-search-bar">
            <Search size={20} className="catalog-search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="catalog-search-input"
            />
          </div>
        </div>

        <div className="catalog-filters">
          <Filter size={18} className="catalog-filter-icon" />
          <div className="catalog-filter-buttons">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`catalog-filter-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="catalog-grid">
          {filteredProducts.map((product) => (
            <article key={product.id} className="catalog-product-card">
              <Link to={`/Catalog/${product.id}`} className="catalog-card-link">
                <div className="catalog-card-image-wrap">
                  <img src={product.image} alt={product.name} />
                  <span className="catalog-badge in-stock">In Stock</span>
                  <span className="catalog-badge rating">
                    <Star size={12} fill="currentColor" />
                    {product.rating ?? 4.8}
                  </span>
                </div>
                <div className="catalog-card-body">
                  <h3 className="catalog-card-title">{product.name}</h3>
                  <p className="catalog-card-desc">{product.description}</p>
                  <p className="catalog-card-price">
                    Starting at ${product.price.toFixed(2)}
                  </p>
                  <p className="catalog-card-min">
                    Min. order: {product.minOrder} units
                  </p>
                  <span className="catalog-view-btn">
                    <Box size={16} />
                    View Details
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <p className="catalog-empty">No products match your filters.</p>
        )}
      </main>
      <Footer/>
    </div>
  );
}
