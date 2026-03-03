import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Search,
  Mail,
  Phone,
  Clock,
  MapPin,
  Send,
  Package2,
  CreditCard,
  FileText,
  AlertTriangle,
  Check,
  Upload,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './Support.css';

const SUPPORT_TABS = [
  { key: 'contact', label: 'Contact Us' },
  { key: 'faq', label: 'FAQ' },
  { key: 'report', label: 'Report Issue' },
];

const FAQ_CATEGORIES = [
  {
    id: 'orders',
    title: 'Orders',
    icon: Package2,
    questions: [
      'What is the minimum order quantity?',
      'How do I track my order?',
      'Can I modify my order after placing it?',
    ],
  },
  {
    id: 'shipping',
    title: 'Shipping',
    icon: Truck,
    questions: [
      'What are the shipping costs?',
      'How long does delivery take?',
      'Do you ship internationally?',
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    icon: CreditCard,
    questions: [
      'What payment methods do you accept?',
      'Is my payment information secure?',
      'Can I get a bulk discount?',
    ],
  },
  {
    id: 'products',
    title: 'Products',
    icon: Box,
    questions: [
      'Can I request custom packaging designs?',
      'What materials are available?',
      'Do you have sample packs?',
    ],
  },
];

const ISSUE_CATEGORIES = [
  { key: 'order', label: 'Order Issue', icon: Package2 },
  { key: 'payment', label: 'Payment Problem', icon: CreditCard },
  { key: 'shipping', label: 'Shipping/Delivery', icon: Truck },
  { key: 'product', label: 'Product Quality', icon: FileText },
  { key: 'other', label: 'Other', icon: AlertTriangle },
];

const PAYMENT_METHODS = [
  { value: '', label: 'Select payment method' },
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'amex', label: 'American Express' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'other', label: 'Other' },
];

const PRIORITIES = [
  { key: 'low', label: 'Low' },
  { key: 'medium', label: 'Medium' },
  { key: 'high', label: 'High' },
  { key: 'urgent', label: 'Urgent' },
];

function generateTicketId() {
  return `#TICK-${String(Math.floor(Math.random() * 900000) + 100000)}`;
}

function SupportHeader({ activeTab, setActiveTab, cartItems }) {
  return (
    <header className="support-header">
      <Link to="/HomePage" className="support-logo">
        <div className="support-logo-icon">
          <Package size={24} color="white" />
        </div>
        <span>Packora</span>
      </Link>

      <nav className="support-nav">
        <Link to="/HomePage" className="support-nav-item">
          <LayoutGrid size={18} />
          Dashboard
        </Link>
        <Link to="/Catalog" className="support-nav-item">
          <Box size={18} />
          Catalog
        </Link>
        <Link to="/Track" className="support-nav-item">
          <Truck size={18} />
          Track
        </Link>
        <Link
          to="/Cart"
          className={`support-nav-item ${cartItems.length > 0 ? 'support-nav-badge' : ''}`}
        >
          <ShoppingCart size={18} />
          Cart
          {cartItems.length > 0 && (
            <span className="support-cart-badge">{cartItems.length}</span>
          )}
        </Link>
        <Link to="/Support" className="support-nav-item active">
          <HelpCircle size={18} />
          Support
        </Link>
        <Link to="#" className="support-nav-item">
          <User size={18} />
          Profile
        </Link>
        <Link to="/" className="support-nav-item">
          <LogOut size={18} />
          Logout
        </Link>
      </nav>

      <button type="button" className="support-share-btn">
        <Share2 size={18} />
        Share
      </button>
    </header>
  );
}

