import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  LayoutGrid,
  Truck,
  ShoppingCart,
  HelpCircle,
  User,
  LogOut,
  Share2,
  Box,
  Search,
  Filter,
  Star,
} from 'lucide-react';
import products from '../../mockdata/product.json';
import './Catalog.css';

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
      <header className="catalog-header">
        <Link to="/HomePage" className="catalog-logo">
          <div className="catalog-logo-icon">
            <Package size={24} color="white" />
          </div>
          <span>Packora</span>
        </Link>

        <nav className="catalog-nav">
          <Link to="/HomePage" className="catalog-nav-item">
            <LayoutGrid size={18} />
            Dashboard
          </Link>
          <Link to="/Catalog" className="catalog-nav-item active">
            <Box size={18} />
            Catalog
          </Link>
          <Link to="/Track" className="catalog-nav-item">
            <Truck size={18} />
            Track
          </Link>
          <Link to="/Cart" className="catalog-nav-item">
            <ShoppingCart size={18} />
            Cart
          </Link>
          <Link to="/Support" className="catalog-nav-item">
            <HelpCircle size={18} />
            Support
          </Link>
          <Link to="/Profile" className="catalog-nav-item">
            <User size={18} />
            Profile
          </Link>
          <Link to="/" className="catalog-nav-item">
            <LogOut size={18} />
            Logout
          </Link>
        </nav>

        <button type="button" className="catalog-share-btn">
          <Share2 size={18} />
          Share
        </button>
      </header>

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
    </div>
  );
}
