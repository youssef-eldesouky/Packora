import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingCart, Users, Package, MoreVertical, TrendingUp, TrendingDown } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { formatMoney } from '../../utils/adminFormat';
import { guessProductIdFromLabel } from '../../utils/adminProductMatch';

function StatusBadge({ status }) {
  const s = (status || '').toLowerCase();
  return <span className={`admin-badge ${s}`}>{s}</span>;
}

export default function AdminDashboard() {
  const { orders, products, dashboardStats, topProductsFromOrders } = useAdmin();
  const recent = [...orders].slice(0, 5);

  const trends = [
    { up: true, text: '+12.5% vs last month' },
    { up: true, text: '+8.2% vs last month' },
    { up: true, text: '+15.3% vs last month' },
    { up: false, text: '-2.1% vs last month' },
  ];

  const statCards = [
    {
      to: '/admin/insights/revenue',
      icon: DollarSign,
      iconClass: 'green',
      value: formatMoney(dashboardStats.totalRevenue),
      label: 'Total Revenue',
      trend: trends[0],
    },
    {
      to: '/admin/insights/orders',
      icon: ShoppingCart,
      iconClass: 'purple',
      value: dashboardStats.totalOrders.toLocaleString(),
      label: 'Total Orders',
      trend: trends[1],
    },
    {
      to: '/admin/insights/customers',
      icon: Users,
      iconClass: 'slate',
      value: dashboardStats.activeCustomers,
      label: 'Active Customers',
      trend: trends[2],
    },
    {
      to: '/admin/insights/products',
      icon: Package,
      iconClass: 'rose',
      value: dashboardStats.productCount,
      label: 'Products',
      trend: trends[3],
    },
  ];

  return (
    <>
      <h1 className="admin-page-title">Admin Dashboard</h1>
      <p className="admin-page-sub">Monitor and manage your packaging business operations.</p>

      <div className="admin-stat-grid">
        {statCards.map(({ to, icon: Icon, iconClass, value, label, trend }) => (
          <Link key={to} to={to} className="admin-stat-card admin-stat-card--clickable">
            <span className="admin-stat-menu" aria-hidden>
              <MoreVertical size={18} />
            </span>
            <div className={`admin-stat-icon ${iconClass}`}>
              <Icon size={20} />
            </div>
            <p className="admin-stat-value">{value}</p>
            <p className="admin-stat-label">{label}</p>
            <span className={`admin-stat-trend ${trend.up ? 'up' : 'down'}`}>
              {trend.up ? '↗' : '↘'} {trend.text}
            </span>
          </Link>
        ))}
      </div>

      <div className="admin-dash-grid">
        <section className="admin-card">
          <div className="admin-card-head">
            <h2>Recent Orders</h2>
            <Link to="/admin/orders" className="admin-link">
              View All Orders
            </Link>
          </div>
          {recent.map((o) => (
            <Link key={o.id} to={`/admin/orders/${encodeURIComponent(o.id)}`} className="admin-order-row admin-order-row--link">
              <div>
                <div>
                  <span className="admin-order-id">{o.id}</span>
                  <StatusBadge status={o.status} />
                </div>
                <div className="admin-order-meta">
                  <strong>{o.customer}</strong>
                  {' · '}
                  {o.product}
                </div>
              </div>
              <div className="admin-order-right">
                <div className="admin-order-price">{o.amount}</div>
                <div className="admin-order-date">{o.date}</div>
              </div>
            </Link>
          ))}
        </section>

        <section className="admin-card">
          <div className="admin-card-head">
            <h2>Top Products</h2>
            <Link to="/admin/products" className="admin-link">
              View All
            </Link>
          </div>
          {topProductsFromOrders.map((p, i) => {
            const pid = guessProductIdFromLabel(products, p.name);
            const inner = (
              <>
                <span className="admin-rank-num">{i + 1}</span>
                <div className="admin-rank-body">
                  <div className="admin-rank-name">{p.name}</div>
                  <div className="admin-rank-sales">
                    {p.sales} sales
                    {i % 2 === 1 ? (
                      <TrendingDown size={14} className="admin-stat-trend down" />
                    ) : (
                      <TrendingUp size={14} className="admin-stat-trend up" />
                    )}
                  </div>
                </div>
                <div className="admin-rank-rev">{formatMoney(p.revenue)}</div>
              </>
            );
            return pid ? (
              <Link key={p.name} to={`/admin/products/${pid}`} className="admin-rank-row admin-rank-row--link">
                {inner}
              </Link>
            ) : (
              <Link key={p.name} to="/admin/insights/products" className="admin-rank-row admin-rank-row--link">
                {inner}
              </Link>
            );
          })}
        </section>
      </div>

      <h2 className="admin-page-title" style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>
        Quick Actions
      </h2>
      <div className="admin-quick-grid">
        <Link to="/admin/orders" className="admin-quick-card primary">
          <span className="admin-quick-icon">
            <ShoppingCart size={22} />
          </span>
          <span className="admin-quick-title">Manage Orders</span>
          <span className="admin-quick-sub">View and process orders</span>
        </Link>
        <Link to="/admin/products" className="admin-quick-card">
          <span className="admin-quick-icon">
            <Package size={22} />
          </span>
          <span className="admin-quick-title">Manage Products</span>
          <span className="admin-quick-sub">Add or edit products</span>
        </Link>
        <Link to="/admin/customers" className="admin-quick-card">
          <span className="admin-quick-icon">
            <Users size={22} />
          </span>
          <span className="admin-quick-title">Manage Customers</span>
          <span className="admin-quick-sub">View customer accounts</span>
        </Link>
        <Link to="/admin/analytics" className="admin-quick-card">
          <span className="admin-quick-icon">
            <TrendingUp size={22} />
          </span>
          <span className="admin-quick-title">Analytics</span>
          <span className="admin-quick-sub">View reports &amp; insights</span>
        </Link>
      </div>
    </>
  );
}
