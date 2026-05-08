import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { parseAmount } from '../utils/adminFormat';
import { userApi, productApi } from '../utils/api';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const orders = useMemo(() => [], []);

  // ── Products: fetched from backend /api/products ──────────────
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setProductsLoading(true);
    setProductsError(null);

    productApi
      .getAll()
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch((err) => {
        if (!cancelled) setProductsError(err.message || 'Failed to load products');
      })
      .finally(() => {
        if (!cancelled) setProductsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Customers: fetched from backend /api/users (ADMIN) ────────
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setCustomersLoading(true);
    setCustomersError(null);

    userApi
      .getAll()
      .then((users) => {
        if (cancelled) return;
        const mapped = users.map((u) => ({
          id: u.id,
          name: u.username || '—',
          businessName: u.companyName || '—',
          email: u.email || '—',
          phone: u.phone || '—',
          role: u.role || 'USER',
          memberSince: u.createdAt
            ? new Date(u.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })
            : '—',
        }));
        setCustomers(mapped);
      })
      .catch((err) => {
        if (!cancelled) {
          setCustomersError(err.message || 'Failed to load users');
        }
      })
      .finally(() => {
        if (!cancelled) setCustomersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Product CRUD (hits real backend) ──────────────────────────

  const addProduct = useCallback(async (payload) => {
    const created = await productApi.create({
      name: payload.name,
      description: payload.description || '',
      price: Number(payload.price) || 0,
      imageUrl: payload.image || payload.imageUrl || null,
      category: payload.category || 'General',
      minOrder: Number(payload.minOrder) || 1,
      stock: Number(payload.stock) || 0,
      inStock: payload.inStock !== false,
    });
    setProducts((prev) => [...prev, created]);
    return created;
  }, []);

  const updateProduct = useCallback(async (id, payload) => {
    const updated = await productApi.update(id, {
      name: payload.name,
      description: payload.description || '',
      price: Number(payload.price) || 0,
      imageUrl: payload.image || payload.imageUrl || null,
      category: payload.category || 'General',
      minOrder: Number(payload.minOrder) || 1,
      stock: Number(payload.stock) || 0,
      inStock: payload.inStock !== false,
    });
    setProducts((prev) => prev.map((p) => (String(p.id) === String(id) ? updated : p)));
    return updated;
  }, []);

  const removeProduct = useCallback(async (id) => {
    await productApi.delete(id);
    setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
  }, []);

  const getOrdersForCustomer = useCallback(
    (customer) => {
      const email = (customer?.email || '').toLowerCase();
      return orders.filter((o) => (o.email || '').toLowerCase() === email);
    },
    [orders]
  );

  const dashboardStats = useMemo(() => {
    const totalRevenue = orders.reduce((s, o) => s + parseAmount(o.amount), 0);
    const uniqueCustomers = new Set(orders.map((o) => o.email)).size;
    return {
      totalRevenue,
      totalOrders: orders.length,
      activeCustomers: uniqueCustomers,
      productCount: products.length,
    };
  }, [orders, products.length]);

  const topProductsFromOrders = useMemo(() => {
    const map = new Map();
    for (const o of orders) {
      const key = o.product || 'Unknown';
      const prev = map.get(key) || { sales: 0, revenue: 0 };
      prev.sales += 1;
      prev.revenue += parseAmount(o.amount);
      map.set(key, prev);
    }
    return [...map.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);
  }, [orders]);

  const value = useMemo(
    () => ({
      products,
      productsLoading,
      productsError,
      orders,
      customers,
      customersLoading,
      customersError,
      addProduct,
      updateProduct,
      removeProduct,
      getOrdersForCustomer,
      dashboardStats,
      topProductsFromOrders,
    }),
    [
      products,
      productsLoading,
      productsError,
      orders,
      customers,
      customersLoading,
      customersError,
      addProduct,
      updateProduct,
      removeProduct,
      getOrdersForCustomer,
      dashboardStats,
      topProductsFromOrders,
    ]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
