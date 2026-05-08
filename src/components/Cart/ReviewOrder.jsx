import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, MapPin, CreditCard, Lock, Loader2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { orderApi } from '../../utils/api';
import './ReviewOrder.css';

const TAX_RATE = 0.08;

export default function ReviewOrder() {
  const navigate = useNavigate();
  const {
    cartItems,
    shippingAddress,
    paymentMethods,
    selectedPaymentId,
    setCheckoutStep,
    clearCart,
  } = useCart();

  const selectedCard = paymentMethods.find((c) => c.id === selectedPaymentId);
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState(null);

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    setError(null);
    try {
      const addressString = [
        shippingAddress.fullName,
        shippingAddress.company,
        shippingAddress.street,
        `${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}`,
        shippingAddress.phone
      ].filter(Boolean).join(', ');

      const items = cartItems.map(item => ({
        productId: parseInt(item.productId, 10),
        quantity: item.quantity,
        unitPrice: item.price,
        size: item.size || null,
        material: item.material || null,
      }));

      await orderApi.create({
        shippingAddress: addressString,
        items
      });

      clearCart();
      setCheckoutStep('shipping');
      navigate('/Track'); // Navigate to Track page to see the new order
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <>
      <div className="review-panel">
        <h2 className="review-title">
          <Check size={20} />
          Review Order
        </h2>

        <div className="review-section">
          <div className="review-section-header">
            <h3>Shipping Address</h3>
            <button
              type="button"
              className="review-edit-btn"
              onClick={() => setCheckoutStep('shipping')}
            >
              Edit
            </button>
          </div>
          <div className="review-section-content">
            <MapPin size={18} className="review-section-icon" />
            <div>
              <p>{shippingAddress.fullName}</p>
              <p>{shippingAddress.company}</p>
              <p>{shippingAddress.street}</p>
              <p>
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}
              </p>
              <p>{shippingAddress.phone}</p>
            </div>
          </div>
        </div>

        <div className="review-section">
          <div className="review-section-header">
            <h3>Payment Method</h3>
            <button
              type="button"
              className="review-edit-btn"
              onClick={() => setCheckoutStep('payment')}
            >
              Edit
            </button>
          </div>
          <div className="review-section-content">
            <CreditCard size={18} className="review-section-icon" />
            <div>
              {selectedCard && (
                <>
                  <p>4532 **** **** {selectedCard.last4}</p>
                  <p>{selectedCard.name}</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="review-section">
          <h3>Order Items ({cartItems.length})</h3>
          <div className="review-items">
            {cartItems.map((item) => (
              <div key={`${item.productId}-${item.size || ''}-${item.material || ''}`} className="review-item">
                <div className="review-item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="review-item-body">
                  <p className="review-item-name">{item.name}</p>
                  <p className="review-item-meta">
                    Quantity: {item.quantity}, Size: {item.size || '—'}
                  </p>
                </div>
                <span className="review-item-price">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="review-actions">
          <button
            type="button"
            className="review-back-btn"
            onClick={() => setCheckoutStep('payment')}
            disabled={isPlacingOrder}
          >
            Back
          </button>
          <button
            type="button"
            className="review-place-btn"
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder}
          >
            {isPlacingOrder ? (
              <Loader2 size={18} className="profile-spinner" />
            ) : (
              <Lock size={18} />
            )}
            {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
        {error && <p style={{ color: 'var(--danger, #ef4444)', marginTop: '1rem', textAlign: 'right' }}>{error}</p>}
      </div>

      <aside className="review-summary">
        <h2 className="review-summary-title">Order Summary</h2>
        <div className="review-summary-rows">
          <div className="review-summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="review-summary-row">
            <span>Shipping</span>
            <span>FREE</span>
          </div>
          <div className="review-summary-row">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
        </div>
        <div className="review-summary-total">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <p className="review-summary-items">
          {cartItems.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
        </p>
      </aside>
    </>
  );
}
