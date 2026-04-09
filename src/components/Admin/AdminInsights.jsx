import React, { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { formatMoney, formatMoneyDecimal } from '../../utils/adminFormat';

const SLUGS = ['revenue', 'orders', 'customers', 'products'];

function StatusBadge({ status }) {
  const s = (status || '').toLowerCase();
  return <span className={`admin-badge ${s}`}>{s}</span>;
}

export default function AdminInsights() {
  const { slug } = useParams();
  const { orders, customers, products, dashboardStats } = useAdmin();

  const statusCounts = useMemo(() => {
    const c = {};
    for (const o of orders) {
      const k = (o.status || 'unknown').toLowerCase();
      c[k] = (c[k] || 0) + 1;
    }
    return c;
  }, [orders]);

  if (!SLUGS.includes(slug)) {
    return <Navigate to="/admin" replace />;
  }

  const title =
    slug === 'revenue'
      ? 'Total revenue'
      : slug === 'orders'
        ? 'Orders overview'
        : slug === 'customers'
          ? 'Active customers'
          : 'Products in catalog';

  return (
    <>
      <Link to="/admin" className="admin-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem' }}>
        <ArrowLeft size={16} />
        Dashboard
      </Link>
      <h1 className="admin-page-title">{title}</h1>
      <p className="admin-page-sub">Detailed breakdown from your current data.</p>

      {slug === 'revenue' && (
        <>
          <div className="admin-stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div className="admin-stat-card">
              <p className="admin-stat-value">{formatMoney(dashboardStats.totalRevenue)}</p>
              <p className="admin-stat-label">Sum of all order amounts</p>
            </div>
            <div className="admin-stat-card">
              <p className="admin-stat-value">{orders.length}</p>
              <p className="admin-stat-label">Orders contributing</p>
            </div>
          </div>
          <section className="admin-card" style={{ marginTop: '1.25rem' }}>
            <div className="admin-card-head">
              <h2>Revenue by order</h2>
              <Link to="/admin/analytics" className="admin-link">
                Open analytics
              </Link>
            </div>
            <div className="admin-table-wrap" style={{ border: 'none' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <Link to={`/admin/orders/${encodeURIComponent(o.id)}`} className="admin-link">
                          {o.id}
                        </Link>
                      </td>
                      <td>{o.customer}</td>
                      <td>{o.amount}</td>
                      <td>{o.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {slug === 'orders' && (
        <>
          <div className="admin-stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
            <div className="admin-stat-card">
              <p className="admin-stat-value">{dashboardStats.totalOrders}</p>
              <p className="admin-stat-label">Total orders</p>
            </div>
            {Object.entries(statusCounts).map(([k, v]) => (
              <div key={k} className="admin-stat-card">
                <p className="admin-stat-value">{v}</p>
                <p className="admin-stat-label" style={{ textTransform: 'capitalize' }}>
                  {k}
                </p>
              </div>
            ))}
          </div>
          <section className="admin-card" style={{ marginTop: '1.25rem' }}>
            <div className="admin-card-head">
              <h2>All orders</h2>
              <Link to="/admin/orders" className="admin-link">
                Manage orders
              </Link>
            </div>
            {orders.map((o) => (
              <Link
                key={o.id}
                to={`/admin/orders/${encodeURIComponent(o.id)}`}
                className="admin-order-row admin-order-row--link"
              >
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
        </>
      )}

      {slug === 'customers' && (
        <>
          <div className="admin-stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div className="admin-stat-card">
              <p className="admin-stat-value">{dashboardStats.activeCustomers}</p>
              <p className="admin-stat-label">Distinct customers (from orders)</p>
            </div>
            <div className="admin-stat-card">
              <p className="admin-stat-value">{customers.length}</p>
              <p className="admin-stat-label">Accounts on file</p>
            </div>
          </div>
          <section className="admin-card" style={{ marginTop: '1.25rem' }}>
            <div className="admin-card-head">
              <h2>Customer accounts</h2>
              <Link to="/admin/customers" className="admin-link">
                Manage customers
              </Link>
            </div>
            <div className="admin-customer-grid">
              {customers.map((c) => (
                <Link key={c.id} to={`/admin/customers/${c.id}`} className="admin-customer-card">
                  <div className="admin-customer-top">
                    <div>
                      <h3>{c.name}</h3>
                      <div className="biz">{c.businessName}</div>
                    </div>
                  </div>
                  <div className="admin-customer-stats">
                    <div>
                      Orders
                      <strong>{c.totalOrders}</strong>
                    </div>
                    <div>
                      Spent
                      <strong>{c.totalSpent}</strong>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      {slug === 'products' && (
        <>
          <div className="admin-stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div className="admin-stat-card">
              <p className="admin-stat-value">{dashboardStats.productCount}</p>
              <p className="admin-stat-label">SKUs in catalog</p>
            </div>
            <div className="admin-stat-card">
              <p className="admin-stat-value">
                {formatMoney(products.reduce((s, p) => s + p.price * p.stock, 0))}
              </p>
              <p className="admin-stat-label">Approx. inventory value (price × stock)</p>
            </div>
          </div>
          <section className="admin-card" style={{ marginTop: '1.25rem' }}>
            <div className="admin-card-head">
              <h2>Catalog</h2>
              <Link to="/admin/products" className="admin-link">
                Manage products
              </Link>
            </div>
            <div className="admin-table-wrap" style={{ border: 'none' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <Link to={`/admin/products/${p.id}`} className="admin-link">
                          {p.name}
                        </Link>
                      </td>
                      <td>{p.category}</td>
                      <td>{formatMoneyDecimal(p.price)}</td>
                      <td>{p.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  );
}
