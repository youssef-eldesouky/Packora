import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Check,
  Truck as TruckIcon,
  Shield,
  Leaf,
  Loader2,
  XCircle,
  Ruler,
  Upload,
  Palette,
  X,
  ShoppingBag,
  Eye,
} from 'lucide-react';
import { productApi } from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../Navbar/Navbar';
import './Singlecard.css';
import Footer from '../Footer/Footer';

const SIZE_CHART = [
  { label: 'Extra Small (XS)', dims: '15 × 10 × 5 cm',  vol: '0.75 L', best: 'Jewelry, accessories' },
  { label: 'Small (S)',        dims: '20 × 15 × 10 cm', vol: '3 L',    best: 'Cosmetics, phone cases' },
  { label: 'Medium (M)',       dims: '30 × 20 × 15 cm', vol: '9 L',    best: 'Shoes, books, clothing' },
  { label: 'Large (L)',        dims: '40 × 30 × 20 cm', vol: '24 L',   best: 'Electronics, bulk items' },
  { label: 'Extra Large (XL)', dims: '50 × 40 × 30 cm', vol: '60 L',   best: 'Large shipments' },
  { label: 'Mailer S (MS)',    dims: '25 × 20 × 5 cm',  vol: '2.5 L',  best: 'Documents, flat items' },
  { label: 'Mailer L (ML)',    dims: '35 × 25 × 8 cm',  vol: '7 L',    best: 'Clothing, soft goods' },
];

const BAG_COLORS = [
  { name: 'White',         hex: '#FFFFFF' },
  { name: 'Brown Kraft',   hex: '#A0826D' },
  { name: 'Black',         hex: '#1A1A1A' },
  { name: 'Navy',          hex: '#1B2A4A' },
  { name: 'Burgundy',      hex: '#6B1D2A' },
  { name: 'Forest Green',  hex: '#2D5F3E' },
  { name: 'Gold',          hex: '#C5A55A' },
  { name: 'Custom',        hex: null },
];

const BAG_CATEGORIES = ['Shopping Bags', 'Mailers', 'Pouches', 'Paper Bags'];

