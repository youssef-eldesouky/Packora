import React, { useState } from 'react';
import { Package, Mail, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './ForgetPassword.css';

export default function ForgetPassword() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/EmailCheck', { state: { email: email || 'your@email.com' } });
  };

  return (
    <div className="forget-page">
      <div className="forget-wrapper">
        {/* Icon */}
        <div
          className="forget-icon"
          style={{
            width: 64,
            height: 64,
            backgroundColor: 'var(--muted)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <Package size={32} color="var(--muted-foreground)" />
        </div>

        <h1 className="forget-title" style={{ color: 'var(--foreground)', marginBottom: 8 }}>
          Reset Password
        </h1>
        <p className="forget-subtitle" style={{ color: 'var(--muted-foreground)', marginBottom: 32 }}>
          Enter your email to receive a reset link
        </p>

        {/* Form card */}
        <div
          className="forget-card"
          style={{
            backgroundColor: 'var(--card)',
            borderRadius: 12,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
            padding: 32,
            width: '100%',
            maxWidth: 400,
          }}
        >
          <form onSubmit={handleSubmit}>
            <div className="forget-field" style={{ marginBottom: 24 }}>
              <label
                htmlFor="email"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: 'var(--foreground)',
                  fontSize: 14,
                  fontWeight: 500,
                  marginBottom: 8,
                }}
              >
                <Mail size={18} color="var(--foreground)" />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="forget-input"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: 'var(--input-background)',
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-foreground)',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
              className="forget-button"
            >
              Send Reset Link
            </button>

            <p
              style={{
                textAlign: 'center',
                marginTop: 24,
                marginBottom: 0,
              }}
            >
              <Link
                to="/"
                style={{
                  color: 'var(--foreground)',
                  fontSize: 14,
                  textDecoration: 'none',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                className="forget-back-link"
              >
                <ArrowLeft size={18} />
                Back to login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
