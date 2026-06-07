import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Building2,
  Save,
  CreditCard,
  Trash2,
  Bell,
  Lock,
  Plus,
  Loader2,
  PackageSearch,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useProfile } from '../../context/ProfileContext';
import { userApi, orderApi } from '../../utils/api';
import AddCard from '../Cart/AddCard';
import Navbar from '../Navbar/Navbar';
import './Profile.css';
import Footer from '../Footer/Footer';

const TABS = [
  { key: 'account', label: 'Account' },
  { key: 'addresses', label: 'Addresses' },
  { key: 'payment', label: 'Payment' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'security', label: 'Security' },
  { key: 'orders', label: 'Order History' },
];

function AccountTab() {
  const { accountProfile, saveProfile, loading, error, stats } = useProfile();
  const { setShippingAddress } = useCart();
  const [draft, setDraft] = useState(accountProfile || {});
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (accountProfile) setDraft(accountProfile);
  }, [accountProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
    setSaveMsg('');
  };

  const handleSave = async () => {
    setSaveMsg('');
    const result = await saveProfile(draft);
    if (result.success) {
      setSaveMsg('Profile updated successfully!');
      // Sync shipping address with updated profile
      setShippingAddress((prev) => ({
        ...prev,
        fullName: draft.username,
        company: draft.companyName,
        phone: draft.phone,
      }));
    } else {
      setSaveMsg(result.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setDraft(accountProfile || {});
    setSaveMsg('');
  };

  if (loading && !accountProfile) {
    return (
      <div className="profile-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <Loader2 size={32} className="profile-spinner" />
        <p>Loading profile…</p>
      </div>
    );
  }

  if (error && !accountProfile) {
    return (
      <div className="profile-card">
        <p className="profile-security-message err">{error}</p>
      </div>
    );
  }

  return (
    <div className="profile-account-layout">
      <div className="profile-card profile-account-form-card">
        <h2 className="profile-card-title">Personal Information</h2>
        <div className="profile-form-grid">
          <div className="profile-field">
            <label>
              <User size={16} />
              Full Name
            </label>
            <input
              name="username"
              value={draft.username || ''}
              onChange={handleChange}
              placeholder="Your username"
            />
          </div>
          <div className="profile-field">
            <label>
              <Building2 size={16} />
              Business Name
            </label>
            <input
              name="companyName"
              value={draft.companyName || ''}
              onChange={handleChange}
              placeholder="Your company name"
            />
          </div>
          <div className="profile-field">
            <label>
              <Mail size={16} />
              Email Address
            </label>
            <input
              name="email"
              type="email"
              value={draft.email || ''}
              onChange={handleChange}
              placeholder="john@example.com"
            />
          </div>
          <div className="profile-field">
            <label>
              <Phone size={16} />
              Phone Number
            </label>
            <input
              name="phone"
              value={draft.phone || ''}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>
        {saveMsg && (
          <p className={`profile-security-message ${saveMsg.includes('success') ? 'ok' : 'err'}`}>
            {saveMsg}
          </p>
        )}
        <div className="profile-form-actions">
          <button type="button" className="profile-btn-outline" onClick={handleCancel}>
            Cancel
          </button>
          <button type="button" className="profile-btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 size={18} className="profile-spinner" /> : <Save size={18} />}
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <aside className="profile-stats-card">
        <div className="profile-stat-row">
          <span className="profile-stat-label">Member Since</span>
          <span className="profile-stat-value">{stats.memberSince}</span>
        </div>
        <div className="profile-stat-row">
          <span className="profile-stat-label">Role</span>
          <span className="profile-tier-badge">{stats.role}</span>
        </div>
      </aside>
    </div>
  );
}

const emptyAddress = {
  label: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  isPrimary: false,
};

function AddressesTab() {
  const { savedAddresses, addAddress, updateAddress, deleteAddress, setPrimaryAddress } =
    useProfile();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyAddress);

  const openAdd = () => {
    setForm(emptyAddress);
    setModal({ mode: 'add' });
  };

  const openEdit = (addr) => {
    setForm({
      label: addr.label,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      isPrimary: addr.isPrimary,
    });
    setModal({ mode: 'edit', id: addr.id });
  };

  const closeModal = () => {
    setModal(null);
    setForm(emptyAddress);
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!form.label.trim() || !form.street.trim()) return;
    if (modal.mode === 'add') {
      addAddress(form);
    } else {
      updateAddress(modal.id, form);
    }
    closeModal();
  };

  return (
    <div className="profile-card">
      <div className="profile-section-head">
        <h2 className="profile-card-title">Saved Addresses</h2>
        <button type="button" className="profile-btn-primary profile-btn-sm" onClick={openAdd}>
          <Plus size={18} />
          Add New Address
        </button>
      </div>
      <div className="profile-address-grid">
        {savedAddresses.map((addr) => (
          <div key={addr.id} className="profile-address-card">
            <div className="profile-address-card-top">
              <h3>{addr.label}</h3>
              {addr.isPrimary && <span className="profile-primary-badge">Primary</span>}
            </div>
            <p className="profile-address-line">
              {addr.street}, {addr.city}, {addr.state} {addr.zip}
            </p>
            <div className="profile-address-actions">
              <button type="button" className="profile-btn-outline profile-btn-xs" onClick={() => openEdit(addr)}>
                Edit
              </button>
              {!addr.isPrimary && (
                <button
                  type="button"
                  className="profile-btn-outline profile-btn-xs"
                  onClick={() => setPrimaryAddress(addr.id)}
                >
                  Set Primary
                </button>
              )}
              <button
                type="button"
                className="profile-btn-text-danger profile-btn-xs"
                onClick={() => deleteAddress(addr.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="profile-modal-overlay" role="presentation" onClick={closeModal}>
          <div
            className="profile-modal"
            role="dialog"
            aria-labelledby="address-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="address-modal-title">
              {modal.mode === 'add' ? 'Add New Address' : 'Edit Address'}
            </h3>
            <form onSubmit={handleSaveAddress} className="profile-modal-form">
              <div className="profile-field full">
                <label>Label</label>
                <input
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="e.g. Main Warehouse"
                  required
                />
              </div>
              <div className="profile-field full">
                <label>Street</label>
                <input
                  value={form.street}
                  onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
                  required
                />
              </div>
              <div className="profile-field">
                <label>City</label>
                <input
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  required
                />
              </div>
              <div className="profile-field">
                <label>State</label>
                <input
                  value={form.state}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  required
                />
              </div>
              <div className="profile-field full">
                <label>ZIP</label>
                <input
                  value={form.zip}
                  onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))}
                  required
                />
              </div>
              <label className="profile-checkbox">
                <input
                  type="checkbox"
                  checked={form.isPrimary}
                  onChange={(e) => setForm((f) => ({ ...f, isPrimary: e.target.checked }))}
                />
                Set as primary address
              </label>
              <div className="profile-modal-actions">
                <button type="button" className="profile-btn-outline" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="profile-btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentTab() {
  const {
    paymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
  } = useCart();
  const [showAddCard, setShowAddCard] = useState(false);

  const handleAdd = (card) => {
    addPaymentMethod(card);
    setShowAddCard(false);
  };

  return (
    <div className="profile-card">
      <div className="profile-section-head">
        <h2 className="profile-card-title">Payment Methods</h2>
        {!showAddCard && (
          <button
            type="button"
            className="profile-btn-primary profile-btn-sm"
            onClick={() => setShowAddCard(true)}
          >
            + Add Card
          </button>
        )}
      </div>
      {showAddCard ? (
        <div className="profile-add-card-wrap">
          <AddCard onSave={handleAdd} onCancel={() => setShowAddCard(false)} />
        </div>
      ) : (
        <div className="profile-payment-list">
          {paymentMethods.map((card) => (
            <div key={card.id} className="profile-payment-row">
              <div className="profile-payment-icon">
                <CreditCard size={22} />
              </div>
              <div className="profile-payment-body">
                <div className="profile-payment-top">
                  <span className="profile-payment-number">
                    ···· ···· ···· {card.last4}
                  </span>
                  {card.isDefault && <span className="profile-default-pill">Default</span>}
                </div>
                <span className="profile-payment-name">{card.name}</span>
                <span className="profile-payment-exp">
                  Expires {String(card.expMonth).padStart(2, '0')}/{card.expYear}
                </span>
              </div>
              <div className="profile-payment-actions">
                {!card.isDefault && (
                  <button
                    type="button"
                    className="profile-btn-outline profile-btn-xs"
                    onClick={() => setDefaultPaymentMethod(card.id)}
                  >
                    Set default
                  </button>
                )}
                <button
                  type="button"
                  className="profile-payment-remove"
                  onClick={() => removePaymentMethod(card.id)}
                  aria-label="Remove card"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationsTab() {
  const { notificationPrefs, setNotificationPrefs } = useProfile();
  const [draft, setDraft] = useState(notificationPrefs);

  useEffect(() => {
    setDraft(notificationPrefs);
  }, [notificationPrefs]);

  const toggle = (key) => {
    setDraft((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setNotificationPrefs(draft);
  };

  const rows = [
    {
      key: 'orderUpdates',
      title: 'Order Updates',
      desc: 'Receive notifications about your order status',
    },
    {
      key: 'shippingAlerts',
      title: 'Shipping Alerts',
      desc: 'Get notified when your orders are shipped',
    },
    {
      key: 'promotions',
      title: 'Promotions & Deals',
      desc: 'Receive special offers and discounts',
    },
    {
      key: 'newsletter',
      title: 'Newsletter',
      desc: 'Get monthly updates and packaging tips',
    },
  ];

  return (
    <div className="profile-card">
      <h2 className="profile-card-title">Notification Preferences</h2>
      <ul className="profile-notify-list">
        {rows.map((row) => (
          <li key={row.key} className="profile-notify-row">
            <div>
              <strong>{row.title}</strong>
              <p>{row.desc}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={draft[row.key]}
              className={`profile-toggle ${draft[row.key] ? 'on' : ''}`}
              onClick={() => toggle(row.key)}
            >
              <span className="profile-toggle-knob" />
            </button>
          </li>
        ))}
      </ul>
      <div className="profile-form-actions profile-form-actions-end">
        <button type="button" className="profile-btn-primary" onClick={handleSave}>
          <Bell size={18} />
          Save Preferences
        </button>
      </div>
    </div>
  );
}

function SecurityTab() {
  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
    confirm: '',
  });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((p) => ({ ...p, [name]: value }));
    setMessage('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.next || !passwords.confirm) {
      setMessage('Please fill in all fields.');
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setMessage('New passwords do not match.');
      return;
    }
    if (passwords.next.length < 8) {
      setMessage('New password must be at least 8 characters.');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      await userApi.updatePassword({
        currentPassword: passwords.current,
        newPassword: passwords.next,
      });
      setPasswords({ current: '', next: '', confirm: '' });
      setMessage('Password updated successfully!');
    } catch (err) {
      const msg = err?.data?.message || err.message || 'Failed to update password';
      setMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-card">
      <h2 className="profile-card-title">Security Settings</h2>
      <form onSubmit={handleUpdate} className="profile-security-form">
        <div className="profile-field full">
          <label>
            <Lock size={16} />
            Current Password
          </label>
          <input
            type="password"
            name="current"
            value={passwords.current}
            onChange={handleChange}
            placeholder="Enter current password"
            autoComplete="current-password"
          />
        </div>
        <div className="profile-field full">
          <label>New Password</label>
          <input
            type="password"
            name="next"
            value={passwords.next}
            onChange={handleChange}
            placeholder="Enter new password"
            autoComplete="new-password"
          />
        </div>
        <div className="profile-field full">
          <label>Confirm New Password</label>
          <input
            type="password"
            name="confirm"
            value={passwords.confirm}
            onChange={handleChange}
            placeholder="Confirm new password"
            autoComplete="new-password"
          />
        </div>
        {message && (
          <p className={`profile-security-message ${message.includes('success') ? 'ok' : 'err'}`}>
            {message}
          </p>
        )}
        <button type="submit" className="profile-btn-primary" disabled={saving}>
          {saving ? <Loader2 size={18} className="profile-spinner" /> : <Lock size={18} />}
          {saving ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}

function OrderHistoryTab() {
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getMyOrders()
      .then(data => setRecentOrders(data.slice(0, 3))) // Show 3 most recent
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="profile-card">
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <PackageSearch size={48} style={{ opacity: 0.4, marginBottom: '1rem' }} />
        <h2 className="profile-card-title">Order History</h2>
        <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
          View and track all your orders from the Track page.
        </p>
        <Link to="/Track" className="profile-btn-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
          Go to Order Tracking
        </Link>
      </div>

      {!loading && recentOrders.length > 0 && (
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--foreground)' }}>Recent Orders</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentOrders.map(order => (
              <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <div>
                  <p style={{ fontWeight: '500', margin: '0 0 0.25rem 0' }}>{order.id}</p>
                  <p style={{ margin: '0', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{order.product} • {order.date}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: '600', margin: '0 0 0.25rem 0' }}>{order.amount}</p>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState('account');

  return (
    <div className="profile-page">
      <Navbar />

      <main className="profile-main">
        <div className="profile-hero">
          <h1 className="profile-title">Profile Settings</h1>
          <p className="profile-subtitle">Manage your account settings and preferences</p>
        </div>

        <nav className="profile-tabs" aria-label="Profile sections">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`profile-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="profile-tab-panel">
          {activeTab === 'account' && <AccountTab />}
          {activeTab === 'addresses' && <AddressesTab />}
          {activeTab === 'payment' && <PaymentTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'orders' && <OrderHistoryTab />}
        </div>
      </main>
     
    </div>
  );
}
