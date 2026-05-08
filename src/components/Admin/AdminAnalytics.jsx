import React, { useMemo, useState } from 'react';
import { DollarSign, LineChart, Users, Package } from 'lucide-react';
import { formatMoney } from '../../utils/adminFormat';
import { useAdmin } from '../../context/AdminContext';

export default function AdminAnalytics() {
  const { orders } = useAdmin();
  const [range, setRange] = useState('6m');

  const summary = useMemo(() => {
    const totalRevenue = orders.reduce((s, o) => s + (o.rawAmount || 0), 0);
    return {
      totalRevenue,
      totalOrders: orders.length,
    };
  }, [orders]);

  const kpiCards = [
    { key: 'aov', label: 'Average Order Value', icon: DollarSign, value: summary.totalOrders ? formatMoney(summary.totalRevenue / summary.totalOrders) : '$0', change: '', up: true },
    { key: 'sold', label: 'Total Orders', icon: Package, value: summary.totalOrders, change: '', up: true },
  ];

  return (
    <>
      <h1 className="admin-page-title">Analytics &amp; Reports</h1>
      <p className="admin-page-sub">Track performance metrics and business insights</p>

      <div className="admin-analytics-kpi-grid">
        {kpiCards.map(({ key, label, icon: Icon, value, change, up }) => (
          <div key={key} className="admin-stat-card">
            <div className="admin-stat-icon green" style={{ marginBottom: '0.65rem' }}>
              <Icon size={20} />
            </div>
            <p className="admin-stat-value" style={{ fontSize: '1.35rem' }}>
              {value}
            </p>
            <p className="admin-stat-label">{label}</p>
          </div>
        ))}
      </div>

      <div className="admin-analytics-bottom">
        <section className="admin-card">
          <div className="admin-card-head">
            <h2>Revenue Overview</h2>
            <div className="admin-toggle" role="group" aria-label="Time range">
              <button
                type="button"
                className={range === '6m' ? 'active' : ''}
                onClick={() => setRange('6m')}
              >
                6M
              </button>
              <button
                type="button"
                className={range === '1y' ? 'active' : ''}
                onClick={() => setRange('1y')}
              >
                1Y
              </button>
            </div>
          </div>
          <div className="admin-bar-chart" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
            <p>Historical chart data will be available once more data is collected.</p>
          </div>
          <div className="admin-rev-footer">
            <div>
              Total Revenue
              <strong>{formatMoney(summary.totalRevenue)}</strong>
            </div>
            <div>
              Total Orders
              <strong>{summary.totalOrders.toLocaleString()}</strong>
            </div>
          </div>
        </section>
      </div>

      <div className="admin-breakdown-grid">
        <section className="admin-card">
          <div className="admin-card-head">
            <h2>Order status breakdown</h2>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
            <p>Live status breakdown coming soon.</p>
          </div>
        </section>
      </div>
    </>
  );
}
