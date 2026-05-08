import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ordersSeed from '../mockdata/Orders.json';
import productsSeed from '../mockdata/product.json';
import { parseAmount } from '../utils/adminFormat';
import { userApi } from '../utils/api';

const STOCK_BY_INDEX = [2500, 1800, 850, 1200, 3000, 900];

function normalizeProducts() {
  return productsSeed.map((p, i) => ({
    id: String(p.id),
    name: p.name,
    description: p.description,
    price: typeof p.price === 'number' ? p.price : parseFloat(String(p.price), 10),
    image: p.image,
    category: p.category,
    minOrder: p.minOrder ?? 100,
    stock: STOCK_BY_INDEX[i] ?? 500,
  }));
}

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [products, setProducts] = useState(normalizeProducts);
  const orders = useMemo(() => ordersSeed, []);

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
          // If the user isn't admin, the call will 403 — that's expected
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

  const addProduct = useCallback((payload) => {
    const id = String(Date.now());
    setProducts((prev) => [
      ...prev,
      {
        id,
        name: payload.name,
        description: payload.description || '',
        price: Number(payload.price) || 0,
        image: payload.image || 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800',
        category: payload.category || 'General',
        minOrder: Number(payload.minOrder) || 1,
        stock: Number(payload.stock) || 0,
      },
    ]);
  }, []);

  const updateProduct = useCallback((id, payload) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...payload,
              price: payload.price != null ? Number(payload.price) : p.price,
              minOrder: payload.minOrder != null ? Number(payload.minOrder) : p.minOrder,
              stock: payload.stock != null ? Number(payload.stock) : p.stock,
            }
          : p
      )
    );
  }, []);

  const removeProduct = useCallback((id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
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
