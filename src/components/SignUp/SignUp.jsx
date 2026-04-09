import React, { useState } from 'react';
import { Package, User, Building2, Mail, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import './SignUp.css';

export default function SignUp() {
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your signup logic here (e.g. validate password === confirmPassword)
  };

  return (
    <div className="signup-page">
      <div className="signup-wrapper">
        {/* Logo icon */}
        <div
          className="signup-icon"
          style={{
            width: 64,
            height: 64,
            backgroundColor: 'var(--secondary)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <Package size={32} color="var(--secondary-foreground)" />
        </div>

        <h1 className="signup-title" style={{ color: 'var(--foreground)', marginBottom: 8 }}>
          Create Account
        </h1>
        <p className="signup-subtitle" style={{ color: 'var(--muted-foreground)', marginBottom: 32 }}>
          Start your packaging journey today
        </p>

        {/* Form card */}
        <div
          className="signup-card"
          style={{
            backgroundColor: 'var(--card)',
            borderRadius: 12,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
            padding: 32,
            width: '100%',
            maxWidth: 440,
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="signup-field" style={{ marginBottom: 20 }}>
              <label
                htmlFor="fullName"
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
                <User size={18} color="var(--foreground)" />
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                className="signup-input"
                style={inputStyle}
              />
            </div>

            {/* Business Name */}
            <div className="signup-field" style={{ marginBottom: 20 }}>
              <label
                htmlFor="businessName"
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
                <Building2 size={18} color="var(--foreground)" />
                Business Name
              </label>
              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your Company Inc."
                required
                className="signup-input"
                style={inputStyle}
              />
            </div>

            {/* Email Address */}
            <div className="signup-field" style={{ marginBottom: 20 }}>
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
                placeholder="your@business.com"
                required
                className="signup-input"
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <div className="signup-field" style={{ marginBottom: 20 }}>
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
                className="signup-input"
                style={inputStyle}
              />
            </div>

            {/* Confirm Password */}
            <div className="signup-field" style={{ marginBottom: 24 }}>
              <label
                htmlFor="confirmPassword"
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
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="signup-input"
                style={inputStyle}
              />
            </div>

            {/* Create Account button */}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'var(--secondary)',
                color: 'var(--secondary-foreground)',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
              className="signup-button"
            >
              Create Account
            </button>

            {/* Sign in link */}
            <p
              style={{
                textAlign: 'center',
                color: 'var(--muted-foreground)',
                fontSize: 14,
                marginTop: 24,
                marginBottom: 0,
              }}
            >
              Already have an account?{' '}
              <Link
                to="/"
                style={{
                  color: 'var(--secondary)',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
                className="signup-link"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
};