function ContactUs({ submitted, setSubmitted, setActiveTab }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (submitted) {
    return (
      <div className="support-success-card">
        <div className="support-success-icon">
          <Check size={48} strokeWidth={2.5} />
        </div>
        <h2 className="support-success-title">Message Sent!</h2>
        <p className="support-success-desc">
          We&apos;ll get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="support-contact-layout">
      <div className="support-contact-form-wrap">
        <h2 className="support-section-title">Send us a message</h2>
        <form onSubmit={handleSubmit} className="support-form">
          <div className="support-field">
            <label htmlFor="fullName">Full Name *</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="John Doe"
              required
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>
          <div className="support-field">
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="support-field">
            <label htmlFor="phone">Phone Number (Optional)</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="support-field">
            <label htmlFor="subject">Subject *</label>
            <input
              id="subject"
              name="subject"
              type="text"
              placeholder="How can we help you?"
              required
              value={formData.subject}
              onChange={handleChange}
            />
          </div>
          <div className="support-field">
            <label htmlFor="message">Message *</label>
            <textarea
              id="message"
              name="message"
              placeholder="Please describe your inquiry in detail...."
              rows={5}
              required
              value={formData.message}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="support-send-btn">
            <Send size={18} />
            Send Message
          </button>
        </form>
      </div>

      <aside className="support-contact-sidebar">
        <div className="support-info-card">
          <h3 className="support-info-title">Contact Information</h3>
          <div className="support-info-item">
            <Mail size={18} />
            <span>support@packora.com</span>
          </div>
          <div className="support-info-item">
            <Phone size={18} />
            <span>+1 (555) 123-4567</span>
          </div>
          <div className="support-info-item">
            <Clock size={18} />
            <div>
              <p>Mon-Fri: 8:00 AM - 6:00 PM EST</p>
              <p>Sat: 9:00 AM - 2:00 PM EST</p>
              <p>Sun: Closed</p>
            </div>
          </div>
          <div className="support-info-item">
            <MapPin size={18} />
            <div>
              <p>123 Packaging Street</p>
              <p>New York, NY 10001</p>
              <p>United States</p>
            </div>
          </div>
        </div>
        <div className="support-quick-actions">
          <h3 className="support-info-title">Quick Actions</h3>
          <Link to="/Track" className="support-quick-btn">
            <Truck size={18} />
            Track Order
          </Link>
          <button
            type="button"
            className="support-quick-btn"
            onClick={() => setActiveTab('report')}
          >
            <AlertTriangle size={18} />
            Report Issue
          </button>
          <button
            type="button"
            className="support-quick-btn"
            onClick={() => setActiveTab('faq')}
          >
            <HelpCircle size={18} />
            Browse FAQ
          </button>
        </div>
      </aside>
    </div>
  );
}

function FAQ({ setActiveTab }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = FAQ_CATEGORIES.map((cat) => ({
    ...cat,
    questions: cat.questions.filter((q) =>
      q.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.questions.length > 0);

  return (
    <div className="support-faq">
      <div className="support-faq-search">
        <Search size={20} className="support-search-icon" />
        <input
          type="text"
          placeholder="Search frequently asked questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="support-faq-grid">
        {filteredCategories.map((cat) => (
          <div key={cat.id} className="support-faq-card">
            <div className="support-faq-card-header">
              <div className="support-faq-icon">
                <cat.icon size={20} />
              </div>
              <h3 className="support-faq-category">{cat.title}</h3>
            </div>
            <ul className="support-faq-list">
              {cat.questions.map((q) => (
                <li key={q}>
                  <span className="support-faq-q-icon">?</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="support-still-help">
        <div>
          <h3 className="support-still-help-title">Still need help?</h3>
          <p className="support-still-help-desc">
            Can&apos;t find what you&apos;re looking for? Our support team is here to help.
          </p>
        </div>
        <button
          type="button"
          className="support-contact-support-btn"
          onClick={() => setActiveTab('contact')}
        >
          Contact Support
        </button>
      </div>
    </div>
  );
}

function ReportIssueLanding({ setActiveTab, onStartReport }) {
  return (
    <div className="support-report-landing">
      <div className="support-report-landing-card">
        <div className="support-report-warning-icon">
          <AlertTriangle size={48} />
        </div>
        <h2 className="support-report-title">Report an Issue</h2>
        <p className="support-report-desc">
          Experiencing a problem with your order or our service? Let us know and we&apos;ll resolve it quickly.
        </p>
        <div className="support-report-buttons">
          <button
            type="button"
            className="support-btn-outline"
            onClick={() => setActiveTab('contact')}
          >
            Contact Support Instead
          </button>
          <button
            type="button"
            className="support-btn-danger"
            onClick={onStartReport}
          >
            <AlertTriangle size={18} />
            Report Issue
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportIssueForm({ submitted, setSubmitted, onBack, setActiveTab, setReportFormVisible }) {
  const [formData, setFormData] = useState({
    category: '',
    orderId: '',
    transactionId: '',
    paymentMethod: '',
    priority: 'medium',
    subject: '',
    description: '',
  });
  const [ticketId, setTicketId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category) return;
    setTicketId(generateTicketId());
    setSubmitted(true);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (submitted) {
    return (
      <div className="support-success-card">
        <div className="support-success-icon">
          <Check size={48} strokeWidth={2.5} />
        </div>
        <h2 className="support-success-title">Issue Reported Successfully</h2>
        <p className="support-success-ticket">
          Your issue has been submitted with ticket ID: {ticketId}
        </p>
        <p className="support-success-desc">
          Our support team will review your issue and get back to you within 24-48 hours via email.
        </p>
        <div className="support-success-buttons">
          <button type="button" className="support-btn-outline" onClick={onBack}>
            Go Back
          </button>
          <button
            type="button"
            className="support-btn-primary"
            onClick={() => {
              setReportFormVisible(false);
              setActiveTab('contact');
            }}
          >
            View Support Center
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="support-report-form-layout">
      <div className="support-report-main">
        <button type="button" className="support-back-link" onClick={onBack}>
          ← Back
        </button>
        <h2 className="support-report-form-title">Report an Issue</h2>
        <p className="support-report-form-desc">
          Tell us about the problem you&apos;re experiencing and we&apos;ll help resolve it.
        </p>

        <form onSubmit={handleSubmit} className="support-report-form">
          <div className="support-form-section">
            <label className="support-form-label">
              Issue Category <span className="required">*</span>
            </label>
            <div className="support-category-grid">
              {ISSUE_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  className={`support-category-btn ${formData.category === cat.key ? 'active' : ''}`}
                  onClick={() => setFormData((prev) => ({ ...prev, category: cat.key }))}
                >
                  <cat.icon size={20} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="support-form-section">
            <label htmlFor="orderId" className="support-form-label">
              Order ID (Optional)
            </label>
            <input
              id="orderId"
              name="orderId"
              type="text"
              placeholder="ORD-2401"
              value={formData.orderId}
              onChange={handleChange}
              className="support-input"
            />
            <p className="support-field-hint">
              If this issue is related to a specific order, please enter the order ID
            </p>
          </div>

          {formData.category === 'payment' && (
            <>
              <div className="support-form-section">
                <label htmlFor="transactionId" className="support-form-label">
                  Transaction ID (Optional)
                </label>
                <input
                  id="transactionId"
                  name="transactionId"
                  type="text"
                  placeholder="e.g. TXN-123456789"
                  value={formData.transactionId}
                  onChange={handleChange}
                  className="support-input"
                />
                <p className="support-field-hint">
                  Include the transaction ID from your payment receipt or statement
                </p>
              </div>
              <div className="support-form-section">
                <label htmlFor="paymentMethod" className="support-form-label">
                  Payment Method (Optional)
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="support-input support-select"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm.value} value={pm.value}>
                      {pm.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="support-form-section">
            <label className="support-form-label">
              Priority Level <span className="required">*</span>
            </label>
            <div className="support-priority-row">
              {PRIORITIES.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className={`support-priority-btn ${formData.priority === p.key ? 'active' : ''} ${p.key === 'urgent' ? 'urgent' : ''}`}
                  onClick={() => setFormData((prev) => ({ ...prev, priority: p.key }))}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="support-form-section">
            <label htmlFor="subject" className="support-form-label">
              Subject <span className="required">*</span>
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              placeholder="Brief description of the issue"
              required
              value={formData.subject}
              onChange={handleChange}
              className="support-input"
            />
          </div>

          <div className="support-form-section">
            <label htmlFor="description" className="support-form-label">
              Detailed Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Please provide as much detail as possible about the issue you're experiencing..."
              rows={5}
              required
              value={formData.description}
              onChange={handleChange}
              className="support-textarea"
            />
            <p className="support-field-hint">
              Include any relevant details, error messages, or steps to reproduce the issue
            </p>
          </div>

          <div className="support-form-section">
            <label className="support-form-label">Attachments (Optional)</label>
            <div className="support-upload-area">
              <Upload size={32} className="support-upload-icon" />
              <p>Upload screenshots or documents (Max 5 files)</p>
              <button type="button" className="support-browse-link">
                Browse files
              </button>
            </div>
          </div>

          <div className="support-form-actions">
            <button type="button" className="support-btn-outline" onClick={onBack}>
              Cancel
            </button>
            <button type="submit" className="support-btn-submit">
              <AlertTriangle size={18} />
              Submit Issue
            </button>
          </div>
        </form>
      </div>

      <aside className="support-report-sidebar">
        <div className="support-sidebar-card">
          <h3 className="support-sidebar-title">Need Help?</h3>
          <p className="support-sidebar-text">
            Before submitting, check our FAQ or contact support for immediate assistance.
          </p>
          <button
            type="button"
            className="support-view-center-btn"
            onClick={() => setActiveTab('contact')}
          >
            View Support Center
          </button>
        </div>
        <div className="support-sidebar-card">
          <h3 className="support-sidebar-title">Tips for Reporting</h3>
          <ul className="support-tips-list">
            <li>Be as specific as possible about the issue</li>
            <li>Include order IDs or transaction numbers</li>
            <li>Attach screenshots showing the problem</li>
            <li>Set the correct priority level</li>
          </ul>
        </div>
        <div className="support-sidebar-card">
          <h3 className="support-sidebar-title">Response Times</h3>
          <ul className="support-response-list">
            <li className="urgent">Urgent: 2-4 hours</li>
            <li>High: 4-8 hours</li>
            <li>Medium: 24 hours</li>
            <li>Low: 48 hours</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

export default function Support() {
  const { cartItems } = useCart();
  const [activeTab, setActiveTab] = useState('contact');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportFormVisible, setReportFormVisible] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'contact') setContactSubmitted(false);
    if (tab !== 'report') {
      setReportSubmitted(false);
      setReportFormVisible(false);
    }
  };

  return (
    <div className="support-page">
      <SupportHeader
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        cartItems={cartItems}
      />

      <main className="support-main">
        <div className="support-hero">
          <h1 className="support-title">Support Center</h1>
          <p className="support-subtitle">
            Get help with your orders, find answers to common questions, or contact our support team
          </p>
        </div>

        <nav className="support-tabs">
          {SUPPORT_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`support-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="support-content">
          {activeTab === 'contact' && (
            <ContactUs
              submitted={contactSubmitted}
              setSubmitted={setContactSubmitted}
              setActiveTab={handleTabChange}
            />
          )}
          {activeTab === 'faq' && <FAQ setActiveTab={handleTabChange} />}
          {activeTab === 'report' &&
            (reportFormVisible ? (
              <ReportIssueForm
                submitted={reportSubmitted}
                setSubmitted={setReportSubmitted}
                onBack={() => setReportFormVisible(false)}
                setActiveTab={handleTabChange}
                setReportFormVisible={setReportFormVisible}
              />
            ) : (
              <ReportIssueLanding
                setActiveTab={handleTabChange}
                onStartReport={() => setReportFormVisible(true)}
              />
            ))}
        </div>
      </main>
    </div>
  );
}
