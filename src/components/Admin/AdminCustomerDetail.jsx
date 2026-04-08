import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

function StatusBadge({ status }) {
  const s = (status || '').toLowerCase();
  return <span className={`admin-badge ${s}`}>{s}</span>;
}

export default function AdminCustomerDetail() {
  const { customerId } = useParams();
  const { customers, getOrdersForCustomer } = useAdmin();
  const customer = customers.find((c) => String(c.id) === String(customerId));
  const orders = customer ? getOrdersForCustomer(customer) : [];

  if (!customer) {
    return (
      <>
        <p>Customer not found.</p>
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
          <span>
            <MapPin size={14} />
            {customer.address}
          </span>
        </div>
        <div className="admin-customer-stats" style={{ marginTop: '1rem' }}>
          <div>
            Total orders
            <strong>{customer.totalOrders}</strong>
          </div>
          <div>
            Total spent
            <strong>{customer.totalSpent}</strong>
          </div>
          <div>
            Tier
            <strong>{customer.tier}</strong>
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
