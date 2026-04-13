import React from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  ShoppingCart,
  Box,
  Trash2,
  CreditCard,
  Lock,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import Navbar from '../Navbar/Navbar';
import './Cart.css';
import Footer from '../Footer/Footer';

const TAX_RATE = 0.08;

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= 100 ? 0 : 0;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

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
            <Link to="/Cart/checkout" className="cart-checkout-btn">
              <CreditCard size={20} />
              Proceed to Checkout
            </Link>
            <div className="cart-trust">
              <p><Box size={16} /> Bulk orders available for better pricing</p>
              <p><Lock size={16} /> Secure payment processing</p>
            </div>
          </aside>
        </div>
      </main>
      <Footer/>
    </div>
  );
}
