import React, { useState } from 'react';
import { Package, User, Building2, Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './SignUp.css';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../utils/api';

export default function SignUp() {
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // 1. Register the user
      const signupRes = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: fullName,
          email: email,
          password: password,
          companyName: businessName,
          phone: '',
        }),
      });

      const signupData = await signupRes.json();

      if (!signupRes.ok) {
        setErrorMsg(signupData.message || 'Signup failed');
        setLoading(false);
        return;
      }

      // 2. Auto-login after successful signup
      const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email, // Backend accepts email in the username field
          password: password,
        }),
      });

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        login(loginData);
        navigate('/HomePage');
      } else {
        // Signup succeeded but auto-login failed — redirect to login page
        setSuccessMsg('Account created! Please sign in.');
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (error) {
      setErrorMsg('Could not connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-wrapper">
        {/* Logo icon */}
        <div
          className="logo-icon"
          style={{
            width: 64,
            height: 64,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
             background: 'linear-gradient(135deg, #52796F, #5D536B)',
            borderRadius: '9999px',
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
            {errorMsg && (
              <div style={{ color: 'red', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div style={{ color: 'green', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>
                {successMsg}
              </div>
            )}
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
                to="/login"
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
