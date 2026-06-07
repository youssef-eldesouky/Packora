import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Truck,
  ShoppingCart,
  HelpCircle,
  BarChart3,
  Box,
  Palette,
  Leaf,
  UploadCloud,
} from 'lucide-react';
import { productApi, orderApi } from '../../utils/api';
import Navbar from '../Navbar/Navbar';
import './Homepage.css';
import Footer from '../Footer/Footer';

// Category display names and descriptions
const categoryLabels = {
  Boxes: 'Durable shipping solutions.',
  'Eco-Friendly': 'Sustainable materials.',
  Protective: 'Bubble wrap & fillers.',
  Mailers: 'Lightweight shipping mailers.',
};

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    productApi
      .getAll()
      .then((data) => {
        if (!cancelled) setProducts(data.slice(0, 8));
      })
      .catch(() => {
        /* silent — homepage still renders without product data */
      });

    orderApi
      .getMyOrders()
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch(() => { })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  // Derive categories from real product data
  const categoryDisplay = {};
  products.forEach((p) => {
    if (p.category && !categoryDisplay[p.category]) {
      categoryDisplay[p.category] = p;
    }
  });
  const categories = Object.entries(categoryDisplay).map(([cat, prod]) => ({
    category: cat,
    ...prod,
  }));

  const inTransitCount = orders.filter(o => o.status === 'shipped').length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.rawAmount || 0), 0);

  const metricIcons = [
    { icon: ShoppingCart, color: 'var(--primary)', label: 'Total Orders', value: ordersLoading ? '-' : String(orders.length), change: '+12%' },
    { icon: Truck, color: 'var(--secondary)', label: 'In Transit', value: ordersLoading ? '-' : String(inTransitCount), change: '+8%' },
    { icon: Box, color: 'var(--accent)', label: 'Total Products', value: String(products.length), change: '+5%' },
    { icon: BarChart3, color: 'var(--chart-4)', label: 'Spent', value: ordersLoading ? '-' : `$${totalSpent.toFixed(2)}`, change: '+18%' },
  ];

  return (
    <div className="homepage">
      <Navbar />

      {/* Main content */}
      <main className="home-main">
        <div className="home-hero">
          <h1 className="home-title">Dashboard</h1>
          <p className="home-welcome">
            Welcome back! Here&apos;s what&apos;s happening with your packaging orders.
          </p>
        </div>



        {/* Metrics cards */}
        <div className="metrics-grid">
          {metricIcons.map(({ icon: Icon, color, label, value, change }) => (
            <div key={label} className="metric-card">
              <div className="metric-icon" style={{ backgroundColor: color }}>
                <Icon size={24} color="white" />
              </div>
              <div className="metric-content">
                <p className="metric-label">{label}</p>
                <p className="metric-value">{value}</p>
                <p className="metric-change">{change} this month</p>
              </div>
            </div>
          ))}
        </div>
        {/* New Feature: 3D Customizer */}
        <section className="new-feature">
          <div className="new-feature-content">
            <div className="new-feature-header">
              <span className="new-feature-badge">
                <Palette size={14} />
                New Feature
              </span>
            </div>
            <h2 className="new-feature-title">Design Your Custom Box in 3D</h2>
            <p className="new-feature-desc">
              Use our interactive 3D customizer to design your perfect packaging.Change colors,
              upload logos, add patterns, and see your design come to life in real-time.
            </p>
            <Link to="/Design" className="launch-3d-btn">
              <Box size={18} />
              Launch 3D Customizer
            </Link>
          </div>
          <div className="new-feature-visual">
            <div className="box-3d-icon">
              <Box size={80} strokeWidth={1.5} />
            </div>
          </div>
        </section>

        <div className="home-grid">
          {/* Quick Actions */}
          <section className="recent-orders">
            <div className="section-header">
              <h2>Recent Orders</h2>
              <Link to="/Track" className="view-all">View All →</Link>
            </div>
            <div className="orders-list">
              {ordersLoading ? (
                <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Loading orders...</p>
              ) : orders.length === 0 ? (
                <div className="empty-orders">
                  <Package size={32} />
                  <p>No orders yet</p>
                  <Link to="/Catalog" className="action-btn outline">Start Shopping</Link>
                </div>
              ) : (
                orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="order-row">
                    <div className="order-info">
                      <p className="order-id">{order.id}</p>
                      <p className="order-product">{order.product}</p>
                    </div>
                    <div className="order-status-wrap">
                      <span className={`status-badge ${order.status}`}>
                        {order.status}
                      </span>
                      <p className="order-date">{order.date}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
          <section className="quick-actions">
            <h2>Quick Actions</h2>
            <Link to="/Catalog" className="action-btn primary">
              <Box size={18} />
              Browse Catalog
            </Link>
            <Link to="/Cart" className="action-btn">
              <ShoppingCart size={18} />
              View Cart
            </Link>
            <Link to="/Track" className="action-btn">
              <Truck size={18} />
              Track Orders
            </Link>
            <Link to="/BulkOrder" className="action-btn">
              <UploadCloud size={18} />
              Bulk Upload
            </Link>
            <Link to="/Support" className="action-btn">
              <HelpCircle size={18} />
              Get Support
            </Link>
          </section>

          {/* Recent Orders Widget */}

        </div>

        {/* Browse by Category - from real API data */}
        {categories.length > 0 && (
          <section className="browse-section">
            <div className="section-header">
              <h2>Browse by Category</h2>
              <Link to="/Catalog" className="view-all">See All →</Link>
            </div>
            <div className="category-grid">
              {categories.map((item) => (
                <Link key={item.id} to={`/Catalog/${item.id}`} className="category-card">
                  <div className="category-image-wrap">
                    <img src={item.image} alt={item.category} />
                    <div className="category-icon-overlay">
                      {item.category === 'Eco-Friendly' ? (
                        <Leaf size={20} color="white" />
                      ) : (
                        <Package size={20} color="white" />
                      )}
                    </div>
                  </div>
                  <h3 className="category-title">{item.category}</h3>
                  <p className="category-desc">
                    {categoryLabels[item.category] || item.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>
    
    </div>
  );
}
