import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'packora_admin_auth';

const AdminAuthContext = createContext(null);

export const ADMIN_EMAIL = 'admin@packora.com';

export function AdminAuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem(STORAGE_KEY) === '1');

  const loginAdmin = useCallback(() => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setIsAdmin(true);
  }, []);

  const logoutAdmin = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIsAdmin(false);
  }, []);

  const value = useMemo(
    () => ({ isAdmin, loginAdmin, logoutAdmin }),
    [isAdmin, loginAdmin, logoutAdmin]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
