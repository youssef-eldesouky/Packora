import React, { useEffect, useMemo, useState } from 'react';
import { DollarSign, Package, Loader2 } from 'lucide-react';
import { formatMoney } from '../../utils/adminFormat';
import { useAdmin } from '../../context/AdminContext';
import { adminAnalyticsApi } from '../../utils/api';

export default function AdminAnalytics() {
  const { dashboardStats, dashboardLoading } = useAdmin();
  const [range, setRange] = useState('6m');
  
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);

  const [topProducts, setTopProducts] = useState([]);
  const [topProductsLoading, setTopProductsLoading] = useState(false);

  // Fetch Revenue Chart Data
  useEffect(() => {
    let cancelled = false;
    setChartLoading(true);
    const months = range === '1y' ? 12 : 6;
    adminAnalyticsApi.getRevenueChart(months).then(data => {
      if (!cancelled) setChartData(data);
    }).catch(err => console.error(err)).finally(() => {
      if (!cancelled) setChartLoading(false);
    });
    return () => { cancelled = true; };
  }, [range]);

  // Fetch Top Products Data
  useEffect(() => {
    let cancelled = false;
    setTopProductsLoading(true);
    adminAnalyticsApi.getTopProducts(5).then(data => {
      if (!cancelled) setTopProducts(data);
    }).catch(err => console.error(err)).finally(() => {
      if (!cancelled) setTopProductsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const chartMax = useMemo(() => {
    return chartData.reduce((max, d) => Math.max(max, d.revenue), 0) || 1;
  }, [chartData]);

  const chartTotalRev = useMemo(() => chartData.reduce((s, d) => s + d.revenue, 0), [chartData]);
  const chartTotalOrders = useMemo(() => chartData.reduce((s, d) => s + d.orders, 0), [chartData]);

  const kpiCards = [
    { 
      key: 'aov', 
      label: 'Average Order Value', 
      icon: DollarSign, 
      value: dashboardStats.totalOrders ? formatMoney(dashboardStats.totalRevenue / dashboardStats.totalOrders) : '$0',
    },
    { 
      key: 'sold', 
      label: 'Total Orders', 
      icon: Package, 
      value: dashboardStats.totalOrders.toLocaleString(),
    },
  ];

  return (
    <>
      <h1 className="admin-page-title">Analytics &amp; Reports</h1>
      <p className="admin-page-sub">Track performance metrics and business insights</p>

      <div className="admin-analytics-kpi-grid">
        {kpiCards.map(({ key, label, icon: Icon, value }) => (
          <div key={key} className="admin-stat-card">
            <div className="admin-stat-icon green" style={{ marginBottom: '0.65rem' }}>
              <Icon size={20} />
            </div>
            <p className="admin-stat-value" style={{ fontSize: '1.35rem' }}>
              {dashboardLoading ? <Loader2 size={20} className="profile-spinner" /> : value}
            </p>
            <p className="admin-stat-label">{label}</p>
          </div>
        ))}
      </div>

      <div className="admin-analytics-bottom">
        {/* Revenue Chart Section */}
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
          
          <div className="admin-bar-chart" style={{ padding: '2rem 0' }}>
            {chartLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                <Loader2 size={24} className="profile-spinner" />
                <p>Loading chart data...</p>
              </div>
            ) : chartData.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--muted)' }}>No data available for this period.</p>
            ) : (
              chartData.map((d, i) => {
                const pct = Math.max((d.revenue / chartMax) * 100, 2); // At least 2% to show the bar
                return (
                  <div key={i} className="admin-bar-row">
                    <div style={{ color: 'var(--admin-muted)', fontWeight: 600 }}>{d.month}</div>
                    <div className="admin-bar-track">
                      <div className="admin-bar-orders" style={{ width: `${pct}%` }}>
                        {d.orders}
                      </div>
                      <div className="admin-bar-rest" />
                    </div>
                    <div className="admin-bar-rev">{formatMoney(d.revenue)}</div>
                  </div>
                );
              })
            )}
          </div>

          <div className="admin-rev-footer">
            <div>
              Period Revenue
              <strong>{formatMoney(chartTotalRev)}</strong>
            </div>
            <div>
              Period Orders
              <strong>{chartTotalOrders.toLocaleString()}</strong>
            </div>
          </div>
        </section>

        {/* Top Products Section */}
        <section className="admin-card">
          <div className="admin-card-head">
            <h2>Top Performing Products</h2>
          </div>
          <div style={{ padding: '1rem 0' }}>
            {topProductsLoading ? (
               <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                 <Loader2 size={24} className="profile-spinner" />
                 <p>Loading products...</p>
               </div>
            ) : topProducts.length === 0 ? (
               <p style={{ textAlign: 'center', color: 'var(--muted)' }}>No product data available.</p>
            ) : (
              <div className="admin-table-wrap" style={{ border: 'none' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Product</th>
                      <th style={{ textAlign: 'right' }}>Sales</th>
                      <th style={{ textAlign: 'right' }}>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p, idx) => (
                      <tr key={idx}>
                        <td style={{ width: '60px' }}>
                          <div className="admin-rank-num" style={{ margin: 0 }}>{idx + 1}</div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td style={{ textAlign: 'right', color: 'var(--admin-muted)' }}>{p.sales}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatMoney(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
