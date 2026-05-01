import React from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  ShoppingCart,
  Box,
  Trash2,
  CreditCard,
  Lock,
  UploadCloud
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import Navbar from '../Navbar/Navbar';
import './Cart.css';
import Footer from '../Footer/Footer';

const TAX_RATE = 0.08;

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, bulkExcelData, setBulkExcelData } = useCart();
  const [showBulkPrompt, setShowBulkPrompt] = React.useState(false);

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= 100 ? 0 : 0;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;
  const totalBoxes = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const showBulkBanner = totalBoxes >= 25;

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <Navbar />

        <main className="cart-main">
          <div className="cart-empty">
            <div className="cart-empty-icon-wrap">
              <ShoppingCart size={80} className="cart-empty-icon" />
            </div>
            <h2 className="cart-empty-title">Your cart is empty</h2>
            <p className="cart-empty-desc">
              Browse our catalog and add some packaging supplies to get started
            </p>
            <Link to="/Catalog" className="cart-browse-btn">
              <Box size={20} />
              Browse Catalog
            </Link>
          </div>
        </main>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <Footer/>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Navbar />

      <main className="cart-main">
        <div className="cart-layout">
          <div className="cart-content">
            {showBulkBanner && (
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--primary)', borderRadius: '8px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Box color="var(--primary)" />
                  <div>
                    <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.05rem' }}>Large Order Detected</h3>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Uploading your {totalBoxes} delivery addresses is faster with our Excel upload tool.</p>
                  </div>
                </div>
                <Link to="/BulkOrder" style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}>
                  Upload Addresses
                </Link>
              </div>
            )}
            <div className="cart-header-row">
              <h1 className="cart-title">Shopping Cart</h1>
              <button type="button" className="cart-clear-btn" onClick={clearCart}>
                <Trash2 size={18} />
                Clear Cart
              </button>
            </div>
            <p className="cart-count">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>

            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={`${item.productId}-${item.size || ''}-${item.material || ''}`} className="cart-item">
                  <button
                    type="button"
                    className="cart-item-remove"
                    onClick={() => removeFromCart(item.productId, item.size, item.material)}
                    aria-label="Remove"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="cart-item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="cart-item-body">
                    <h3 className="cart-item-name">{item.name}</h3>
                    <p className="cart-item-specs">
                      Size: {item.size || '—'} • Material: {item.material || '—'}
                    </p>
                    <div className="cart-item-qty">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.size, item.material, Math.max(1, item.quantity - 1))}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.size, item.material, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <div className="cart-item-prices">
                      <span className="cart-item-unit">${item.price.toFixed(2)} each</span>
                      <span className="cart-item-total">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="cart-summary">
            <h2 className="cart-summary-title">Order Summary</h2>
            <div className="cart-summary-rows">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="cart-summary-row">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            </div>
            {shipping === 0 && subtotal > 0 && (
              <div className="cart-shipping-badge">
                <Truck size={16} />
                Free shipping applied!
              </div>
            )}
            <div className="cart-summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            {bulkExcelData && bulkExcelData.length > 0 ? (
              <button 
                className="cart-checkout-btn" 
                onClick={() => setShowBulkPrompt(true)}
                style={{ width: '100%', border: 'none', cursor: 'pointer' }}
              >
                <CreditCard size={20} />
                Proceed to Checkout
              </button>
            ) : (
              <Link to="/Cart/checkout" className="cart-checkout-btn">
                <CreditCard size={20} />
                Proceed to Checkout
              </Link>
            )}
            <div className="cart-trust">
              <Link to="/BulkOrder" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', textDecoration: 'none', marginBottom: '12px' }}>
                <UploadCloud size={16} /> Bulk Excel Upload for Addresses
              </Link>
              <p><Box size={16} /> Bulk orders available for better pricing</p>
              <p><Lock size={16} /> Secure payment processing</p>
            </div>
          </aside>
        </div>
      </main>

      {showBulkPrompt && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--accent-foreground)', padding: '30px', borderRadius: '12px', maxWidth: '500px', width: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, fontSize: '1.3rem', color: 'var(--text-main)' }}>Continue Bulk Order?</h3>
            <p style={{ color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '24px' }}>
              We noticed you previously uploaded an Excel sheet with <strong>{bulkExcelData.length}</strong> delivery addresses. Would you like to proceed with your bulk order, or start a new standard checkout?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Link 
                to="/Cart/checkout" 
                style={{ padding: '10px 16px', background: 'var(--chart-5)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}
                onClick={() => {
                  setBulkExcelData([]);
                  setShowBulkPrompt(false);
                }}
              >
                Standard Checkout
              </Link>
              <Link 
                to="/BulkOrder" 
                style={{ padding: '10px 16px', background: 'var(--primary)', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}
              >
                Continue Bulk Order
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer/>
    </div>
  );
}
