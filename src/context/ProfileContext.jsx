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

  // Address and notification preference states
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [notificationPrefs, setNotificationPrefs] = useState({
    orderUpdates: true,
    shippingAlerts: true,
    promotions: false,
    newsletter: false,
  });

  /* ── Fetch profile, addresses, and notification preferences on mount / login ── */
  useEffect(() => {
    if (!isLoggedIn) {
      setAccountProfile(null);
      setSavedAddresses([]);
      setNotificationPrefs({ orderUpdates: true, shippingAlerts: true, promotions: false, newsletter: false });
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    // 1. Fetch user profile
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

    // 2. Fetch saved addresses
    userApi
      .getAddresses()
      .then((addresses) => {
        if (!cancelled) setSavedAddresses(addresses);
      })
      .catch((err) => console.error('Failed to load saved addresses', err));

    // 3. Fetch notification preferences
    userApi
      .getNotificationPrefs()
      .then((prefs) => {
        if (!cancelled) setNotificationPrefs(prefs);
      })
      .catch((err) => console.error('Failed to load notification preferences', err));

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

  /* ── Address helpers (API-persisted) ──────────────────────────── */
  const addAddress = async (addr) => {
    setLoading(true);
    try {
      const newAddress = await userApi.addAddress(addr);
      setSavedAddresses((prev) => {
        let next = prev;
        if (newAddress.isPrimary) {
          next = prev.map((a) => ({ ...a, isPrimary: false }));
        }
        return [...next, newAddress];
      });
    } catch (err) {
      console.error('Failed to add address', err);
      setError(err.message || 'Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async (id, updates) => {
    setLoading(true);
    try {
      const updated = await userApi.updateAddress(id, updates);
      setSavedAddresses((prev) => {
        let next = prev.map((a) => (a.id === id ? updated : a));
        if (updated.isPrimary) {
          next = next.map((a) => ({ ...a, isPrimary: a.id === id }));
        }
        return next;
      });
    } catch (err) {
      console.error('Failed to update address', err);
      setError(err.message || 'Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (id) => {
    setLoading(true);
    try {
      await userApi.deleteAddress(id);
      const fresh = await userApi.getAddresses();
      setSavedAddresses(fresh);
    } catch (err) {
      console.error('Failed to delete address', err);
      setError(err.message || 'Failed to delete address');
    } finally {
      setLoading(false);
    }
  };

  const setPrimaryAddress = async (id) => {
    setLoading(true);
    try {
      await userApi.setPrimaryAddress(id);
      setSavedAddresses((prev) => prev.map((a) => ({ ...a, isPrimary: a.id === id })));
    } catch (err) {
      console.error('Failed to set primary address', err);
      setError(err.message || 'Failed to set primary address');
    } finally {
      setLoading(false);
    }
  };

  /* ── Notification preferences helper (API-persisted) ─────────── */
  const updateNotificationPrefs = async (prefs) => {
    setLoading(true);
    try {
      const updated = await userApi.updateNotificationPrefs(prefs);
      setNotificationPrefs(updated);
    } catch (err) {
      console.error('Failed to save notification preferences', err);
      setError(err.message || 'Failed to save notification preferences');
    } finally {
      setLoading(false);
    }
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
    setNotificationPrefs: updateNotificationPrefs,
    stats,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
