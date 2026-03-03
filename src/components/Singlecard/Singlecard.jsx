import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
  Star,
  Check,
  Truck as TruckIcon,
  Shield,
  Leaf,
} from 'lucide-react';
import products from '../../mockdata/product.json';
import { useCart } from '../../context/CartContext';
import './Singlecard.css';

export default function Singlecard() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = products.find((p) => p.id === productId);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quantity, setQuantity] = useState(10);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes?.[0] ?? '');
      setSelectedMaterial(product.materials?.[0] ?? '');
      setQuantity(Math.max(product.minOrder, 10));
    }
  }, [product]);

  if (!product) {
    return (
      <div className="singlecard-page">
        <p className="singlecard-not-found">Product not found.</p>
        <Link to="/Catalog">Back to Catalog</Link>
      </div>
    );
  }

  const pricePerUnit = product.price;
  const total = (pricePerUnit * quantity).toFixed(2);

  const handleQuantityChange = (delta) => {
    const min = product.minOrder;
    setQuantity((q) => Math.max(min, Math.min(9999, q + delta)));
  };

  return (
    <div className="singlecard-page">
      <header className="singlecard-header">
        <Link to="/HomePage" className="singlecard-logo">
          <div className="singlecard-logo-icon">
            <Package size={24} color="white" />
          </div>
          <span>Packora</span>
        </Link>

        <nav className="singlecard-nav">
          <Link to="/HomePage" className="singlecard-nav-item">
            <LayoutGrid size={18} />
            Dashboard
          </Link>
          <Link to="/Catalog" className="singlecard-nav-item active">
            <Box size={18} />
            Catalog
          </Link>
          <Link to="/Track" className="singlecard-nav-item">
            <Truck size={18} />
            Track
          </Link>
          <Link to="#" className="singlecard-nav-item">
            <ShoppingCart size={18} />
            Cart
          </Link>
          <Link to="#" className="singlecard-nav-item">
            <HelpCircle size={18} />
            Support
          </Link>
          <Link to="#" className="singlecard-nav-item">
            <User size={18} />
            Profile
          </Link>
          <Link to="/" className="singlecard-nav-item">
            <LogOut size={18} />
            Logout
          </Link>
        </nav>

        <button type="button" className="singlecard-share-btn">
          <Share2 size={18} />
          Share
        </button>
      </header>

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
            <div className="singlecard-rating">
              <div className="singlecard-stars">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={18} fill="#fbbf24" stroke="#fbbf24" />
                ))}
              </div>
              <span className="singlecard-reviews">(245 reviews)</span>
            </div>

            <h1 className="singlecard-title">{product.name}</h1>
            <p className="singlecard-desc">{product.description}</p>
            <p className="singlecard-price">${product.price.toFixed(2)} per unit</p>

            <div className="singlecard-stock">
              <Check size={18} />
              <span>In Stock - Ready to Ship</span>
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
              onClick={() => {
                addToCart({
                  productId: product.id,
                  name: product.name,
                  image: product.image,
                  price: product.price,
                  quantity,
                  size: selectedSize,
                  material: selectedMaterial,
                });
                navigate('/Cart');
              }}
            >
              <ShoppingCart size={20} />
              Add to Cart
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
      </main>
    </div>
  );
}
