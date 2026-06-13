import React, { useMemo, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, Package, Truck, Loader2, Check, Clock } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { shipmentApi } from '../../utils/api';

const SHIPMENT_STATUSES = [
  { value: 'PREPARING', label: 'Preparing' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'RETURNED', label: 'Returned' },
];

const TERMINAL_STATUSES = ['DELIVERED', 'RETURNED'];

function StatusBadge({ status }) {
  const s = (status || '').toLowerCase();
  return <span className={`admin-badge ${s}`}>{s}</span>;
}

function formatDateTime(dateString) {
  if (!dateString) return '—';
  const d = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let hours = d.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${hours}:${minutes} ${ampm}`;
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

  // ── Shipment state ────────────────────────────────────────────
  const [shipment, setShipment] = useState(null);
  const [shipmentLoading, setShipmentLoading] = useState(false);
  const [shipmentError, setShipmentError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (!order?.rawId) return;
    let cancelled = false;
    setShipmentLoading(true);
    setShipmentError(null);

    shipmentApi
      .getByOrderId(order.rawId)
      .then((data) => {
        if (!cancelled) {
          setShipment(data);
          setSelectedStatus(data.status || '');
        }
      })
      .catch((err) => {
        if (!cancelled) setShipmentError(err.message || 'Failed to load shipment.');
      })
      .finally(() => {
        if (!cancelled) setShipmentLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [order?.rawId]);

  const isTerminal = TERMINAL_STATUSES.includes((shipment?.status || '').toUpperCase());

  const handleUpdateStatus = async () => {
    if (!shipment?.id || !selectedStatus || selectedStatus === shipment.status) return;
    setUpdating(true);
    setUpdateSuccess(false);
    try {
      const updated = await shipmentApi.updateStatus(shipment.id, selectedStatus);
      setShipment(updated);
      setSelectedStatus(updated.status || '');
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update shipment status.');
    } finally {
      setUpdating(false);
    }
  };

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

      {/* ── Amount ─────────────────────────────────────────────── */}
      <div className="admin-card" style={{ marginBottom: '1rem' }}>
        <h2 className="admin-page-title" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
          Amount
        </h2>
        <p className="admin-stat-value" style={{ margin: 0 }}>
          {order.amount}
        </p>
      </div>

      {/* ── Payment Method ─────────────────────────────────────── */}
      <div className="admin-card" style={{ marginBottom: '1rem' }}>
        <h2 className="admin-page-title" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
          Payment Method
        </h2>
        <p style={{ margin: 0, fontWeight: 600 }}>
          {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Credit / Debit Card'}
        </p>
      </div>

      {/* ── Customer ───────────────────────────────────────────── */}
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

      {/* ── Product & quantity ─────────────────────────────────── */}
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

      {/* ── Shipping address ───────────────────────────────────── */}
      <div className="admin-card" style={{ marginBottom: '1rem' }}>
        <h2 className="admin-page-title" style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <MapPin size={18} />
          Shipping address
        </h2>
        <p style={{ margin: 0 }}>{order.address || '—'}</p>
      </div>

      {/* ── Shipment & tracking ────────────────────────────────── */}
      <div className="admin-card">
        <h2 className="admin-page-title" style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Truck size={18} />
          Shipment &amp; Tracking
        </h2>

        {shipmentLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--admin-muted)', padding: '0.5rem 0' }}>
            <Loader2 size={16} className="profile-spinner" />
            Loading shipment info…
          </div>
        ) : shipmentError ? (
          <p style={{ margin: 0, color: 'var(--admin-muted)' }}>
            {shipmentError === 'Failed to load shipment.' || shipmentError.includes('404')
              ? 'No shipment record found. Shipment will be created once the order is processed.'
              : shipmentError}
          </p>
        ) : shipment ? (
          <div>
            {/* Tracking number */}
            <div style={{ marginBottom: '0.75rem' }}>
              <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tracking Number</p>
              <p style={{ margin: 0, fontWeight: 600, fontFamily: 'monospace', fontSize: '1rem' }}>
                {shipment.trackingNumber || 'Pending assignment'}
              </p>
            </div>

            {/* Current location */}
            <div style={{ marginBottom: '0.75rem' }}>
              <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Location</p>
              <p style={{ margin: 0 }}>{shipment.currentLocation || 'Processing center'}</p>
            </div>

            {/* Delivery date */}
            {shipment.deliveryDate && (
              <div style={{ marginBottom: '0.75rem' }}>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivery Date</p>
                <p style={{ margin: 0 }}>{formatDateTime(shipment.deliveryDate)}</p>
              </div>
            )}

            {/* Timeline */}
            {Array.isArray(shipment.timeline) && shipment.timeline.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timeline</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {shipment.timeline.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: step.completed ? 'var(--accent, #4f46e5)' : 'var(--admin-border, #e2e8f0)',
                        color: step.completed ? '#fff' : 'var(--admin-muted)',
                        marginTop: 2,
                      }}>
                        {step.completed ? <Check size={13} /> : <Clock size={13} />}
                      </span>
                      <div>
                        <p style={{ margin: 0, fontWeight: step.completed ? 600 : 400, opacity: step.completed ? 1 : 0.55, fontSize: '0.9rem' }}>{step.label}</p>
                        {step.occurredAt && (
                          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--admin-muted)', opacity: step.completed ? 1 : 0.55 }}>
                            {formatDateTime(step.occurredAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status update (PUT /api/shipments/{id}/status) */}
            <div style={{ borderTop: '1px solid var(--admin-border, #e2e8f0)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Update Shipment Status</p>
              {isTerminal ? (
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--admin-muted)' }}>
                  Shipment has reached a terminal state (<strong>{shipment.status}</strong>) and cannot be updated further.
                </p>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="admin-input"
                    style={{ width: 'auto', padding: '0.35rem 0.6rem' }}
                    disabled={updating}
                  >
                    {SHIPMENT_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    onClick={handleUpdateStatus}
                    disabled={updating || selectedStatus === shipment.status}
                    style={{ padding: '0.35rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    {updating ? <Loader2 size={14} className="profile-spinner" /> : <Check size={14} />}
                    {updating ? 'Updating…' : 'Apply'}
                  </button>
                  {updateSuccess && (
                    <span style={{ fontSize: '0.85rem', color: '#16a34a' }}>✓ Status updated</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
