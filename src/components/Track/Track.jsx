import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Truck,
  Box,
  Search,
  Check,
  Clock,
  MapPin,
  Copy,
  AlertCircle,
  MessageCircle,
  Loader2,
  XCircle,
} from 'lucide-react';
import { orderApi } from '../../utils/api';

import Navbar from '../Navbar/Navbar';
import './Track.css';
import Footer from '../Footer/Footer';


const statusConfig = {
  delivered: { label: 'Delivered', class: 'status-delivered', Icon: Check },
  shipped: { label: 'In Transit', class: 'status-transit', Icon: Truck },
  processing: { label: 'Processing', class: 'status-processing', Icon: Clock },
  pending: { label: 'Pending', class: 'status-pending', Icon: Clock },
  cancelled: { label: 'Cancelled', class: 'status-cancelled', Icon: AlertCircle },
};

// Generate timeline and tracking from order
function getOrderTracking(order) {
  const idNum = order.id.replace(/\D/g, '') || '0000';
  const n = parseInt(idNum, 10) || 0;
  const a = String(Math.abs(n % 10000)).padStart(4, '0');
  const b = String(Math.abs(Math.floor(n / 100) % 10000)).padStart(4, '0');
  const c = String(Math.abs(Math.floor(n / 10000) % 10000)).padStart(4, '0');
  const trackingNumber = `TRK-${a}-${b}-${c}`;
  const baseDate = new Date(order.rawDate || order.date || new Date());
  const steps = [
    { key: 'placed', label: 'Order Placed', date: baseDate, time: '10:30 AM' },
    { key: 'processing', label: 'Processing', date: baseDate, time: '2:15 PM' },
    { key: 'shipped', label: 'Shipped', date: new Date(baseDate.getTime() + 86400000), time: '8:00 AM' },
    { key: 'out', label: 'Out for Delivery', date: new Date(baseDate.getTime() + 172800000), time: '6:30 AM' },
    { key: 'delivered', label: 'Delivered', date: new Date(baseDate.getTime() + 172800000), time: '2:45 PM' },
  ];
  const statusOrder = ['placed', 'processing', 'shipped', 'out', 'delivered'];
  const statusIdx = statusOrder.indexOf(order.status);
  const timeline = steps.slice(0, statusIdx === -1 ? 2 : statusIdx + 1);
  const location =
    order.status === 'delivered'
      ? 'Delivered to Business Address'
      : order.status === 'shipped'
        ? 'In Transit'
        : order.status === 'processing' || order.status === 'pending'
          ? 'Processing at Warehouse'
          : '—';
  const deliveredDate = order.status === 'delivered' ? steps[4] : null;
  return { trackingNumber, timeline, location, deliveredDate };
}

