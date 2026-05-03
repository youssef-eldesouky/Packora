import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, Package } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

function StatusBadge({ status }) {
  const s = (status || '').toLowerCase();
  return <span className={`admin-badge ${s}`}>{s}</span>;
}

export default function AdminOrderDetail() {
  const { orderId } = useParams();
  const { orders, customers } = useAdmin();

  const order = useMemo(() => {
    const decoded = decodeURIComponent(orderId || '');
    return orders.find((o) => o.id === orderId || o.id === decoded);
  }, [orders, orderId]);

  const customerRecord = useMemo(
    () => customers.find((c) => (c.email || '').toLowerCase() === (order?.email || '').toLowerCase()),
    [customers, order]
  );

  if (!order) {
    return (
      <>
        <Link to="/admin/orders" className="admin-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem' }}>
          <ArrowLeft size={16} />
          Back to orders
        </Link>
        <h1 className="admin-page-title">Order not found</h1>
        <p className="admin-page-sub">This order ID is not in the current list.</p>
      </>
    );
  }

  return (
    <>
      <Link to="/admin/orders" className="admin-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem' }}>
        <ArrowLeft size={16} />
        All orders
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>
          {order.id}
        </h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="admin-page-sub">Placed {order.date}</p>

      <div className="admin-card" style={{ marginBottom: '1rem' }}>
        <h2 className="admin-page-title" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
          Amount
        </h2>
        <p className="admin-stat-value" style={{ margin: 0 }}>
          {order.amount}
        </p>
      </div>

      <div className="admin-card" style={{ marginBottom: '1rem' }}>
        <h2 className="admin-page-title" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
          Customer
        </h2>
        <p style={{ margin: '0 0 0.35rem', fontWeight: 600 }}>{order.customer}</p>
        <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--admin-muted)', fontSize: '0.9rem' }}>
          <Mail size={16} />
          {order.email}
        </p>
        {customerRecord && (
          <p style={{ marginTop: '0.75rem' }}>
            <Link to={`/admin/customers/${customerRecord.id}`} className="admin-link">
              View customer profile
            </Link>
          </p>
        )}
      </div>

      <div className="admin-card" style={{ marginBottom: '1rem' }}>
        <h2 className="admin-page-title" style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Package size={18} />
          Product &amp; quantity
        </h2>
        <p style={{ margin: '0 0 0.35rem' }}>{order.product}</p>
        {order.quantity != null && (
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--admin-muted)' }}>Quantity: {order.quantity}</p>
        )}
      </div>

      <div className="admin-card">
        <h2 className="admin-page-title" style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <MapPin size={18} />
          Shipping address
        </h2>
        <p style={{ margin: 0 }}>{order.address || '—'}</p>
      </div>
    </>
  );
}
