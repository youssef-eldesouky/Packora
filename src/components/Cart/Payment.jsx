import React, { useState } from 'react';
import { Lock, CreditCard, Banknote, Loader2, CheckCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { paymentApi, orderApi } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import './Payment.css';

export default function Payment() {
  const navigate = useNavigate();
  const {
    currentOrderId,
    shippingAddress,
    cartItems,
    iframeUrl,
    setIframeUrl,
    setCheckoutStep,
    clearCart
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState(null); // 'CARD' or 'COD' or null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate total
  const TAX_RATE = 0.08;
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handleSelectCard = async () => {
    setPaymentMethod('CARD');
    if (iframeUrl) return;

    setLoading(true);
    setError(null);
    try {
      const [firstName = 'NA', ...rest] = (shippingAddress.fullName || 'NA').split(' ');
      const lastName = rest.join(' ') || 'NA';

      const billingData = {
        first_name: firstName,
        last_name: lastName,
        email: shippingAddress.email || 'na@na.com',
        phone_number: shippingAddress.phone || 'NA',
        street: shippingAddress.street || 'NA',
        city: shippingAddress.city || 'NA',
        country: 'EG',
        apartment: 'NA',
        floor: 'NA',
        building: 'NA',
        shipping_method: 'NA',
        postal_code: shippingAddress.zip || 'NA',
        state: shippingAddress.state || 'NA',
      };

      const paymentResp = await paymentApi.initiate(currentOrderId, total, billingData);
      setIframeUrl(paymentResp.iframeUrl);
    } catch (err) {
      console.error("Failed to initiate card payment:", err);
      setError(err.message || "Failed to initialize credit/debit card payment. Please try again.");
      setPaymentMethod(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCod = async () => {
    setLoading(true);
    setError(null);
    try {
      await orderApi.confirmCod(currentOrderId);
      await clearCart();
      // Redirect to review step with success=true and method=cod
      navigate('/Cart/checkout?step=review&success=true&method=cod');
    } catch (err) {
      console.error("Failed to confirm COD order:", err);
      setError(err.message || "Failed to confirm Cash on Delivery order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (paymentMethod === 'CARD' && (loading || iframeUrl)) {
    return (
      <div className="paymob-iframe-wrapper">
        <h2 className="paymob-iframe-title">
          <Lock size={20} /> Secure Card Payment
        </h2>
        <p className="paymob-iframe-subtitle">
          Enter your card details below to complete your payment.
        </p>

        {loading ? (
          <div className="payment-loading-spinner-wrap">
            <Loader2 size={40} className="profile-spinner spinner-icon" />
            <p>Initializing secure payment gateway...</p>
          </div>
        ) : (
          <iframe
            id="paymob-iframe"
            title="Paymob Payment"
            src={iframeUrl}
            className="paymob-iframe"
            frameBorder="0"
            allowFullScreen
          />
        )}

        <p className="paymob-iframe-note">
          Powered by <strong>Paymob</strong> — PCI DSS compliant secure gateway
        </p>

        <div className="payment-actions-inline">
          <button
            type="button"
            className="payment-back-to-select"
            onClick={() => setPaymentMethod(null)}
            disabled={loading}
          >
            Choose Different Payment Method
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-method-selector-container">
      <h2 className="payment-selector-title">Select Payment Method</h2>
      <p className="payment-selector-subtitle">Choose how you would like to pay for your order</p>

      {error && (
        <div className="payment-error-alert">
          {error}
        </div>
      )}

      <div className="payment-method-options-grid">
        <div
          className={`payment-method-option-card ${paymentMethod === 'CARD' ? 'selected' : ''}`}
          onClick={handleSelectCard}
        >
          <div className="payment-option-icon-wrap">
            <CreditCard size={28} />
          </div>
          <div className="payment-option-content">
            <h3>Credit / Debit Card</h3>
            <p>Pay online securely using your Visa, Mastercard, or American Express.</p>
          </div>
        </div>

        <div
          className={`payment-method-option-card ${paymentMethod === 'COD' ? 'selected' : ''}`}
          onClick={() => setPaymentMethod('COD')}
        >
          <div className="payment-option-icon-wrap">
            <Banknote size={28} />
          </div>
          <div className="payment-option-content">
            <h3>Cash on Delivery (COD)</h3>
            <p>Pay in cash to the courier agent when your products are delivered.</p>
          </div>
        </div>
      </div>

      {paymentMethod === 'COD' && (
        <div className="payment-cod-confirmation-box">
          <div className="cod-check-icon">
            <CheckCircle size={24} />
          </div>
          <div className="cod-confirmation-text">
            <h3>Cash on Delivery Selected</h3>
            <p>
              Your total amount is <strong>EGP {total.toFixed(2)}</strong>. You will pay this full amount in cash upon delivery at your shipping address.
            </p>
          </div>
        </div>
      )}

      <div className="payment-actions">
        <button
          type="button"
          className="payment-back-btn"
          onClick={() => setCheckoutStep('shipping')}
          disabled={loading}
        >
          Back to Shipping
        </button>

        {paymentMethod === 'COD' && (
          <button
            type="button"
            className="payment-confirm-cod-btn"
            onClick={handleConfirmCod}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="profile-spinner spinner-icon" />
                Processing...
              </>
            ) : (
              'Place Order (Cash on Delivery)'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
