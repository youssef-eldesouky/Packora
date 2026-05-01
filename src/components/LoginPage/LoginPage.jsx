import React, { useState } from 'react';
import { Package, Mail, Lock } from 'lucide-react';
import './LoginPage.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth, ADMIN_EMAIL } from '../../context/AdminAuthContext';
import { useAuth, emailToDisplayName } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { loginAdmin } = useAdminAuth();
  const { login } = useAuth();
  const { setAccountProfile } = useProfile();

  const handleSubmit = (e) => {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (em === ADMIN_EMAIL && password.length > 0) {
      loginAdmin();
      login(em, { displayName: 'Admin' });
      navigate('/admin');
      return;
    }
    const displayName = emailToDisplayName(em);
    login(em);
    setAccountProfile((prev) => ({
      ...prev,
      email: em,
      fullName: displayName,
    }));
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        {/* Icon */}
        <div
          className="login-icon"
          style={{
            width: 64,
            height: 64,
            backgroundColor: 'var(--primary)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <Package size={32} color="var(--secondary-foreground)" />
        </div>

        {/* Welcome text */}
        <h1 className="login-title" style={{ color: 'var(--primary)', marginBottom: 8 }}>
          Welcome Back
        </h1>
        <p className="login-subtitle" style={{ color: 'var(--muted-foreground)', marginBottom: 32 }}>
          Sign in to your Packora account.
        </p>

        {/* Form card */}
        <div
          className="login-card"
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
            {/* Email */}
            <div className="login-field" style={{ marginBottom: 20 }}>
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
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                className="login-input"
              />
            </div>

            {/* Password */}
            <div className="login-field" style={{ marginBottom: 20 }}>
              <label
                htmlFor="password"
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
                <Lock size={18} color="var(--foreground)" />
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                className="login-input"
              />
            </div>

            {/* Remember me & Forgot password */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 24,
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: 'var(--foreground)',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: 16,
                    height: 16,
                    accentColor: 'var(--primary)',
                  }}
                />
                Remember me
              </label>
              <Link
                to="/ForgetPassword"
                style={{
                  color: 'var(--primary)',
                  fontSize: 14,
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
                className="login-link"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In button */}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
              className="login-button"
            >
              Sign In
            </button>

            {/* Create account */}
            <p
              style={{
                textAlign: 'center',
                color: 'var(--muted-foreground)',
                fontSize: 14,
                marginTop: 24,
                marginBottom: 0,
              }}
            >
              Don't have an account?{' '}
              <Link
                to="/SignUp"
                style={{
                  color: 'var(--primary)',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
                className="login-link"
              >
                Create one now
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