export default function Singlecard() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quantity, setQuantity] = useState(10);

  // Bag customization
  const [bagColor, setBagColor] = useState('White');
  const [customHex, setCustomHex] = useState('#6366F1');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [addBagOption, setAddBagOption] = useState(false);
  const [logoPos, setLogoPos] = useState({ x: 50, y: 40 }); // percentage
  const logoInputRef = useRef(null);
  const bagPreviewRef = useRef(null);

  const isBagProduct = product ? BAG_CATEGORIES.some(c =>
    (product.category || '').toLowerCase().includes(c.toLowerCase())
  ) : false;
  const showBagCustomization = isBagProduct || addBagOption;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    productApi
      .getById(productId)
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
        setSelectedSize(data.sizes?.[0] ?? '');
        setSelectedMaterial(data.materials?.[0] ?? '');
        setQuantity(Math.max(data.minOrder || 1, 10));
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load product');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="singlecard-page">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Loader2 size={36} className="profile-spinner" />
          <p>Loading product…</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="singlecard-page">
        <Navbar />
        <main className="singlecard-main">
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <XCircle size={48} style={{ opacity: 0.4, marginBottom: '1rem' }} />
            <p className="singlecard-not-found">{error || 'Product not found.'}</p>
            <Link to="/Catalog">Back to Catalog</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const pricePerUnit = product.price;
  const total = (pricePerUnit * quantity).toFixed(2);

  const handleQuantityChange = (delta) => {
    const min = product.minOrder || 1;
    setQuantity((q) => Math.max(min, Math.min(9999, q + delta)));
  };

  return (
    <div className="singlecard-page">
      <Navbar />

      <main className="singlecard-main">
        <Link to="/Catalog" className="singlecard-back">
          ← Back to Catalog
        </Link>

        <div className="singlecard-layout">
          <div className="singlecard-gallery">
            <div className="singlecard-main-image">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="singlecard-thumbnails">
              <button type="button" className="singlecard-thumb active">
                <img src={product.image} alt="" />
              </button>
              <button type="button" className="singlecard-thumb">
                <img src={product.image} alt="" />
              </button>
              <button type="button" className="singlecard-thumb">
                <img src={product.image} alt="" />
              </button>
            </div>
          </div>

          <div className="singlecard-details">

            <h1 className="singlecard-title">{product.name}</h1>
            <p className="singlecard-desc">{product.description}</p>
            <p className="singlecard-price">${product.price.toFixed(2)} per unit</p>

            <div className="singlecard-stock">
              {product.inStock ? (
                <>
                  <Check size={18} />
                  <span>In Stock{product.stock > 0 ? ` — ${product.stock} available` : ' — Ready to Ship'}</span>
                </>
              ) : (
                <span style={{ color: 'var(--destructive, #ef4444)' }}>Out of Stock</span>
              )}
            </div>

            {product.sizes?.length > 0 && (
              <div className="singlecard-section">
                <label className="singlecard-label">Select Size</label>
                <div className="singlecard-options singlecard-size-grid">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`singlecard-option-btn ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.materials?.length > 0 && (
              <div className="singlecard-section">
                <label className="singlecard-label">Select Material</label>
                <div className="singlecard-options">
                  {product.materials.map((mat) => (
                    <button
                      key={mat}
                      type="button"
                      className={`singlecard-option-btn ${selectedMaterial === mat ? 'active' : ''}`}
                      onClick={() => setSelectedMaterial(mat)}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bag Customization Section */}
            {!isBagProduct && (
              <div className="singlecard-section">
                <button
                  type="button"
                  className={`sc-bag-toggle ${addBagOption ? 'active' : ''}`}
                  onClick={() => setAddBagOption(v => !v)}
                >
                  <ShoppingBag size={18} />
                  <span>{addBagOption ? 'Remove Bag Customization' : 'Add Custom Bag'}</span>
                </button>
              </div>
            )}

            {showBagCustomization && (
              <div className="sc-bag-customize">
                <div className="sc-bag-customize-header">
                  <Palette size={18} />
                  <h3>{isBagProduct ? 'Customize Your Bag' : 'Bag Add-On'}</h3>
                </div>

                {/* Bag Color */}
                <div className="singlecard-section">
                  <label className="singlecard-label">Bag Color</label>
                  <div className="sc-bag-colors">
                    {BAG_COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        className={`sc-bag-color-btn ${bagColor === c.name ? 'active' : ''}`}
                        onClick={() => setBagColor(c.name)}
                        title={c.name}
                      >
                        <span
                          className="sc-bag-color-swatch"
                          style={{
                            background: c.hex || `conic-gradient(red, yellow, lime, aqua, blue, magenta, red)`,
                            border: c.name === 'White' ? '1px solid var(--border)' : 'none',
                          }}
                        />
                        <span className="sc-bag-color-name">{c.name}</span>
                      </button>
                    ))}
                  </div>
                  {bagColor === 'Custom' && (
                    <div className="sc-bag-custom-color">
                      <input
                        type="color"
                        value={customHex}
                        onChange={(e) => setCustomHex(e.target.value)}
                        className="sc-bag-color-input"
                      />
                      <span className="sc-bag-hex-label">{customHex.toUpperCase()}</span>
                    </div>
                  )}
                </div>

                {/* Logo Upload */}
                <div className="singlecard-section">
                  <label className="singlecard-label">Upload Logo</label>
                  {!logoPreview ? (
                    <div
                      className="sc-logo-dropzone"
                      onClick={() => logoInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
                      onDragLeave={(e) => e.currentTarget.classList.remove('dragover')}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('dragover');
                        const file = e.dataTransfer.files[0];
                        if (file && file.type.startsWith('image/')) {
                          setLogoFile(file);
                          setLogoPreview(URL.createObjectURL(file));
                        }
                      }}
                    >
                      <Upload size={28} className="sc-logo-upload-icon" />
                      <p>Drag & drop your logo here</p>
                      <span>or <strong>browse files</strong></span>
                      <span className="sc-logo-formats">.PNG, .JPG, .SVG — Max 5 MB</span>
                    </div>
                  ) : (
                    <div className="sc-logo-preview">
                      <img src={logoPreview} alt="Logo preview" />
                      <div className="sc-logo-preview-info">
                        <span>{logoFile?.name}</span>
                        <button
                          type="button"
                          className="sc-logo-remove"
                          onClick={() => {
                            setLogoFile(null);
                            setLogoPreview(null);
                          }}
                        >
                          <X size={16} />
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setLogoFile(file);
                        setLogoPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>

                {/* Bag Mockup Preview */}
                <div className="singlecard-section">
                  <label className="singlecard-label">
                    <Eye size={15} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 5 }} />
                    Preview — Drag logo to position
                  </label>
                  <div
                    className="sc-bag-mockup"
                    ref={bagPreviewRef}
                    onMouseMove={(e) => {
                      if (e.buttons !== 1 || !logoPreview) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      setLogoPos({
                        x: Math.min(85, Math.max(15, ((e.clientX - rect.left) / rect.width) * 100)),
                        y: Math.min(85, Math.max(15, ((e.clientY - rect.top) / rect.height) * 100)),
                      });
                    }}
                    onTouchMove={(e) => {
                      if (!logoPreview) return;
                      const touch = e.touches[0];
                      const rect = e.currentTarget.getBoundingClientRect();
                      setLogoPos({
                        x: Math.min(85, Math.max(15, ((touch.clientX - rect.left) / rect.width) * 100)),
                        y: Math.min(85, Math.max(15, ((touch.clientY - rect.top) / rect.height) * 100)),
                      });
                    }}
                  >
                    {/* Bag shape SVG — color fills only the bag */}
                    {(() => {
                      const bagHex = bagColor === 'Custom' ? customHex
                        : BAG_COLORS.find(c => c.name === bagColor)?.hex || '#FFFFFF';
                      const isDark = parseInt(bagHex.replace('#','').substring(0,2), 16) < 100;
                      const handleColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.25)';
                      const trimColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)';
                      return (
                        <svg className="sc-bag-svg" viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {/* Bag body */}
                          <path d="M30 60 Q30 55 35 50 L75 45 Q100 40 125 45 L165 50 Q170 55 170 60 L175 240 Q175 250 165 250 L35 250 Q25 250 25 240 Z" fill={bagHex} stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} strokeWidth="1" />
                          {/* Bag handles */}
                          <path d="M65 45 Q65 20 80 15 Q100 10 120 15 Q135 20 135 45" stroke={handleColor} strokeWidth="3" fill="none" />
                          {/* Top trim line */}
                          <rect x="30" y="58" width="140" height="2" rx="1" fill={trimColor} />
                        </svg>
                      );
                    })()}
                    {/* Logo overlay */}
                    {logoPreview && (
                      <img
                        src={logoPreview}
                        alt="Logo on bag"
                        className="sc-bag-logo-overlay"
                        draggable={false}
                        style={{
                          left: `${logoPos.x}%`,
                          top: `${logoPos.y}%`,
                        }}
                      />
                    )}
                    {!logoPreview && (
                      <div className="sc-bag-placeholder-text">Upload a logo to preview</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="singlecard-section">
              <label className="singlecard-label">
                Quantity (Min: {product.minOrder})
              </label>
              <div className="singlecard-quantity">
                <button
                  type="button"
                  className="singlecard-qty-btn"
                  onClick={() => handleQuantityChange(-1)}
                  aria-label="Decrease"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v)) setQuantity(Math.max(product.minOrder, v));
                  }}
                  min={product.minOrder}
                  className="singlecard-qty-input"
                />
                <button
                  type="button"
                  className="singlecard-qty-btn"
                  onClick={() => handleQuantityChange(1)}
                  aria-label="Increase"
                >
                  +
                </button>
              </div>
            </div>

            <div className="singlecard-total-wrap">
              <span className="singlecard-total-label">Total Price:</span>
              <span className="singlecard-total-value">${total}</span>
            </div>

            <button
              type="button"
              className="singlecard-add-btn"
              disabled={!product.inStock}
              onClick={() => {
                if (!isLoggedIn) {
                  navigate('/login', { state: { from: `/catalog/${productId}` } });
                  return;
                }
                addToCart({
                  productId: product.id,
                  name: product.name,
                  image: product.image,
                  price: product.price,
                  quantity,
                  size: selectedSize,
                  material: selectedMaterial,
                  ...(showBagCustomization && {
                    bagColor: bagColor === 'Custom' ? customHex : bagColor,
                    logoFile: logoFile?.name || null,
                  }),
                });
                navigate('/Cart');
              }}
            >
              <ShoppingCart size={20} />
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>

            <div className="singlecard-features">
              <div className="singlecard-feature">
                <TruckIcon size={20} />
                <span>Fast shipping available</span>
              </div>
              <div className="singlecard-feature">
                <Shield size={20} />
                <span>Quality guaranteed</span>
              </div>
              <div className="singlecard-feature">
                <Leaf size={20} />
                <span>Eco-friendly options</span>
              </div>
            </div>
          </div>
        </div>

        <section className="singlecard-specs">
          <h2 className="singlecard-specs-title">Product Specifications</h2>
          <div className="singlecard-specs-grid">
            <div className="singlecard-spec-row">
              <span className="singlecard-spec-label">Category</span>
              <span className="singlecard-spec-value">{product.category}</span>
            </div>
            <div className="singlecard-spec-row">
              <span className="singlecard-spec-label">Minimum Order</span>
              <span className="singlecard-spec-value">{product.minOrder} units</span>
            </div>
            <div className="singlecard-spec-row">
              <span className="singlecard-spec-label">Availability</span>
              <span className="singlecard-spec-value">
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            <div className="singlecard-spec-row">
              <span className="singlecard-spec-label">Price per Unit</span>
              <span className="singlecard-spec-value">
                ${product.price.toFixed(2)}
              </span>
            </div>
          </div>
        </section>

        {/* Size Chart */}
        <section className="sc-sizechart-section">
          <div className="sc-sizechart-section-header">
            <Ruler size={20} />
            <h2>Box Size Chart</h2>
          </div>
          <p className="sc-sizechart-desc">All dimensions in centimeters (L × W × H). Find the right box for your products.</p>
          <div className="sc-sizechart">
            <table className="sc-sizechart-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Dimensions (L×W×H)</th>
                  <th>Volume</th>
                  <th>Best For</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_CHART.map((row) => (
                  <tr key={row.label}>
                    <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{row.label}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{row.dims}</td>
                    <td>{row.vol}</td>
                    <td style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{row.best}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer/>
    </div>
  );
}
