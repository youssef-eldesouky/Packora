import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'packora_user_auth';

export function emailToDisplayName(email) {
  const local = String(email || '').trim().split('@')[0] || 'User';
  const words = local.split(/[._-]+/).filter(Boolean);
  const titled = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
  return titled || local;
}

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.email === 'string' && typeof parsed.displayName === 'string') {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());

  const login = useCallback((email, options = {}) => {
    const em = String(email || '').trim().toLowerCase();
    const displayName =
      typeof options.displayName === 'string' && options.displayName.trim()
        ? options.displayName.trim()
        : emailToDisplayName(em);
    const next = { email: em, displayName };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setUser(next);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: !!user,
      login,
      logout,
    }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
