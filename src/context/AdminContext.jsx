import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAdminAuth } from './AdminAuthContext';

import { userApi, productApi, orderApi, adminAnalyticsApi } from '../utils/api';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const { isAdmin } = useAdminAuth();

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    setOrdersLoading(true);
    setOrdersError(null);

    orderApi
      .getAll()
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((err) => {
        if (!cancelled) setOrdersError(err.message || 'Failed to load orders');
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  // ── Products: fetched from backend /api/products ──────────────
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
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
  }, [isAdmin]);

  // ── Customers: fetched from backend /api/users (ADMIN) ────────
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
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
  }, [isAdmin]);

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
      return orders.filter((o) => (o.userEmail || '').toLowerCase() === email);
    },
    [orders]
  );

  // ── Dashboard Analytics (from backend) ──────────────────────
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeCustomers: 0,
    productCount: 0,
  });
  const [topProductsFromOrders, setTopProductsFromOrders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [revenueChart, setRevenueChart] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    setDashboardLoading(true);
    setDashboardError(null);

    Promise.all([
      adminAnalyticsApi.getDashboard(),
      adminAnalyticsApi.getRevenueChart(6)
    ])
      .then(([dashboardData, chartData]) => {
        if (!cancelled) {
          setDashboardStats(dashboardData.stats || {});
          setTopProductsFromOrders(dashboardData.topProducts || []);
          setRecentOrders(dashboardData.recentOrders || []);
          setRevenueChart(chartData || []);
        }
      })
      .catch((err) => {
        if (!cancelled) setDashboardError(err.message || 'Failed to load dashboard data');
      })
      .finally(() => {
        if (!cancelled) setDashboardLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const value = useMemo(
    () => ({
      products,
      productsLoading,
      productsError,
      orders,
      ordersLoading,
      ordersError,
      customers,
      customersLoading,
      customersError,
      addProduct,
      updateProduct,
      removeProduct,
      getOrdersForCustomer,
      dashboardStats,
      topProductsFromOrders,
      recentOrders,
      revenueChart,
      dashboardLoading,
      dashboardError,
    }),
    [
      products,
      productsLoading,
      productsError,
      orders,
      ordersLoading,
      ordersError,
      customers,
      customersLoading,
      customersError,
      addProduct,
      updateProduct,
      removeProduct,
      getOrdersForCustomer,
      dashboardStats,
      topProductsFromOrders,
      recentOrders,
      revenueChart,
      dashboardLoading,
      dashboardError,
    ]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
