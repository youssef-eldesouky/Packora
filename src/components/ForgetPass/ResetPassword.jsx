import React, { useState, useEffect } from 'react';
import { Package, Lock, Eye, EyeOff, Loader, CheckCircle, XCircle } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import './ResetPassword.css';

const API_BASE = 'http://localhost:8080/api/auth';

export default function ResetPassword() {
  const [searchParams]              = useSearchParams();
  const navigate                    = useNavigate();
  const token                       = searchParams.get('token');

  const [tokenValid, setTokenValid] = useState(null);   // null = checking, true/false
  const [newPassword, setNewPass]   = useState('');
  const [confirmPass, setConfirm]   = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);

  /* ── Validate token on mount ── */
  useEffect(() => {
    if (!token) { setTokenValid(false); return; }

    fetch(`${API_BASE}/validate-reset-token?token=${encodeURIComponent(token)}`)
      .then(r => setTokenValid(r.ok))
      .catch(() => setTokenValid(false));
  }, [token]);

  /* ── Submit new password ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPass) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/reset-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.message || 'Reset failed. The link may have expired.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────────────── */
  /* Render: checking token                          */
  /* ─────────────────────────────────────────────── */
  if (tokenValid === null) {
    return (
      <div className="rp-page">
        <div className="rp-wrapper">
          <Loader size={40} className="spin" color="var(--accent)" />
          <p style={{ color: 'var(--muted-foreground)', marginTop: 16 }}>Verifying your reset link…</p>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────── */
  /* Render: invalid / expired token                 */
  /* ─────────────────────────────────────────────── */
  if (!tokenValid) {
    return (
      <div className="rp-page">
        <div className="rp-wrapper">
          <div className="rp-icon rp-icon--error">
            <XCircle size={36} color="#ef4444" />
          </div>
          <h1 className="rp-title" style={{ color: 'var(--foreground)' }}>Link Expired</h1>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: 32, textAlign: 'center', maxWidth: 340 }}>
            This password reset link is invalid or has expired (links expire after 30 minutes).
            Please request a new one.
          </p>
          <Link to="/ForgetPassword" className="rp-btn rp-btn--primary" style={{ textDecoration: 'none' }}>
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────── */
  /* Render: success                                 */
  /* ─────────────────────────────────────────────── */
  if (success) {
    return (
      <div className="rp-page">
        <div className="rp-wrapper">
          <div className="rp-icon rp-icon--success">
            <CheckCircle size={36} color="#22c55e" />
          </div>
          <h1 className="rp-title" style={{ color: 'var(--foreground)' }}>Password Reset!</h1>
          <p style={{ color: 'var(--muted-foreground)', marginBottom: 32, textAlign: 'center', maxWidth: 340 }}>
            Your password has been updated successfully. Redirecting you to login…
          </p>
          <Link to="/login" className="rp-btn rp-btn--primary" style={{ textDecoration: 'none' }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────── */
  /* Render: reset form                              */
  /* ─────────────────────────────────────────────── */
  return (
    <div className="rp-page">
      <div className="rp-wrapper">

        {/* Header icon */}
        <div className="rp-icon">
          <Package size={32} color="var(--muted-foreground)" />
        </div>

        <h1 className="rp-title" style={{ color: 'var(--foreground)', marginBottom: 8 }}>
          Choose New Password
        </h1>
        <p className="rp-subtitle" style={{ color: 'var(--muted-foreground)', marginBottom: 32 }}>
          Enter and confirm your new password below
        </p>

        {/* Form card */}
        <div className="rp-card">
          <form onSubmit={handleSubmit}>

            {/* New Password */}
            <div className="rp-field">
              <label htmlFor="new-password" className="rp-label">
                <Lock size={16} />
                New Password
              </label>
              <div className="rp-input-wrap">
                <input
                  id="new-password"
                  type={showPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="rp-input"
                />
                <button
                  type="button"
                  className="rp-eye"
                  onClick={() => setShowPass(p => !p)}
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="rp-field">
              <label htmlFor="confirm-password" className="rp-label">
                <Lock size={16} />
                Confirm Password
              </label>
              <div className="rp-input-wrap">
                <input
                  id="confirm-password"
                  type={showPass ? 'text' : 'password'}
                  value={confirmPass}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className="rp-input"
                />
              </div>
            </div>

            {/* Password match indicator */}
            {confirmPass && (
              <p className={`rp-match ${newPassword === confirmPass ? 'rp-match--ok' : 'rp-match--bad'}`}>
                {newPassword === confirmPass ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}

            {/* Error */}
            {error && <p className="rp-error">{error}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="rp-btn rp-btn--primary rp-btn--full"
            >
              {loading ? (
                <><Loader size={16} className="spin" /> Updating…</>
              ) : (
                'Reset Password'
              )}
            </button>

            <p style={{ textAlign: 'center', marginTop: 20, marginBottom: 0 }}>
              <Link to="/login" className="rp-back-link">
                ← Back to login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
