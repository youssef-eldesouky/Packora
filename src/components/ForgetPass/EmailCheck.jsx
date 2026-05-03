import React from 'react';
import { Package, Check } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import './EmailCheck.css';

export default function EmailCheck() {
  const location = useLocation();
  const email = location.state?.email || 'your@email.com';

  return (
    <div className="emailcheck-page">
      <div className="emailcheck-wrapper">
        {/* Header: icon + title (same as Reset Password) */}
        <div
          className="emailcheck-icon"
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

        <h1 className="emailcheck-title" style={{ color: 'var(--foreground)', marginBottom: 8 }}>
          Reset Password
        </h1>
        <p className="emailcheck-subtitle" style={{ color: 'var(--muted-foreground)', marginBottom: 32 }}>
          We've sent you a reset link
        </p>

        {/* Main card */}
        <div
          className="emailcheck-card"
          style={{
            backgroundColor: 'var(--card)',
            borderRadius: 12,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
            padding: 32,
            width: '100%',
            maxWidth: 400,
            textAlign: 'center',
          }}
        >
          {/* Checkmark icon */}
          <div
            className="emailcheck-success-icon"
            style={{
              width: 56,
              height: 56,
              backgroundColor: 'var(--muted)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Check size={28} color="var(--muted-foreground)" strokeWidth={2.5} />
          </div>

          <h2 className="emailcheck-card-title" style={{ color: 'var(--foreground)', marginBottom: 12 }}>
            Check Your Email
          </h2>

          <p
            style={{
              color: 'var(--foreground)',
              fontSize: 14,
              lineHeight: 1.6,
              marginBottom: 8,
            }}
          >
            We've sent a password reset link to{' '}
            <strong style={{ fontWeight: 600 }}>{email}</strong>
          </p>
          <p
            style={{
              color: 'var(--muted-foreground)',
              fontSize: 14,
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            Please check your inbox and follow the instructions to reset your password.
          </p>

          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '12px 8px',
              backgroundColor: 'var(--muted)',
              color: 'var(--muted-foreground)',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'none',
            }}
            className="emailcheck-button"
          >
            Return to Login
          </Link>
        </div>

       
      </div>
    </div>
  );
}
