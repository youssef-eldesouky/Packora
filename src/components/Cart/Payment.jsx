import React from 'react';
import { Lock } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './Payment.css';

export default function Payment() {
  const { iframeUrl, setCheckoutStep } = useCart();

  if (!iframeUrl) {
    return (
      <div className="payment-panel">
        <h2 className="payment-title">Payment Initialization Error</h2>
        <p>There was an issue initializing the payment gateway. Please go back and try again.</p>
        <button className="payment-back-btn" onClick={() => setCheckoutStep('shipping')}>
          Back to Shipping
        </button>
      </div>
    );
  }

  return (
    <div className="paymob-iframe-wrapper">
      <h2 className="paymob-iframe-title">
        <Lock size={20} /> Secure Payment
      </h2>
      <p className="paymob-iframe-subtitle">
        Enter your card details below. Your connection is secure and encrypted.
      </p>
      
      <iframe
        id="paymob-iframe"
        title="Paymob Payment"
        src={iframeUrl}
        className="paymob-iframe"
        frameBorder="0"
        allowFullScreen
      />
      
      <p className="paymob-iframe-note">
        Powered by <strong>Paymob</strong> — PCI DSS compliant payment gateway
      </p>

      <button className="payment-back-btn" style={{marginTop: '1rem'}} onClick={() => setCheckoutStep('shipping')}>
        Back to Shipping
      </button>
    </div>
  );
}
