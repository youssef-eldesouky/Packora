import React from 'react';
import { NavLink, Outlet, /* useNavigate */ } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  LineChart,
  LogOut,
  Box,
} from 'lucide-react';
import './Admin.css';
import { useAdminAuth } from '../../context/AdminAuthContext';

const nav = [
  { to: '/admin', end: true, label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/analytics', label: 'Analytics', icon: LineChart },
];

export default function AdminLayout() {
  //const navigate = useNavigate();
  const { logoutAdmin } = useAdminAuth();

  function handleLogout() {
    logoutAdmin();
    window.location.href = '/';
  }

  return (
    <div className="admin-root">
      <header className="admin-header">
        <div className="admin-header-inner">
          <NavLink to="/admin" className="admin-brand">
            <span className="admin-brand-icon">
              <Box size={22} strokeWidth={2} />
            </span>
            <span className="admin-brand-text">
              <strong>Packora Admin</strong>
              <span>Management Portal</span>
            </span>
          </NavLink>
          <nav className="admin-nav" aria-label="Admin">
            {nav.map(({ to, end, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <Icon size={18} strokeWidth={2} />
                {label}
              </NavLink>
            ))}
          </nav>
          <button type="button" className="admin-logout" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
