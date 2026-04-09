import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Mail, Phone } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

function tierClass(tier) {
  const t = (tier || '').toLowerCase();
  if (t === 'platinum') return 'platinum';
  if (t === 'gold') return 'gold';
  if (t === 'silver') return 'silver';
  if (t === 'bronze') return 'bronze';
  return '';
}

export default function AdminCustomers() {
  const { customers } = useAdmin();
  const [q, setQ] = useState('');

  const stats = useMemo(() => {
    const platinum = customers.filter((c) => (c.tier || '').toLowerCase() === 'platinum').length;
    const gold = customers.filter((c) => (c.tier || '').toLowerCase() === 'gold').length;
    return {
      total: customers.length,
      platinum,
      gold,
      newThisMonth: 12,
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
          <p className="admin-stat-label">Total Customers</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-value">{stats.platinum}</p>
          <p className="admin-stat-label">Platinum Tier</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-value">{stats.gold}</p>
          <p className="admin-stat-label">Gold Tier</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-value">{stats.newThisMonth}</p>
          <p className="admin-stat-label">New This Month</p>
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
              <span className={`admin-tier ${tierClass(c.tier)}`}>{c.tier}</span>
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
            <div className="admin-member-since">Member since {c.memberSince}</div>
          </Link>
        ))}
      </div>
    </>
  );
}
