import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Search,
  Filter,
  Star,
  Loader2,
  Archive,
  Calculator,
} from 'lucide-react';
import { productApi, packagingApi } from '../../utils/api';
import Navbar from '../Navbar/Navbar';
import './Catalog.css';
import Footer from '../Footer/Footer';

const CATEGORIES = ['All', 'Boxes', 'Mailers', 'Protective', 'Eco-Friendly', 'Tape & Labels'];
const PKG_TYPES = ['All', 'Box', 'Mailer', 'Pouch', 'Paper Bag', 'Tube', 'Tray'];

export default function Catalog() {
  const [tab, setTab] = useState('products'); // 'products' | 'packagings'

  // ── Products state ──────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [prodLoading, setProdLoading] = useState(true);
  const [prodError, setProdError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    let cancelled = false;
    setProdLoading(true);
    setProdError(null);

    productApi
      .getAll()
      .then((data) => { if (!cancelled) setProducts(data); })
      .catch((err) => { if (!cancelled) setProdError(err.message || 'Failed to load products'); })
      .finally(() => { if (!cancelled) setProdLoading(false); });

    return () => { cancelled = true; };
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        searchQuery === '' ||
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory]);

  // ── Packagings state ────────────────────────────────────────
  const [packagings, setPackagings] = useState([]);
  const [pkgLoading, setPkgLoading] = useState(false);
  const [pkgError, setPkgError] = useState(null);
  const [pkgType, setPkgType] = useState('All');
  const [pkgSearch, setPkgSearch] = useState('');

  useEffect(() => {
    if (tab !== 'packagings') return;
    let cancelled = false;
    setPkgLoading(true);
    setPkgError(null);

    const fetch =
      pkgType === 'All'
        ? packagingApi.getAll()
        : packagingApi.getByType(pkgType);

    fetch
      .then((data) => { if (!cancelled) setPackagings(data); })
      .catch((err) => { if (!cancelled) setPkgError(err.message || 'Failed to load packagings'); })
      .finally(() => { if (!cancelled) setPkgLoading(false); });

    return () => { cancelled = true; };
  }, [tab, pkgType]);

  const filteredPackagings = useMemo(() => {
    const term = pkgSearch.trim().toLowerCase();
    if (!term) return packagings;
    return packagings.filter(
      (p) =>
        (p.type || '').toLowerCase().includes(term) ||
        (p.material || '').toLowerCase().includes(term) ||
        (p.color || '').toLowerCase().includes(term) ||
        (p.size || '').toLowerCase().includes(term)
    );
  }, [packagings, pkgSearch]);

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

        {/* ── Tab toggle ── */}
        <div className="catalog-tab-toggle">
          <button
            type="button"
            className={`catalog-tab-btn ${tab === 'products' ? 'active' : ''}`}
            onClick={() => setTab('products')}
          >
            <Box size={16} /> Products
          </button>
          <button
            type="button"
            className={`catalog-tab-btn ${tab === 'packagings' ? 'active' : ''}`}
            onClick={() => setTab('packagings')}
          >
            <Archive size={16} /> Packaging Configs
          </button>
        </div>

        {/* ═══════════════ PRODUCTS TAB ═══════════════ */}
        {tab === 'products' && (
          <>
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

            {prodLoading && (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <Loader2 size={32} className="profile-spinner" />
                <p>Loading products…</p>
              </div>
            )}

            {prodError && (
              <p style={{ textAlign: 'center', color: 'var(--destructive, #ef4444)', padding: '2rem' }}>
                {prodError}
              </p>
            )}

            {!prodLoading && !prodError && (
              <>
                <div className="catalog-grid">
                  {filteredProducts.map((product) => (
                    <article key={product.id} className="catalog-product-card">
                      <Link to={`/Catalog/${product.id}`} className="catalog-card-link">
                        <div className="catalog-card-image-wrap">
                          <img src={product.image} alt={product.name} />
                          <span className={`catalog-badge ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                          <span className="catalog-badge rating">
                            <Star size={12} fill="currentColor" />
                            {product.rating ?? 4.8}
                          </span>
                        </div>
                        <div className="catalog-card-body">
                          <h3 className="catalog-card-title">{product.name}</h3>
                          <p className="catalog-card-desc">{product.description}</p>
                          <p className="catalog-card-price">
                            Starting at EGP{product.price.toFixed(2)}
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
              </>
            )}
          </>
        )}

        {/* ═══════════════ PACKAGINGS TAB ═══════════════ */}
        {tab === 'packagings' && (
          <>
            {/* Type filter */}
            <div className="catalog-filters">
              <Filter size={18} className="catalog-filter-icon" />
              <div className="catalog-filter-buttons">
                {PKG_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`catalog-filter-btn ${pkgType === t ? 'active' : ''}`}
                    onClick={() => setPkgType(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="catalog-search-wrap">
              <div className="catalog-search-bar">
                <Search size={20} className="catalog-search-icon" />
                <input
                  type="text"
                  placeholder="Search by type, material, color, size…"
                  value={pkgSearch}
                  onChange={(e) => setPkgSearch(e.target.value)}
                  className="catalog-search-input"
                />
              </div>
            </div>

            {pkgLoading && (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <Loader2 size={32} className="profile-spinner" />
                <p>Loading packaging configurations…</p>
              </div>
            )}

            {pkgError && (
              <p style={{ textAlign: 'center', color: 'var(--destructive, #ef4444)', padding: '2rem' }}>
                {pkgError}
              </p>
            )}

            {!pkgLoading && !pkgError && (
              <>
                <div className="catalog-grid">
                  {filteredPackagings.map((pkg) => (
                    <article key={pkg.id} className="catalog-product-card catalog-pkg-card">
                      <div className="catalog-card-body" style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                          <Archive size={18} style={{ color: 'var(--primary)' }} />
                          <span className="catalog-badge in-stock" style={{ position: 'static' }}>
                            {pkg.type}
                          </span>
                        </div>
                        <h3 className="catalog-card-title">
                          {pkg.material ? `${pkg.material} ${pkg.type}` : pkg.type}
                        </h3>
                        {pkg.size && (
                          <p className="catalog-card-desc" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            📐 {pkg.size}
                          </p>
                        )}
                        {pkg.color && (
                          <p className="catalog-card-desc">🎨 {pkg.color}</p>
                        )}
                        <p className="catalog-card-price">
                          EGP {pkg.price.toFixed(2)} / unit
                        </p>
                        <Link
                          to={`/Packaging/quote?type=${encodeURIComponent(pkg.type)}&material=${encodeURIComponent(pkg.material || '')}`}
                          className="catalog-view-btn"
                          style={{ marginTop: '0.5rem', display: 'inline-flex' }}
                        >
                          <Calculator size={15} />
                          Get a Quote
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>

                {filteredPackagings.length === 0 && (
                  <p className="catalog-empty">No packaging configurations found.</p>
                )}
              </>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