function formatTimelineDate(d, time) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${time}`;
}

export default function Track() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    orderApi.getMyOrders()
      .then(data => {
        if (!cancelled) {
          setOrders(data);
          const focusId = location.state?.focusOrderId;
          if (focusId) {
            const found = data.find((o) => o.id === focusId || String(o.rawId) === String(focusId));
            if (found) setSelectedOrder(found);
          }
        }
      })
      .catch(err => {
        if (!cancelled) setError(err.message || 'Failed to load orders.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [location.state]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter((o) => {
      const tracking = getOrderTracking(o).trackingNumber.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.product.toLowerCase().includes(q) ||
        tracking.includes(q)
      );
    });
  }, [searchQuery, orders]);

  const handleCopyTracking = (text) => {
    navigator.clipboard?.writeText(text);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder || !selectedOrder.rawId) return;
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    setIsCancelling(true);
    try {
      const updated = await orderApi.cancel(selectedOrder.rawId);
      setOrders(prev => prev.map(o => o.rawId === updated.rawId ? updated : o));
      setSelectedOrder(updated);
    } catch (err) {
      alert(err.message || 'Failed to cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="track-page">
      <Navbar />

      <main className="track-main">
        <div className="track-hero">
          <h1 className="track-title">Track Orders</h1>
          <p className="track-subtitle">Monitor your packaging orders in real-time</p>
        </div>

        <div className="track-layout">
          <aside className="track-orders-panel">
            <div className="track-search-bar">
              <Search size={20} className="track-search-icon" />
              <input
                type="text"
                placeholder="Search by order ID, product, or tracking number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="track-search-input"
              />
            </div>

            <div className="track-orders-list">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                  <Loader2 size={24} className="profile-spinner" />
                  <p>Loading orders...</p>
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger, #ef4444)' }}>
                  <XCircle size={32} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                  <p>{error}</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                  <p>No orders found.</p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const config = statusConfig[order.status] || statusConfig.processing;
                  const Icon = config.Icon;
                  const isSelected = selectedOrder?.id === order.id;
                  return (
                    <button
                      key={order.id}
                      type="button"
                      className={`track-order-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="track-order-card-top">
                        <span className="track-order-icon">
                          <Icon size={18} />
                        </span>
                        <span className="track-order-id">{order.id}</span>
                        <span className={`track-order-badge ${config.class}`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="track-order-product">
                        {order.product} ({order.quantity} units)
                      </p>
                      <div className="track-order-meta">
                        <span>{order.date}</span>
                        <span className="track-order-amount">{order.amount}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <section className="track-detail-panel">
            {selectedOrder ? (
              <>
                <div className="track-detail-header">
                  <h2 className="track-detail-title">Order Details</h2>
                  <span
                    className={`track-detail-badge ${
                      statusConfig[selectedOrder.status]?.class ?? 'status-processing'
                    }`}
                  >
                    {statusConfig[selectedOrder.status]?.label ?? 'Processing'}
                  </span>
                </div>

                <div className="track-detail-body">
                  <p className="track-detail-row">
                    <span className="track-detail-label">Order ID</span>
                    <span className="track-detail-value">{selectedOrder.id}</span>
                  </p>
                  <p className="track-detail-row">
                    <span className="track-detail-label">Product</span>
                    <span className="track-detail-value">
                      {selectedOrder.product} ({selectedOrder.quantity} units)
                    </span>
                  </p>
                  <p className="track-detail-row">
                    <span className="track-detail-label">Total Amount</span>
                    <span className="track-detail-value track-detail-amount">
                      {selectedOrder.amount}
                    </span>
                  </p>
                  <p className="track-detail-row">
                    <span className="track-detail-label">Order Date</span>
                    <span className="track-detail-value">{selectedOrder.date}</span>
                  </p>
                  {getOrderTracking(selectedOrder).deliveredDate && (
                    <p className="track-detail-row">
                      <span className="track-detail-label">Delivered</span>
                      <span className="track-detail-value">
                        {formatTimelineDate(
                          getOrderTracking(selectedOrder).deliveredDate.date,
                          getOrderTracking(selectedOrder).deliveredDate.time
                        )}
                      </span>
                    </p>
                  )}

                  <div className="track-tracking-wrap">
                    <span className="track-detail-label">Tracking Number</span>
                    <div className="track-tracking-box">
                      <span className="track-tracking-value">
                        {getOrderTracking(selectedOrder).trackingNumber}
                      </span>
                      <button
                        type="button"
                        className="track-copy-btn"
                        onClick={() =>
                          handleCopyTracking(
                            getOrderTracking(selectedOrder).trackingNumber
                          )
                        }
                      >
                        <Copy size={14} />
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="track-location-wrap">
                    <span className="track-detail-label">Current Location</span>
                    <p className="track-location">
                      <MapPin size={18} />
                      {getOrderTracking(selectedOrder).location}
                    </p>
                  </div>

                  <div className="track-timeline-wrap">
                    <span className="track-detail-label">Order Placed</span>
                    <div className="track-timeline">
                      {getOrderTracking(selectedOrder).timeline.map((step) => (
                        <div key={step.key} className="track-timeline-item">
                          <span className="track-timeline-dot">
                            <Check size={14} />
                          </span>
                          <div className="track-timeline-content">
                            <span className="track-timeline-label">
                              {step.label}
                            </span>
                            <span className="track-timeline-date">
                              {formatTimelineDate(step.date, step.time)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="track-need-help">
                  <h3 className="track-need-help-title">Need Help?</h3>
                  <div className="track-need-help-actions">
                    <Link to="/Support" className="track-help-btn">
                     <button type="button" className="track-help-btn">
                      <Box size={18} />
                      Report an Issue
                    </button>
                    </Link>
                   <Link to="/Support" className="track-help-btn">
                   <button type="button" className="track-help-btn">
                      <MessageCircle size={18} />
                      Contact Support
                    </button> 
                    </Link>
                  </div>
                  {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                      <button 
                        type="button" 
                        className="track-help-btn" 
                        style={{ color: 'var(--danger, #ef4444)', borderColor: 'var(--danger, #ef4444)', background: 'transparent' }}
                        onClick={handleCancelOrder}
                        disabled={isCancelling}
                      >
                        <AlertCircle size={18} />
                        {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="track-empty-state">
                <Truck size={64} className="track-empty-icon" />
                <p className="track-empty-text">Select an order to view tracking details</p>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer/>
    </div>
  );
}
