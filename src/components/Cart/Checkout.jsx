import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Box,
  MapPin,
  CreditCard,
  Check,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import ShippingAddress from './ShippingAddress';
import Payment from './Payment';
import ReviewOrder from './ReviewOrder';
import Navbar from '../Navbar/Navbar';
import './Checkout.css';
import Footer from '../Footer/Footer';

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
        <Navbar />
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
      <Navbar />

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
      <Footer/>
  
    </div>
  );
}
