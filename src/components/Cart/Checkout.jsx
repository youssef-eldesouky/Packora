import React from 'react';
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
  MapPin,
  CreditCard,
  Check,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import ShippingAddress from './ShippingAddress';
import Payment from './Payment';
import ReviewOrder from './ReviewOrder';
import './Checkout.css';

const STEPS = [
  { key: 'shipping', label: 'Shipping', icon: MapPin },
  { key: 'payment', label: 'Payment', icon: CreditCard },
  { key: 'review', label: 'Review', icon: Check },
];

export default function Checkout() {
  const { cartItems, checkoutStep, setCheckoutStep } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <header className="checkout-header">
          <Link to="/HomePage" className="checkout-logo">
            <div className="checkout-logo-icon">
              <Package size={24} color="white" />
            </div>
            <span>Packora</span>
          </Link>
          <nav className="checkout-nav">
            <Link to="/HomePage" className="checkout-nav-item">
              <LayoutGrid size={18} /> Dashboard
            </Link>
            <Link to="/Catalog" className="checkout-nav-item">
              <Box size={18} /> Catalog
            </Link>
            <Link to="/Track" className="checkout-nav-item">
              <Truck size={18} /> Track
            </Link>
            <Link to="/Cart" className="checkout-nav-item active">
              <ShoppingCart size={18} /> Cart
            </Link>
            <Link to="#" className="checkout-nav-item">
              <HelpCircle size={18} /> Support
            </Link>
            <Link to="#" className="checkout-nav-item">
              <User size={18} /> Profile
            </Link>
            <Link to="/" className="checkout-nav-item">
              <LogOut size={18} /> Logout
            </Link>
          </nav>
          <button type="button" className="checkout-share-btn">
            <Share2 size={18} /> Share
          </button>
        </header>
        <main className="checkout-main">
          <div className="checkout-empty">
            <ShoppingCart size={80} className="checkout-empty-icon" />
            <h2>Your cart is empty</h2>
            <p>Browse our catalog and add some packaging supplies to get started</p>
            <Link to="/Catalog" className="checkout-browse-btn">
              <Box size={20} /> Browse Catalog
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const stepIndex = STEPS.findIndex((s) => s.key === checkoutStep);

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <Link to="/HomePage" className="checkout-logo">
          <div className="checkout-logo-icon">
            <Package size={24} color="white" />
          </div>
          <span>Packora</span>
        </Link>

        <nav className="checkout-nav">
          <Link to="/HomePage" className="checkout-nav-item">
            <LayoutGrid size={18} /> Dashboard
          </Link>
          <Link to="/Catalog" className="checkout-nav-item">
            <Box size={18} /> Catalog
          </Link>
          <Link to="/Track" className="checkout-nav-item">
            <Truck size={18} /> Track
          </Link>
          <Link to="/Cart" className="checkout-nav-item active checkout-nav-badge">
            <ShoppingCart size={18} /> Cart
            <span className="checkout-badge">{cartItems.length}</span>
          </Link>
          <Link to="#" className="checkout-nav-item">
            <HelpCircle size={18} /> Support
          </Link>
          <Link to="#" className="checkout-nav-item">
            <User size={18} /> Profile
          </Link>
          <Link to="/" className="checkout-nav-item">
            <LogOut size={18} /> Logout
          </Link>
        </nav>

        <button type="button" className="checkout-share-btn">
          <Share2 size={18} /> Share
        </button>
      </header>

      <main className="checkout-main">
        <Link to="/Cart" className="checkout-back">Back to Cart</Link>
        <h1 className="checkout-title">Checkout</h1>
        <p className="checkout-subtitle">Complete your order in a few simple steps</p>

        <div className="checkout-steps">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = checkoutStep === step.key;
            const isComplete = stepIndex > i;
            return (
              <React.Fragment key={step.key}>
                <button
                  type="button"
                  className={`checkout-step-btn ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''}`}
                  onClick={() => setCheckoutStep(step.key)}
                >
                  <span className="checkout-step-icon">
                    <Icon size={18} />
                  </span>
                  <span className="checkout-step-label">{step.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`checkout-step-line ${isComplete ? 'complete' : ''}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="checkout-content">
          {checkoutStep === 'shipping' && <ShippingAddress />}
          {checkoutStep === 'payment' && <Payment />}
          {checkoutStep === 'review' && <ReviewOrder />}
        </div>
      </main>
    </div>
  );
}
