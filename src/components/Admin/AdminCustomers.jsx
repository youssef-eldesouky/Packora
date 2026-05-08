import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Mail, Phone, Loader2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

function roleClass(role) {
  const r = (role || '').toUpperCase();
  if (r === 'ADMIN') return 'platinum';
  if (r === 'BUSINESS_OWNER') return 'gold';
  if (r === 'SUPPORT_STAFF') return 'silver';
  return 'bronze';
}

function formatRole(role) {
  if (!role) return 'User';
  return role
    .replace(/^ROLE_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminCustomers() {
  const { customers, customersLoading, customersError } = useAdmin();
  const [q, setQ] = useState('');

  const stats = useMemo(() => {
    const admins = customers.filter((c) => (c.role || '').toUpperCase() === 'ADMIN').length;
    const businessOwners = customers.filter(
      (c) => (c.role || '').toUpperCase() === 'BUSINESS_OWNER'
    ).length;
    return {
      total: customers.length,
      admins,
      businessOwners,
      other: customers.length - admins - businessOwners,
    };
  }, [customers]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(term) ||
        (c.businessName || '').toLowerCase().includes(term) ||
        (c.email || '').toLowerCase().includes(term)
    );
  }, [customers, q]);

  if (customersLoading) {
    return (
      <>
        <h1 className="admin-page-title">Manage Customers</h1>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Loader2 size={32} className="profile-spinner" />
          <p>Loading users…</p>
        </div>
      </>
    );
  }

  if (customersError) {
    return (
      <>
        <h1 className="admin-page-title">Manage Customers</h1>
        <p style={{ color: 'var(--danger, #ef4444)', padding: '1rem' }}>{customersError}</p>
      </>
    );
  }

  return (
    <>
      <h1 className="admin-page-title">Manage Customers</h1>
      <p className="admin-page-sub">View and manage customer accounts.</p>

      <div className="admin-toolbar" style={{ marginBottom: '1rem' }}>
        <div className="admin-search-wrap">
          <Search size={18} />
          <input
            className="admin-search"
            placeholder="Search by name, business, or email..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search customers"
          />
        </div>
      </div>

      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <p className="admin-stat-value">{stats.total}</p>
          <p className="admin-stat-label">Total Users</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-value">{stats.admins}</p>
          <p className="admin-stat-label">Admins</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-value">{stats.businessOwners}</p>
          <p className="admin-stat-label">Business Owners</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-value">{stats.other}</p>
          <p className="admin-stat-label">Other Roles</p>
        </div>
      </div>

      <div className="admin-customer-grid">
        {filtered.map((c) => (
          <Link key={c.id} to={`/admin/customers/${c.id}`} className="admin-customer-card">
            <div className="admin-customer-top">
              <div>
                <h3>{c.name}</h3>
                <div className="biz">{c.businessName}</div>
              </div>
              <span className={`admin-tier ${roleClass(c.role)}`}>{formatRole(c.role)}</span>
            </div>
            <div className="admin-customer-contact">
              <span>
                <Mail size={14} />
                {c.email}
              </span>
              <span>
                <Phone size={14} />
                {c.phone}
              </span>
            </div>
            <div className="admin-member-since">Member since {c.memberSince}</div>
          </Link>
        ))}
      </div>
    </>
  );
}
