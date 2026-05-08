import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import { userApi } from '../utils/api';
import { useAuth } from './AuthContext';

const ProfileContext = createContext(null);

/* ── Provider ────────────────────────────────────────────────────── */

export function ProfileProvider({ children }) {
  const { isLoggedIn } = useAuth();

  // Profile state fetched from backend
  const [accountProfile, setAccountProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Local-only state (no backend support yet)
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [notificationPrefs, setNotificationPrefs] = useState({
    orderUpdates: true,
    shippingAlerts: true,
    promotions: false,
    newsletter: false,
  });

  /* ── Fetch profile on mount / login ───────────────────────────── */
  useEffect(() => {
    if (!isLoggedIn) {
      setAccountProfile(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    userApi
      .getMe()
      .then((data) => {
        if (!cancelled) {
          setAccountProfile({
            username: data.username || '',
            companyName: data.companyName || '',
            email: data.email || '',
            phone: data.phone || '',
            role: data.role || 'USER',
            createdAt: data.createdAt || null,
          });
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load profile');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  /* ── Save profile to backend ──────────────────────────────────── */
  const saveProfile = useCallback(async (draft) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await userApi.updateMe({
        username: draft.username,
        email: draft.email,
        phone: draft.phone || null,
        companyName: draft.companyName || null,
      });
      setAccountProfile({
        username: updated.username || '',
        companyName: updated.companyName || '',
        email: updated.email || '',
        phone: updated.phone || '',
        role: updated.role || 'USER',
        createdAt: updated.createdAt || null,
      });
      return { success: true };
    } catch (err) {
      const msg = err?.data?.message || err.message || 'Failed to update profile';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Stats derived from real data ─────────────────────────────── */
  const stats = useMemo(() => {
    const created = accountProfile?.createdAt;
    let memberSince = '—';
    if (created) {
      const d = new Date(created);
      memberSince = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    return {
      memberSince,
      role: accountProfile?.role || 'USER',
    };
  }, [accountProfile]);

  /* ── Address helpers (local-only) ─────────────────────────────── */
  const addAddress = (addr) => {
    const id = `addr-${Date.now()}`;
    const isPrimary = addr.isPrimary === true;
    setSavedAddresses((prev) => {
      let next = prev.map((a) => (isPrimary ? { ...a, isPrimary: false } : a));
      next = [...next, { ...addr, id, isPrimary: !!isPrimary }];
      return next;
    });
  };

  const updateAddress = (id, updates) => {
    setSavedAddresses((prev) => {
      let next = prev.map((a) => {
        if (a.id !== id) return a;
        return { ...a, ...updates };
      });
      if (updates.isPrimary) {
        next = next.map((a) => ({ ...a, isPrimary: a.id === id }));
      }
      return next;
    });
  };

  const deleteAddress = (id) => {
    setSavedAddresses((prev) => {
      const next = prev.filter((a) => a.id !== id);
      if (next.length && !next.some((a) => a.isPrimary)) {
        return next.map((a, i) => ({ ...a, isPrimary: i === 0 }));
      }
      return next;
    });
  };

  const setPrimaryAddress = (id) => {
    setSavedAddresses((prev) => prev.map((a) => ({ ...a, isPrimary: a.id === id })));
  };

  /* ── Context value ────────────────────────────────────────────── */
  const value = {
    accountProfile,
    setAccountProfile,
    saveProfile,
    loading,
    error,
    savedAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setPrimaryAddress,
    notificationPrefs,
    setNotificationPrefs,
    stats,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
