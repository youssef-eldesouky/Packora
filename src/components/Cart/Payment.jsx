import React, { useState } from 'react';
import { CreditCard, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import AddCard from './AddCard';
import './Payment.css';

const TAX_RATE = 0.08;

export default function Payment() {
  const {
    cartItems,
    paymentMethods,
    selectedPaymentId,
    setSelectedPaymentId,
    removePaymentMethod,
    addPaymentMethod,
    setCheckoutStep,
  } = useCart();
  const [showAddCard, setShowAddCard] = useState(false);

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handleAddCard = (card) => {
    addPaymentMethod(card);
    setShowAddCard(false);
  };

  return (
    <>
      <div className="payment-panel">
        <div className="payment-header">
          <h2 className="payment-title">
            <CreditCard size={20} />
            Payment Method
          </h2>
          <button
            type="button"
            className="payment-add-btn"
            onClick={() => setShowAddCard(true)}
          >
            + Add Card
          </button>
        </div>

        {showAddCard ? (
          <AddCard onSave={handleAddCard} onCancel={() => setShowAddCard(false)} />
        ) : (
          <>
            <div className="payment-cards">
              {paymentMethods.map((card) => (
                <label
                  key={card.id}
                  className={`payment-card ${selectedPaymentId === card.id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedPaymentId === card.id}
                    onChange={() => setSelectedPaymentId(card.id)}
                  />
                  <div className="payment-card-body">
                    <span className="payment-card-number">4532 **** **** {card.last4}</span>
                    {card.isDefault && <span className="payment-card-default">Default</span>}
                    <span className="payment-card-name">{card.name}</span>
                    <span className="payment-card-exp">
                      Expires {String(card.expMonth).padStart(2, '0')}/{card.expYear}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="payment-card-remove"
                    onClick={(e) => {
                      e.preventDefault();
                      removePaymentMethod(card.id);
                    }}
                    aria-label="Remove card"
                  >
                    <Trash2 size={18} />
                  </button>
                </label>
              ))}
            </div>

            <div className="payment-secure">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <div>
                <strong>Secure Payment.</strong> Your payment information is encrypted and secure.
                We never store your full card details.
              </div>
            </div>

            <div className="payment-actions">
              <button
                type="button"
                className="payment-back-btn"
                onClick={() => setCheckoutStep('shipping')}
              >
                Back
              </button>
              <button
                type="button"
                className="payment-continue-btn"
                onClick={() => setCheckoutStep('review')}
              >
                Continue to Review
              </button>
            </div>
          </>
        )}
      </div>

      <aside className="payment-summary">
        <h2 className="payment-summary-title">Order Summary</h2>
        <div className="payment-summary-rows">
          <div className="payment-summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="payment-summary-row">
            <span>Shipping</span>
            <span>FREE</span>
          </div>
          <div className="payment-summary-row">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
        </div>
        <div className="payment-summary-total">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <p className="payment-summary-items">
          {cartItems.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
        </p>
      </aside>
    </>
  );
}
