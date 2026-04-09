import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, MapPin, CreditCard, Lock } from 'lucide-react';
import { useCart } from '../../context/CartContext';
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

  const handlePlaceOrder = () => {
    clearCart();
    setCheckoutStep('shipping');
    navigate('/Cart');
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
          >
            Back
          </button>
          <button
            type="button"
            className="review-place-btn"
            onClick={handlePlaceOrder}
          >
            <Lock size={18} />
            Place Order
          </button>
        </div>
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
