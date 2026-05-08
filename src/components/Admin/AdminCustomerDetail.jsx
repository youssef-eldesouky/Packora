import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Loader2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { userApi } from '../../utils/api';

function StatusBadge({ status }) {
  const s = (status || '').toLowerCase();
  return <span className={`admin-badge ${s}`}>{s}</span>;
}

function formatRole(role) {
  if (!role) return 'User';
  return role
    .replace(/^ROLE_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminCustomerDetail() {
  const { customerId } = useParams();
  const { getOrdersForCustomer } = useAdmin();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch fresh user data from backend
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    userApi
      .getById(customerId)
      .then((u) => {
        if (cancelled) return;
        setCustomer({
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
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load user');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [customerId]);

  const orders = customer ? getOrdersForCustomer(customer) : [];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <Loader2 size={32} className="profile-spinner" />
        <p>Loading user details…</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <>
        <p style={{ color: 'var(--danger, #ef4444)', padding: '1rem' }}>
          {error || 'Customer not found.'}
        </p>
        <Link to="/admin/customers" className="admin-link">
          Back to customers
        </Link>
      </>
    );
  }

  return (
    <>
      <Link to="/admin/customers" className="admin-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem' }}>
        <ArrowLeft size={16} />
        All customers
      </Link>
      <h1 className="admin-page-title">{customer.name}</h1>
      <p className="admin-page-sub">{customer.businessName}</p>

      <div className="admin-card" style={{ marginBottom: '1.25rem' }}>
        <div className="admin-customer-contact" style={{ marginBottom: 0 }}>
          <span>
            <Mail size={14} />
            {customer.email}
          </span>
          <span>
            <Phone size={14} />
            {customer.phone}
          </span>
        </div>
        <div className="admin-customer-stats" style={{ marginTop: '1rem' }}>
          <div>
            Role
            <strong>{formatRole(customer.role)}</strong>
          </div>
          <div>
            Member since
            <strong>{customer.memberSince}</strong>
          </div>
        </div>
      </div>

      <h2 className="admin-page-title" style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>
        Orders for this customer
      </h2>
      {orders.length === 0 ? (
        <p className="admin-page-sub" style={{ marginTop: 0 }}>
          No orders match this account email in the current order list.
        </p>
      ) : (
        <section className="admin-card">
          {orders.map((o) => (
            <div key={o.id} className="admin-order-row">
              <div>
                <div>
                  <span className="admin-order-id">{o.id}</span>
                  <StatusBadge status={o.status} />
                </div>
                <div className="admin-order-meta">{o.product}</div>
              </div>
              <div className="admin-order-right">
                <div className="admin-order-price">{o.amount}</div>
                <div className="admin-order-date">{o.date}</div>
              </div>
            </div>
          ))}
        </section>
      )}
    </>
  );
}
