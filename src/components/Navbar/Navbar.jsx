import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Package,
  LayoutGrid,
  Box,
  Truck,
  ShoppingCart,
  HelpCircle,
  User,
  LogOut,
  Share2,
  House,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const navItems = [
  { to: '/LandingPage', label: 'Home', icon: House, match: '/LandingPage' },
  { to: '/HomePage', label: 'Dashboard', icon: LayoutGrid, match: '/HomePage' },
  { to: '/Catalog', label: 'Catalog', icon: Box, match: '/Catalog' },
  { to: '/Track', label: 'Track', icon: Truck, match: '/Track' },
  { to: '/Cart', label: 'Cart', icon: ShoppingCart, match: '/Cart' },
  { to: '/Support', label: 'Support', icon: HelpCircle, match: '/Support' },
  { to: '/Profile', label: 'Profile', icon: User, match: '/Profile' },
];

export default function Navbar() {
  const location = useLocation();
  const { cartItems } = useCart();
  const currentPath = location.pathname;

  const isActive = (matchPath) => currentPath === matchPath || currentPath.startsWith(`${matchPath}/`);

  return (
    <header className="global-navbar">
      <Link to="/HomePage" className="global-navbar-logo">
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

        <Link to="/" className="global-navbar-item">
          <LogOut size={18} />
          Logout
        </Link>
      </nav>

      <button type="button" className="global-navbar-share">
        <Share2 size={18} />
        Share
      </button>
    </header>
  );
}
