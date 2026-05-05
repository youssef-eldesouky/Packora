import React from 'react';
import { Link, useLocation, /* useNavigate */ } from 'react-router-dom';
import {
  Package,
  LayoutGrid,
  Box,
  Truck,
  ShoppingCart,
  HelpCircle,
  User,
  LogOut,
  LogIn,
  House,
  Wand,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import './Navbar.css';

const baseNavItems = [
  { to: '/', label: 'Home', icon: House, match: '/' },
  { to: '/HomePage', label: 'Dashboard', icon: LayoutGrid, match: '/HomePage' },
  { to: '/Catalog', label: 'Catalog', icon: Box, match: '/Catalog' },
  { to: '/Design', label: 'Create New Box', icon: Wand, match: '/Design' },
  { to: '/Track', label: 'Track', icon: Truck, match: '/Track' },
  { to: '/Cart', label: 'Cart', icon: ShoppingCart, match: '/Cart' },
  { to: '/Support', label: 'Support', icon: HelpCircle, match: '/Support' },
];

const profileNavItem = { to: '/Profile', label: 'Profile', icon: User, match: '/Profile' };

export default function Navbar() {
  const location = useLocation();
  //const navigate = useNavigate();
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const { logoutAdmin } = useAdminAuth();
  const currentPath = location.pathname;

  const isActive = (matchPath) => {
    if (matchPath === '/') {
      return currentPath === '/' || currentPath === '/LandingPage';
    }
    return currentPath === matchPath || currentPath.startsWith(`${matchPath}/`);
  };

  const handleLogout = () => {
    logout();
    logoutAdmin();
    // Force a hard navigation to the landing page
    window.location.href = '/';
  };

  const navItems = user ? [...baseNavItems, profileNavItem] : baseNavItems;

  return (
    <header className="global-navbar">
      <Link to="/" className="global-navbar-logo">
        <div className="global-navbar-logo-icon">
          <Package size={24} color="white" />
        </div>
        <span>Packora</span>
      </Link>

      <nav className="global-navbar-nav">
        {navItems.map(({ to, label, icon: Icon, match }) => (
          <Link
            key={to}
            to={to}
            className={`global-navbar-item ${isActive(match) ? 'active' : ''} ${
              label === 'Cart' && cartItems.length > 0 ? 'has-badge' : ''
            }`}
          >
            <Icon size={18} />
            {label}
            {label === 'Cart' && cartItems.length > 0 && (
              <span className="global-navbar-badge">{cartItems.length}</span>
            )}
          </Link>
        ))}
      </nav>

      <div className="global-navbar-right">
        {user && (
          <Link to="/Profile" className="global-navbar-user-block" title="Profile">
            <span className="global-navbar-user-icon" aria-hidden>
              <User size={18} />
            </span>
            <span className="global-navbar-user">{user.displayName}</span>
          </Link>
        )}
        {user ? (
          <button type="button" className="global-navbar-item global-navbar-logout" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        ) : (
          <Link to="/login" className="global-navbar-item global-navbar-login">
            <LogIn size={18} />
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
