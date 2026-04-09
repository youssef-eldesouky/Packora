import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  LayoutGrid,
  Truck,
  ShoppingCart,
  HelpCircle,
  User,
  LogOut,
  Share2,
  Box,
  Mail,
  Phone,
  MapPin,
  Building2,
  Save,
  CreditCard,
  Trash2,
  Bell,
  Lock,
  Plus,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useProfile } from '../../context/ProfileContext';
import AddCard from '../Cart/AddCard';
import orders from '../../mockdata/Orders.json';
import './Profile.css';

const TABS = [
  { key: 'account', label: 'Account' },
  { key: 'addresses', label: 'Addresses' },
  { key: 'payment', label: 'Payment' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'security', label: 'Security' },
  { key: 'orders', label: 'Order History' },
];

const statusLabel = {
  delivered: 'Delivered',
  shipped: 'In Transit',
  processing: 'Processing',
  pending: 'Pending',
  cancelled: 'Cancelled',
};

function ProfileHeader({ cartItems }) {
  return (
    <header className="profile-header">
      <Link to="/HomePage" className="profile-logo">
        <div className="profile-logo-icon">
          <Package size={24} color="white" />
        </div>
        <span>Packora</span>
      </Link>

      <nav className="profile-nav">
        <Link to="/HomePage" className="profile-nav-item">
          <LayoutGrid size={18} />
          Dashboard
        </Link>
        <Link to="/Catalog" className="profile-nav-item">
          <Box size={18} />
          Catalog
        </Link>
        <Link to="/Track" className="profile-nav-item">
          <Truck size={18} />
          Track
        </Link>
        <Link
          to="/Cart"
          className={`profile-nav-item ${cartItems.length > 0 ? 'profile-nav-badge' : ''}`}
        >
          <ShoppingCart size={18} />
          Cart
          {cartItems.length > 0 && (
            <span className="profile-cart-badge">{cartItems.length}</span>
          )}
        </Link>
        <Link to="/Support" className="profile-nav-item">
          <HelpCircle size={18} />
          Support
        </Link>
        <Link to="/Profile" className="profile-nav-item active">
          <User size={18} />
          Profile
        </Link>
        <Link to="/" className="profile-nav-item">
          <LogOut size={18} />
          Logout
        </Link>
      </nav>

      <button type="button" className="profile-share-btn">
        <Share2 size={18} />
        Share
      </button>
    </header>
  );
}

function AccountTab() {
  const { accountProfile, setAccountProfile, stats } = useProfile();
  const { setShippingAddress } = useCart();
  const [draft, setDraft] = useState(accountProfile);

  useEffect(() => {
    setDraft(accountProfile);
  }, [accountProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setAccountProfile(draft);
    setShippingAddress((prev) => ({
      ...prev,
      fullName: draft.fullName,
      company: draft.businessName,
      street: draft.street,
      city: draft.city,
      state: draft.state,
      zip: draft.zip,
      phone: draft.phone,
    }));
  };

  const handleCancel = () => {
    setDraft(accountProfile);
  };

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
              name="fullName"
              value={draft.fullName}
              onChange={handleChange}
              placeholder="John Smith"
            />
          </div>
          <div className="profile-field">
            <label>
              <Building2 size={16} />
              Business Name
            </label>
            <input
              name="businessName"
              value={draft.businessName}
              onChange={handleChange}
              placeholder="Smith Enterprises Inc."
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
              value={draft.email}
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
              value={draft.phone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div className="profile-field full">
            <label>
              <MapPin size={16} />
              Street Address
            </label>
            <input
              name="street"
              value={draft.street}
              onChange={handleChange}
              placeholder="123 Business Street"
            />
          </div>
          <div className="profile-field">
            <label>City</label>
            <input name="city" value={draft.city} onChange={handleChange} placeholder="New York" />
          </div>
          <div className="profile-field">
            <label>State</label>
            <input name="state" value={draft.state} onChange={handleChange} placeholder="NY" />
          </div>
          <div className="profile-field">
            <label>ZIP Code</label>
            <input name="zip" value={draft.zip} onChange={handleChange} placeholder="10001" />
          </div>
        </div>
        <div className="profile-form-actions">
          <button type="button" className="profile-btn-outline" onClick={handleCancel}>
            Cancel
          </button>
          <button type="button" className="profile-btn-primary" onClick={handleSave}>
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>

      <aside className="profile-stats-card">
        <div className="profile-stat-row">
          <span className="profile-stat-label">Member Since</span>
          <span className="profile-stat-value">{stats.memberSince}</span>
        </div>
        <div className="profile-stat-row">
          <span className="profile-stat-label">Total Orders</span>
          <span className="profile-stat-value">{stats.totalOrders}</span>
        </div>
        <div className="profile-stat-row">
          <span className="profile-stat-label">Total Spent</span>
          <span className="profile-stat-value">
            ${stats.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="profile-stat-row">
          <span className="profile-stat-label">Account Tier</span>
          <span className="profile-tier-badge">{stats.tier}</span>
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((p) => ({ ...p, [name]: value }));
    setMessage('');
  };

  const handleUpdate = (e) => {
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
    setPasswords({ current: '', next: '', confirm: '' });
    setMessage('Password updated successfully.');
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
        <button type="submit" className="profile-btn-primary">
          <Lock size={18} />
          Update Password
        </button>
      </form>
    </div>
  );
}

function OrderHistoryTab() {
  const navigate = useNavigate();
  const sorted = [...orders].sort((a, b) => {
    const da = new Date(a.date);
    const db = new Date(b.date);
    return db - da;
  });

  const goToOrder = (orderId) => {
    navigate('/Track', { state: { focusOrderId: orderId } });
  };

  return (
    <div className="profile-card">
      <h2 className="profile-card-title">Order History</h2>
      <ul className="profile-order-list">
        {sorted.map((order) => (
          <li key={order.id}>
            <button type="button" className="profile-order-row" onClick={() => goToOrder(order.id)}>
              <div>
                <span className="profile-order-id">{order.id}</span>
                <span className="profile-order-date">{order.date}</span>
              </div>
              <div className="profile-order-right">
                <span className="profile-order-amount">{order.amount}</span>
                <span className={`profile-order-status status-${order.status}`}>
                  {statusLabel[order.status] || order.status}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Profile() {
  const { cartItems } = useCart();
  const [activeTab, setActiveTab] = useState('account');

  return (
    <div className="profile-page">
      <ProfileHeader cartItems={cartItems} />

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
