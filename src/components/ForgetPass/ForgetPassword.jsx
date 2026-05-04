import React, { useState } from 'react';
import { Package, Mail, ArrowLeft, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './ForgetPassword.css';

const API_BASE = 'http://localhost:8080/api/auth';

export default function ForgetPassword() {
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/forgot-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });

      // Always navigate to confirmation screen (even if email not found —
      // backend is designed not to leak whether the email exists).
      navigate('/EmailCheck', { state: { email } });
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forget-page">
      <div className="forget-wrapper">
        {/* Icon */}
        <div
          className="forget-icon"
          style={{
            width: 64, height: 64,
            backgroundColor: 'var(--muted)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
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
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
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
                  display: 'flex', alignItems: 'center', gap: 8,
                  color: 'var(--foreground)', fontSize: 14, fontWeight: 500, marginBottom: 8,
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
                  width: '100%', padding: '12px 16px',
                  border: '1px solid var(--border)', borderRadius: 8,
                  fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  backgroundColor: 'var(--input-background)',
                }}
              />
            </div>

            {/* Error message */}
            {error && (
              <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 16, marginTop: -12 }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px 16px',
                backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)',
                border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.75 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
              className="forget-button"
            >
              {loading ? (
                <>
                  <Loader size={18} className="spin" />
                  Sending…
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>

            <p style={{ textAlign: 'center', marginTop: 24, marginBottom: 0 }}>
              <Link
                to="/login"
                style={{
                  color: 'var(--foreground)', fontSize: 14, textDecoration: 'none',
                  fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6,
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
