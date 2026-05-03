import React, { createContext, useContext, useMemo, useState } from 'react';
import orders from '../mockdata/Orders.json';

const ProfileContext = createContext(null);

const defaultAccount = {
  fullName: 'John Smith',
  businessName: 'Smith Enterprises Inc.',
  email: 'john.smith@smithenterprises.com',
  phone: '+1 (555) 123-4567',
  street: '123 Business Street',
  city: 'New York',
  state: 'NY',
  zip: '10001',
};

const defaultAddresses = [
  {
    id: 'addr-1',
    label: 'Main Warehouse',
    street: '123 Business Street',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    isPrimary: true,
  },
  {
    id: 'addr-2',
    label: 'Distribution Center',
    street: '456 Commerce Avenue',
    city: 'Chicago',
    state: 'IL',
    zip: '60601',
    isPrimary: false,
  },
];

const defaultNotifications = {
  orderUpdates: true,
  shippingAlerts: true,
  promotions: false,
  newsletter: true,
};

function parseAmount(str) {
  if (!str || typeof str !== 'string') return 0;
  const n = parseFloat(str.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export function ProfileProvider({ children }) {
  const [accountProfile, setAccountProfile] = useState(defaultAccount);
  const [savedAddresses, setSavedAddresses] = useState(defaultAddresses);
  const [notificationPrefs, setNotificationPrefs] = useState(defaultNotifications);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + parseAmount(o.amount), 0);
    return {
      memberSince: 'Jan 2024',
      totalOrders,
      totalSpent,
      tier: 'Gold',
    };
  }, []);

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

  const value = {
    accountProfile,
    setAccountProfile,
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
