import React, { useState } from 'react';
import './AddCard.css';

export default function AddCard({ onSave, onCancel }) {
  const [form, setForm] = useState({
    cardNumber: '',
    cardholderName: '',
    expMonth: '',
    expYear: '',
    cvv: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') {
      const digits = value.replace(/\D/g, '').slice(0, 16);
      const formatted = digits.replace(/(\d{4})/g, '$1 ').trim();
      setForm((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const digits = form.cardNumber.replace(/\D/g, '');
    const last4 = digits.slice(-4);
    onSave({
      last4,
      name: form.cardholderName,
      expMonth: parseInt(form.expMonth, 10),
      expYear: parseInt(form.expYear, 10),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="addcard-form">
      <div className="addcard-row full">
        <label>Card Type *</label>
        <select className="addcard-select" defaultValue="credit">
          <option value="credit">Credit Card</option>
          <option value="debit">Debit Card</option>
        </select>
      </div>
      <div className="addcard-row full">
        <label>Card Number *</label>
        <input
          type="text"
          name="cardNumber"
          placeholder="1234 5678 9012 3456"
          value={form.cardNumber}
          onChange={handleChange}
          required
        />
      </div>
      <div className="addcard-row full">
        <label>Cardholder Name *</label>
        <input
          type="text"
          name="cardholderName"
          placeholder="John Doe"
          value={form.cardholderName}
          onChange={handleChange}
          required
        />
      </div>
      <div className="addcard-row-group">
        <div className="addcard-row">
          <label>Month (MM) *</label>
          <input
            type="number"
            name="expMonth"
            placeholder="12"
            min="1"
            max="12"
            value={form.expMonth}
            onChange={handleChange}
            required
          />
        </div>
        <div className="addcard-row">
          <label>Year (YYYY) *</label>
          <input
            type="number"
            name="expYear"
            placeholder="2027"
            min={new Date().getFullYear()}
            value={form.expYear}
            onChange={handleChange}
            required
          />
        </div>
        <div className="addcard-row">
          <label>CVV *</label>
          <input
            type="text"
            name="cvv"
            placeholder="123"
            maxLength="4"
            value={form.cvv}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="addcard-actions">
        <button type="button" className="addcard-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="addcard-submit">
          Add Payment Method
        </button>
      </div>
    </form>
  );
}
