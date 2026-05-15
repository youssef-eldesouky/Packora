import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ShoppingCart,
  Box,
  MapPin,
  CreditCard,
  CheckCircle
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import ShippingAddress from './ShippingAddress';
import Payment from './Payment';
import PaymentResult from './PaymentResult';
import Navbar from '../Navbar/Navbar';
import './Checkout.css';
import Footer from '../Footer/Footer';

const STEPS = [
  { key: 'shipping', label: 'Shipping', icon: MapPin },
  { key: 'payment',  label: 'Payment',  icon: CreditCard },
  { key: 'review',   label: 'Review',   icon: CheckCircle },
];

export default function Checkout() {
  const { cartItems, checkoutStep, setCheckoutStep } = useCart();
  const [params] = useSearchParams();

  // If redirected from Paymob, the URL will have ?step=review
  useEffect(() => {
    const stepFromUrl = params.get('step');
    if (stepFromUrl === 'review') {
      setCheckoutStep('review');
    }
  }, [params, setCheckoutStep]);

  // If cart is empty AND we aren't on the review step (which happens after clearing cart on success)
  if (cartItems.length === 0 && checkoutStep !== 'review') {
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

  const handleStepClick = (stepKey) => {
    // Only allow going back to shipping
    if (stepKey === 'shipping') {
      setCheckoutStep('shipping');
    }
  };

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
            const Icon       = step.icon;
            const isActive   = checkoutStep === step.key;
            const isComplete = stepIndex > i;
            return (
              <React.Fragment key={step.key}>
                <button
                  type="button"
                  className={`checkout-step-btn ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''}`}
                  onClick={() => handleStepClick(step.key)}
                  disabled={stepIndex < i}
                  style={stepIndex < i ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
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
          {checkoutStep === 'payment'  && <Payment />}
          {checkoutStep === 'review'   && <PaymentResult />}
        </div>
      </main>
      <Footer />
    </div>
  );
}
