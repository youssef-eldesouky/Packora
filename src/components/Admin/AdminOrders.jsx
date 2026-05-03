import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, Clock, Truck, CheckCircle2, Eye } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

function StatusCell({ status }) {
  const s = (status || '').toLowerCase();
  const icon =
    s === 'processing' || s === 'pending' ? (
      <Clock size={12} />
    ) : s === 'shipped' ? (
      <Truck size={12} />
    ) : s === 'delivered' ? (
      <CheckCircle2 size={12} />
    ) : null;
  return (
    <span className={`admin-badge ${s}`}>
      {icon}
      {s}
    </span>
  );
}

function exportCsv(rows) {
  const headers = ['Order ID', 'Customer', 'Email', 'Product', 'Amount', 'Status', 'Date'];
  const lines = [
    headers.join(','),
    ...rows.map((o) =>
      [
        o.id,
        `"${(o.customer || '').replace(/"/g, '""')}"`,
        o.email,
        `"${(o.product || '').replace(/"/g, '""')}"`,
        o.amount,
        o.status,
        o.date,
      ].join(',')
    ),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'packora-orders.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminOrders() {
  const { orders } = useAdmin();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');

  const counts = useMemo(() => {
    const c = { all: orders.length };
    for (const o of orders) {
      const k = (o.status || '').toLowerCase();
      c[k] = (c[k] || 0) + 1;
    }
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return orders.filter((o) => {
      const st = (o.status || '').toLowerCase();
      if (filter !== 'all' && st !== filter) return false;
      if (!term) return true;
      return (
        (o.id || '').toLowerCase().includes(term) ||
        (o.customer || '').toLowerCase().includes(term) ||
        (o.email || '').toLowerCase().includes(term) ||
        (o.product || '').toLowerCase().includes(term)
      );
    });
  }, [orders, q, filter]);

  const pills = [
    { key: 'all', label: 'All Orders' },
    { key: 'pending', label: 'Pending' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <>
      <h1 className="admin-page-title">Manage Orders</h1>
      <p className="admin-page-sub">View and manage all customer orders</p>

      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <Search size={18} />
          <input
            className="admin-search"
            placeholder="Search by order ID, customer, or email..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search orders"
          />
        </div>
        <button type="button" className="admin-btn admin-btn-ghost" onClick={() => exportCsv(filtered)}>
          <Download size={18} />
          Export
        </button>
      </div>

      <div className="admin-pills">
        {pills.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`admin-pill ${filter === key ? 'active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label} ({counts[key] ?? 0})
          </button>
        ))}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>
                  {o.customer}
                  <div className="cell-muted">{o.email}</div>
                </td>
                <td>{o.product}</td>
                <td>{o.amount}</td>
                <td>
                  <StatusCell status={o.status} />
                </td>
                <td>{o.date}</td>
                <td>
                  <Link to={`/admin/orders/${encodeURIComponent(o.id)}`} className="admin-table-action">
                    <Eye size={14} />
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
