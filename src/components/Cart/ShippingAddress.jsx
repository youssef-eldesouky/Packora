import React, { useState } from 'react';
import { MapPin, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './ShippingAddress.css';

const TAX_RATE = 0.08;

export default function ShippingAddress() {
  const { shippingAddress, setShippingAddress, setCheckoutStep, cartItems } = useCart();
  const [form, setForm] = useState(shippingAddress);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShippingAddress(form);
    setCheckoutStep('payment');
  };

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return (
    <>
      <div className="shipping-panel">
        <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid var(--primary)', borderRadius: '8px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <UploadCloud color="var(--primary)" />
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1rem' }}>Shipping to multiple addresses?</h3>
              <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Upload an Excel file to handle large orders easily.</p>
            </div>
          </div>
          <Link to="/BulkOrder" style={{ padding: '8px 16px', background: 'var(--background)', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: '6px', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
            Use Bulk Upload
          </Link>
        </div>

        <h2 className="shipping-title">
          <MapPin size={20} />
          Shipping Address
        </h2>
        <form onSubmit={handleSubmit} className="shipping-form">
          <div className="shipping-row">
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="shipping-row">
            <label>Company Name *</label>
            <input
              type="text"
              name="company"
              value={form.company}
              onChange={handleChange}
              required
            />
          </div>
          <div className="shipping-row full">
            <label>Street Address *</label>
            <input
              type="text"
              name="street"
              value={form.street}
              onChange={handleChange}
              required
            />
          </div>
          <div className="shipping-row">
            <label>City *</label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              required
            />
          </div>
          <div className="shipping-row">
            <label>State *</label>
            <input
              type="text"
              name="state"
              value={form.state}
              onChange={handleChange}
              required
            />
          </div>
          <div className="shipping-row">
            <label>ZIP Code *</label>
            <input
              type="text"
              name="zip"
              value={form.zip}
              onChange={handleChange}
              required
            />
          </div>
          <div className="shipping-row full">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="shipping-submit">
            Continue to Payment
          </button>
        </form>
      </div>

      <aside className="shipping-summary">
        <h2 className="shipping-summary-title">Order Summary</h2>
        <div className="shipping-summary-rows">
          <div className="shipping-summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="shipping-summary-row">
            <span>Shipping</span>
            <span>FREE</span>
          </div>
          <div className="shipping-summary-row">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
        </div>
        <div className="shipping-summary-total">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <p className="shipping-summary-items">
          {cartItems.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
        </p>
      </aside>
    </>
  );
}
