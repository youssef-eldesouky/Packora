import React, { useMemo, useState } from 'react';
import { DollarSign, LineChart, Users, Package } from 'lucide-react';
import {
  analyticsKpis,
  revenueSixMonths,
  revenueOneYear,
  topCategories,
  summarizeRevenue,
} from '../../Data/adminAnalytics';
import { formatMoney } from '../../utils/adminFormat';

export default function AdminAnalytics() {
  const [range, setRange] = useState('6m');

  const rows = range === '6m' ? revenueSixMonths : revenueOneYear;
  const maxOrders = useMemo(() => Math.max(...rows.map((r) => r.orders), 1), [rows]);
  const summary = useMemo(() => summarizeRevenue(rows), [rows]);

  const orderStatus = [
    { label: 'Delivered', count: 845, pct: 67 },
    { label: 'Shipped', count: 234, pct: 19 },
    { label: 'Processing', count: 128, pct: 10 },
    { label: 'Pending', count: 49, pct: 4 },
  ];

  const tiers = [
    { label: 'Platinum', count: 45, pct: 13 },
    { label: 'Gold', count: 89, pct: 26 },
    { label: 'Silver', count: 126, pct: 37 },
    { label: 'Bronze', count: 82, pct: 24 },
  ];

  const regions = [
    { label: 'Northeast', rev: '$128,400' },
    { label: 'West Coast', rev: '$96,200' },
    { label: 'Midwest', rev: '$74,800' },
    { label: 'Southeast', rev: '$36,000' },
  ];

  const kpiCards = [
    { key: 'aov', label: 'Average Order Value', icon: DollarSign, ...analyticsKpis.averageOrderValue },
    { key: 'conv', label: 'Conversion Rate', icon: LineChart, ...analyticsKpis.conversionRate },
    { key: 'ret', label: 'Customer Retention', icon: Users, ...analyticsKpis.customerRetention },
    { key: 'sold', label: 'Products Sold', icon: Package, ...analyticsKpis.productsSold },
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
            <span className={`admin-stat-trend ${up ? 'up' : 'down'}`}>
              {up ? '↗' : '↘'} {change} vs last month
            </span>
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
          <div className="admin-bar-chart">
            {rows.map((r) => {
              const greenPct = Math.max(22, Math.round((r.orders / maxOrders) * 72));
              return (
                <div key={r.month} className="admin-bar-row">
                  <span>{r.month}</span>
                  <div className="admin-bar-track" style={{ flex: 1 }}>
                    <div className="admin-bar-orders" style={{ width: `${greenPct}%` }}>
                      {r.orders} orders
                    </div>
                    <div className="admin-bar-rest" />
                  </div>
                  <span className="admin-bar-rev">
                    {r.revenue >= 1000 ? `$${(r.revenue / 1000).toFixed(1)}k` : `$${r.revenue}`}
                  </span>
                </div>
              );
            })}
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
            <div>
              Growth
              <strong className="admin-stat-trend up">+24.5%</strong>
            </div>
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-card-head">
            <h2>Top Categories</h2>
          </div>
          {topCategories.map((c) => (
            <div key={c.name} className="admin-cat-row">
              <div className="admin-cat-label">
                <span>{c.name}</span>
                <span>
                  {c.percent}% · {c.sales.toLocaleString()} sales
                </span>
              </div>
              <div className="admin-cat-bar">
                <div className="admin-cat-fill" style={{ width: `${c.percent}%` }} />
              </div>
            </div>
          ))}
        </section>
      </div>

      <div className="admin-breakdown-grid">
        <section className="admin-card">
          <div className="admin-card-head">
            <h2>Order status breakdown</h2>
          </div>
          <ul className="admin-breakdown-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {orderStatus.map((x) => (
              <li key={x.label}>
                <span>{x.label}</span>
                <span>
                  {x.count} ({x.pct}%)
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="admin-card">
          <div className="admin-card-head">
            <h2>Customer tiers</h2>
          </div>
          <ul className="admin-breakdown-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {tiers.map((x) => (
              <li key={x.label}>
                <span>{x.label}</span>
                <span>
                  {x.count} ({x.pct}%)
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="admin-card">
          <div className="admin-card-head">
            <h2>Top performing regions</h2>
          </div>
          <ul className="admin-breakdown-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {regions.map((x) => (
              <li key={x.label}>
                <span>{x.label}</span>
                <span>{x.rev}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
