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
import { orderApi, shipmentApi } from '../../utils/api';

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

function formatBackendDateTime(isoString) {
  if (!isoString) return { date: '—', time: '' };
  const d = new Date(isoString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  let hours = d.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; 
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes} ${ampm}`;
  return { date: dateStr, time: timeStr };
}

export default function Track() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [shipmentLoading, setShipmentLoading] = useState(false);

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

  useEffect(() => {
    if (!selectedOrder || !selectedOrder.rawId) {
      setSelectedShipment(null);
      return;
    }
    let cancelled = false;
    setShipmentLoading(true);
    shipmentApi.getByOrderId(selectedOrder.rawId)
      .then(data => {
        if (!cancelled) setSelectedShipment(data);
      })
      .catch(err => {
        if (!cancelled) {
          console.error("Failed to load shipment:", err);
          setSelectedShipment(null);
        }
      })
      .finally(() => {
        if (!cancelled) setShipmentLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedOrder]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter((o) => {
      return (
        o.id.toLowerCase().includes(q) ||
        o.product.toLowerCase().includes(q) ||
        (o.trackingNumber || '').toLowerCase().includes(q)
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
                  
                  {shipmentLoading ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--muted)' }}>
                      <Loader2 size={24} className="profile-spinner" style={{ margin: '0 auto 1rem' }} />
                      <p>Loading tracking information...</p>
                    </div>
                  ) : selectedShipment ? (
                    <>
                      {selectedShipment.deliveryDate && (
                        <p className="track-detail-row">
                          <span className="track-detail-label">Expected Delivery</span>
                          <span className="track-detail-value">
                            {formatBackendDateTime(selectedShipment.deliveryDate).date}
                          </span>
                        </p>
                      )}

                      <div className="track-tracking-wrap">
                        <span className="track-detail-label">Tracking Number</span>
                        <div className="track-tracking-box">
                          <span className="track-tracking-value">
                            {selectedShipment.trackingNumber || 'Pending Assignment'}
                          </span>
                          {selectedShipment.trackingNumber && (
                            <button
                              type="button"
                              className="track-copy-btn"
                              onClick={() => handleCopyTracking(selectedShipment.trackingNumber)}
                            >
                              <Copy size={14} />
                              Copy
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="track-location-wrap">
                        <span className="track-detail-label">Current Location</span>
                        <p className="track-location">
                          <MapPin size={18} />
                          {selectedShipment.currentLocation || 'Processing Center'}
                        </p>
                      </div>

                      <div className="track-timeline-wrap">
                        <span className="track-detail-label">Tracking Timeline</span>
                        <div className="track-timeline">
                          {(selectedShipment.timeline || []).map((step, idx) => {
                            const dt = formatBackendDateTime(step.occurredAt);
                            return (
                              <div key={idx} className="track-timeline-item">
                                <span className={`track-timeline-dot ${step.completed ? 'completed' : ''}`}>
                                  <Check size={14} />
                                </span>
                                <div className="track-timeline-content">
                                  <span className="track-timeline-label" style={{ opacity: step.completed ? 1 : 0.6 }}>
                                    {step.label}
                                  </span>
                                  {step.occurredAt && (
                                    <span className="track-timeline-date">
                                      {dt.date} {dt.time}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--muted)' }}>
                      <p>Tracking information is not available yet.</p>
                    </div>
                  )}
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
  
    </div>
  );
}
